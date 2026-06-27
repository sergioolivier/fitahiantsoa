const bcrypt = require('bcryptjs');
const { query } = require('../db/pool');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../utils/token.utils');
const { AppError } = require('../middlewares/error.middleware');

const ROLES_AUTORISES_INSCRIPTION = ['client', 'fournisseur', 'partenaire_logistique'];
// Les comptes employe et admin ne peuvent pas s'auto-inscrire : ils sont
// crees par un administrateur via l'interface admin, pour des raisons de securite.

/**
 * POST /api/auth/register
 * Inscription d'un nouvel utilisateur (client, fournisseur ou partenaire logistique).
 */
async function register(req, res, next) {
  try {
    const { email, password, nom, prenom, telephone, cin, role, pays, ville, langue_preferee } = req.body;

    if (!email || !password || !nom || !prenom || !cin) {
      throw new AppError('Les champs email, mot de passe, nom, prenom et CIN sont obligatoires.', 400);
    }
    if (password.length < 8) {
      throw new AppError('Le mot de passe doit contenir au moins 8 caracteres.', 400);
    }

    const roleFinal = ROLES_AUTORISES_INSCRIPTION.includes(role) ? role : 'client';

    const existing = await query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
    if (existing.rowCount > 0) {
      throw new AppError('Un compte existe deja avec cet email.', 409);
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const result = await query(
      `INSERT INTO users (role, email, password_hash, nom, prenom, telephone, cin, pays, ville, langue_preferee)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING id, role, email, nom, prenom, created_at`,
      [roleFinal, email.toLowerCase(), passwordHash, nom, prenom, telephone || null, cin, pays || 'Madagascar', ville || null, langue_preferee || 'fr']
    );

    const user = result.rows[0];

    // Creation du profil specifique selon le role
    if (roleFinal === 'fournisseur') {
      await query(
        `INSERT INTO supplier_profiles (user_id, nom_entreprise, secteur_activite)
         VALUES ($1, $2, $3)`,
        [user.id, req.body.nom_entreprise || `${prenom} ${nom}`, req.body.secteur_activite || 'autre']
      );
    } else if (roleFinal === 'partenaire_logistique') {
      await query(
        `INSERT INTO logistics_profiles (user_id, nom_societe, zones_couvertes)
         VALUES ($1, $2, $3)`,
        [user.id, req.body.nom_societe || `${prenom} ${nom}`, req.body.zones_couvertes || []]
      );
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res.status(201).json({
      success: true,
      message: 'Inscription reussie.',
      data: { user, accessToken, refreshToken },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/auth/login
 * Connexion par email/mot de passe pour tous les roles.
 */
async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      throw new AppError('Email et mot de passe requis.', 400);
    }

    const result = await query('SELECT * FROM users WHERE email = $1', [email.toLowerCase()]);
    const user = result.rows[0];

    const ip = req.ip;
    const userAgent = req.headers['user-agent'];

    if (!user) {
      throw new AppError('Email ou mot de passe incorrect.', 401);
    }

    if (!user.est_actif) {
      throw new AppError('Ce compte a ete desactive. Contactez le support.', 403);
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);

    await query(
      `INSERT INTO login_logs (user_id, ip_address, user_agent, succes) VALUES ($1, $2, $3, $4)`,
      [user.id, ip, userAgent, validPassword]
    );

    if (!validPassword) {
      throw new AppError('Email ou mot de passe incorrect.', 401);
    }

    await query('UPDATE users SET derniere_connexion = now() WHERE id = $1', [user.id]);

    delete user.password_hash;

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res.json({
      success: true,
      message: 'Connexion reussie.',
      data: { user, accessToken, refreshToken },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/auth/refresh
 * Genere un nouvel access token a partir d'un refresh token valide.
 */
async function refresh(req, res, next) {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      throw new AppError('Refresh token requis.', 400);
    }

    const decoded = verifyRefreshToken(refreshToken);
    const result = await query('SELECT id, role, email, est_actif FROM users WHERE id = $1', [decoded.id]);
    const user = result.rows[0];

    if (!user || !user.est_actif) {
      throw new AppError('Utilisateur introuvable ou compte desactive.', 401);
    }

    const newAccessToken = generateAccessToken(user);
    res.json({ success: true, data: { accessToken: newAccessToken } });
  } catch (err) {
    if (err.name === 'TokenExpiredError' || err.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, message: 'Refresh token invalide ou expire. Reconnexion necessaire.' });
    }
    next(err);
  }
}

/**
 * GET /api/auth/me
 * Retourne le profil de l'utilisateur connecte.
 */
async function me(req, res, next) {
  try {
    const result = await query(
      `SELECT id, role, email, nom, prenom, telephone, cin, pays, ville, adresse,
              langue_preferee, devise_preferee, avatar_url, est_verifie, created_at
       FROM users WHERE id = $1`,
      [req.user.id]
    );
    if (result.rowCount === 0) {
      throw new AppError('Utilisateur introuvable.', 404);
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, refresh, me };
