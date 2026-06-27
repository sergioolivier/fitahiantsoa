const { query } = require('../db/pool');
const { AppError } = require('../middlewares/error.middleware');

/**
 * GET /api/notifications
 * Liste les notifications de l'utilisateur connecte (tous roles).
 */
async function listNotifications(req, res, next) {
  try {
    const result = await query(
      `SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50`,
      [req.user.id]
    );
    const unreadCount = await query(
      `SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND est_lue = false`,
      [req.user.id]
    );
    res.json({ success: true, data: result.rows, non_lues: parseInt(unreadCount.rows[0].count, 10) });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/notifications/:id/read
 * Marque une notification comme lue.
 */
async function markAsRead(req, res, next) {
  try {
    const result = await query(
      `UPDATE notifications SET est_lue = true WHERE id = $1 AND user_id = $2 RETURNING *`,
      [req.params.id, req.user.id]
    );
    if (result.rowCount === 0) {
      throw new AppError('Notification introuvable.', 404);
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/notifications/read-all
 * Marque toutes les notifications de l'utilisateur comme lues.
 */
async function markAllAsRead(req, res, next) {
  try {
    await query(`UPDATE notifications SET est_lue = true WHERE user_id = $1 AND est_lue = false`, [req.user.id]);
    res.json({ success: true, message: 'Toutes les notifications ont ete marquees comme lues.' });
  } catch (err) {
    next(err);
  }
}

module.exports = { listNotifications, markAsRead, markAllAsRead };
