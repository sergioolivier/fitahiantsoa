const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { requireRole } = require('../middlewares/role.middleware');

router.get('/', categoryController.listCategories);
router.post('/', authenticate, requireRole('admin'), categoryController.createCategory);
router.delete('/:id', authenticate, requireRole('admin'), categoryController.deleteCategory);

module.exports = router;
