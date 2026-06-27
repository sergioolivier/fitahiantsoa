const { query } = require('../db/pool');
const { AppError } = require('../middlewares/error.middleware');

/**
 * GET /api/cart
 * Affiche le panier du client connecte avec details produits et total.
 */
async function getCart(req, res, next) {
  try {
    const result = await query(
      `SELECT ci.id, ci.quantite, p.id AS product_id, p.nom, p.prix_vente, p.devise, p.stock_theorique,
              (SELECT url FROM product_media pm WHERE pm.product_id = p.id ORDER BY ordre_affichage LIMIT 1) AS image
       FROM cart_items ci
       JOIN products p ON p.id = ci.product_id
       WHERE ci.client_id = $1
       ORDER BY ci.created_at DESC`,
      [req.user.id]
    );

    const items = result.rows;
    const total = items.reduce((sum, item) => sum + parseFloat(item.prix_vente) * item.quantite, 0);

    res.json({ success: true, data: { items, total, nombre_articles: items.length } });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/cart
 * Ajoute un produit au panier (ou augmente la quantite si deja present).
 */
async function addToCart(req, res, next) {
  try {
    const { product_id, quantite = 1 } = req.body;
    if (!product_id) {
      throw new AppError('product_id est requis.', 400);
    }

    const product = await query(`SELECT id, statut, stock_theorique FROM products WHERE id = $1`, [product_id]);
    if (product.rowCount === 0 || product.rows[0].statut !== 'en_vente') {
      throw new AppError('Ce produit n\'est pas disponible a la vente.', 400);
    }

    const result = await query(
      `INSERT INTO cart_items (client_id, product_id, quantite)
       VALUES ($1, $2, $3)
       ON CONFLICT (client_id, product_id) DO UPDATE SET quantite = cart_items.quantite + $3
       RETURNING *`,
      [req.user.id, product_id, quantite]
    );

    res.status(201).json({ success: true, message: 'Produit ajoute au panier.', data: result.rows[0] });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/cart/:id
 * Modifie la quantite d'un article du panier.
 */
async function updateCartItem(req, res, next) {
  try {
    const { quantite } = req.body;
    if (!quantite || quantite < 1) {
      throw new AppError('La quantite doit etre superieure ou egale a 1.', 400);
    }
    const result = await query(
      `UPDATE cart_items SET quantite = $1 WHERE id = $2 AND client_id = $3 RETURNING *`,
      [quantite, req.params.id, req.user.id]
    );
    if (result.rowCount === 0) {
      throw new AppError('Article du panier introuvable.', 404);
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/cart/:id
 * Retire un article du panier.
 */
async function removeCartItem(req, res, next) {
  try {
    const result = await query(`DELETE FROM cart_items WHERE id = $1 AND client_id = $2 RETURNING id`, [req.params.id, req.user.id]);
    if (result.rowCount === 0) {
      throw new AppError('Article du panier introuvable.', 404);
    }
    res.json({ success: true, message: 'Article retire du panier.' });
  } catch (err) {
    next(err);
  }
}

module.exports = { getCart, addToCart, updateCartItem, removeCartItem };
