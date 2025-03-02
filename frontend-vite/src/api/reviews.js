// src/api/reviews.js
import { api } from "./route";

export const reviewApi = {
  getAllReviews: async (params) => {
    try {
      const response = await api.get("/reviews", { params });
      return response.data;
    } catch (error) {
      console.error("Ошибка при получении списка отзывов:", error);
      throw error;
    }
  },

  createReview: async (reviewData) => {
    try {
      // Validate required fields before sending
      if (!reviewData.name || !reviewData.text) {
        throw new Error("Имя и текст отзыва обязательны для заполнения");
      }

      // Use direct object submission instead of FormData
      const payload = {
        name: reviewData.name.trim(),
        text: reviewData.text.trim(),
        email: reviewData.email ? reviewData.email.trim() : null,
        phone: reviewData.phone ? reviewData.phone.trim() : null,
        status: "pending",
      };

      const response = await api.post("/reviews", payload, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      return response.data;
    } catch (error) {
      console.error(
        "Ошибка при создании отзыва:",
        error.response ? error.response.data : error
      );
      throw error;
    }
  },

  updateReview: async (id, reviewData) => {
    try {
      // Ensure required fields are not empty
      if (!reviewData.name || !reviewData.text) {
        throw new Error("Имя и текст отзыва обязательны для заполнения");
      }

      const payload = {
        id,
        name: reviewData.name.trim(),
        text: reviewData.text.trim(),
        email: reviewData.email ? reviewData.email.trim() : null,
        phone: reviewData.phone ? reviewData.phone.trim() : null,
        status: reviewData.status || "pending",
      };

      const response = await api.put(`/reviews/${id}`, payload, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      return response.data;
    } catch (error) {
      console.error(
        "Ошибка при обновлении отзыва:",
        error.response ? error.response.data : error
      );
      throw error;
    }
  },

  updateReviewStatus: async (id, status) => {
    try {
      const response = await api.put(
        `/reviews/${id}/status`,
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
        "Ошибка при обновлении статуса отзыва:",
        error.response ? error.response.data : error
      );
      throw error;
    }
  },

  deleteReview: async (id) => {
    try {
      const response = await api.delete(`/reviews/${id}`);
      return response.data;
    } catch (error) {
      console.error(
        "Ошибка при удалении отзыва:",
        error.response ? error.response.data : error
      );
      throw error;
    }
  },
};
