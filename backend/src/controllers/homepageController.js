// controllers/homepageController.js

const Homepage = require("../models/homepage");
const { deleteFile } = require("../utils/fileHelpers");
const path = require("path");
const fs = require("fs").promises;

const homepageController = {
  async getHomepage(req, res) {
    try {
      const homepage = await Homepage.getHomepage();
      res.json(homepage || null);
    } catch (error) {
      console.error("Ошибка при получении данных главной страницы:", error);
      res.status(500).json({
        error: "Не удалось получить данные главной страницы",
        details: error.message,
      });
    }
  },

  async createOrUpdateHomepage(req, res) {
    try {
      console.log("Received body:", req.body);
      console.log("Received files:", req.files);

      const homepageData = {
        id: req.body.id,
        title: req.body.title,
        description: req.body.description,
        imageMetadata: req.body.imageMetadata,
        popularProducts: req.body.popularProducts,
        files: req.files,
      };

      const homepage = await Homepage.update(homepageData);
      res.status(200).json(homepage);
    } catch (error) {
      // Clean up any uploaded files in case of error
      if (req.files?.imageFiles) {
        for (const file of req.files.imageFiles) {
          try {
            await deleteFile(file.path);
          } catch (deleteError) {
            console.error("Error deleting file:", deleteError);
          }
        }
      }

      console.error("Error saving homepage:", error);
      res.status(500).json({
        error: "Не удалось сохранить данные главной страницы",
        details: error.message,
      });
    }
  },
};

module.exports = homepageController;
