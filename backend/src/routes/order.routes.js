const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { requireRole } = require('../middlewares/role.middleware');

router.post('/', authenticate, requireRole('client'), orderController.createOrder);
router.get('/mine', authenticate, requireRole('client'), orderController.listMyOrders);
router.get('/', authenticate, requireRole('employe', 'admin'), orderController.listAllOrders);
router.get('/:id', authenticate, orderController.getOrder);
router.patch('/:id/status', authenticate, requireRole('employe', 'admin'), orderController.updateOrderStatus);

module.exports = router;
