// src/controllers/faqController.js
const FAQ = require("../models/faq");

const faqController = {
  async getFaq(req, res) {
    try {
      const faq = await FAQ.getFaq();
      res.json(faq || null);
    } catch (error) {
      console.error("Error getting FAQ:", error);
      res.status(500).json({
        error: "Failed to get FAQ information",
        details: error.message,
      });
    }
  },

  async updateFaq(req, res) {
    try {
      console.log("Received request body:", req.body);

      let description_blocks = [];
      try {
        description_blocks = JSON.parse(req.body.description_blocks || "[]");
      } catch (parseError) {
        console.error("Error parsing description_blocks:", parseError);
      }

      const faqData = {
        id: req.body.id,
        title: req.body.title,
        description_blocks: description_blocks
      };

      const faq = await FAQ.update(faqData);
      res.json(faq);
    } catch (error) {
      console.error("Error saving FAQ:", error);
      res.status(500).json({
        error: "Failed to save FAQ",
        details: error.message,
      });
    }
  },
};

module.exports = faqController;