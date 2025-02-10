// src/models/faq.js
const { pool, withTransaction } = require("../utils/database");

class FAQ {
  static async initTable() {
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS faq (
          id SERIAL PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      await pool.query(`
        CREATE TABLE IF NOT EXISTS faq_description_blocks (
          id SERIAL PRIMARY KEY,
          faq_id INTEGER REFERENCES faq(id) ON DELETE CASCADE,
          subtitle VARCHAR(255),
          description TEXT,
          answers TEXT[],
          order_index INTEGER NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Create trigger for updating updated_at
      await pool.query(`
        CREATE OR REPLACE FUNCTION update_faq_timestamp()
        RETURNS TRIGGER AS $$
        BEGIN
          NEW.updated_at = CURRENT_TIMESTAMP;
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;

        DROP TRIGGER IF EXISTS update_faq_timestamp ON faq;
        CREATE TRIGGER update_faq_timestamp
        BEFORE UPDATE ON faq
        FOR EACH ROW
        EXECUTE FUNCTION update_faq_timestamp();
      `);

      // Add initial FAQ if table is empty
      const { rows } = await pool.query("SELECT COUNT(*) FROM faq");
      if (parseInt(rows[0].count) === 0) {
        await pool.query(`
          INSERT INTO faq (title) 
          VALUES ('Вопрос-ответ')
        `);
      }
    } catch (error) {
      console.error("Error initializing FAQ tables:", error);
      throw error;
    }
  }

  static async getFaq() {
    const { rows } = await pool.query(`
      SELECT 
        f.*,
        (
          SELECT json_agg(block_data ORDER BY block_data->>'order_index')
          FROM (
            SELECT DISTINCT jsonb_build_object(
              'id', fdb.id,
              'subtitle', fdb.subtitle,
              'description', fdb.description,
              'answers', fdb.answers,
              'order_index', fdb.order_index
            ) AS block_data
            FROM faq_description_blocks fdb
            WHERE fdb.faq_id = f.id
          ) sub
        ) as description_blocks
      FROM faq f
      LIMIT 1
    `);
    return rows[0] || null;
  }

  static async update(faqData) {
    return await withTransaction(async (client) => {
      const { id, title, description_blocks } = faqData;

      // Update main FAQ info
      await client.query(`UPDATE faq SET title = $1 WHERE id = $2`, [
        title,
        id,
      ]);

      // Delete old description blocks
      await client.query(
        `DELETE FROM faq_description_blocks WHERE faq_id = $1`,
        [id]
      );

      // Add new description blocks
      if (description_blocks && description_blocks.length > 0) {
        for (let i = 0; i < description_blocks.length; i++) {
          const block = description_blocks[i];
          await client.query(
            `INSERT INTO faq_description_blocks 
             (faq_id, subtitle, description, answers, order_index)
             VALUES ($1, $2, $3, $4, $5)`,
            [
              id,
              block.subtitle || null,
              block.description || null,
              block.answers || [],
              i,
            ]
          );
        }
      }

      return this.getFaq();
    });
  }
}

module.exports = FAQ;
