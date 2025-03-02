// src/api/orders.js
import { api } from "./route";

export const ordersApi = {
  getAllOrders: async (params) => {
    try {
      const response = await api.get("/orders", { params });
      return response.data;
    } catch (error) {
      console.error("Ошибка при получении списка заказов:", error);
      throw error;
    }
  },

  getOrder: async (id) => {
    try {
      const response = await api.get(`/orders/${id}`);
      return response.data;
    } catch (error) {
      console.error("Ошибка при получении заказа:", error);
      throw error;
    }
  },

  createOrder: async (orderData) => {
    try {
      // Validate required fields
      if (!orderData.customerPhone || !orderData.items || orderData.items.length === 0) {
        throw new Error("Номер телефона и товары обязательны для заполнения");
      }

      const response = await api.post("/orders", orderData, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      return response.data;
    } catch (error) {
      console.error(
        "Ошибка при создании заказа:",
        error.response ? error.response.data : error
      );
      throw error;
    }
  },

  updateOrderStatus: async (id, status) => {
    try {
      const response = await api.patch(
        `/orders/${id}/status`,
        { status },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error(
        "Ошибка при обновлении статуса заказа:",
        error.response ? error.response.data : error
      );
      throw error;
    }
  },

  deleteOrder: async (id) => {
    try {
      const response = await api.delete(`/orders/${id}`);
      return response.data;
    } catch (error) {
      console.error(
        "Ошибка при удалении заказа:",
        error.response ? error.response.data : error
      );
      throw error;
    }
  },
};