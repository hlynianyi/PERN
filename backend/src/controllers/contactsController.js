// src/controllers/contactsController.js
const Contacts = require("../models/contacts");

const contactsController = {
  async getContacts(req, res) {
    try {
      const contacts = await Contacts.getContacts();
      res.json(contacts || null);
    } catch (error) {
      console.error("Ошибка при получении контактов:", error);
      res.status(500).json({
        error: "Не удалось получить контактную информацию",
        details: error.message,
      });
    }
  },

  async updateContacts(req, res) {
    try {
      const contactsData = {
        id: req.body.id,
        city: req.body.city,
        address: req.body.address,
        phones: Array.isArray(req.body.phones) ? req.body.phones : [],
        email: req.body.email,
        work_days: req.body.work_days,
        work_hours: req.body.work_hours,
        description: req.body.description,
        telegram: req.body.telegram,
        whatsapp: req.body.whatsapp,
        instagram: req.body.instagram,
        vkontakte: req.body.vkontakte,
      };

      // Проверяем наличие id
      if (!contactsData.id) {
        const initialContacts = await Contacts.getContacts();
        if (initialContacts) {
          contactsData.id = initialContacts.id;
        }
      }

      const contacts = await Contacts.update(contactsData);
      res.json(contacts);
    } catch (error) {
      console.error("Ошибка при обновлении контактов:", error);
      res.status(500).json({
        error: "Не удалось обновить контактную информацию",
        details: error.message,
      });
    }
  },
};

module.exports = contactsController;
