// src/models/payment.js
const { pool, withTransaction } = require("../utils/database");

class Payment {
    static async initTable() {
        try {
            await pool.query(`
        CREATE TABLE IF NOT EXISTS payment (
          id SERIAL PRIMARY KEY,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS payment_descriptions (
          id SERIAL PRIMARY KEY,
          payment_id INTEGER REFERENCES payment(id) ON DELETE CASCADE,
          text TEXT NOT NULL,
          order_index INTEGER NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS payment_methods (
          id SERIAL PRIMARY KEY,
          payment_id INTEGER REFERENCES payment(id) ON DELETE CASCADE,
          title VARCHAR(255) NOT NULL,
          descriptions TEXT[],
          order_index INTEGER NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

            // Создаем триггер для обновления updated_at
            await pool.query(`
        CREATE OR REPLACE FUNCTION update_payment_timestamp()
        RETURNS TRIGGER AS $$
        BEGIN
          NEW.updated_at = CURRENT_TIMESTAMP;
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;

        DROP TRIGGER IF EXISTS update_payment_timestamp ON payment;
        CREATE TRIGGER update_payment_timestamp
        BEFORE UPDATE ON payment
        FOR EACH ROW
        EXECUTE FUNCTION update_payment_timestamp();
      `);

            // Добавляем начальную запись, если таблица пуста
            const { rows } = await pool.query("SELECT COUNT(*) FROM payment");
            if (parseInt(rows[0].count) === 0) {
                const { rows: [payment] } = await pool.query(
                    `INSERT INTO payment DEFAULT VALUES RETURNING id`
                );

                // Добавляем пример описания
                await pool.query(`
          INSERT INTO payment_descriptions (payment_id, text, order_index)
          VALUES ($1, 'Пример описания оплаты', 0)
        `, [payment.id]);

                // Добавляем пример метода оплаты
                await pool.query(`
          INSERT INTO payment_methods (payment_id, title, descriptions, order_index)
          VALUES ($1, 'Наличные', ARRAY['Оплата при получении'], 0)
        `, [payment.id]);
            }
        } catch (error) {
            console.error("Error initializing payment tables:", error);
            throw error;
        }
    }

    static async getPayment() {
        const { rows } = await pool.query(`
      SELECT 
        p.*,
        (
          SELECT json_agg(
            jsonb_build_object(
              'id', pd.id,
              'text', pd.text,
              'order_index', pd.order_index
            ) ORDER BY pd.order_index
          ) FILTER (WHERE pd.id IS NOT NULL)
          FROM payment_descriptions pd
          WHERE pd.payment_id = p.id
        ) as descriptions,
        (
          SELECT json_agg(
            jsonb_build_object(
              'id', pm.id,
              'title', pm.title,
              'descriptions', pm.descriptions,
              'order_index', pm.order_index
            ) ORDER BY pm.order_index
          ) FILTER (WHERE pm.id IS NOT NULL)
          FROM payment_methods pm
          WHERE pm.payment_id = p.id
        ) as payment_methods
      FROM payment p
      LIMIT 1
    `);
        return rows[0] || null;
    }

    static async update(paymentData) {
        return await withTransaction(async(client) => {
            const { id, descriptions = [], payment_methods = [] } = paymentData;

            // Получаем существующую запись или создаем новую
            let paymentId = id;
            if (!paymentId) {
                const { rows: [payment] } = await client.query(
                    `INSERT INTO payment DEFAULT VALUES RETURNING id`
                );
                paymentId = payment.id;
            }

            // Удаляем старые записи
            await client.query('DELETE FROM payment_descriptions WHERE payment_id = $1', [paymentId]);
            await client.query('DELETE FROM payment_methods WHERE payment_id = $1', [paymentId]);

            // Добавляем новые описания
            if (descriptions.length > 0) {
                const descValues = descriptions.map((_, index) =>
                    `($1, $${index * 2 + 2}, $${index * 2 + 3})`
                ).join(', ');

                const descParams = descriptions.flatMap((desc, index) => [
                    desc.text,
                    index
                ]);

                await client.query(
                    `INSERT INTO payment_descriptions (payment_id, text, order_index)
           VALUES ${descValues}`, [paymentId, ...descParams]
                );
            }

            // Добавляем новые методы оплаты
            if (payment_methods.length > 0) {
                const methodValues = payment_methods.map((_, index) =>
                    `($1, $${index * 3 + 2}, $${index * 3 + 3}, $${index * 3 + 4})`
                ).join(', ');

                const methodParams = payment_methods.flatMap((method, index) => [
                    method.title,
                    method.descriptions,
                    index
                ]);

                await client.query(
                    `INSERT INTO payment_methods (payment_id, title, descriptions, order_index)
           VALUES ${methodValues}`, [paymentId, ...methodParams]
                );
            }

            return this.getPayment();
        });
    }
}

module.exports = Payment;