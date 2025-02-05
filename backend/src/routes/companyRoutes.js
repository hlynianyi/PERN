const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const companyController = require('../controllers/companyController');

// Настройка хранилища для multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.fieldname === 'images') {
      cb(null, 'uploads/company');
    }
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
  { name: 'images', maxCount: 10 }
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
router.get('/', companyController.getCompany);
router.post('/', uploadFiles, handleUploadErrors, companyController.createOrUpdateCompany);

module.exports = router;