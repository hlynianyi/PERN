// src/utils/database.js
const pool = require('../config/database');

const withTransaction = async (callback) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

const retryConnection = async (maxRetries = 5) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const client = await pool.connect();
      console.log('Успешное подключение к базе данных');
      client.release();
      return true;
    } catch (err) {
      console.log(`Попытка подключения к базе данных ${i + 1}/${maxRetries} не удалась:`, err.message);
      if (i === maxRetries - 1) throw err;
      await new Promise(resolve => setTimeout(resolve, 5000 * (i + 1)));
    }
  }
  return false;
};

module.exports = {
  pool,
  withTransaction,
  retryConnection
};