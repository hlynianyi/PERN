// src/routes/index.js
const express = require("express");
const router = express.Router();
const productRoutes = require("./productRoutes");
const companyRoutes = require("./companyRoutes");
const faqRoutes = require("./faqRoutes");
const partnershipRoutes = require("./partnershipRoutes");
const reviewRoutes = require("./reviewRoutes");
const contactsRoutes = require("./contactsRoutes");
const paymentRoutes = require("./paymentRoutes");
const deliveryRoutes = require("./deliveryRoutes");
const homepageRoutes = require("./homepageRoutes");

// using routes
router.use("/products", productRoutes);
router.use("/company", companyRoutes);
router.use("/faqs", faqRoutes);
router.use("/partnership", partnershipRoutes);
router.use("/reviews", reviewRoutes);
router.use("/contacts", contactsRoutes);
router.use("/payment", paymentRoutes);
router.use("/delivery", deliveryRoutes);
router.use("/homepage", homepageRoutes);

module.exports = router;
