/**
 * Middleware de controle d'acces base sur le role.
 * Usage : requireRole('admin') ou requireRole('admin', 'employe')
 *
 * Doit etre utilise APRES le middleware authenticate, car il
 * depend de req.user.role deja renseigne.
 */
function requireRole(...rolesAutorises) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentification requise.' });
    }
    if (!rolesAutorises.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Acces refuse. Ce role (${req.user.role}) n'est pas autorise pour cette action.`,
      });
    }
    next();
  };
}

module.exports = { requireRole };
