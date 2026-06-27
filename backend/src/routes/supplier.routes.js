const express = require('express');
const router = express.Router();
const supplierController = require('../controllers/supplier.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { requireRole } = require('../middlewares/role.middleware');

router.use(authenticate, requireRole('fournisseur'));

router.get('/dashboard', supplierController.getDashboard);
router.patch('/profile', supplierController.updateProfile);

module.exports = router;
