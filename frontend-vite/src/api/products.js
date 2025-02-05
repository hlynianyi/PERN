// frontend/src/api/products.js
import axios from 'axios';

const api = axios.create({
 baseURL: 'http://localhost:5002/api'
});

export const PRODUCT_STATUSES = {
 in_stock: 'В наличии',
 out_of_stock: 'Нет в наличии'
};

export const productsApi = {
 getAll: async () => {
   try {
     const response = await api.get('/products');
     return response.data;
   } catch (error) {
     console.error('Error fetching products:', error);
     throw error;
   }
 },

 getOne: async (id) => {
   try {
     const response = await api.get(`/products/${id}`);
     return response.data;
   } catch (error) {
     console.error('Error fetching product:', error);
     throw error;
   }
 },

 create: async (productData) => {
   try {
     const formData = new FormData();
   
     // Добавляем основные поля
     Object.keys(productData).forEach(key => {
       if (key !== 'images' && key !== 'certificates') {
         formData.append(key, productData[key] || '');
       }
     });

     // Добавляем изображения
     if (productData.images && productData.images.length > 0) {
       productData.images.forEach(file => {
         formData.append('images', file);
       });
     }

     // Добавляем сертификаты
     if (productData.certificates && productData.certificates.length > 0) {
       productData.certificates.forEach(file => {
         formData.append('certificates', file);
       });
     }

     const response = await api.post('/products', formData, {
       headers: {
         'Content-Type': 'multipart/form-data'
       }
     });
     return response.data;
   } catch (error) {
     console.error('Error creating product:', error);
     throw error;
   }
 },

 update: async (id, productData) => {
  try {
    const formData = new FormData();
    
    // Добавляем основные поля
    const requiredFields = ['name', 'category', 'description', 'price', 'status'];
    requiredFields.forEach(field => {
      formData.append(field, productData[field] || '');
    });

    // Добавляем опциональные поля
    const optionalFields = ['steel', 'handle', 'length'];
    optionalFields.forEach(field => {
      if (productData[field]) {
        formData.append(field, productData[field]);
      }
    });

    // Добавляем файлы
    if (productData.images) {
      productData.images.forEach(file => {
        formData.append('images', file);
      });
    }

    if (productData.certificates) {
      productData.certificates.forEach(file => {
        formData.append('certificates', file);
      });
    }

    // Добавляем массивы удаленных файлов
    formData.append('deletedImages', JSON.stringify(productData.deletedImages || []));
    formData.append('deletedCertificates', JSON.stringify(productData.deletedCertificates || []));

    // Логируем содержимое FormData перед отправкой
    console.log('FormData entries:');
    for (let [key, value] of formData.entries()) {
      if (value instanceof File) {
        console.log(key, ':', `File: ${value.name}`);
      } else {
        console.log(key, ':', value);
      }
    }

    const response = await api.put(`/products/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error in API update:', error);
    throw error;
  }
},

 delete: async (id) => {
   try {
     await api.delete(`/products/${id}`);
   } catch (error) {
     console.error('Error deleting product:', error);
     throw error;
   }
 },

 setPrimaryImage: async (productId, imageId) => {
   try {
     const response = await api.post(`/products/${productId}/images/${imageId}/primary`);
     return response.data;
   } catch (error) {
     console.error('Error setting primary image:', error);
     throw error;
   }
 },

 updateStatus: async (productId, status) => {
   try {
     const response = await api.patch(`/products/${productId}/status`, { status });
     return response.data;
   } catch (error) {
     console.error('Error updating status:', error);
     throw error;
   }
 },

 addReview: async (productId, reviewData) => {
   try {
     const response = await api.post(`/products/${productId}/reviews`, reviewData);
     return response.data;
   } catch (error) {
     console.error('Error adding review:', error);
     throw error;
   }
 },

 updateReview: async (reviewId, reviewData) => {
   try {
     const response = await api.put(`/products/reviews/${reviewId}`, reviewData);
     return response.data;
   } catch (error) {
     console.error('Error updating review:', error);
     throw error;
   }
 },

 deleteReview: async (reviewId) => {
   try {
     await api.delete(`/products/reviews/${reviewId}`);
   } catch (error) {
     console.error('Error deleting review:', error);
     throw error;
   }
 }
};