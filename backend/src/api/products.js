// frontend/src/api/products.js
import axios from "axios";

const API_URL = "http://localhost:5002/api";

export const productsApi = {
  getAll: async () => {
    const response = await axios.get(`${API_URL}/products`);
    return response.data;
  },

  create: async (productData) => {
    const formData = new FormData();
    Object.keys(productData).forEach((key) => {
      if (key === "image" && productData[key]) {
        formData.append("image", productData[key]);
      } else {
        formData.append(key, productData[key]);
      }
    });

    const response = await axios.post(`${API_URL}/products`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  update: async (id, productData) => {
    const formData = new FormData();
    Object.keys(productData).forEach((key) => {
      if (key === "image" && productData[key]) {
        formData.append("image", productData[key]);
      } else {
        formData.append(key, productData[key]);
      }
    });

    const response = await axios.put(`${API_URL}/products/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  delete: async (id) => {
    await axios.delete(`${API_URL}/products/${id}`);
  },
};
