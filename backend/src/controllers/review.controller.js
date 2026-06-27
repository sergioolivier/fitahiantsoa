const { query } = require('../db/pool');
const { AppError } = require('../middlewares/error.middleware');

/**
 * POST /api/reviews
 * [CLIENT] Laisse un avis sur un produit, uniquement si le client a deja
 * recu une commande contenant ce produit (achat verifie).
 */
async function createReview(req, res, next) {
  try {
    const { product_id, order_id, note, commentaire } = req.body;

    if (!product_id || !note) {
      throw new AppError('product_id et note sont obligatoires.', 400);
    }
    if (note < 1 || note > 5) {
      throw new AppError('La note doit etre comprise entre 1 et 5.', 400);
    }

    // Verification que le client a bien recu ce produit dans une commande livree
    const purchaseCheck = await query(
      `SELECT o.id FROM orders o
       JOIN order_items oi ON oi.order_id = o.id
       WHERE o.client_id = $1 AND oi.product_id = $2 AND o.statut = 'livree'
       LIMIT 1`,
      [req.user.id, product_id]
    );
    if (purchaseCheck.rowCount === 0) {
      throw new AppError('Vous ne pouvez evaluer que des produits que vous avez recus.', 403);
    }

    const result = await query(
      `INSERT INTO reviews (product_id, client_id, order_id, note, commentaire)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (product_id, client_id, order_id) DO UPDATE SET note = $4, commentaire = $5
       RETURNING *`,
      [product_id, req.user.id, order_id || purchaseCheck.rows[0].id, note, commentaire || null]
    );

    // Recalcul de la note moyenne du produit
    const stats = await query(
      `SELECT AVG(note)::numeric(3,2) AS moyenne, COUNT(*) AS total FROM reviews WHERE product_id = $1`,
      [product_id]
    );
    await query(
      `UPDATE products SET note_moyenne = $1, nombre_avis = $2 WHERE id = $3`,
      [stats.rows[0].moyenne, stats.rows[0].total, product_id]
    );

    res.status(201).json({ success: true, message: 'Avis enregistre.', data: result.rows[0] });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/reviews/product/:productId
 * Liste des avis publics d'un produit.
 */
async function listProductReviews(req, res, next) {
  try {
    const result = await query(
      `SELECT r.id, r.note, r.commentaire, r.created_at, u.nom AS client_nom, u.prenom AS client_prenom
       FROM reviews r JOIN users u ON u.id = r.client_id
       WHERE r.product_id = $1 ORDER BY r.created_at DESC`,
      [req.params.productId]
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    next(err);
  }
}

module.exports = { createReview, listProductReviews };
