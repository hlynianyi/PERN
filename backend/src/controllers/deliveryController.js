// src/controllers/deliveryController.js
const Delivery = require("../models/delivery");

const deliveryController = {
  async getDelivery(req, res) {
    try {
      const delivery = await Delivery.getDelivery();
      res.json(delivery || null);
    } catch (error) {
      console.error("Ошибка при получении информации о доставке:", error);
      res.status(500).json({
        error: "Не удалось получить информацию о доставке",
        details: error.message,
      });
    }
  },

  async updateDelivery(req, res) {
    try {
      console.log("Received delivery data:", req.body);

      const deliveryData = {
        id: req.body.id,
        subtitle: req.body.subtitle,
        description: req.body.description,
        regions: req.body.regions, // regions уже как объект, не нужно парсить
      };

      const delivery = await Delivery.update(deliveryData);
      res.json(delivery);
    } catch (error) {
      console.error("Ошибка при обновлении информации о доставке:", error);
      res.status(500).json({
        error: "Не удалось обновить информацию о доставке",
        details: error.message,
      });
    }
  },
};

module.exports = deliveryController;
