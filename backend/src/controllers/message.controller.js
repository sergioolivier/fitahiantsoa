const { query } = require('../db/pool');
const { AppError } = require('../middlewares/error.middleware');

/**
 * POST /api/messages
 * Envoie un message a un autre utilisateur (ex : fournisseur <-> employe).
 */
async function sendMessage(req, res, next) {
  try {
    const { recipient_id, sujet, contenu, related_product_id, related_order_id } = req.body;
    if (!recipient_id || !contenu) {
      throw new AppError('recipient_id et contenu sont obligatoires.', 400);
    }

    const recipientCheck = await query('SELECT id FROM users WHERE id = $1', [recipient_id]);
    if (recipientCheck.rowCount === 0) {
      throw new AppError('Destinataire introuvable.', 404);
    }

    const result = await query(
      `INSERT INTO messages (sender_id, recipient_id, sujet, contenu, related_product_id, related_order_id)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [req.user.id, recipient_id, sujet || null, contenu, related_product_id || null, related_order_id || null]
    );

    await query(
      `INSERT INTO notifications (user_id, type, titre, message)
       VALUES ($1, 'message', 'Nouveau message', $2)`,
      [recipient_id, sujet ? `Nouveau message : ${sujet}` : 'Vous avez recu un nouveau message.']
    );

    res.status(201).json({ success: true, message: 'Message envoye.', data: result.rows[0] });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/messages/inbox
 * Boite de reception de l'utilisateur connecte.
 */
async function getInbox(req, res, next) {
  try {
    const result = await query(
      `SELECT m.*, u.nom AS sender_nom, u.prenom AS sender_prenom, u.role AS sender_role
       FROM messages m JOIN users u ON u.id = m.sender_id
       WHERE m.recipient_id = $1 ORDER BY m.created_at DESC`,
      [req.user.id]
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/messages/sent
 * Messages envoyes par l'utilisateur connecte.
 */
async function getSent(req, res, next) {
  try {
    const result = await query(
      `SELECT m.*, u.nom AS recipient_nom, u.prenom AS recipient_prenom
       FROM messages m JOIN users u ON u.id = m.recipient_id
       WHERE m.sender_id = $1 ORDER BY m.created_at DESC`,
      [req.user.id]
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/messages/:id/read
 */
async function markMessageRead(req, res, next) {
  try {
    const result = await query(
      `UPDATE messages SET est_lu = true WHERE id = $1 AND recipient_id = $2 RETURNING *`,
      [req.params.id, req.user.id]
    );
    if (result.rowCount === 0) {
      throw new AppError('Message introuvable.', 404);
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
}

module.exports = { sendMessage, getInbox, getSent, markMessageRead };
