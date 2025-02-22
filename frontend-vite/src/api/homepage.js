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

      // Basic fields
      formData.append("id", homepageData.id || "");
      formData.append("title", homepageData.title || "");
      formData.append("description", homepageData.description || "");

      // Image metadata with a distinct name
      formData.append("imageMetadata", JSON.stringify(homepageData.images));

      // Image files with a different field name
      if (homepageData.selectedFiles?.length > 0) {
        homepageData.selectedFiles.forEach((file) => {
          formData.append("imageFiles", file);
        });
      }

      // Other fields
      if (homepageData.deletedImageIds?.length > 0) {
        formData.append(
          "deletedImages",
          JSON.stringify(homepageData.deletedImageIds)
        );
      }

      if (homepageData.popularProducts?.length > 0) {
        formData.append(
          "popularProducts",
          JSON.stringify(homepageData.popularProducts)
        );
      }

      console.log("🚀 ~ saveHomepage: ~ formData:", formData);
      return await api.post("/homepage", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    } catch (error) {
      console.error("Ошибка при сохранении данных главной страницы:", error);
      throw error;
    }
  },
};
