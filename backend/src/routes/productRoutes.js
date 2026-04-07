const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.get('/', productController.getProducts);
router.get('/user', authMiddleware, productController.getUserProducts);

router.post('/', authMiddleware, productController.addProduct);
router.delete('/:id', authMiddleware, productController.deleteProduct);

router.get('/:id', productController.getProductDetail);

module.exports = router;
