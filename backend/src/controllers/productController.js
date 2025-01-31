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
    try {
      const files = req.files || [];
      const product = await Product.create(req.body, files);
      res.status(201).json(product);
    } catch (error) {
      // В случае ошибки удаляем загруженные файлы
      if (req.files) {
        for (const file of req.files) {
          await deleteFile(`/uploads/${file.filename}`);
        }
      }
      console.error('Ошибка при создании продукта:', error);
      res.status(500).json({ error: error.message });
    }
  },

  async updateProduct(req, res) {
    try {
      const { id } = req.params;
      const files = req.files || [];
      const product = await Product.update(id, req.body, files);
      res.json(product);
    } catch (error) {
      // В случае ошибки удаляем новые загруженные файлы
      if (req.files) {
        for (const file of req.files) {
          await deleteFile(`/uploads/${file.filename}`);
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

  async setPrimaryImage(req, res) {
    try {
      const { productId, imageId } = req.params;
      const image = await Product.setPrimaryImage(productId, imageId);
      res.json(image);
    } catch (error) {
      console.error('Ошибка при установке основной фотографии:', error);
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = productController;