// frontend/src/api/delivery.js
import { api } from "./route";

export const deliveryApi = {
  getDelivery: async () => {
    try {
      const response = await api.get("/delivery");
      return response.data;
    } catch (error) {
      console.error("Ошибка при получении информации о доставке:", error);
      throw error;
    }
  },

  saveDelivery: async (deliveryData) => {
    try {
      // Отправляем данные напрямую как JSON вместо FormData
      const response = await api.post(
        "/delivery",
        {
          id: deliveryData.id || "",
          subtitle: deliveryData.subtitle || "",
          description: deliveryData.description || "",
          regions: deliveryData.regions || [],
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      console.log(response.data);
      return response.data;
    } catch (error) {
      console.error("Ошибка при сохранении информации о доставке:", error);
      throw error;
    }
  },
};
