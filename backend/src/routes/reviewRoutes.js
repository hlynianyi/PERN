// src/routes/reviewRoutes.js
const express = require("express");
const reviewController = require("../controllers/reviewController");

const router = express.Router();

// Публичные маршруты
router.post("/", reviewController.createReview);
router.get("/", reviewController.getAllReviews);
router.get("/:id", reviewController.getReviewById);

// Маршруты для администратора (без специальной авторизации)
router.put("/:id", reviewController.updateReview);
router.put("/:id/status", reviewController.updateReviewStatus);
router.delete("/:id", reviewController.deleteReview);

module.exports = router;
