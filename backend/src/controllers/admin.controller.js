const bcrypt = require('bcryptjs');
const { query } = require('../db/pool');
const { AppError } = require('../middlewares/error.middleware');

/**
 * GET /api/admin/users
 * [ADMIN] Liste tous les utilisateurs, avec filtre optionnel par role.
 */
async function listUsers(req, res, next) {
  try {
    const { role } = req.query;
    const conditions = [];
    const params = [];
    if (role) {
      conditions.push(`role = $1`);
      params.push(role);
    }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const result = await query(
      `SELECT id, role, email, nom, prenom, telephone, cin, pays, ville, est_actif, est_verifie,
              type_personnel, date_fin_mission, derniere_connexion, created_at
       FROM users ${where} ORDER BY created_at DESC`,
      params
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/admin/users
 * [ADMIN] Cree un compte employe ou admin (seul moyen de creer ces roles).
 */
async function createInternalUser(req, res, next) {
  try {
    const { email, password, nom, prenom, telephone, cin, role, type_personnel, date_fin_mission } = req.body;

    if (!['employe', 'admin'].includes(role)) {
      throw new AppError('Cette route ne permet de creer que des comptes employe ou admin.', 400);
    }
    if (!email || !password || !nom || !prenom || !cin) {
      throw new AppError('Tous les champs sont obligatoires (email, password, nom, prenom, cin).', 400);
    }
    if (role === 'employe' && type_personnel && !['interne', 'externe'].includes(type_personnel)) {
      throw new AppError('Le type de personnel doit etre "interne" ou "externe".', 400);
    }

    const existing = await query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
    if (existing.rowCount > 0) {
      throw new AppError('Un compte existe deja avec cet email.', 409);
    }

    // Le type de personnel ne s'applique qu'aux comptes employe ; un admin reste toujours interne par defaut.
    const typePersonnelFinal = role === 'employe' ? (type_personnel || 'interne') : null;
    const dateFinFinal = typePersonnelFinal === 'externe' ? (date_fin_mission || null) : null;

    const passwordHash = await bcrypt.hash(password, 12);
    const result = await query(
      `INSERT INTO users (role, email, password_hash, nom, prenom, telephone, cin, est_actif, est_verifie, type_personnel, date_fin_mission)
       VALUES ($1, $2, $3, $4, $5, $6, $7, true, true, $8, $9)
       RETURNING id, role, email, nom, prenom, type_personnel, date_fin_mission, created_at`,
      [role, email.toLowerCase(), passwordHash, nom, prenom, telephone || null, cin, typePersonnelFinal, dateFinFinal]
    );

    res.status(201).json({ success: true, message: `Compte ${role} cree avec succes.`, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/admin/users/:id/toggle-active
 * [ADMIN] Active ou desactive un compte utilisateur.
 */
async function toggleUserActive(req, res, next) {
  try {
    const result = await query(
      `UPDATE users SET est_actif = NOT est_actif WHERE id = $1 RETURNING id, email, est_actif`,
      [req.params.id]
    );
    if (result.rowCount === 0) {
      throw new AppError('Utilisateur introuvable.', 404);
    }
    res.json({ success: true, message: 'Statut du compte mis a jour.', data: result.rows[0] });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/admin/users/:id/role
 * [ADMIN] Modifie le role d'un utilisateur.
 */
async function changeUserRole(req, res, next) {
  try {
    const { role } = req.body;
    const rolesValides = ['client', 'fournisseur', 'employe', 'admin', 'partenaire_logistique'];
    if (!rolesValides.includes(role)) {
      throw new AppError('Role invalide.', 400);
    }
    const result = await query(
      `UPDATE users SET role = $1 WHERE id = $2 RETURNING id, email, role`,
      [role, req.params.id]
    );
    if (result.rowCount === 0) {
      throw new AppError('Utilisateur introuvable.', 404);
    }
    res.json({ success: true, message: 'Role mis a jour.', data: result.rows[0] });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/admin/users/:id/staff-type
 * [ADMIN] Definit le type de personnel (interne/externe) d'un compte employe.
 */
async function changeStaffType(req, res, next) {
  try {
    const { type_personnel, date_fin_mission } = req.body;
    if (!['interne', 'externe'].includes(type_personnel)) {
      throw new AppError('Le type de personnel doit etre "interne" ou "externe".', 400);
    }

    const target = await query('SELECT role FROM users WHERE id = $1', [req.params.id]);
    if (target.rowCount === 0) {
      throw new AppError('Utilisateur introuvable.', 404);
    }
    if (target.rows[0].role !== 'employe') {
      throw new AppError('Le type de personnel ne s\'applique qu\'aux comptes employe.', 400);
    }

    const dateFinFinal = type_personnel === 'externe' ? (date_fin_mission || null) : null;

    const result = await query(
      `UPDATE users SET type_personnel = $1, date_fin_mission = $2 WHERE id = $3
       RETURNING id, email, role, type_personnel, date_fin_mission`,
      [type_personnel, dateFinFinal, req.params.id]
    );
    res.json({ success: true, message: 'Type de personnel mis a jour.', data: result.rows[0] });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/admin/dashboard
 * [ADMIN] Statistiques globales de la plateforme.
 */
async function getDashboardStats(req, res, next) {
  try {
    const [
      totalUsers, usersByRole, totalProducts, productsByStatus,
      totalOrders, ordersByStatus, revenue, topProducts, topSuppliers, pendingProducts, staffByType,
    ] = await Promise.all([
      query('SELECT COUNT(*) FROM users'),
      query('SELECT role, COUNT(*) FROM users GROUP BY role'),
      query('SELECT COUNT(*) FROM products'),
      query('SELECT statut, COUNT(*) FROM products GROUP BY statut'),
      query('SELECT COUNT(*) FROM orders'),
      query('SELECT statut, COUNT(*) FROM orders GROUP BY statut'),
      query(`SELECT COALESCE(SUM(montant_total),0) AS total FROM orders WHERE statut NOT IN ('annulee','remboursee')`),
      query(`SELECT p.id, p.nom, p.nombre_ventes, p.note_moyenne FROM products p ORDER BY p.nombre_ventes DESC LIMIT 5`),
      query(`SELECT u.id, u.nom, u.prenom, sp.solde_disponible
             FROM users u JOIN supplier_profiles sp ON sp.user_id = u.id
             ORDER BY sp.solde_disponible DESC LIMIT 5`),
      query(`SELECT COUNT(*) FROM products WHERE statut = 'en_attente'`),
      query(`SELECT type_personnel, COUNT(*) FROM users WHERE role = 'employe' GROUP BY type_personnel`),
    ]);

    res.json({
      success: true,
      data: {
        utilisateurs: {
          total: parseInt(totalUsers.rows[0].count, 10),
          par_role: usersByRole.rows,
        },
        produits: {
          total: parseInt(totalProducts.rows[0].count, 10),
          par_statut: productsByStatus.rows,
          en_attente_validation: parseInt(pendingProducts.rows[0].count, 10),
          top_ventes: topProducts.rows,
        },
        commandes: {
          total: parseInt(totalOrders.rows[0].count, 10),
          par_statut: ordersByStatus.rows,
        },
        finances: {
          chiffre_affaires_total: parseFloat(revenue.rows[0].total),
        },
        top_fournisseurs: topSuppliers.rows,
        personnel: {
          par_type: staffByType.rows,
        },
      },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { listUsers, createInternalUser, toggleUserActive, changeUserRole, changeStaffType, getDashboardStats };
