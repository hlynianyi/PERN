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

      // Parse deletedImages array from JSON string
      let deletedImages = [];
      if (req.body.deletedImages) {
        try {
          deletedImages = JSON.parse(req.body.deletedImages);
          console.log("Parsed deletedImages:", deletedImages);
        } catch (parseError) {
          console.error("Error parsing deletedImages:", parseError);
        }
      }

      // Parse popularProducts array from JSON string if it's a string
      let popularProducts = req.body.popularProducts;
      if (typeof popularProducts === "string") {
        try {
          popularProducts = JSON.parse(popularProducts);
        } catch (parseError) {
          console.error("Error parsing popularProducts:", parseError);
          popularProducts = [];
        }
      }

      const homepageData = {
        id: req.body.id,
        title: req.body.title,
        description: req.body.description,
        imageMetadata: req.body.imageMetadata,
        deletedImages: deletedImages,
        popularProducts: popularProducts,
        files: req.files,
      };

      const homepage = await Homepage.update(homepageData);
      res.status(200).json(homepage);
    } catch (error) {
      // Clean up uploaded files in case of error
      if (req.files?.images) {
        const images = Array.isArray(req.files.images)
          ? req.files.images
          : [req.files.images];

        for (const file of images) {
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

  // Add a dedicated endpoint for deleting a single image
  async deleteImage(req, res) {
    try {
      const { id } = req.params;

      // Get the image URL before deletion to remove the file
      const result = await Homepage.deleteImage(id);

      res
        .status(200)
        .json({ success: true, message: "Изображение успешно удалено" });
    } catch (error) {
      console.error("Error deleting image:", error);
      res.status(500).json({
        error: "Не удалось удалить изображение",
        details: error.message,
      });
    }
  },
};

module.exports = homepageController;
