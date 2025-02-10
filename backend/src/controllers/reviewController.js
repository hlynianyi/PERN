// src/controllers/reviewController.js
const Review = require("../models/review");

const reviewController = {
  async getAllReviews(req, res) {
    try {
      const { page, limit, status } = req.query;
      const reviews = await Review.findAll({
        page: Number(page),
        limit: Number(limit),
        status,
      });

      res.json(reviews);
    } catch (error) {
      console.error("Ошибка при получении отзывов:", error);
      res.status(500).json({ error: error.message });
    }
  },

  async getReviewById(req, res) {
    try {
      const { id } = req.params;
      const review = await Review.findById(id);

      if (!review) {
        return res.status(404).json({ error: "Отзыв не найден" });
      }

      res.json(review);
    } catch (error) {
      console.error("Ошибка при получении отзыва:", error);
      res.status(500).json({ error: error.message });
    }
  },

  async createReview(req, res) {
    try {
      const reviewData = {
        name: req.body.name,
        email: req.body.email || null,
        phone: req.body.phone || null,
        text: req.body.text,
      };

      const review = await Review.create(reviewData);
      res.status(201).json(review);
    } catch (error) {
      console.error("Ошибка при создании отзыва:", error);
      res.status(400).json({ error: error.message });
    }
  },

  async updateReview(req, res) {
    try {
      const { id } = req.params;
      const reviewData = {
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        text: req.body.text,
        status: req.body.status,
      };

      const review = await Review.update(id, reviewData);
      res.json(review);
    } catch (error) {
      console.error("Ошибка при обновлении отзыва:", error);
      res.status(400).json({ error: error.message });
    }
  },

  async deleteReview(req, res) {
    try {
      const { id } = req.params;
      await Review.delete(id);
      res.status(204).send();
    } catch (error) {
      console.error("Ошибка при удалении отзыва:", error);
      res.status(500).json({ error: error.message });
    }
  },

  async updateReviewStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const review = await Review.updateStatus(id, status);
      res.json(review);
    } catch (error) {
      console.error("Ошибка при обновлении статуса отзыва:", error);
      res.status(500).json({ error: error.message });
    }
  },
};

module.exports = reviewController;
