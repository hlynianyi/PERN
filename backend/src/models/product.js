// src/models/product.js
const { pool, withTransaction } = require('../utils/database');
const { deleteFile } = require('../utils/fileHelpers');

class Product {
  static async initTable() {
    try {
      // Удаляем старое ограничение, если оно существует
      await pool.query(`
        DO $$ BEGIN
          ALTER TABLE IF EXISTS product_images 
            DROP CONSTRAINT IF EXISTS one_primary_image;
        EXCEPTION
          WHEN undefined_table THEN
            NULL;
        END $$;
      `);

      // Создаем таблицу продуктов
      await pool.query(`
        CREATE TABLE IF NOT EXISTS products (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          description TEXT,
          price DECIMAL(10,2),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Создаем таблицу изображений
      await pool.query(`
        CREATE TABLE IF NOT EXISTS product_images (
          id SERIAL PRIMARY KEY,
          product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
          image_url VARCHAR(255) NOT NULL,
          is_primary BOOLEAN DEFAULT false,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Добавляем триггер для управления основным изображением
      await pool.query(`
        CREATE OR REPLACE FUNCTION manage_primary_image()
        RETURNS TRIGGER AS $$
        BEGIN
          IF (TG_OP = 'INSERT' AND NEW.is_primary) OR (TG_OP = 'UPDATE' AND NEW.is_primary AND NOT OLD.is_primary) THEN
            UPDATE product_images 
            SET is_primary = false 
            WHERE product_id = NEW.product_id AND id != NEW.id;
          END IF;
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
      `);

      // Создаем триггер
      await pool.query(`
        DROP TRIGGER IF EXISTS manage_primary_image_trigger ON product_images;
        CREATE TRIGGER manage_primary_image_trigger
        BEFORE INSERT OR UPDATE ON product_images
        FOR EACH ROW
        EXECUTE FUNCTION manage_primary_image();
      `);

    } catch (error) {
      console.error('Error initializing tables:', error);
      throw error;
    }
  }

  static async findAll() {
    const { rows } = await pool.query(`
      SELECT 
        p.*,
        json_agg(
          json_build_object(
            'id', pi.id,
            'image_url', pi.image_url,
            'is_primary', pi.is_primary
          )
        ) as images
      FROM products p
      LEFT JOIN product_images pi ON p.id = pi.product_id
      GROUP BY p.id
      ORDER BY p.created_at DESC
    `);
    return rows;
  }

  static async findById(id) {
    const { rows } = await pool.query(`
      SELECT 
        p.*,
        json_agg(
          json_build_object(
            'id', pi.id,
            'image_url', pi.image_url,
            'is_primary', pi.is_primary
          )
        ) as images
      FROM products p
      LEFT JOIN product_images pi ON p.id = pi.product_id
      WHERE p.id = $1
      GROUP BY p.id
    `, [id]);
    return rows[0];
  }

  static async create(productData, files) {
    return await withTransaction(async (client) => {
      const { name, description, price } = productData;
      
      // Проверяем количество файлов
      if (files.length > 10) {
        throw new Error('Максимальное количество изображений - 10');
      }

      const { rows: [product] } = await client.query(
        'INSERT INTO products (name, description, price) VALUES ($1, $2, $3) RETURNING *',
        [name, description, price]
      );

      for (let i = 0; i < files.length; i++) {
        const imageUrl = `/uploads/${files[i].filename}`;
        await client.query(
          'INSERT INTO product_images (product_id, image_url, is_primary) VALUES ($1, $2, $3)',
          [product.id, imageUrl, i === 0] // Первое изображение становится основным
        );
      }

      return this.findById(product.id);
    });
  }

  static async update(id, productData, files) {
    return await withTransaction(async (client) => {
      const { name, description, price, deletedImages } = productData;

      // Обновляем основную информацию о продукте
      const { rows: [product] } = await client.query(
        'UPDATE products SET name = $1, description = $2, price = $3 WHERE id = $4 RETURNING *',
        [name, description, price, id]
      );

      if (!product) {
        throw new Error('Продукт не найден');
      }

      // Получаем текущее количество изображений
      const { rows: currentImages } = await client.query(
        'SELECT COUNT(*) as count FROM product_images WHERE product_id = $1',
        [id]
      );

      const deletedCount = deletedImages ? JSON.parse(deletedImages).length : 0;
      const remainingCount = currentImages[0].count - deletedCount;
      
      if (remainingCount + files.length > 10) {
        throw new Error('Максимальное количество изображений - 10');
      }

      // Удаляем выбранные изображения
      if (deletedImages) {
        const imagesToDelete = JSON.parse(deletedImages);
        for (const imageId of imagesToDelete) {
          const { rows } = await client.query(
            'DELETE FROM product_images WHERE id = $1 RETURNING image_url',
            [imageId]
          );
          if (rows[0]) {
            await deleteFile(rows[0].image_url);
          }
        }
      }

      // Проверяем, есть ли основное изображение после удаления
      const { rows: primaryCheck } = await client.query(
        'SELECT EXISTS(SELECT 1 FROM product_images WHERE product_id = $1 AND is_primary = true) as has_primary',
        [id]
      );
      const needsPrimaryImage = !primaryCheck[0].has_primary;

      // Добавляем новые изображения
      for (let i = 0; i < files.length; i++) {
        const imageUrl = `/uploads/${files[i].filename}`;
        await client.query(
          'INSERT INTO product_images (product_id, image_url, is_primary) VALUES ($1, $2, $3)',
          [id, imageUrl, needsPrimaryImage && i === 0] // Делаем первое изображение основным, если нет основного
        );
      }

      return this.findById(id);
    });
  }

  static async delete(id) {
    return await withTransaction(async (client) => {
      const { rows: images } = await client.query(
        'SELECT image_url FROM product_images WHERE product_id = $1',
        [id]
      );

      const { rows } = await client.query(
        'DELETE FROM products WHERE id = $1 RETURNING *',
        [id]
      );

      if (rows.length === 0) {
        throw new Error('Продукт не найден');
      }

      // Удаляем файлы изображений
      for (const image of images) {
        await deleteFile(image.image_url);
      }

      return rows[0];
    });
  }

  static async setPrimaryImage(productId, imageId) {
    return await withTransaction(async (client) => {
      // Сначала снимаем отметку основного изображения со всех изображений продукта
      await client.query(
        'UPDATE product_images SET is_primary = false WHERE product_id = $1',
        [productId]
      );

      // Устанавливаем новое основное изображение
      const { rows } = await client.query(
        'UPDATE product_images SET is_primary = true WHERE id = $1 AND product_id = $2 RETURNING *',
        [imageId, productId]
      );

      if (rows.length === 0) {
        throw new Error('Фотография не найдена');
      }

      return rows[0];
    });
  }
}

module.exports = Product;