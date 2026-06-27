const { query } = require('../db/pool');
const { AppError } = require('../middlewares/error.middleware');
const { generateConfirmationCode } = require('../utils/codes.utils');

/**
 * GET /api/deliveries/available
 * [PARTENAIRE LOGISTIQUE] Liste des demandes de livraison non encore assignees.
 */
async function listAvailableDeliveries(req, res, next) {
  try {
    const result = await query(
      `SELECT d.*, o.numero_commande, o.adresse_livraison, o.ville_livraison, o.telephone_contact, o.montant_total
       FROM deliveries d JOIN orders o ON o.id = d.order_id
       WHERE d.statut = 'demande' AND d.logistics_partner_id IS NULL
       ORDER BY d.date_demande ASC`
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/deliveries/mine
 * [PARTENAIRE LOGISTIQUE] Livraisons assignees au partenaire connecte.
 */
async function listMyDeliveries(req, res, next) {
  try {
    const result = await query(
      `SELECT d.*, o.numero_commande, o.adresse_livraison, o.ville_livraison, o.telephone_contact, o.montant_total
       FROM deliveries d JOIN orders o ON o.id = d.order_id
       WHERE d.logistics_partner_id = $1
       ORDER BY d.created_at DESC`,
      [req.user.id]
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/deliveries/:id/accept
 * [PARTENAIRE LOGISTIQUE] Accepte une mission de livraison.
 */
async function acceptDelivery(req, res, next) {
  try {
    const { id } = req.params;
    const result = await query(
      `UPDATE deliveries SET statut = 'acceptee', logistics_partner_id = $1, date_acceptation = now(),
              historique_statuts = historique_statuts || jsonb_build_object('statut', 'acceptee', 'date', now())
       WHERE id = $2 AND statut = 'demande' AND logistics_partner_id IS NULL
       RETURNING *`,
      [req.user.id, id]
    );
    if (result.rowCount === 0) {
      throw new AppError('Cette mission n\'est plus disponible.', 409);
    }
    res.json({ success: true, message: 'Mission acceptee.', data: result.rows[0] });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/deliveries/:id/refuse
 * [PARTENAIRE LOGISTIQUE] Refuse une mission qui lui avait ete proposee/assignee.
 */
async function refuseDelivery(req, res, next) {
  try {
    const { id } = req.params;
    const result = await query(
      `UPDATE deliveries SET statut = 'demande', logistics_partner_id = NULL
       WHERE id = $1 AND logistics_partner_id = $2 RETURNING *`,
      [id, req.user.id]
    );
    if (result.rowCount === 0) {
      throw new AppError('Mission introuvable.', 404);
    }
    res.json({ success: true, message: 'Mission refusee, elle redevient disponible pour d\'autres partenaires.', data: result.rows[0] });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/deliveries/:id/status
 * [PARTENAIRE LOGISTIQUE] Met a jour le statut d'une livraison en cours.
 * Statuts attendus dans l'ordre : ramassage -> en_transit -> livree
 */
async function updateDeliveryStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { statut, code_confirmation } = req.body;
    const statutsValides = ['ramassage', 'en_transit', 'livree', 'echouee'];

    if (!statutsValides.includes(statut)) {
      throw new AppError('Statut invalide.', 400);
    }

    const delivery = await query('SELECT * FROM deliveries WHERE id = $1 AND logistics_partner_id = $2', [id, req.user.id]);
    if (delivery.rowCount === 0) {
      throw new AppError('Livraison introuvable ou non assignee a ce partenaire.', 404);
    }

    if (statut === 'livree') {
      if (!code_confirmation || code_confirmation !== delivery.rows[0].code_confirmation) {
        throw new AppError('Code de confirmation invalide. Demandez le code au client pour confirmer la reception.', 400);
      }
    }

    const dateField = statut === 'ramassage' ? 'date_ramassage' : statut === 'livree' ? 'date_livraison' : null;

    const result = await query(
      `UPDATE deliveries SET statut = $1::delivery_status,
              ${dateField ? `${dateField} = now(),` : ''}
              historique_statuts = historique_statuts || jsonb_build_object('statut', $3::text, 'date', now())
       WHERE id = $2 RETURNING *`,
      [statut, id, statut]
    );

    const updatedDelivery = result.rows[0];

    // Synchronisation du statut de la commande correspondante
    const statutCommandeMap = { ramassage: 'prise_en_charge', en_transit: 'en_transit', livree: 'livree', echouee: 'en_attente' };
    if (statutCommandeMap[statut]) {
      await query('UPDATE orders SET statut = $1 WHERE id = $2', [statutCommandeMap[statut], updatedDelivery.order_id]);

      const orderRes = await query('SELECT client_id, numero_commande FROM orders WHERE id = $1', [updatedDelivery.order_id]);
      if (orderRes.rowCount > 0) {
        await query(
          `INSERT INTO notifications (user_id, type, titre, message)
           VALUES ($1, 'livraison', 'Mise a jour de livraison', $2)`,
          [orderRes.rows[0].client_id, `Votre commande ${orderRes.rows[0].numero_commande} : statut de livraison -> ${statut}.`]
        );
      }
    }

    res.json({ success: true, message: 'Statut de livraison mis a jour.', data: updatedDelivery });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/deliveries/:orderId/generate-code
 * Genere (ou regenere) un code de confirmation pour une commande,
 * a communiquer au client pour qu'il le transmette au livreur.
 * Accessible par employe/admin ou le client proprietaire.
 */
async function generateConfirmationCodeForOrder(req, res, next) {
  try {
    const { orderId } = req.params;
    const order = await query('SELECT client_id FROM orders WHERE id = $1', [orderId]);
    if (order.rowCount === 0) {
      throw new AppError('Commande introuvable.', 404);
    }
    if (req.user.role === 'client' && order.rows[0].client_id !== req.user.id) {
      throw new AppError('Acces non autorise.', 403);
    }

    const code = generateConfirmationCode();
    const result = await query(
      `UPDATE deliveries SET code_confirmation = $1 WHERE order_id = $2 RETURNING *`,
      [code, orderId]
    );
    if (result.rowCount === 0) {
      throw new AppError('Livraison introuvable pour cette commande.', 404);
    }

    res.json({ success: true, message: 'Code de confirmation genere.', data: { code_confirmation: code } });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listAvailableDeliveries,
  listMyDeliveries,
  acceptDelivery,
  refuseDelivery,
  updateDeliveryStatus,
  generateConfirmationCodeForOrder,
};
