// src/models/order.js
const { pool, withTransaction } = require("../utils/database");

class Order {
  static ORDER_STATUSES = {
    NEW: 'new',              // Ожидает обработки
    SHIPPED: 'shipped',      // Отправлен
    COMPLETED: 'completed',  // Выполнен
    REJECTED: 'rejected'     // Отклонен
  };

  static async initTable() {
    try {
      // Create order status enum if it doesn't exist
      await pool.query(`
        DO $$ BEGIN
          CREATE TYPE order_status AS ENUM ('new', 'shipped', 'completed', 'rejected');
        EXCEPTION
          WHEN duplicate_object THEN null;
        END $$;
      `);

      // Create orders table
      await pool.query(`
        CREATE TABLE IF NOT EXISTS orders (
          id SERIAL PRIMARY KEY,
          customer_name VARCHAR(255),
          customer_phone VARCHAR(20) NOT NULL,
          customer_email VARCHAR(100),
          customer_zip_code VARCHAR(20),
          customer_address TEXT,
          customer_comment TEXT,
          total_amount DECIMAL(10,2) NOT NULL,
          status order_status NOT NULL DEFAULT 'new',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Create order items table
      await pool.query(`
        CREATE TABLE IF NOT EXISTS order_items (
          id SERIAL PRIMARY KEY,
          order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
          product_id INTEGER REFERENCES products(id),
          product_name VARCHAR(255) NOT NULL,
          price DECIMAL(10,2) NOT NULL,
          quantity INTEGER NOT NULL,
          engraving TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Create update timestamp trigger
      await pool.query(`
        CREATE OR REPLACE FUNCTION update_order_timestamp()
        RETURNS TRIGGER AS $$
        BEGIN
          NEW.updated_at = CURRENT_TIMESTAMP;
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;

        DROP TRIGGER IF EXISTS update_order_timestamp_trigger ON orders;
        CREATE TRIGGER update_order_timestamp_trigger
        BEFORE UPDATE ON orders
        FOR EACH ROW
        EXECUTE FUNCTION update_order_timestamp();
      `);
    } catch (error) {
      console.error("Error initializing orders tables:", error);
      throw error;
    }
  }

  static async create(orderData) {
    return await withTransaction(async (client) => {
      // Extract order details
      const {
        customerName,
        customerPhone,
        customerEmail,
        customerZipCode,
        customerAddress,
        customerComment,
        items,
        totalAmount
      } = orderData;

      // Insert order
      const { rows: [order] } = await client.query(`
        INSERT INTO orders (
          customer_name,
          customer_phone,
          customer_email,
          customer_zip_code,
          customer_address,
          customer_comment,
          total_amount,
          status
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *`,
        [
          customerName,
          customerPhone,
          customerEmail,
          customerZipCode,
          customerAddress,
          customerComment,
          totalAmount,
          'new'
        ]
      );

      // Insert order items
      for (const item of items) {
        await client.query(`
          INSERT INTO order_items (
            order_id,
            product_id,
            product_name,
            price,
            quantity,
            engraving
          )
          VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            order.id,
            item.id,
            item.name,
            item.price,
            item.quantity,
            item.engraving || null
          ]
        );
      }

      return this.findById(order.id);
    });
  }

  static async findAll(params = {}) {
    const { page = 1, limit = 10, status = null } = params;
    const offset = (page - 1) * limit;

    let query = `
      SELECT
        o.*,
        COUNT(oi.id) as item_count,
        json_agg(jsonb_build_object(
          'id', oi.id,
          'product_id', oi.product_id,
          'product_name', oi.product_name,
          'price', oi.price,
          'quantity', oi.quantity,
          'engraving', oi.engraving
        )) as items
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
    `;

    const queryParams = [];
    let whereClause = '';

    if (status) {
      whereClause = 'WHERE o.status = $1';
      queryParams.push(status);
    }

    query += whereClause;
    query += ' GROUP BY o.id ORDER BY o.created_at DESC LIMIT $' + (queryParams.length + 1) + ' OFFSET $' + (queryParams.length + 2);
    queryParams.push(limit, offset);

    const { rows } = await pool.query(query, queryParams);

    // Get total count for pagination
    // Вот здесь ошибка: нужно использовать alias "o" в FROM или убрать "o." в WHERE
    let countQuery = 'SELECT COUNT(*) as total FROM orders o';
    let countParams = [];

    if (status) {
      countQuery += ' WHERE o.status = $1';
      countParams.push(status);
    }

    const { rows: [countResult] } = await pool.query(countQuery, countParams);

    return {
      orders: rows,
      total: parseInt(countResult.total),
      page,
      totalPages: Math.ceil(parseInt(countResult.total) / limit)
    };
}

  static async findById(id) {
    const { rows } = await pool.query(`
      SELECT
        o.*,
        json_agg(jsonb_build_object(
          'id', oi.id,
          'product_id', oi.product_id,
          'product_name', oi.product_name,
          'price', oi.price,
          'quantity', oi.quantity,
          'engraving', oi.engraving
        )) as items
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE o.id = $1
      GROUP BY o.id
    `, [id]);

    return rows[0];
  }

  static async updateStatus(id, status) {
    const { rows: [order] } = await pool.query(
      "UPDATE orders SET status = $1 WHERE id = $2 RETURNING *",
      [status, id]
    );

    if (!order) {
      throw new Error("Заказ не найден");
    }

    return order;
  }

  static async delete(id) {
    return await withTransaction(async (client) => {
      const { rows } = await client.query(
        "DELETE FROM orders WHERE id = $1 RETURNING *",
        [id]
      );

      if (rows.length === 0) {
        throw new Error("Заказ не найден");
      }

      return rows[0];
    });
  }
}

module.exports = Order;