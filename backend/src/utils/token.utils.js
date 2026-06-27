const jwt = require('jsonwebtoken');
require('dotenv').config();

/**
 * Genere un access token de courte/moyenne duree.
 */
function generateAccessToken(user) {
  return jwt.sign(
    { id: user.id, role: user.role, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

/**
 * Genere un refresh token de longue duree, utilise pour
 * obtenir un nouvel access token sans redemander le mot de passe.
 */
function generateRefreshToken(user) {
  return jwt.sign(
    { id: user.id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d' }
  );
}

function verifyRefreshToken(token) {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
}

module.exports = { generateAccessToken, generateRefreshToken, verifyRefreshToken };
