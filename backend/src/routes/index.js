// src/routes/index.js
const express = require('express');
const router = express.Router();
const productRoutes = require('./productRoutes');

router.use('/products', productRoutes);

module.exports = router;