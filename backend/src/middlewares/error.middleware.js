/**
 * Middleware centralise de gestion des erreurs.
 * Doit etre place en DERNIER dans la chaine de middlewares d'Express.
 */
function errorHandler(err, req, res, next) {
  console.error('[ERROR]', err);

  // Erreurs PostgreSQL connues
  if (err.code === '23505') {
    return res.status(409).json({ success: false, message: 'Cette ressource existe deja (conflit d\'unicite).' });
  }
  if (err.code === '23503') {
    return res.status(400).json({ success: false, message: 'Reference invalide vers une ressource liee.' });
  }
  if (err.code === '22P02') {
    return res.status(400).json({ success: false, message: 'Format de donnees invalide.' });
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Erreur interne du serveur.';

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {}),
  });
}

/**
 * Middleware pour les routes non trouvees (404).
 */
function notFoundHandler(req, res) {
  res.status(404).json({ success: false, message: `Route non trouvee : ${req.method} ${req.originalUrl}` });
}

/**
 * Classe d'erreur applicative avec code de statut HTTP.
 */
class AppError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}

module.exports = { errorHandler, notFoundHandler, AppError };
