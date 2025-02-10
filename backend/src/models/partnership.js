// src/models/partnership.js
const { pool, withTransaction } = require("../utils/database");

class Partnership {
  static async initTable() {
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS partnership (
          id SERIAL PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS partnership_blocks (
          id SERIAL PRIMARY KEY,
          partnership_id INTEGER REFERENCES partnership(id) ON DELETE CASCADE,
          text TEXT NOT NULL,
          format_data JSONB DEFAULT '{"bold": false}',
          order_index INTEGER NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      await pool.query(`
        CREATE OR REPLACE FUNCTION update_partnership_timestamp()
        RETURNS TRIGGER AS $$
        BEGIN
          NEW.updated_at = CURRENT_TIMESTAMP;
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;

        DROP TRIGGER IF EXISTS update_partnership_timestamp ON partnership;
        CREATE TRIGGER update_partnership_timestamp
        BEFORE UPDATE ON partnership
        FOR EACH ROW
        EXECUTE FUNCTION update_partnership_timestamp();
      `);

      const { rows } = await pool.query("SELECT COUNT(*) FROM partnership");
      if (parseInt(rows[0].count) === 0) {
        await pool.query(
          `INSERT INTO partnership (title) VALUES ('Сотрудничество')`
        );
      }
    } catch (error) {
      console.error("Error initializing partnership tables:", error);
      throw error;
    }
  }

  static async getPartnership() {
    const { rows } = await pool.query(`
      SELECT 
        w.*,
        COALESCE(
          json_agg(
            json_build_object(
              'id', wb.id,
              'text', wb.text,
              'format_data', wb.format_data,
              'order_index', wb.order_index
            ) ORDER BY wb.order_index
          ) FILTER (WHERE wb.id IS NOT NULL),
          '[]'
        ) as text_blocks
      FROM partnership w
      LEFT JOIN partnership_blocks wb ON w.id = wb.partnership_id
      GROUP BY w.id
      LIMIT 1
    `);
    return rows[0] || null;
  }

  static async update(partnershipData) {
    return await withTransaction(async (client) => {
      const { id, title, text_blocks = [] } = partnershipData;

      await client.query(`UPDATE partnership SET title = $1 WHERE id = $2`, [
        title,
        id,
      ]);

      await client.query(`DELETE FROM partnership_blocks WHERE partnership_id = $1`, [
        id,
      ]);

      if (text_blocks.length > 0) {
        const values = text_blocks.map((block, index) => ({
          partnership_id: id,
          text: block.text,
          format_data: block.format_data || { bold: false },
          order_index: index,
        }));

        const placeholders = values
          .map((_, i) => `($1, $${i * 3 + 2}, $${i * 3 + 3}, $${i * 3 + 4})`)
          .join(", ");

        const flatValues = [id];
        values.forEach((v) => {
          flatValues.push(v.text, v.format_data, v.order_index);
        });

        await client.query(
          `INSERT INTO partnership_blocks (partnership_id, text, format_data, order_index)
           VALUES ${placeholders}`,
          flatValues
        );
      }

      return this.getPartnership();
    });
  }
}

module.exports = Partnership;
