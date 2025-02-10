const { pool, withTransaction } = require("../utils/database");
const { deleteFile } = require("../utils/fileHelpers");
const fs = require("fs").promises;
const path = require("path");

class Company {
  static async initTable() {
    try {
      // Удаляем существующие таблицы в правильном порядке
      // await pool.query(`
      //   DROP TABLE IF EXISTS company_images CASCADE;
      //   DROP TABLE IF EXISTS company_description_blocks CASCADE;
      //   DROP TABLE IF EXISTS company CASCADE;
      // `);

      // Создаем основную таблицу компании
      await pool.query(`
        CREATE TABLE IF NOT EXISTS company (
          id SERIAL PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Создаем таблицу для блоков описания
      await pool.query(`
        CREATE TABLE IF NOT EXISTS company_description_blocks (
          id SERIAL PRIMARY KEY,
          company_id INTEGER REFERENCES company(id) ON DELETE CASCADE,
          content TEXT NOT NULL,
          order_index INTEGER NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Создаем таблицу для изображений
      await pool.query(`
        CREATE TABLE IF NOT EXISTS company_images (
          id SERIAL PRIMARY KEY,
          company_id INTEGER REFERENCES company(id) ON DELETE CASCADE,
          image_url VARCHAR(255) NOT NULL,
          order_index INTEGER NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Создаем триггер для обновления updated_at
      await pool.query(`
        CREATE OR REPLACE FUNCTION update_company_timestamp()
        RETURNS TRIGGER AS $$
        BEGIN
          NEW.updated_at = CURRENT_TIMESTAMP;
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
      `);

      await pool.query(`
        DROP TRIGGER IF EXISTS update_company_timestamp ON company;
        CREATE TRIGGER update_company_timestamp
        BEFORE UPDATE ON company
        FOR EACH ROW
        EXECUTE FUNCTION update_company_timestamp();
      `);

      // Добавляем начальную запись, если таблица пуста
      const { rows } = await pool.query("SELECT COUNT(*) FROM company");
      if (parseInt(rows[0].count) === 0) {
        await pool.query(`
          INSERT INTO company (title) 
          VALUES ('Ваша компания')
        `);
      }
    } catch (error) {
      console.error("Error initializing company tables:", error);
      throw error;
    }
  }

  static async getCompany() {
    const { rows } = await pool.query(`
        SELECT 
          c.*,
          (
            SELECT json_agg(image_data ORDER BY image_data->>'order_index')
            FROM (
              SELECT DISTINCT jsonb_build_object(
                'id', ci.id,
                'image_url', ci.image_url,
                'order_index', ci.order_index
              ) AS image_data
              FROM company_images ci
              WHERE ci.company_id = c.id
            ) sub
          ) as images,
          (
            SELECT json_agg(block_data ORDER BY block_data->>'order_index')
            FROM (
              SELECT DISTINCT jsonb_build_object(
                'id', cdb.id,
                'content', cdb.content,
                'order_index', cdb.order_index
              ) AS block_data
              FROM company_description_blocks cdb
              WHERE cdb.company_id = c.id
            ) sub
          ) as description_blocks
        FROM company c
        LIMIT 1
      `);
    return rows[0] || null;
  }

  static async create(companyData, files) {
    return await withTransaction(async (client) => {
      const { title, description_blocks } = companyData;

      // Создаем запись о компании
      const {
        rows: [company],
      } = await client.query(
        `INSERT INTO company (title) VALUES ($1) RETURNING *`,
        [title]
      );

      // Добавляем блоки описания
      if (description_blocks && description_blocks.length > 0) {
        for (let i = 0; i < description_blocks.length; i++) {
          await client.query(
            `INSERT INTO company_description_blocks (company_id, content, order_index)
             VALUES ($1, $2, $3)`,
            [company.id, description_blocks[i], i]
          );
        }
      }

      // Загружаем изображения
      if (files && files.length > 0) {
        for (let i = 0; i < files.length; i++) {
          const imageUrl = `/uploads/company/${files[i].filename}`;
          await client.query(
            `INSERT INTO company_images (company_id, image_url, order_index)
             VALUES ($1, $2, $3)`,
            [company.id, imageUrl, i]
          );
        }
      }

      return this.getCompany();
    });
  }

  static async update(companyData, files) {
    return await withTransaction(async (client) => {
      const { id, title, description_blocks, deletedImages } = companyData;
      console.log("::: Данные для обновления:", companyData);
      console.log("::: Файлы:", files);

      // Обновляем основную информацию
      await client.query(`UPDATE company SET title = $1 WHERE id = $2`, [
        title,
        id,
      ]);

      // Удаляем старые блоки описания
      await client.query(
        `DELETE FROM company_description_blocks WHERE company_id = $1`,
        [id]
      );

      // Добавляем новые блоки описания
      if (description_blocks && description_blocks.length > 0) {
        for (let i = 0; i < description_blocks.length; i++) {
          await client.query(
            `INSERT INTO company_description_blocks (company_id, content, order_index)
             VALUES ($1, $2, $3)`,
            [id, description_blocks[i], i]
          );
        }
      }

      // Удаляем отмеченные изображения
      if (deletedImages && deletedImages.length > 0) {
        const { rows } = await client.query(
          `DELETE FROM company_images 
           WHERE id = ANY($1) AND company_id = $2
           RETURNING image_url`,
          [deletedImages, id]
        );

        for (const row of rows) {
          try {
            const fullPath = path.join(process.cwd(), "public", row.image_url);
            await fs.unlink(fullPath);
          } catch (error) {
            console.error(`Ошибка удаления файла ${row.image_url}:`, error);
          }
        }
      }

      // Добавляем новые изображения
      if (files && files.length > 0) {
        for (let i = 0; i < files.length; i++) {
          const imageUrl = `/uploads/company/${files[i].filename}`;
          await client.query(
            `INSERT INTO company_images (company_id, image_url, order_index)
             VALUES ($1, $2, $3)`,
            [id, imageUrl, i]
          );
        }
      }

      // Возвращаем обновленную информацию о компании
      const { rows } = await client.query(
        `
        WITH 
        images_data AS (
          SELECT 
            company_id, 
            json_agg(
              json_build_object(
                'id', id,
                'image_url', image_url,
                'order_index', order_index
              ) 
              ORDER BY order_index
            ) AS images
          FROM company_images
          WHERE company_id = $1
          GROUP BY company_id
        ),
        blocks_data AS (
          SELECT 
            company_id, 
            json_agg(
              json_build_object(
                'id', id,
                'content', content,
                'order_index', order_index
              ) 
              ORDER BY order_index
            ) AS description_blocks
          FROM company_description_blocks
          WHERE company_id = $1
          GROUP BY company_id
        )
        SELECT 
          c.*,
          COALESCE(id.images, '[]'::json) AS images,
          COALESCE(bd.description_blocks, '[]'::json) AS description_blocks
        FROM company c
        LEFT JOIN images_data id ON c.id = id.company_id
        LEFT JOIN blocks_data bd ON c.id = bd.company_id
        WHERE c.id = $1
      `,
        [id]
      );

      return rows[0] || null;
    });
  }
}

module.exports = Company;
