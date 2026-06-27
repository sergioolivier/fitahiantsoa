const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const mediaController = require('../controllers/media.controller');
const { authenticate, optionalAuthenticate } = require('../middlewares/auth.middleware');
const { requireRole } = require('../middlewares/role.middleware');
const { upload } = require('../middlewares/upload.middleware');

// Routes publiques (catalogue)
router.get('/', optionalAuthenticate, productController.listProducts);

// Routes fournisseur (avant /:id pour eviter conflit de route)
router.get('/mine', authenticate, requireRole('fournisseur'), productController.listMyProducts);
router.post('/', authenticate, requireRole('fournisseur'), productController.createProduct);
router.patch('/:id', authenticate, requireRole('fournisseur'), productController.updateProduct);
router.post('/:id/media', authenticate, requireRole('fournisseur'), upload.single('file'), mediaController.uploadProductMedia);
router.delete('/:id/media/:mediaId', authenticate, requireRole('fournisseur'), mediaController.deleteProductMedia);

// Routes employe/admin (validation)
router.get('/pending', authenticate, requireRole('employe', 'admin'), productController.listPendingProducts);
router.patch('/:id/validate', authenticate, requireRole('employe', 'admin'), productController.validateProduct);
router.patch('/:id/refuse', authenticate, requireRole('employe', 'admin'), productController.refuseProduct);

// Suppression (admin ou fournisseur proprietaire)
router.delete('/:id', authenticate, requireRole('admin', 'fournisseur'), productController.deleteProduct);

// Fiche produit publique (en dernier car catch-all sur :id)
router.get('/:id', optionalAuthenticate, productController.getProduct);

module.exports = router;
