const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { requireRole } = require('../middlewares/role.middleware');

router.use(authenticate, requireRole('admin'));

router.get('/users', adminController.listUsers);
router.post('/users', adminController.createInternalUser);
router.patch('/users/:id/toggle-active', adminController.toggleUserActive);
router.patch('/users/:id/role', adminController.changeUserRole);
router.patch('/users/:id/staff-type', adminController.changeStaffType);
router.get('/dashboard', adminController.getDashboardStats);

module.exports = router;
