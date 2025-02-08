// src/models/product.js
const { pool, withTransaction } = require("../utils/database");
const { deleteFile } = require("../utils/fileHelpers");

class Product {
  static async initTable() {
    try {
      await pool.query(`
        DROP TABLE IF EXISTS product_reviews CASCADE;
        DROP TABLE IF EXISTS product_certificates CASCADE;
        DROP TABLE IF EXISTS product_images CASCADE;
        DROP TABLE IF EXISTS products CASCADE;
      `);

      // Удаляем enum type
      await pool.query(`
        DROP TYPE IF EXISTS product_category CASCADE;
      `);
      // Создаем enum для статуса товара
      await pool.query(`
        DO $$ BEGIN
          CREATE TYPE product_status AS ENUM ('in_stock', 'out_of_stock');
        EXCEPTION
          WHEN duplicate_object THEN null;
        END $$;
      `);

      // Создаем таблицу продуктов с новыми полями
      await pool.query(`
        CREATE TABLE IF NOT EXISTS products (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          category VARCHAR(100) NOT NULL,
          description TEXT NOT NULL,
          price DECIMAL(10) NOT NULL,
          status product_status NOT NULL DEFAULT 'in_stock',
          steel VARCHAR(100),
          handle VARCHAR(100),
          length DECIMAL(10,2),
          sheath VARCHAR(255), 
          blade_length DECIMAL(10,2), 
          blade_thickness DECIMAL(10,2), 
          hardness VARCHAR(100), 
          notes TEXT, 
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Таблица изображений
      await pool.query(`
        CREATE TABLE IF NOT EXISTS product_images (
          id SERIAL PRIMARY KEY,
          product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
          image_url VARCHAR(255) NOT NULL,
          is_primary BOOLEAN DEFAULT false,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Таблица сертификатов
      await pool.query(`
        CREATE TABLE IF NOT EXISTS product_certificates (
          id SERIAL PRIMARY KEY,
          product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
          certificate_url VARCHAR(255) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Таблица отзывов
      await pool.query(`
        CREATE TABLE IF NOT EXISTS product_reviews (
          id SERIAL PRIMARY KEY,
          product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
          user_name VARCHAR(100) NOT NULL,
          rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
          comment TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Триггер для управления основным изображением
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

      // Триггер для обновления updated_at в отзывах
      await pool.query(`
        CREATE OR REPLACE FUNCTION update_review_timestamp()
        RETURNS TRIGGER AS $$
        BEGIN
          NEW.updated_at = CURRENT_TIMESTAMP;
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
      `);

      // Создаем триггеры
      await pool.query(`
        DROP TRIGGER IF EXISTS manage_primary_image_trigger ON product_images;
        CREATE TRIGGER manage_primary_image_trigger
        BEFORE INSERT OR UPDATE ON product_images
        FOR EACH ROW
        EXECUTE FUNCTION manage_primary_image();
      `);

      await pool.query(`
        DROP TRIGGER IF EXISTS update_review_timestamp_trigger ON product_reviews;
        CREATE TRIGGER update_review_timestamp_trigger
        BEFORE UPDATE ON product_reviews
        FOR EACH ROW
        EXECUTE FUNCTION update_review_timestamp();
      `);
    } catch (error) {
      console.error("Error initializing tables:", error);
      throw error;
    }
  }

  static async findAll() {
    const { rows } = await pool.query(`
      SELECT 
        p.*,
        json_agg(DISTINCT jsonb_build_object(
          'id', pi.id,
          'image_url', pi.image_url,
          'is_primary', pi.is_primary
        )) FILTER (WHERE pi.id IS NOT NULL) as images,
        json_agg(DISTINCT jsonb_build_object(
          'id', pc.id,
          'certificate_url', pc.certificate_url
        )) FILTER (WHERE pc.id IS NOT NULL) as certificates,
        COUNT(DISTINCT pr.id) as review_count,
        COALESCE(AVG(pr.rating), 0) as average_rating,
        CASE 
          WHEN p.created_at >= NOW() - INTERVAL '30 days' THEN true 
          ELSE false 
        END as is_new
      FROM products p
      LEFT JOIN product_images pi ON p.id = pi.product_id
      LEFT JOIN product_certificates pc ON p.id = pc.product_id
      LEFT JOIN product_reviews pr ON p.id = pr.product_id
      GROUP BY p.id
      ORDER BY p.created_at DESC
    `);
    return rows;
  }

  static async findById(id) {
    const { rows } = await pool.query(
      `
      SELECT 
        p.*,
        json_agg(DISTINCT jsonb_build_object(
          'id', pi.id,
          'image_url', pi.image_url,
          'is_primary', pi.is_primary
        )) FILTER (WHERE pi.id IS NOT NULL) as images,
        json_agg(DISTINCT jsonb_build_object(
          'id', pc.id,
          'certificate_url', pc.certificate_url
        )) FILTER (WHERE pc.id IS NOT NULL) as certificates,
        json_agg(DISTINCT jsonb_build_object(
          'id', pr.id,
          'user_name', pr.user_name,
          'rating', pr.rating,
          'comment', pr.comment,
          'created_at', pr.created_at,
          'updated_at', pr.updated_at
        )) FILTER (WHERE pr.id IS NOT NULL) as reviews,
        COUNT(DISTINCT pr.id) as review_count,
        COALESCE(AVG(pr.rating), 0) as average_rating,
        CASE 
          WHEN p.created_at >= NOW() - INTERVAL '30 days' THEN true 
          ELSE false 
        END as is_new
      FROM products p
      LEFT JOIN product_images pi ON p.id = pi.product_id
      LEFT JOIN product_certificates pc ON p.id = pc.product_id
      LEFT JOIN product_reviews pr ON p.id = pr.product_id
      WHERE p.id = $1
      GROUP BY p.id
    `,
      [id]
    );
    return rows[0];
  }

  static async create(productData, files) {
    return await withTransaction(async (client) => {
      const {
        name,
        category,
        description,
        price,
        steel,
        handle,
        length,
        status = "in_stock",
        sheath,
        blade_length,
        blade_thickness,
        hardness,
        notes,
      } = productData;

      const {
        rows: [product],
      } = await client.query(
        `INSERT INTO products 
         (name, category, description, price, steel, handle, length, 
          status, sheath, blade_length, blade_thickness, hardness, notes) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) 
         RETURNING *`,
        [
          name,
          category,
          description,
          price,
          steel,
          handle,
          length,
          status,
          sheath,
          blade_length,
          blade_thickness,
          hardness,
          notes,
        ]
      );

      // Загружаем изображения
      for (let i = 0; i < files.images.length; i++) {
        const imageUrl = `/uploads/images/${files.images[i].filename}`;
        await client.query(
          "INSERT INTO product_images (product_id, image_url, is_primary) VALUES ($1, $2, $3)",
          [product.id, imageUrl, i === 0]
        );
      }

      // Загружаем сертификаты
      for (const cert of files.certificates) {
        const certUrl = `/uploads/certificates/${cert.filename}`;
        await client.query(
          "INSERT INTO product_certificates (product_id, certificate_url) VALUES ($1, $2)",
          [product.id, certUrl]
        );
      }

      return this.findById(product.id);
    });
  }

  // В методе update класса Product
  static async update(id, productData, files) {
    return await withTransaction(async (client) => {
      const {
        rows: [currentProduct],
      } = await client.query("SELECT * FROM products WHERE id = $1", [id]);

      if (!currentProduct) {
        throw new Error("Продукт не найден");
      }

      const updatedData = {
        name: productData.name || currentProduct.name,
        category: productData.category || currentProduct.category,
        description: productData.description || currentProduct.description,
        price: productData.price || currentProduct.price,
        steel: productData.steel || currentProduct.steel,
        handle: productData.handle || currentProduct.handle,
        length: productData.length || currentProduct.length,
        status: productData.status || currentProduct.status,
        sheath: productData.sheath || currentProduct.sheath,
        blade_length: productData.blade_length || currentProduct.blade_length,
        blade_thickness:
          productData.blade_thickness || currentProduct.blade_thickness,
        hardness: productData.hardness || currentProduct.hardness,
        notes: productData.notes || currentProduct.notes,
      };

      // Обновляем продукт с проверенными данными
      const {
        rows: [product],
      } = await client.query(
        `UPDATE products 
         SET name = $1, category = $2, description = $3, price = $4, 
             steel = $5, handle = $6, length = $7, status = $8,
             sheath = $9, blade_length = $10, blade_thickness = $11,
             hardness = $12, notes = $13
         WHERE id = $14 
         RETURNING *`,
        [
          updatedData.name,
          updatedData.category,
          updatedData.description,
          updatedData.price,
          updatedData.steel,
          updatedData.handle,
          updatedData.length,
          updatedData.status,
          updatedData.sheath,
          updatedData.blade_length,
          updatedData.blade_thickness,
          updatedData.hardness,
          updatedData.notes,
          id,
        ]
      );

      // Обработка изображений
      const images = files.images || [];
      const deletedImages = Array.isArray(productData.deletedImages)
        ? productData.deletedImages
        : [];

      if (
        images.length +
          (await this.getCurrentImagesCount(client, id)) -
          deletedImages.length >
        10
      ) {
        throw new Error("Максимальное количество изображений - 10");
      }

      // Удаляем помеченные изображения
      if (deletedImages.length > 0) {
        for (const imageId of deletedImages) {
          const { rows } = await client.query(
            "DELETE FROM product_images WHERE id = $1 AND product_id = $2 RETURNING image_url",
            [imageId, id]
          );
          if (rows[0]) {
            await deleteFile(rows[0].image_url);
          }
        }
      }

      // Обработка сертификатов
      const certificates = files.certificates || [];
      const deletedCertificates = Array.isArray(productData.deletedCertificates)
        ? productData.deletedCertificates
        : [];

      // Удаляем помеченные сертификаты
      if (deletedCertificates.length > 0) {
        for (const certId of deletedCertificates) {
          const { rows } = await client.query(
            "DELETE FROM product_certificates WHERE id = $1 AND product_id = $2 RETURNING certificate_url",
            [certId, id]
          );
          if (rows[0]) {
            await deleteFile(rows[0].certificate_url);
          }
        }
      }

      // Добавляем новые изображения
      for (const file of images) {
        const imageUrl = `/uploads/images/${file.filename}`;
        await client.query(
          "INSERT INTO product_images (product_id, image_url, is_primary) VALUES ($1, $2, false)",
          [id, imageUrl]
        );
      }

      // Добавляем новые сертификаты
      for (const cert of certificates) {
        const certUrl = `/uploads/certificates/${cert.filename}`;
        await client.query(
          "INSERT INTO product_certificates (product_id, certificate_url) VALUES ($1, $2)",
          [id, certUrl]
        );
      }

      return this.findById(id);
    });
  }

  static async delete(id) {
    return await withTransaction(async (client) => {
      // Получаем все файлы для удаления
      const { rows: images } = await client.query(
        "SELECT image_url FROM product_images WHERE product_id = $1",
        [id]
      );
      const { rows: certificates } = await client.query(
        "SELECT certificate_url FROM product_certificates WHERE product_id = $1",
        [id]
      );

      const { rows } = await client.query(
        "DELETE FROM products WHERE id = $1 RETURNING *",
        [id]
      );

      if (rows.length === 0) {
        throw new Error("Продукт не найден");
      }

      // Удаляем файлы
      for (const image of images) {
        await deleteFile(image.image_url);
      }
      for (const cert of certificates) {
        await deleteFile(cert.certificate_url);
      }

      return rows[0];
    });
  }

  // Методы для работы с отзывами
  static async addReview(productId, reviewData) {
    const { user_name, rating, comment } = reviewData;
    const {
      rows: [review],
    } = await pool.query(
      `INSERT INTO product_reviews (product_id, user_name, rating, comment)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [productId, user_name, rating, comment]
    );
    return review;
  }

  static async updateReview(reviewId, reviewData) {
    const { rating, comment } = reviewData;
    const {
      rows: [review],
    } = await pool.query(
      `UPDATE product_reviews
       SET rating = $1, comment = $2
       WHERE id = $3
       RETURNING *`,
      [rating, comment, reviewId]
    );
    if (!review) {
      throw new Error("Отзыв не найден");
    }
    return review;
  }

  static async deleteReview(reviewId) {
    const { rows } = await pool.query(
      "DELETE FROM product_reviews WHERE id = $1 RETURNING *",
      [reviewId]
    );
    if (rows.length === 0) {
      throw new Error("Отзыв не найден");
    }
    return rows[0];
  }

  // Вспомогательные методы
  static async getCurrentImagesCount(client, productId) {
    const { rows } = await client.query(
      "SELECT COUNT(*) as count FROM product_images WHERE product_id = $1",
      [productId]
    );
    return parseInt(rows[0].count);
  }

  static async deleteFiles(client, table, ids) {
    const { rows } = await client.query(
      `DELETE FROM ${table} WHERE id = ANY($1) RETURNING *`,
      [ids]
    );
    for (const row of rows) {
      const url = row.image_url || row.certificate_url;
      await deleteFile(url);
    }
  }

  static async updateStatus(id, status) {
    const {
      rows: [product],
    } = await pool.query(
      "UPDATE products SET status = $1 WHERE id = $2 RETURNING *",
      [status, id]
    );
    if (!product) {
      throw new Error("Продукт не найден");
    }
    return product;
  }
}

module.exports = Product;
