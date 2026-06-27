const { query } = require('../db/pool');
const { AppError } = require('../middlewares/error.middleware');

/**
 * GET /api/categories
 * Liste publique des categories et sous-categories.
 */
async function listCategories(req, res, next) {
  try {
    const result = await query(`SELECT * FROM categories ORDER BY ordre_affichage ASC, nom ASC`);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/categories
 * [ADMIN] Cree une nouvelle categorie ou sous-categorie.
 */
async function createCategory(req, res, next) {
  try {
    const { nom, nom_en, nom_mg, slug, icone, parent_id, ordre_affichage } = req.body;
    if (!nom || !slug) {
      throw new AppError('nom et slug sont obligatoires.', 400);
    }
    const result = await query(
      `INSERT INTO categories (nom, nom_en, nom_mg, slug, icone, parent_id, ordre_affichage)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [nom, nom_en || null, nom_mg || null, slug, icone || null, parent_id || null, ordre_affichage || 0]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/categories/:id
 * [ADMIN]
 */
async function deleteCategory(req, res, next) {
  try {
    const result = await query('DELETE FROM categories WHERE id = $1 RETURNING id', [req.params.id]);
    if (result.rowCount === 0) {
      throw new AppError('Categorie introuvable.', 404);
    }
    res.json({ success: true, message: 'Categorie supprimee.' });
  } catch (err) {
    next(err);
  }
}

module.exports = { listCategories, createCategory, deleteCategory };
