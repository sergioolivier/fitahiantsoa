const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cart.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { requireRole } = require('../middlewares/role.middleware');

router.use(authenticate, requireRole('client'));

router.get('/', cartController.getCart);
router.post('/', cartController.addToCart);
router.patch('/:id', cartController.updateCartItem);
router.delete('/:id', cartController.removeCartItem);

module.exports = router;
