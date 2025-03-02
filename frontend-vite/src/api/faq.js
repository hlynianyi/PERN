// src/api/faq.js
import { api } from "./route";

export const faqApi = {
  getFaq: async () => {
    try {
      const response = await api.get("/faqs");
      return response.data;
    } catch (error) {
      console.error("Ошибка при получении FAQ:", error);
      throw error;
    }
  },

  saveFaq: async (faqData) => {
    try {
      const formData = new FormData();

      // Добавляем основные поля FAQ
      formData.append("title", faqData.title || "");
      formData.append(
        "description_blocks",
        JSON.stringify(faqData.description_blocks || [])
      );

      // Если есть ID, добавляем его
      if (faqData.id) {
        formData.append("id", faqData.id);
      }

      const response = await api.post("/faqs", formData);
      return response.data;
    } catch (error) {
      console.error("Ошибка при сохранении FAQ:", error);
      throw error;
    }
  },
};
