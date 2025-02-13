// src/controllers/paymentController.js
const Payment = require('../models/payment');

const paymentController = {
    async getPayment(req, res) {
        try {
            const payment = await Payment.getPayment();
            res.json(payment || null);
        } catch (error) {
            console.error("Ошибка при получении информации об оплате:", error);
            res.status(500).json({
                error: "Не удалось получить информацию об оплате",
                details: error.message
            });
        }
    },

    async updatePayment(req, res) {
        try {
            console.log("Received payment data:", req.body);

            let descriptions = [];
            try {
                descriptions = JSON.parse(req.body.descriptions || "[]");
            } catch (parseError) {
                console.error("Ошибка парсинга descriptions:", parseError);
            }

            let payment_methods = [];
            try {
                payment_methods = JSON.parse(req.body.payment_methods || "[]");
            } catch (parseError) {
                console.error("Ошибка парсинга payment_methods:", parseError);
            }

            const paymentData = {
                id: req.body.id,
                descriptions,
                payment_methods
            };

            const payment = await Payment.update(paymentData);
            res.json(payment);
        } catch (error) {
            console.error("Ошибка при обновлении информации об оплате:", error);
            res.status(500).json({
                error: "Не удалось обновить информацию об оплате",
                details: error.message
            });
        }
    }
};

module.exports = paymentController;