// frontend/src/api/products.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5002/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
});

export const productsApi = {
  // Получение всех продуктов
  getAll: async () => {
    try {
      const response = await api.get('/products');
      return response.data;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  },

  // Получение одного продукта
  getOne: async (id) => {
    try {
      const response = await api.get(`/products/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching product:', error);
      throw error;
    }
  },

  // Создание продукта с изображениями
  create: async (productData) => {
    try {
      const response = await api.post('/products', productData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  },

  // Обновление продукта с изображениями
  update: async (id, productData) => {
    try {
      const response = await api.put(`/products/${id}`, productData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  },

  // Удаление продукта
  delete: async (id) => {
    try {
      await api.delete(`/products/${id}`);
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  },

  // Установка основного изображения
  setPrimaryImage: async (productId, imageId) => {
    try {
      const response = await api.post(`/products/${productId}/images/${imageId}/primary`);
      return response.data;
    } catch (error) {
      console.error('Error setting primary image:', error);
      throw error;
    }
  },

  // Удаление изображения
  deleteImage: async (productId, imageId) => {
    try {
      await api.delete(`/products/${productId}/images/${imageId}`);
    } catch (error) {
      console.error('Error deleting image:', error);
      throw error;
    }
  }
};