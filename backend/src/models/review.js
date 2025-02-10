// src/models/Review.js
const { pool, withTransaction } = require("../utils/database");

class Review {
  static async initTable() {
    try {
      // Создаем таблицу отзывов
      await pool.query(`
        CREATE TABLE IF NOT EXISTS reviews (
          id SERIAL PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          email VARCHAR(100),
          phone VARCHAR(20),
          text TEXT NOT NULL,
          status VARCHAR(20) NOT NULL DEFAULT 'pending',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Триггер для обновления updated_at
      await pool.query(`
        CREATE OR REPLACE FUNCTION update_review_timestamp()
        RETURNS TRIGGER AS $$
        BEGIN
          NEW.updated_at = CURRENT_TIMESTAMP;
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
      `);

      // Создаем триггер
      await pool.query(`
        DROP TRIGGER IF EXISTS update_review_timestamp_trigger ON reviews;
        CREATE TRIGGER update_review_timestamp_trigger
        BEFORE UPDATE ON reviews
        FOR EACH ROW
        EXECUTE FUNCTION update_review_timestamp();
      `);
    } catch (error) {
      console.error("Error initializing reviews table:", error);
      throw error;
    }
  }

  static async findAll(params = {}) {
    const { page = 1, limit = 10, status = "approved" } = params;

    const offset = (page - 1) * limit;

    const { rows } = await pool.query(
      `
      SELECT * FROM reviews 
      WHERE status = $1
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3
    `,
      [status, limit, offset]
    );

    const {
      rows: [countResult],
    } = await pool.query(
      `
      SELECT COUNT(*) as total 
      FROM reviews 
      WHERE status = $1
    `,
      [status]
    );

    return {
      reviews: rows,
      total: parseInt(countResult.total),
      page,
      totalPages: Math.ceil(parseInt(countResult.total) / limit),
    };
  }

  static async findById(id) {
    const { rows } = await pool.query("SELECT * FROM reviews WHERE id = $1", [
      id,
    ]);
    return rows[0];
  }

  static async create(reviewData) {
    const { name, email = null, phone = null, text } = reviewData;

    return await withTransaction(async (client) => {
      const {
        rows: [review],
      } = await client.query(
        `INSERT INTO reviews 
         (name, email, phone, text, status) 
         VALUES ($1, $2, $3, $4, $5) 
         RETURNING *`,
        [name, email, phone, text, "pending"]
      );

      return review;
    });
  }

  static async update(id, reviewData) {
    return await withTransaction(async (client) => {
      const {
        status = "pending",
        name = null,
        email = null,
        phone = null,
        text = null,
      } = reviewData;

      const {
        rows: [review],
      } = await client.query(
        `UPDATE reviews 
         SET 
           name = COALESCE($1, name),
           email = COALESCE($2, email),
           phone = COALESCE($3, phone),
           text = COALESCE($4, text),
           status = $5
         WHERE id = $6
         RETURNING *`,
        [name, email, phone, text, status, id]
      );

      if (!review) {
        throw new Error("Отзыв не найден");
      }

      return review;
    });
  }

  static async delete(id) {
    return await withTransaction(async (client) => {
      const { rows } = await client.query(
        "DELETE FROM reviews WHERE id = $1 RETURNING *",
        [id]
      );

      if (rows.length === 0) {
        throw new Error("Отзыв не найден");
      }

      return rows[0];
    });
  }

  static async updateStatus(id, status) {
    const {
      rows: [review],
    } = await pool.query(
      "UPDATE reviews SET status = $1 WHERE id = $2 RETURNING *",
      [status, id]
    );

    if (!review) {
      throw new Error("Отзыв не найден");
    }

    return review;
  }
}

module.exports = Review;
