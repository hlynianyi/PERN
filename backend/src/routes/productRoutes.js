// src/routes/productRoutes.js
const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const uploadMiddleware = require('../middleware/upload');

router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);
router.post('/', uploadMiddleware, productController.createProduct);
router.put('/:id', uploadMiddleware, productController.updateProduct);
router.delete('/:id', productController.deleteProduct);
router.post('/:productId/images/:imageId/primary', productController.setPrimaryImage);

module.exports = router;