// src/routes/index.js
const express = require("express");
const router = express.Router();
const productRoutes = require("./productRoutes");
const companyRoutes = require("./companyRoutes");

router.use("/products", productRoutes);
router.use("/company", companyRoutes);

module.exports = router;
