const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const homepageController = require("../controllers/homepageController");

// Настраиваем хранилище для изображений карусели
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Using the new field name
    if (file.fieldname === "imageFiles") {
      cb(null, "uploads/homepage");
    }
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const fileFilter = function (req, file, cb) {
  if (file.fieldname === "imageFiles") {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
      return cb(new Error("Разрешены только изображения"), false);
    }
  }
  cb(null, true);
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

const uploadFiles = upload.fields([{ name: "imageFiles", maxCount: 5 }]);
// Middleware для обработки ошибок загрузки файлов
const handleUploadErrors = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res
        .status(400)
        .json({ error: "Файл слишком большой (максимум 10MB)" });
    }
    if (err.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({
        error: "Превышено максимальное количество файлов (максимум 5)",
      });
    }
    return res.status(400).json({ error: err.message });
  }
  if (err) {
    return res.status(500).json({ error: err.message });
  }
  next();
};

// Определяем маршруты для работы с главной страницей
router.get("/", homepageController.getHomepage);
router.post(
  "/",
  uploadFiles,
  handleUploadErrors,
  homepageController.createOrUpdateHomepage
);

module.exports = router;
