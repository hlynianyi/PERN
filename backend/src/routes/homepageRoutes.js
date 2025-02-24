// src/routes/homepageRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const homepageController = require('../controllers/homepageController');

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/homepage');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

// File filter
const fileFilter = function (req, file, cb) {
  if (file.fieldname === 'images') {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
      return cb(new Error('Only image files are allowed'), false);
    }
  }
  cb(null, true);
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Handle upload errors
const handleUploadErrors = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large (max 5MB)' });
    }
    return res.status(400).json({ error: err.message });
  }
  if (err) {
    return res.status(500).json({ error: err.message });
  }
  next();
};

// Routes
router.get('/', homepageController.getHomepage);
router.post('/', upload.fields([{ name: 'images', maxCount: 5 }]), handleUploadErrors, homepageController.createOrUpdateHomepage);
router.delete('/images/:id', homepageController.deleteImage);

module.exports = router;