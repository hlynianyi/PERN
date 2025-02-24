// src/api/homepage.js

import { api } from "./route";

export const homepageApi = {
  getHomepage: async () => {
    try {
      const response = await api.get("/homepage");
      return response.data;
    } catch (error) {
      console.error("Ошибка при получении данных главной страницы:", error);
      throw error;
    }
  },

  saveHomepage: async (homepageData) => {
    try {
      const formData = new FormData();

      // Add basic fields
      formData.append("id", homepageData.id || "");
      formData.append("title", homepageData.title || "");
      formData.append("description", homepageData.description || "");

      // Add image metadata
      if (homepageData.imageMetadata) {
        formData.append("imageMetadata", homepageData.imageMetadata);
      }

      // Add new image files
      if (homepageData.selectedFiles?.length > 0) {
        homepageData.selectedFiles.forEach((file) => {
          formData.append("images", file);
        });
      }

      // Add array of deleted image IDs
      if (homepageData.deletedImageIds?.length > 0) {
        formData.append(
          "deletedImages",
          JSON.stringify(homepageData.deletedImageIds)
        );
      }

      // Add popular products
      if (homepageData.popularProducts?.length > 0) {
        formData.append(
          "popularProducts",
          JSON.stringify(homepageData.popularProducts)
        );
      }

      // Log FormData contents for debugging
      console.log("Sending FormData contents:");
      for (let [key, value] of formData.entries()) {
        if (value instanceof File) {
          console.log(`${key}: File - ${value.name}`);
        } else {
          console.log(`${key}: ${value}`);
        }
      }

      const response = await api.post("/homepage", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        // Add upload progress handling
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          console.log(`Upload progress: ${percentCompleted}%`);
        },
      });

      return response.data;
    } catch (error) {
      console.error("Ошибка при сохранении данных главной страницы:", error);

      // Enhanced error handling
      if (error.response) {
        // Server error with status code
        const errorMessage =
          error.response.data.error ||
          error.response.data.message ||
          "Не удалось сохранить данные";
        throw new Error(errorMessage);
      } else if (error.request) {
        // Request was made but no response received
        throw new Error(
          "Нет ответа от сервера. Проверьте подключение к интернету."
        );
      } else {
        // Error in setting up the request
        throw new Error("Ошибка при подготовке запроса: " + error.message);
      }
    }
  },

  // Method for deleting a single image
  deleteImage: async (imageId) => {
    try {
      const response = await api.delete(`/homepage/images/${imageId}`);
      return response.data;
    } catch (error) {
      console.error("Ошибка при удалении изображения:", error);

      if (error.response) {
        const errorMessage =
          error.response.data.error ||
          error.response.data.message ||
          "Не удалось удалить изображение";
        throw new Error(errorMessage);
      } else {
        throw new Error("Не удалось удалить изображение");
      }
    }
  },

  // Method for updating image order
  updateImageOrder: async (imageIds) => {
    try {
      const response = await api.put("/homepage/images/order", {
        imageIds: imageIds,
      });
      return response.data;
    } catch (error) {
      console.error("Ошибка при обновлении порядка изображений:", error);
      throw new Error("Не удалось обновить порядок изображений");
    }
  },

  // Method for updating image metadata
  updateImageMetadata: async (imageId, metadata) => {
    try {
      const response = await api.put(
        `/homepage/images/${imageId}/metadata`,
        metadata
      );
      return response.data;
    } catch (error) {
      console.error("Ошибка при обновлении метаданных изображения:", error);
      throw new Error("Не удалось обновить метаданные изображения");
    }
  },
};
