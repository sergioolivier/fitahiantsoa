const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/review.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { requireRole } = require('../middlewares/role.middleware');

router.get('/product/:productId', reviewController.listProductReviews);
router.post('/', authenticate, requireRole('client'), reviewController.createReview);

module.exports = router;
