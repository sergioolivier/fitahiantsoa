const { query, getClient } = require('../db/pool');
const { AppError } = require('../middlewares/error.middleware');
const { generateBarcode, generateProductQrCode } = require('../utils/codes.utils');

/**
 * GET /api/products
 * Catalogue public : liste des produits en vente, avec recherche et filtres.
 * Query params : q (texte), category, prix_min, prix_max, tri, page, limit
 */
async function listProducts(req, res, next) {
  try {
    const { q, category, prix_min, prix_max, tri, page = 1, limit = 20, sponsorise, populaire } = req.query;

    const conditions = [`p.statut = 'en_vente'`];
    const params = [];
    let idx = 1;

    if (q) {
      conditions.push(`(p.nom ILIKE $${idx} OR p.description ILIKE $${idx})`);
      params.push(`%${q}%`);
      idx++;
    }
    if (category) {
      conditions.push(`c.slug = $${idx}`);
      params.push(category);
      idx++;
    }
    if (prix_min) {
      conditions.push(`p.prix_vente >= $${idx}`);
      params.push(prix_min);
      idx++;
    }
    if (prix_max) {
      conditions.push(`p.prix_vente <= $${idx}`);
      params.push(prix_max);
      idx++;
    }
    if (sponsorise === 'true') {
      conditions.push(`p.est_sponsorise = true`);
    }
    if (populaire === 'true') {
      conditions.push(`p.est_populaire = true`);
    }

    let orderBy = 'p.created_at DESC';
    if (tri === 'prix_asc') orderBy = 'p.prix_vente ASC';
    if (tri === 'prix_desc') orderBy = 'p.prix_vente DESC';
    if (tri === 'popularite') orderBy = 'p.nombre_ventes DESC';
    if (tri === 'note') orderBy = 'p.note_moyenne DESC';

    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    const sql = `
      SELECT p.id, p.nom, p.description, p.prix_vente, p.devise, p.note_moyenne,
             p.nombre_avis, p.nombre_ventes, p.est_sponsorise, p.est_populaire,
             p.code_barre, c.nom AS categorie_nom, c.slug AS categorie_slug,
             u.nom AS fournisseur_nom, u.ville AS fournisseur_ville,
             (SELECT url FROM product_media pm WHERE pm.product_id = p.id ORDER BY ordre_affichage LIMIT 1) AS image_principale
      FROM products p
      LEFT JOIN categories c ON c.id = p.category_id
      LEFT JOIN users u ON u.id = p.supplier_id
      WHERE ${conditions.join(' AND ')}
      ORDER BY ${orderBy}
      LIMIT $${idx} OFFSET $${idx + 1}
    `;
    params.push(parseInt(limit, 10), offset);

    const result = await query(sql, params);

    const countResult = await query(
      `SELECT COUNT(*) FROM products p LEFT JOIN categories c ON c.id = p.category_id WHERE ${conditions.join(' AND ')}`,
      params.slice(0, idx - 1)
    );

    res.json({
      success: true,
      data: result.rows,
      pagination: {
        total: parseInt(countResult.rows[0].count, 10),
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/products/:id
 * Fiche detaillee d'un produit (public).
 */
async function getProduct(req, res, next) {
  try {
    const { id } = req.params;
    const result = await query(
      `SELECT p.*, c.nom AS categorie_nom, c.slug AS categorie_slug,
              u.nom AS fournisseur_nom, u.prenom AS fournisseur_prenom, u.ville AS fournisseur_ville
       FROM products p
       LEFT JOIN categories c ON c.id = p.category_id
       LEFT JOIN users u ON u.id = p.supplier_id
       WHERE p.id = $1`,
      [id]
    );
    if (result.rowCount === 0) {
      throw new AppError('Produit introuvable.', 404);
    }

    const media = await query('SELECT id, type, url, ordre_affichage FROM product_media WHERE product_id = $1 ORDER BY ordre_affichage', [id]);
    const reviews = await query(
      `SELECT r.id, r.note, r.commentaire, r.created_at, u.nom AS client_nom
       FROM reviews r JOIN users u ON u.id = r.client_id
       WHERE r.product_id = $1 ORDER BY r.created_at DESC LIMIT 20`,
      [id]
    );

    res.json({ success: true, data: { ...result.rows[0], media: media.rows, avis: reviews.rows } });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/products
 * Soumission d'un nouveau produit par un fournisseur (statut initial : en_attente).
 */
async function createProduct(req, res, next) {
  try {
    const supplierId = req.user.id;
    const { nom, description, caracteristiques_techniques, prix_propose, category_id, stock_theorique, unite, devise } = req.body;

    if (!nom || !prix_propose) {
      throw new AppError('Le nom et le prix propose sont obligatoires.', 400);
    }

    const barcode = generateBarcode();

    const result = await query(
      `INSERT INTO products (supplier_id, category_id, nom, description, caracteristiques_techniques,
                              prix_propose, devise, stock_theorique, unite, code_barre, statut)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'en_attente')
       RETURNING *`,
      [
        supplierId, category_id || null, nom, description || null,
        JSON.stringify(caracteristiques_techniques || {}), prix_propose,
        devise || 'MGA', stock_theorique || 0, unite || 'unite', barcode,
      ]
    );

    const product = result.rows[0];
    const { dataUrl } = await generateProductQrCode(product.id);
    await query('UPDATE products SET qr_code_data = $1 WHERE id = $2', [dataUrl, product.id]);

    res.status(201).json({
      success: true,
      message: 'Produit soumis avec succes. Il est en attente de validation par l\'equipe FITAHIANTSOA.',
      data: { ...product, qr_code_data: dataUrl },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/products/mine
 * Liste des produits soumis par le fournisseur connecte (tous statuts).
 */
async function listMyProducts(req, res, next) {
  try {
    const result = await query(
      `SELECT p.*, c.nom AS categorie_nom
       FROM products p LEFT JOIN categories c ON c.id = p.category_id
       WHERE p.supplier_id = $1 ORDER BY p.created_at DESC`,
      [req.user.id]
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/products/:id
 * Mise a jour d'un produit par son fournisseur (uniquement si en_attente ou refuse).
 */
async function updateProduct(req, res, next) {
  try {
    const { id } = req.params;
    const existing = await query('SELECT * FROM products WHERE id = $1 AND supplier_id = $2', [id, req.user.id]);
    if (existing.rowCount === 0) {
      throw new AppError('Produit introuvable ou non autorise.', 404);
    }
    if (!['en_attente', 'refuse'].includes(existing.rows[0].statut)) {
      throw new AppError('Ce produit ne peut plus etre modifie (deja valide ou en vente). Contactez un employe.', 400);
    }

    const { nom, description, caracteristiques_techniques, prix_propose, category_id, stock_theorique, unite } = req.body;

    const result = await query(
      `UPDATE products SET
        nom = COALESCE($1, nom), description = COALESCE($2, description),
        caracteristiques_techniques = COALESCE($3, caracteristiques_techniques),
        prix_propose = COALESCE($4, prix_propose), category_id = COALESCE($5, category_id),
        stock_theorique = COALESCE($6, stock_theorique), unite = COALESCE($7, unite),
        statut = 'en_attente', motif_refus = NULL
       WHERE id = $8 RETURNING *`,
      [nom, description, caracteristiques_techniques ? JSON.stringify(caracteristiques_techniques) : null,
       prix_propose, category_id, stock_theorique, unite, id]
    );

    res.json({ success: true, message: 'Produit mis a jour et renvoye en validation.', data: result.rows[0] });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/products/pending
 * [EMPLOYE/ADMIN] Liste des produits en attente de validation.
 */
async function listPendingProducts(req, res, next) {
  try {
    const result = await query(
      `SELECT p.*, c.nom AS categorie_nom, u.nom AS fournisseur_nom, u.prenom AS fournisseur_prenom, u.email AS fournisseur_email
       FROM products p
       LEFT JOIN categories c ON c.id = p.category_id
       LEFT JOIN users u ON u.id = p.supplier_id
       WHERE p.statut = 'en_attente'
       ORDER BY p.created_at ASC`
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/products/:id/validate
 * [EMPLOYE/ADMIN] Valide un produit et fixe le prix de vente final.
 */
async function validateProduct(req, res, next) {
  try {
    const { id } = req.params;
    const { prix_vente, est_sponsorise } = req.body;

    if (!prix_vente) {
      throw new AppError('Le prix de vente final est obligatoire pour valider un produit.', 400);
    }

    const result = await query(
      `UPDATE products SET statut = 'en_vente', prix_vente = $1, validated_by = $2,
                            est_sponsorise = COALESCE($3, est_sponsorise)
       WHERE id = $4 AND statut = 'en_attente' RETURNING *`,
      [prix_vente, req.user.id, est_sponsorise, id]
    );

    if (result.rowCount === 0) {
      throw new AppError('Produit introuvable ou deja traite.', 404);
    }

    const product = result.rows[0];
    await query(
      `INSERT INTO notifications (user_id, type, titre, message, lien_action)
       VALUES ($1, 'systeme', 'Produit valide', $2, $3)`,
      [product.supplier_id, `Votre produit "${product.nom}" a ete valide et est maintenant en vente.`, `/fournisseur/produits/${product.id}`]
    );

    res.json({ success: true, message: 'Produit valide et publie sur la plateforme.', data: product });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/products/:id/refuse
 * [EMPLOYE/ADMIN] Refuse un produit avec motif.
 */
async function refuseProduct(req, res, next) {
  try {
    const { id } = req.params;
    const { motif_refus } = req.body;

    if (!motif_refus) {
      throw new AppError('Un motif de refus est obligatoire.', 400);
    }

    const result = await query(
      `UPDATE products SET statut = 'refuse', motif_refus = $1, validated_by = $2
       WHERE id = $3 AND statut = 'en_attente' RETURNING *`,
      [motif_refus, req.user.id, id]
    );

    if (result.rowCount === 0) {
      throw new AppError('Produit introuvable ou deja traite.', 404);
    }

    const product = result.rows[0];
    await query(
      `INSERT INTO notifications (user_id, type, titre, message, lien_action)
       VALUES ($1, 'systeme', 'Produit refuse', $2, $3)`,
      [product.supplier_id, `Votre produit "${product.nom}" a ete refuse. Motif : ${motif_refus}`, `/fournisseur/produits/${product.id}`]
    );

    res.json({ success: true, message: 'Produit refuse.', data: product });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/products/:id
 * [ADMIN] Suppression definitive d'un produit. [FOURNISSEUR] peut retirer son propre produit en_attente.
 */
async function deleteProduct(req, res, next) {
  try {
    const { id } = req.params;
    let result;
    if (req.user.role === 'admin') {
      result = await query('DELETE FROM products WHERE id = $1 RETURNING id', [id]);
    } else {
      result = await query(
        `DELETE FROM products WHERE id = $1 AND supplier_id = $2 AND statut IN ('en_attente','refuse') RETURNING id`,
        [id, req.user.id]
      );
    }
    if (result.rowCount === 0) {
      throw new AppError('Produit introuvable ou suppression non autorisee.', 404);
    }
    res.json({ success: true, message: 'Produit supprime.' });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listProducts,
  getProduct,
  createProduct,
  listMyProducts,
  updateProduct,
  listPendingProducts,
  validateProduct,
  refuseProduct,
  deleteProduct,
};
