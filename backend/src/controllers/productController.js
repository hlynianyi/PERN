// src/controllers/productController.js
const Product = require('../models/product');
const { deleteFile } = require('../utils/fileHelpers');

const productController = {
  async getAllProducts(req, res) {
    try {
      const products = await Product.findAll();
      res.json(products);
    } catch (error) {
      console.error('Ошибка при получении продуктов:', error);
      res.status(500).json({ error: error.message });
    }
  },

  async getProductById(req, res) {
    try {
      const { id } = req.params;
      const product = await Product.findById(id);
      
      if (!product) {
        return res.status(404).json({ error: 'Продукт не найден' });
      }
      
      res.json(product);
    } catch (error) {
      console.error('Ошибка при получении продукта:', error);
      res.status(500).json({ error: error.message });
    }
  },

  async createProduct(req, res) {
    console.log('Files received:', req.files);
    console.log('Body received:', req.body);
    try {
      const productData = {
        name: req.body.name,
        category: req.body.category,
        description: req.body.description,
        price: req.body.price,
        steel: req.body.steel || null,
        handle: req.body.handle || null,
        length: req.body.length || null,
        status: req.body.status || 'in_stock'
      };

      const files = {
        images: req.files?.images || [],
        certificates: req.files?.certificates || []
      };

      const product = await Product.create(productData, files);
      res.status(201).json(product);
    } catch (error) {
      // В случае ошибки удаляем загруженные файлы
      if (req.files) {
        if (req.files.images) {
          for (const file of req.files.images) {
            await deleteFile(`/uploads/images/${file.filename}`);
          }
        }
        if (req.files.certificates) {
          for (const file of req.files.certificates) {
            await deleteFile(`/uploads/certificates/${file.filename}`);
          }
        }
      }
      console.error('Ошибка при создании продукта:', error);
      res.status(500).json({ error: error.message });
    }
  },

  
  async updateProduct(req, res) {
    try {
      const { id } = req.params;
      const productData = {
        name: req.body.name,
        category: req.body.category,
        description: req.body.description,
        price: req.body.price,
        steel: req.body.steel || null,
        handle: req.body.handle || null,
        length: req.body.length || null,
        status: req.body.status,
        deletedImages: req.body.deletedImages ? JSON.parse(req.body.deletedImages) : [],
        deletedCertificates: req.body.deletedCertificates ? JSON.parse(req.body.deletedCertificates) : []
      };
  
      console.log('Update data:', {
        ...productData,
        files: req.files || {}
      });
  
      const files = {
        images: req.files?.images || [],
        certificates: req.files?.certificates || []
      };
  
      const product = await Product.update(id, productData, files);
      res.json(product);
    } catch (error) {
      // В случае ошибки удаляем новые загруженные файлы
      if (req.files) {
        if (req.files.images) {
          for (const file of req.files.images) {
            await deleteFile(`/uploads/images/${file.filename}`);
          }
        }
        if (req.files.certificates) {
          for (const file of req.files.certificates) {
            await deleteFile(`/uploads/certificates/${file.filename}`);
          }
        }
      }
      console.error('Ошибка при обновлении продукта:', error);
      res.status(500).json({ error: error.message });
    }
  },

  async deleteProduct(req, res) {
    try {
      const { id } = req.params;
      await Product.delete(id);
      res.status(204).send();
    } catch (error) {
      console.error('Ошибка при удалении продукта:', error);
      res.status(500).json({ error: error.message });
    }
  },

  async updateProductStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const product = await Product.updateStatus(id, status);
      res.json(product);
    } catch (error) {
      console.error('Ошибка при обновлении статуса продукта:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Контроллеры для работы с отзывами
  async addReview(req, res) {
    try {
      const { productId } = req.params;
      const review = await Product.addReview(productId, req.body);
      res.status(201).json(review);
    } catch (error) {
      console.error('Ошибка при добавлении отзыва:', error);
      res.status(500).json({ error: error.message });
    }
  },

  async updateReview(req, res) {
    try {
      const { reviewId } = req.params;
      const review = await Product.updateReview(reviewId, req.body);
      res.json(review);
    } catch (error) {
      console.error('Ошибка при обновлении отзыва:', error);
      res.status(500).json({ error: error.message });
    }
  },

  async deleteReview(req, res) {
    try {
      const { reviewId } = req.params;
      await Product.deleteReview(reviewId);
      res.status(204).send();
    } catch (error) {
      console.error('Ошибка при удалении отзыва:', error);
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = productController;