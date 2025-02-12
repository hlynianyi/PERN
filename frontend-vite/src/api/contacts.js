// frontend/src/api/contacts.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5002/api",
});

export const contactsApi = {
  getContacts: async () => {
    try {
      const response = await api.get("/contacts");
      return response.data;
    } catch (error) {
      console.error("Ошибка при получении контактов:", error);
      throw error;
    }
  },

  saveContacts: async (contactsData) => {
    try {
      // Отправляем данные напрямую, без FormData
      const response = await api.post("/contacts", contactsData, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      return response.data;
    } catch (error) {
      console.error("Ошибка при сохранении контактов:", error);
      throw error;
    }
  },
};
