const jwt = require('jsonwebtoken');
require('dotenv').config();

/**
 * Verifie le token JWT envoye dans l'en-tete Authorization (Bearer <token>).
 * Attache les infos utilisateur decodees a req.user si le token est valide.
 */
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Authentification requise. Aucun token fourni.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, role, email }
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Session expiree, veuillez vous reconnecter.' });
    }
    return res.status(401).json({ success: false, message: 'Token invalide.' });
  }
}

/**
 * Middleware optionnel : n'echoue pas si pas de token,
 * mais attache req.user si un token valide est present.
 * Utile pour les routes publiques qui personnalisent le contenu si connecte.
 */
function optionalAuthenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
  } catch (err) {
    // On ignore silencieusement un token invalide ici, la route reste publique.
  }
  next();
}

module.exports = { authenticate, optionalAuthenticate };
