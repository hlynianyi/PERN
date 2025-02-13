const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");

router.get("/", paymentController.getPayment);
router.post("/", paymentController.updatePayment);

module.exports = router;