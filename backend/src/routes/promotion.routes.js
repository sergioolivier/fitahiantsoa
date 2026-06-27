const express = require('express');
const router = express.Router();
const promotionController = require('../controllers/promotion.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { requireRole } = require('../middlewares/role.middleware');

router.get('/', promotionController.listActivePromotions);
router.get('/all', authenticate, requireRole('employe', 'admin'), promotionController.listAllPromotions);
router.post('/', authenticate, requireRole('employe', 'admin'), promotionController.createPromotion);
router.patch('/:id/toggle', authenticate, requireRole('employe', 'admin'), promotionController.togglePromotion);

module.exports = router;
