// src/routes/productRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const productController = require('../controllers/productController');

// Настройка хранилища для multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = file.fieldname === 'images' ? 'uploads/images' : 'uploads/certificates';
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

// Фильтр файлов
const fileFilter = function (req, file, cb) {
  if (file.fieldname === 'images') {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
      return cb(new Error('Разрешены только изображения'), false);
    }
  } else if (file.fieldname === 'certificates') {
    if (!file.originalname.match(/\.(pdf|jpg|jpeg|png)$/i)) {
      return cb(new Error('Разрешены только PDF и изображения'), false);
    }
  }
  cb(null, true);
};

// Настройка multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB максимум
  }
});

// Middleware для загрузки файлов
const uploadFiles = upload.fields([
  { name: 'images', maxCount: 10 },
  { name: 'certificates', maxCount: 5 }
]);

// Middleware для обработки ошибок загрузки
const handleUploadErrors = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'Файл слишком большой (максимум 10MB)' });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ error: 'Превышено максимальное количество файлов' });
    }
    return res.status(400).json({ error: err.message });
  }
  if (err) {
    return res.status(500).json({ error: err.message });
  }
  next();
};

// Маршруты
router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);
router.post('/', uploadFiles, handleUploadErrors, productController.createProduct);
router.put('/:id', uploadFiles, handleUploadErrors, productController.updateProduct);
router.delete('/:id', productController.deleteProduct);
router.patch('/:id/status', productController.updateProductStatus);

// Маршруты для отзывов
router.post('/:productId/reviews', productController.addReview);
router.put('/reviews/:reviewId', productController.updateReview);
router.delete('/reviews/:reviewId', productController.deleteReview);

module.exports = router;