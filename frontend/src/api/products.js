// frontend/src/api/products.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5002/api',
  headers: {
    'Content-Type': 'application/json',
  }
});

// Перехватчик для обработки ошибок
api.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error);
    throw error;
  }
);

export const productsApi = {
  getAll: async () => {
    const response = await api.get('/products');
    return response.data;
  },

  getOne: async (id) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  create: async (productData) => {
    const response = await api.post('/products', productData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  update: async (id, productData) => {
    const response = await api.put(`/products/${id}`, productData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  delete: async (id) => {
    await api.delete(`/products/${id}`);
  },

  setPrimaryImage: async (productId, imageId) => {
    const response = await api.post(`/products/${productId}/images/${imageId}/primary`);
    return response.data;
  },

  deleteImage: async (productId, imageId) => {
    await api.delete(`/products/${productId}/images/${imageId}`);
  }
};