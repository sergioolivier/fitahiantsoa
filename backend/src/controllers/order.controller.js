const { query, getClient } = require('../db/pool');
const { AppError } = require('../middlewares/error.middleware');
const { generateOrderNumber } = require('../utils/codes.utils');

/**
 * POST /api/orders
 * Cree une commande a partir du panier du client, en transaction.
 * Etapes : verification stock -> creation commande -> creation lignes
 * -> calcul commission par ligne -> vidage du panier -> notification.
 */
async function createOrder(req, res, next) {
  const client = await getClient();
  try {
    const { adresse_livraison, ville_livraison, pays_livraison, telephone_contact, methode_paiement } = req.body;

    if (!adresse_livraison || !telephone_contact) {
      throw new AppError('Adresse de livraison et telephone de contact sont obligatoires.', 400);
    }

    await client.query('BEGIN');

    const cartResult = await client.query(
      `SELECT ci.quantite, p.id AS product_id, p.prix_vente, p.supplier_id, p.stock_theorique, p.nom
       FROM cart_items ci JOIN products p ON p.id = ci.product_id
       WHERE ci.client_id = $1`,
      [req.user.id]
    );

    if (cartResult.rowCount === 0) {
      throw new AppError('Le panier est vide.', 400);
    }

    // Verification du stock theorique pour chaque article
    for (const item of cartResult.rows) {
      if (item.stock_theorique < item.quantite) {
        throw new AppError(`Stock insuffisant pour "${item.nom}" (disponible : ${item.stock_theorique}).`, 400);
      }
    }

    const montantTotal = cartResult.rows.reduce((sum, item) => sum + parseFloat(item.prix_vente) * item.quantite, 0);
    const fraisLivraison = 0; // a calculer selon distance/poids dans une version future
    const numeroCommande = generateOrderNumber();

    const orderResult = await client.query(
      `INSERT INTO orders (numero_commande, client_id, montant_total, frais_livraison, adresse_livraison, ville_livraison, pays_livraison, telephone_contact, statut)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'confirmee')
       RETURNING *`,
      [numeroCommande, req.user.id, montantTotal + fraisLivraison, fraisLivraison, adresse_livraison, ville_livraison || null, pays_livraison || 'Madagascar', telephone_contact]
    );
    const order = orderResult.rows[0];

    for (const item of cartResult.rows) {
      const supplierProfile = await client.query(
        `SELECT commission_taux FROM supplier_profiles WHERE user_id = $1`,
        [item.supplier_id]
      );
      const tauxCommission = supplierProfile.rows[0]?.commission_taux ?? 15.0;
      const montantLigne = parseFloat(item.prix_vente) * item.quantite;
      const commissionMontant = montantLigne * (tauxCommission / 100);
      const montantDuFournisseur = montantLigne - commissionMontant;

      await client.query(
        `INSERT INTO order_items (order_id, product_id, supplier_id, quantite, prix_unitaire, commission_montant, montant_du_fournisseur)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [order.id, item.product_id, item.supplier_id, item.quantite, item.prix_vente, commissionMontant, montantDuFournisseur]
      );

      // Decrement du stock theorique et incrementation des ventes
      await client.query(
        `UPDATE products SET stock_theorique = stock_theorique - $1, nombre_ventes = nombre_ventes + $1 WHERE id = $2`,
        [item.quantite, item.product_id]
      );

      // Mise a jour du solde disponible du fournisseur
      await client.query(
        `UPDATE supplier_profiles SET solde_disponible = solde_disponible + $1 WHERE user_id = $2`,
        [montantDuFournisseur, item.supplier_id]
      );

      // Notification au fournisseur
      await client.query(
        `INSERT INTO notifications (user_id, type, titre, message, lien_action)
         VALUES ($1, 'commande', 'Nouvelle vente', $2, $3)`,
        [item.supplier_id, `Votre produit a ete commande (x${item.quantite}). Commande ${numeroCommande}.`, `/fournisseur/ventes`]
      );
    }

    // Enregistrement du paiement (statut en_attente, a brancher avec un vrai prestataire plus tard)
    await client.query(
      `INSERT INTO payments (order_id, methode, statut, montant)
       VALUES ($1, $2, 'en_attente', $3)`,
      [order.id, methode_paiement || 'especes_livraison', order.montant_total]
    );

    // Creation automatique de la demande de livraison
    await client.query(
      `INSERT INTO deliveries (order_id, statut) VALUES ($1, 'demande')`,
      [order.id]
    );

    // Vidage du panier
    await client.query(`DELETE FROM cart_items WHERE client_id = $1`, [req.user.id]);

    // Notification au client
    await client.query(
      `INSERT INTO notifications (user_id, type, titre, message, lien_action)
       VALUES ($1, 'commande', 'Commande confirmee', $2, $3)`,
      [req.user.id, `Votre commande ${numeroCommande} a ete confirmee.`, `/client/commandes/${order.id}`]
    );

    await client.query('COMMIT');

    res.status(201).json({ success: true, message: 'Commande creee avec succes.', data: order });
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
}

/**
 * GET /api/orders/mine
 * [CLIENT] Historique des commandes du client connecte.
 */
async function listMyOrders(req, res, next) {
  try {
    const result = await query(
      `SELECT o.*, d.statut AS statut_livraison, d.logistics_partner_id
       FROM orders o LEFT JOIN deliveries d ON d.order_id = o.id
       WHERE o.client_id = $1 ORDER BY o.created_at DESC`,
      [req.user.id]
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/orders/:id
 * Detail d'une commande (client proprietaire, employe, ou admin).
 */
async function getOrder(req, res, next) {
  try {
    const { id } = req.params;
    const orderResult = await query('SELECT * FROM orders WHERE id = $1', [id]);
    if (orderResult.rowCount === 0) {
      throw new AppError('Commande introuvable.', 404);
    }
    const order = orderResult.rows[0];

    if (req.user.role === 'client' && order.client_id !== req.user.id) {
      throw new AppError('Acces non autorise a cette commande.', 403);
    }

    const items = await query(
      `SELECT oi.*, p.nom AS produit_nom FROM order_items oi JOIN products p ON p.id = oi.product_id WHERE oi.order_id = $1`,
      [id]
    );
    const delivery = await query('SELECT * FROM deliveries WHERE order_id = $1', [id]);
    const payment = await query('SELECT * FROM payments WHERE order_id = $1', [id]);

    res.json({ success: true, data: { ...order, items: items.rows, livraison: delivery.rows[0] || null, paiement: payment.rows[0] || null } });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/orders
 * [EMPLOYE/ADMIN] Liste de toutes les commandes, avec filtre optionnel par statut.
 */
async function listAllOrders(req, res, next) {
  try {
    const { statut } = req.query;
    const conditions = [];
    const params = [];
    if (statut) {
      conditions.push(`o.statut = $1`);
      params.push(statut);
    }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const result = await query(
      `SELECT o.*, u.nom AS client_nom, u.prenom AS client_prenom, u.telephone AS client_telephone
       FROM orders o JOIN users u ON u.id = o.client_id
       ${where} ORDER BY o.created_at DESC`,
      params
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/orders/:id/status
 * [EMPLOYE/ADMIN] Change le statut d'une commande.
 */
async function updateOrderStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { statut } = req.body;
    const statutsValides = ['en_attente', 'confirmee', 'en_preparation', 'prise_en_charge', 'en_transit', 'livree', 'annulee', 'remboursee'];

    if (!statutsValides.includes(statut)) {
      throw new AppError('Statut invalide.', 400);
    }

    const result = await query(
      `UPDATE orders SET statut = $1, traite_par = $2 WHERE id = $3 RETURNING *`,
      [statut, req.user.id, id]
    );
    if (result.rowCount === 0) {
      throw new AppError('Commande introuvable.', 404);
    }

    const order = result.rows[0];
    await query(
      `INSERT INTO notifications (user_id, type, titre, message, lien_action)
       VALUES ($1, 'commande', 'Mise a jour de commande', $2, $3)`,
      [order.client_id, `Votre commande ${order.numero_commande} est maintenant : ${statut}.`, `/client/commandes/${order.id}`]
    );

    res.json({ success: true, message: 'Statut de la commande mis a jour.', data: order });
  } catch (err) {
    next(err);
  }
}

module.exports = { createOrder, listMyOrders, getOrder, listAllOrders, updateOrderStatus };
