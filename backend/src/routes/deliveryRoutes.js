// src/routes/deliveryRoutes.js
const express = require("express");
const router = express.Router();
const deliveryController = require("../controllers/deliveryController");

router.get("/", deliveryController.getDelivery);
router.post("/", deliveryController.updateDelivery);

module.exports = router;
