const { pool, withTransaction } = require("../utils/database");
const fs = require("fs").promises;
const path = require("path");

class Homepage {
  static async initTable() {
    try {
      // Создаем основную таблицу для главной страницы
      await pool.query(`
            CREATE TABLE IF NOT EXISTS homepage (
              id SERIAL PRIMARY KEY,
              title VARCHAR(255) NOT NULL,
              description TEXT NOT NULL,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
          `);

      // Создаем таблицу для изображений карусели
      await pool.query(`
            CREATE TABLE IF NOT EXISTS homepage_carousel (
              id SERIAL PRIMARY KEY,
              homepage_id INTEGER REFERENCES homepage(id) ON DELETE CASCADE,
              image_url VARCHAR(255) NOT NULL,
              name VARCHAR(255) NOT NULL,
              product_link VARCHAR(255) NOT NULL,
              order_index INTEGER NOT NULL CHECK (order_index >= 0 AND order_index < 5),
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
          `);

      // Создаем функцию для проверки количества изображений
      await pool.query(`
            CREATE OR REPLACE FUNCTION check_carousel_images_count()
            RETURNS TRIGGER AS $$
            BEGIN
              IF (
                SELECT COUNT(*)
                FROM homepage_carousel
                WHERE homepage_id = NEW.homepage_id
              ) >= 5 THEN
                RAISE EXCEPTION 'Maximum number of carousel images (5) exceeded';
              END IF;
              RETURN NEW;
            END;
            $$ LANGUAGE plpgsql;
          `);

      // Создаем триггер для проверки количества изображений
      await pool.query(`
            DROP TRIGGER IF EXISTS check_carousel_images_count_trigger ON homepage_carousel;
            CREATE TRIGGER check_carousel_images_count_trigger
            BEFORE INSERT ON homepage_carousel
            FOR EACH ROW
            EXECUTE FUNCTION check_carousel_images_count();
          `);

      // Создаем таблицу для популярных товаров
      await pool.query(`
            CREATE TABLE IF NOT EXISTS homepage_popular_products (
              id SERIAL PRIMARY KEY,
              product_id INTEGER NOT NULL,
              order_index INTEGER NOT NULL,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              UNIQUE(product_id)
            );
          `);

      // Создаем триггер обновления временной метки
      await pool.query(`
            CREATE OR REPLACE FUNCTION update_homepage_timestamp()
            RETURNS TRIGGER AS $$
            BEGIN
              NEW.updated_at = CURRENT_TIMESTAMP;
              RETURN NEW;
            END;
            $$ LANGUAGE plpgsql;
          `);

      await pool.query(`
            DROP TRIGGER IF EXISTS update_homepage_timestamp ON homepage;
            CREATE TRIGGER update_homepage_timestamp
            BEFORE UPDATE ON homepage
            FOR EACH ROW
            EXECUTE FUNCTION update_homepage_timestamp();
          `);

      // Добавляем начальную запись, если таблица пуста
      const { rows } = await pool.query("SELECT COUNT(*) FROM homepage");
      if (parseInt(rows[0].count) === 0) {
        await pool.query(`
              INSERT INTO homepage (title, description) 
              VALUES ('Добро пожаловать', 'Описание вашей компании')
            `);
      }
    } catch (error) {
      console.error("Error initializing homepage tables:", error);
      throw error;
    }
  }

  static async getHomepage() {
    const { rows } = await pool.query(`
      SELECT 
  h.*,
  COALESCE(
    (
      SELECT json_agg(carousel_data ORDER BY carousel_data->>'order_index')
      FROM (
        SELECT jsonb_build_object(
          'id', hc.id,
          'image_url', hc.image_url,
          'name', hc.name,
          'product_link', hc.product_link,
          'order_index', hc.order_index
        ) AS carousel_data
        FROM homepage_carousel hc
        WHERE hc.homepage_id = h.id
      ) sub
    ), 
    '[]'::json
  ) as carousel_images,
        (
          SELECT json_agg(
            jsonb_build_object(
              'id', p.id,
              'order_index', hpp.order_index
            )
            ORDER BY hpp.order_index
          )
          FROM homepage_popular_products hpp
          JOIN products p ON p.id = hpp.product_id
        ) as popular_products
      FROM homepage h
      LIMIT 1
    `);
    return rows[0] || null;
  }

  static async update(homepageData) {
    return await withTransaction(async (client) => {
      const { id, title, description, imageMetadata, popularProducts, files } =
        homepageData;

      // Update main content
      await client.query(
        `UPDATE homepage SET title = $1, description = $2 WHERE id = $3`,
        [title, description, id]
      );

      // Handle popular products
      if (popularProducts) {
        // First, clear existing popular products
        await client.query("DELETE FROM homepage_popular_products");

        const productIds = JSON.parse(popularProducts);

        // Insert new popular products with order index
        for (let i = 0; i < productIds.length; i++) {
          await client.query(
            `INSERT INTO homepage_popular_products (product_id, order_index)
             VALUES ($1, $2)`,
            [parseInt(productIds[i]), i]
          );
        }
      }

      // Handle carousel images
      if (files?.imageFiles) {
        const images = JSON.parse(imageMetadata || "[]");

        for (let i = 0; i < files.imageFiles.length; i++) {
          const file = files.imageFiles[i];
          const metadata = images[i] || {};
          const imageUrl = `/uploads/homepage/${file.filename}`;

          await client.query(
            `INSERT INTO homepage_carousel 
             (homepage_id, image_url, name, product_link, order_index)
             VALUES ($1, $2, $3, $4, $5)`,
            [id, imageUrl, metadata.name || "", metadata.product_link || "", i]
          );
        }
      }

      // Return updated homepage data
      return this.getHomepage();
    });
  }
}

module.exports = Homepage;
