// frontend/src/api/products.js
import { api } from "./route";

export const PRODUCT_STATUSES = {
  in_stock: "В наличии",
  out_of_stock: "Нет в наличии",
};

export const productsApi = {
  getAll: async () => {
    try {
      const response = await api.get("/products");
      return response.data;
    } catch (error) {
      console.error("Error fetching products:", error);
      throw error;
    }
  },

  getOne: async (id) => {
    try {
      const response = await api.get(`/products/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching product:", error);
      throw error;
    }
  },

  create: async (productData) => {
    try {
      const formData = new FormData();

      // Добавляем все поля продукта, кроме файлов
      const productFields = [
        "name",
        "category",
        "description",
        "price",
        "steel",
        "handle",
        "length",
        "status",
        "sheath",
        "blade_length",
        "blade_thickness",
        "hardness",
        "notes",
      ];

      productFields.forEach((field) => {
        if (field in productData) {
          formData.append(field, productData[field] || "");
        }
      });

      // Добавляем изображения
      if (productData.images && productData.images.length > 0) {
        productData.images.forEach((file) => {
          formData.append("images", file);
        });
      }

      // Добавляем сертификаты
      if (productData.certificates && productData.certificates.length > 0) {
        productData.certificates.forEach((file) => {
          formData.append("certificates", file);
        });
      }

      const response = await api.post("/products", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error creating product:", error);
      throw error;
    }
  },

  update: async (id, productData) => {
    try {
      const formData = new FormData();

      // Добавляем все поля продукта
      const productFields = [
        "name",
        "category",
        "description",
        "price",
        "status",
        "steel",
        "handle",
        "length",
        "sheath",
        "blade_length",
        "blade_thickness",
        "hardness",
        "notes",
      ];

      productFields.forEach((field) => {
        if (field in productData) {
          formData.append(field, productData[field] || "");
        }
      });

      // Добавляем файлы
      if (productData.images) {
        productData.images.forEach((file) => {
          formData.append("images", file);
        });
      }

      if (productData.certificates) {
        productData.certificates.forEach((file) => {
          formData.append("certificates", file);
        });
      }

      // Добавляем массивы удаленных файлов
      formData.append(
        "deletedImages",
        JSON.stringify(productData.deletedImages || [])
      );
      formData.append(
        "deletedCertificates",
        JSON.stringify(productData.deletedCertificates || [])
      );

      // Логируем содержимое FormData перед отправкой
      console.log("FormData entries:");
      for (let [key, value] of formData.entries()) {
        if (value instanceof File) {
          console.log(key, ":", `File: ${value.name}`);
        } else {
          console.log(key, ":", value);
        }
      }

      const response = await api.put(`/products/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error in API update:", error);
      throw error;
    }
  },

  // Остальные методы API остаются без изменений
  delete: async (id) => {
    try {
      await api.delete(`/products/${id}`);
    } catch (error) {
      console.error("Error deleting product:", error);
      throw error;
    }
  },

  setPrimaryImage: async (productId, imageId) => {
    try {
      const response = await api.post(
        `/products/${productId}/images/${imageId}/primary`
      );
      return response.data;
    } catch (error) {
      console.error("Error setting primary image:", error);
      throw error;
    }
  },

  updateStatus: async (productId, status) => {
    try {
      const response = await api.patch(`/products/${productId}/status`, {
        status,
      });
      return response.data;
    } catch (error) {
      console.error("Error updating status:", error);
      throw error;
    }
  },

  addReview: async (productId, reviewData) => {
    try {
      const response = await api.post(
        `/products/${productId}/reviews`,
        reviewData
      );
      return response.data;
    } catch (error) {
      console.error("Error adding review:", error);
      throw error;
    }
  },

  updateReview: async (reviewId, reviewData) => {
    try {
      const response = await api.put(
        `/products/reviews/${reviewId}`,
        reviewData
      );
      return response.data;
    } catch (error) {
      console.error("Error updating review:", error);
      throw error;
    }
  },

  deleteReview: async (reviewId) => {
    try {
      await api.delete(`/products/reviews/${reviewId}`);
    } catch (error) {
      console.error("Error deleting review:", error);
      throw error;
    }
  },
};
