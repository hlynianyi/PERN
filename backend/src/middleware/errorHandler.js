// src/middleware/errorHandler.js
const errorHandler = (err, req, res, next) => {
    console.error(err.stack);
  
    if (err instanceof multer.MulterError) {
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
    }
  
    res.status(500).json({
      error: 'Внутренняя ошибка сервера'
    });
  };
  
  module.exports = errorHandler;