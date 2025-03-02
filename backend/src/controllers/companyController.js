const Company = require("../models/company");
const { deleteFile } = require("../utils/fileHelpers");

const companyController = {
  async getCompany(req, res) {
    try {
      const company = await Company.getCompany();
      res.json(company || null);
    } catch (error) {
      console.error("Ошибка при получении информации о компании:", error);
      res.status(500).json({
        error: "Не удалось получить информацию о компании",
        details: error.message,
      });
    }
  },

  async createOrUpdateCompany(req, res) {
    try {
      // Безопасный парсинг description_blocks
      let descriptionBlocks = [];
      try {
        descriptionBlocks = JSON.parse(req.body.description_blocks || "[]");
      } catch (parseError) {
        console.error("Ошибка парсинга description_blocks:", parseError);
      }

      // Безопасный парсинг deletedImages
      let deletedImages = [];
      try {
        deletedImages = JSON.parse(req.body.deletedImages || "[]");
      } catch (parseError) {
        console.error("Ошибка парсинга deletedImages:", parseError);
      }

      const companyData = {
        title: req.body.title,
        description_blocks: descriptionBlocks,
        deletedImages: deletedImages,
      };

      // Добавляем ID, если присутствует
      if (req.body.id) {
        companyData.id = req.body.id;
      }

      // Определяем метод сохранения
      const saveMethod = companyData.id ? Company.update : Company.create;

      // Сохраняем компанию
      const company = await saveMethod(companyData, req.files?.images || []);

      // Возвращаем статус в зависимости от метода сохранения
      res.status(companyData.id ? 200 : 201).json(company);
    } catch (error) {
      // Удаляем загруженные файлы в случае ошибки
      if (req.files?.images) {
        try {
          for (const file of req.files.images) {
            await deleteFile(`/uploads/company/${file.filename}`);
          }
        } catch (deleteError) {
          console.error("Ошибка при удалении файлов:", deleteError);
        }
      }

      console.error("Ошибка при сохранении информации о компании:", error);

      res.status(500).json({
        error: "Не удалось сохранить информацию о компании",
        details: error.message,
      });
    }
  },
};

module.exports = companyController;
