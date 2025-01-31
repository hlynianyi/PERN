// src/middleware/upload.js
const multerConfig = require('../config/multer');

// Middleware для обработки загрузки файлов с обработкой ошибок
const uploadMiddleware = (req, res, next) => {
  const upload = multerConfig.array('images', 10);

  upload(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          error: 'Размер файла превышает допустимый лимит (5MB)'
        });
      }
      if (err.code === 'LIMIT_FILE_COUNT') {
        return res.status(400).json({
          error: 'Превышено максимальное количество файлов (10)'
        });
      }
      if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(400).json({
          error: 'Неожиданный тип файла'
        });
      }
      return res.status(400).json({
        error: err.message
      });
    }
    next();
  });
};

module.exports = uploadMiddleware;