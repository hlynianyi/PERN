// src/routes/warrantyRoutes.js
const express = require("express");
const router = express.Router();
const partnershipController = require("../controllers/partnershipController");

// Базовые маршруты для работы с гарантийной информацией
router.get("/", partnershipController.getPartnership);
router.post("/", partnershipController.updatePartnership);

module.exports = router;
