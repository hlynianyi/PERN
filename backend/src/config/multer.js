// src/config/multer.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Убедимся, что директория uploads существует
const uploadsDir = 'uploads';
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Настройка хранилища для загружаемых файлов
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Генерируем уникальное имя файла
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

// Фильтр файлов
const fileFilter = (req, file, cb) => {
  // Проверяем MIME-тип файла
  if (!file.mimetype.startsWith('image/')) {
    return cb(new Error('Разрешены только изображения'), false);
  }

  // Проверяем расширение файла
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (!allowedExtensions.includes(ext)) {
    return cb(new Error('Неподдерживаемый формат файла'), false);
  }

  cb(null, true);
};

// Конфигурация multer
const multerConfig = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 10 // максимум 10 файлов за раз
  }
});

module.exports = multerConfig;