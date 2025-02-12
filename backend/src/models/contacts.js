// src/models/contacts.js
const { pool, withTransaction } = require("../utils/database");

class Contacts {
  static async initTable() {
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS contacts (
          id SERIAL PRIMARY KEY,
          city VARCHAR(255),
          address TEXT,
          phones TEXT[], -- Массив телефонов
          email VARCHAR(255),
          work_days VARCHAR(255),
          work_hours VARCHAR(255),
          description TEXT,
          telegram VARCHAR(255),
          whatsapp VARCHAR(255),
          instagram VARCHAR(255),
          vkontakte VARCHAR(255),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Создаем триггер для обновления updated_at
      await pool.query(`
        CREATE OR REPLACE FUNCTION update_contacts_timestamp()
        RETURNS TRIGGER AS $$
        BEGIN
          NEW.updated_at = CURRENT_TIMESTAMP;
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;

        DROP TRIGGER IF EXISTS update_contacts_timestamp ON contacts;
        CREATE TRIGGER update_contacts_timestamp
        BEFORE UPDATE ON contacts
        FOR EACH ROW
        EXECUTE FUNCTION update_contacts_timestamp();
      `);

      // Добавляем начальную запись, если таблица пуста
      const { rows } = await pool.query("SELECT COUNT(*) FROM contacts");
      if (parseInt(rows[0].count) === 0) {
        await pool.query(`
          INSERT INTO contacts (
            city, 
            address, 
            phones, 
            email, 
            work_days, 
            work_hours,
            description,
            telegram,
            whatsapp,
            instagram,
            vkontakte
          ) VALUES (
            'Ваш город',
            'Ваш адрес',
            ARRAY[]::TEXT[],
            'email@example.com',
            'Пн-Пт',
            '9:00 - 18:00',
            'Описание контактов',
            null,
            null,
            null,
            null
          )
        `);
      }
    } catch (error) {
      console.error("Error initializing contacts table:", error);
      throw error;
    }
  }

  static async getContacts() {
    const { rows } = await pool.query(`
      SELECT * FROM contacts LIMIT 1
    `);
    return rows[0] || null;
  }

  static async update(contactsData) {
    return await withTransaction(async (client) => {
      const {
        id,
        city,
        address,
        phones,
        email,
        work_days,
        work_hours,
        description,
        telegram,
        whatsapp,
        instagram,
        vkontakte,
      } = contactsData;

      const {
        rows: [contacts],
      } = await client.query(
        `UPDATE contacts 
         SET 
           city = $1,
           address = $2,
           phones = $3,
           email = $4,
           work_days = $5,
           work_hours = $6,
           description = $7,
           telegram = $8,
           whatsapp = $9,
           instagram = $10,
           vkontakte = $11
         WHERE id = $12 
         RETURNING *`,
        [
          city || null,
          address || null,
          phones || [],
          email || null,
          work_days || null,
          work_hours || null,
          description || null,
          telegram || null,
          whatsapp || null,
          instagram || null,
          vkontakte || null,
          id,
        ]
      );

      if (!contacts) {
        throw new Error("Контакты не найдены");
      }

      return contacts;
    });
  }
}

module.exports = Contacts;
