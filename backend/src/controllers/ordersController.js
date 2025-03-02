// src/controllers/ordersController.js
const Order = require("../models/order");

const ordersController = {
  async getAllOrders(req, res) {
    try {
      const { page, limit, status } = req.query;
      const orders = await Order.findAll({
        page: Number(page) || 1,
        limit: Number(limit) || 10,
        status: status || null
      });

      res.json(orders);
    } catch (error) {
      console.error("Ошибка при получении заказов:", error);
      res.status(500).json({ error: error.message });
    }
  },

  async getOrderById(req, res) {
    try {
      const { id } = req.params;
      const order = await Order.findById(id);

      if (!order) {
        return res.status(404).json({ error: "Заказ не найден" });
      }

      res.json(order);
    } catch (error) {
      console.error("Ошибка при получении заказа:", error);
      res.status(500).json({ error: error.message });
    }
  },

  async createOrder(req, res) {
    try {
      // Validate required fields
      if (!req.body.customerPhone || !req.body.items || req.body.items.length === 0) {
        return res.status(400).json({
          error: "Не указаны обязательные поля: номер телефона или товары"
        });
      }

      const orderData = {
        customerName: req.body.customerName,
        customerPhone: req.body.customerPhone,
        customerEmail: req.body.customerEmail,
        customerZipCode: req.body.customerZipCode,
        customerAddress: req.body.customerAddress,
        customerComment: req.body.customerComment,
        items: req.body.items,
        totalAmount: req.body.totalAmount
      };

      const order = await Order.create(orderData);
      res.status(201).json(order);
    } catch (error) {
      console.error("Ошибка при создании заказа:", error);
      res.status(400).json({ error: error.message });
    }
  },

  async updateOrderStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status) {
        return res.status(400).json({ error: "Статус не указан" });
      }

      const order = await Order.updateStatus(id, status);
      res.json(order);
    } catch (error) {
      console.error("Ошибка при обновлении статуса заказа:", error);
      res.status(500).json({ error: error.message });
    }
  },

  async deleteOrder(req, res) {
    try {
      const { id } = req.params;
      await Order.delete(id);
      res.status(204).send();
    } catch (error) {
      console.error("Ошибка при удалении заказа:", error);
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = ordersController;