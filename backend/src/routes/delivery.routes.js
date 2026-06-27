const express = require('express');
const router = express.Router();
const deliveryController = require('../controllers/delivery.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { requireRole } = require('../middlewares/role.middleware');

router.get('/available', authenticate, requireRole('partenaire_logistique'), deliveryController.listAvailableDeliveries);
router.get('/mine', authenticate, requireRole('partenaire_logistique'), deliveryController.listMyDeliveries);
router.patch('/:id/accept', authenticate, requireRole('partenaire_logistique'), deliveryController.acceptDelivery);
router.patch('/:id/refuse', authenticate, requireRole('partenaire_logistique'), deliveryController.refuseDelivery);
router.patch('/:id/status', authenticate, requireRole('partenaire_logistique'), deliveryController.updateDeliveryStatus);
router.post('/:orderId/generate-code', authenticate, requireRole('client', 'employe', 'admin'), deliveryController.generateConfirmationCodeForOrder);

module.exports = router;
