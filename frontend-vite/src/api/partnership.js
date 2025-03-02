// src/api/partnership.js
import { api } from "./route";

export const partnershipApi = {
  getPartnership: async () => {
    try {
      const response = await api.get("/partnership");
      return response.data;
    } catch (error) {
      console.error("Ошибка при получении гарантийной информации:", error);
      throw error;
    }
  },

  savePartnership: async (partnershipData) => {
    try {
      const formData = new FormData();
      formData.append("title", partnershipData.title || "");
      formData.append(
        "text_blocks",
        JSON.stringify(partnershipData.text_blocks || [])
      );

      if (partnershipData.id) {
        formData.append("id", partnershipData.id);
      }

      const response = await api.post("/partnership", formData);
      return response.data;
    } catch (error) {
      console.error("Ошибка при сохранении гарантийной информации:", error);
      throw error;
    }
  },
};
