import { api } from "./route";

export const companyApi = {
  getCompany: async () => {
    try {
      const response = await api.get("/company");
      return response.data;
    } catch (error) {
      console.error("Ошибка при получении информации о компании:", error);
      throw error;
    }
  },

  saveCompany: async (companyData) => {
    try {
      const formData = new FormData();

      // Добавляем основные поля
      formData.append("title", companyData.title);

      // Безопасная сериализация description_blocks
      formData.append(
        "description_blocks",
        JSON.stringify(companyData.description_blocks || [])
      );

      if (companyData.id) {
        formData.append("id", companyData.id);
      }

      // Добавляем массив удаленных изображений
      if (companyData.deletedImages && companyData.deletedImages.length > 0) {
        formData.append(
          "deletedImages",
          JSON.stringify(companyData.deletedImages)
        );
      }

      // Добавляем новые изображения
      if (companyData.images) {
        companyData.images.forEach((file) => {
          formData.append("images", file);
        });
      }

      const response = await api.post("/company", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      console.error("Ошибка при сохранении информации о компании:", error);

      // Более информативная обработка ошибок
      if (error.response) {
        // Ошибка от сервера с кодом статуса
        throw new Error(
          error.response.data.error ||
            "Не удалось сохранить информацию о компании"
        );
      } else if (error.request) {
        // Запрос был сделан, но нет ответа
        throw new Error("Нет ответа от сервера");
      } else {
        // Что-то пошло не так при настройке запроса
        throw new Error("Ошибка при подготовке запроса");
      }
    }
  },
};
