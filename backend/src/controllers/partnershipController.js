// src/controllers/partnershipController.js
const Partnership = require("../models/partnership");

const partnershipController = {
  async getPartnership(req, res) {
    try {
      const partnership = await Partnership.getPartnership();
      res.json(partnership || null);
    } catch (error) {
      console.error("Ошибка при получении гарантийной информации:", error);
      res.status(500).json({
        error: "Не удалось получить информацию о гарантии",
        details: error.message,
      });
    }
  },

  async updatePartnership(req, res) {
    try {
      let text_blocks = [];
      try {
        text_blocks = JSON.parse(req.body.text_blocks || "[]");
      } catch (parseError) {
        console.error("Ошибка парсинга text_blocks:", parseError);
        return res.status(400).json({
          error: "Некорректный формат text_blocks",
          details: parseError.message,
        });
      }

      const partnershipData = {
        id: req.body.id,
        title: req.body.title,
        text_blocks: text_blocks,
      };

      const partnership = await Partnership.update(partnershipData);
      res.json(partnership);
    } catch (error) {
      console.error("Ошибка при обновлении гарантии:", error);
      res.status(500).json({
        error: "Не удалось обновить информацию о гарантии",
        details: error.message,
      });
    }
  },
};

module.exports = partnershipController;
