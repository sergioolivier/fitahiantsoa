const { query } = require('../db/pool');
const { AppError } = require('../middlewares/error.middleware');

/**
 * GET /api/suppliers/dashboard
 * [FOURNISSEUR] Tableau de bord personnel : performances, ventes, revenus.
 */
async function getDashboard(req, res, next) {
  try {
    const profile = await query('SELECT * FROM supplier_profiles WHERE user_id = $1', [req.user.id]);
    const productsStats = await query(
      `SELECT statut, COUNT(*) FROM products WHERE supplier_id = $1 GROUP BY statut`,
      [req.user.id]
    );
    const salesStats = await query(
      `SELECT COUNT(*) AS nombre_lignes, COALESCE(SUM(quantite * prix_unitaire),0) AS chiffre_affaires,
              COALESCE(SUM(montant_du_fournisseur),0) AS revenus_nets
       FROM order_items WHERE supplier_id = $1`,
      [req.user.id]
    );
    const recentOrders = await query(
      `SELECT o.id, o.numero_commande, o.statut, o.created_at, oi.quantite, oi.prix_unitaire, p.nom AS produit_nom
       FROM order_items oi
       JOIN orders o ON o.id = oi.order_id
       JOIN products p ON p.id = oi.product_id
       WHERE oi.supplier_id = $1
       ORDER BY o.created_at DESC LIMIT 10`,
      [req.user.id]
    );

    res.json({
      success: true,
      data: {
        profil: profile.rows[0] || null,
        produits_par_statut: productsStats.rows,
        statistiques_ventes: salesStats.rows[0],
        commandes_recentes: recentOrders.rows,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/suppliers/profile
 * [FOURNISSEUR] Mise a jour du profil entreprise.
 */
async function updateProfile(req, res, next) {
  try {
    const { nom_entreprise, secteur_activite, description, numero_fiscal } = req.body;
    const result = await query(
      `UPDATE supplier_profiles SET
        nom_entreprise = COALESCE($1, nom_entreprise),
        secteur_activite = COALESCE($2, secteur_activite),
        description = COALESCE($3, description),
        numero_fiscal = COALESCE($4, numero_fiscal)
       WHERE user_id = $5 RETURNING *`,
      [nom_entreprise, secteur_activite, description, numero_fiscal, req.user.id]
    );
    if (result.rowCount === 0) {
      throw new AppError('Profil fournisseur introuvable.', 404);
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
}

module.exports = { getDashboard, updateProfile };
