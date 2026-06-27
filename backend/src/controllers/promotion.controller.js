const { query } = require('../db/pool');
const { AppError } = require('../middlewares/error.middleware');

/**
 * GET /api/promotions
 * Liste publique des promotions actives.
 */
async function listActivePromotions(req, res, next) {
  try {
    const result = await query(
      `SELECT * FROM promotions WHERE est_active = true AND date_fin >= now() ORDER BY date_debut DESC`
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/promotions/all
 * [EMPLOYE/ADMIN] Toutes les promotions, actives ou non.
 */
async function listAllPromotions(req, res, next) {
  try {
    const result = await query(`SELECT * FROM promotions ORDER BY created_at DESC`);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/promotions
 * [EMPLOYE/ADMIN] Cree une nouvelle campagne promotionnelle.
 */
async function createPromotion(req, res, next) {
  try {
    const { titre, description, code_promo, type_reduction, valeur_reduction, date_debut, date_fin, categorie_id, product_id } = req.body;

    if (!titre || !valeur_reduction || !date_debut || !date_fin) {
      throw new AppError('titre, valeur_reduction, date_debut et date_fin sont obligatoires.', 400);
    }

    const result = await query(
      `INSERT INTO promotions (created_by, titre, description, code_promo, type_reduction, valeur_reduction, date_debut, date_fin, categorie_id, product_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [req.user.id, titre, description || null, code_promo || null, type_reduction || 'pourcentage', valeur_reduction, date_debut, date_fin, categorie_id || null, product_id || null]
    );
    res.status(201).json({ success: true, message: 'Promotion creee.', data: result.rows[0] });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/promotions/:id/toggle
 * [EMPLOYE/ADMIN] Active/desactive une promotion.
 */
async function togglePromotion(req, res, next) {
  try {
    const result = await query(
      `UPDATE promotions SET est_active = NOT est_active WHERE id = $1 RETURNING *`,
      [req.params.id]
    );
    if (result.rowCount === 0) {
      throw new AppError('Promotion introuvable.', 404);
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
}

module.exports = { listActivePromotions, listAllPromotions, createPromotion, togglePromotion };
