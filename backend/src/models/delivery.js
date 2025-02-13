// src/models/delivery.js
const { pool, withTransaction } = require("../utils/database");

class Delivery {
  static async initTable() {
    try {
      await pool.query(`
        DROP TABLE IF EXISTS delivery_regions CASCADE;
        DROP TABLE IF EXISTS delivery CASCADE;

        CREATE TABLE IF NOT EXISTS delivery (
          id SERIAL PRIMARY KEY,
          subtitle TEXT,
          description TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS delivery_regions (
          id SERIAL PRIMARY KEY,
          delivery_id INTEGER REFERENCES delivery(id) ON DELETE CASCADE,
          destinations JSONB NOT NULL DEFAULT '[]'::jsonb,
          note TEXT,
          order_index INTEGER NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Создаем триггер для обновления updated_at
      await pool.query(`
        CREATE OR REPLACE FUNCTION update_delivery_timestamp()
        RETURNS TRIGGER AS $$
        BEGIN
          NEW.updated_at = CURRENT_TIMESTAMP;
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;

        DROP TRIGGER IF EXISTS update_delivery_timestamp ON delivery;
        CREATE TRIGGER update_delivery_timestamp
        BEFORE UPDATE ON delivery
        FOR EACH ROW
        EXECUTE FUNCTION update_delivery_timestamp();
      `);

      // Добавляем начальную запись, если таблица пуста
      const { rows } = await pool.query("SELECT COUNT(*) FROM delivery");
      if (parseInt(rows[0].count) === 0) {
        const {
          rows: [delivery],
        } = await pool.query(
          `
          INSERT INTO delivery (subtitle, description) 
          VALUES ($1, $2)
          RETURNING id`,
          ["Условия доставки", "Основная информация о доставке"]
        );

        // Добавляем пример региона
        const initialDestinations = [
          {
            destination_service: "Москва и МО",
            services: [
              {
                service_name: "СДЭК",
                service_cost: "от 300₽",
                service_period: "1-2 дня",
              },
            ],
          },
        ];

        await pool.query(
          `INSERT INTO delivery_regions (delivery_id, destinations, note, order_index)
           VALUES ($1, $2, $3, $4)`,
          [
            delivery.id,
            JSON.stringify(initialDestinations),
            "Доставка осуществляется по рабочим дням",
            0,
          ]
        );
      }
    } catch (error) {
      console.error("Error initializing delivery tables:", error);
      throw error;
    }
  }

  static async getDelivery() {
    try {
      const { rows } = await pool.query(`
        SELECT 
          d.*,
          COALESCE(
            (
              SELECT jsonb_agg(  -- Изменено с json_agg на jsonb_agg
                jsonb_build_object(
                  'id', dr.id,
                  'destinations', dr.destinations,
                  'note', dr.note,
                  'order_index', dr.order_index
                ) ORDER BY dr.order_index
              ) FILTER (WHERE dr.id IS NOT NULL)
            ),
            '[]'::jsonb
          ) as regions
        FROM delivery d
        LEFT JOIN delivery_regions dr ON dr.delivery_id = d.id
        GROUP BY d.id
        LIMIT 1
      `);
      return rows[0] || null;
    } catch (error) {
      console.error("Error getting delivery:", error);
      throw error;
    }
  }

  static async update(deliveryData) {
    return await withTransaction(async (client) => {
      try {
        const { id, subtitle, description, regions = [] } = deliveryData;

        // Обновляем или создаем запись доставки
        let deliveryId = id;
        if (!deliveryId) {
          const {
            rows: [delivery],
          } = await client.query(
            `INSERT INTO delivery (subtitle, description) 
             VALUES ($1, $2) 
             RETURNING id`,
            [subtitle || null, description || null]
          );
          deliveryId = delivery.id;
        } else {
          await client.query(
            `UPDATE delivery 
             SET subtitle = $1, description = $2 
             WHERE id = $3`,
            [subtitle || null, description || null, deliveryId]
          );
        }

        // Удаляем старые регионы
        await client.query(
          "DELETE FROM delivery_regions WHERE delivery_id = $1",
          [deliveryId]
        );

        // Добавляем новые регионы
        if (regions && regions.length > 0) {
          const regionValues = regions
            .map((_, index) => `($1, $2, $3, $${index + 4})`)
            .join(", ");

          const regionParams = [
            deliveryId,
            JSON.stringify(regions[0].destinations),
            regions[0].note || null,
            ...regions.map((_, index) => index),
          ];

          await client.query(
            `INSERT INTO delivery_regions (delivery_id, destinations, note, order_index)
             VALUES ${regionValues}`,
            regionParams
          );
        }

        return this.getDelivery();
      } catch (error) {
        console.error("Error updating delivery:", error);
        throw error;
      }
    });
  }
}

module.exports = Delivery;
