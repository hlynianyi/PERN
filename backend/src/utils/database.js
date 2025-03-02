// src/utils/database.js
const pool = require("../config/database");

const withTransaction = async (callback) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await callback(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

const retryConnection = async (maxRetries = 5) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const client = await pool.connect();
      console.log("Successful connected to DB.");
      client.release();
      return true;
    } catch (err) {
      console.log(`Couldnt connect to DB ${i + 1}/${maxRetries}:`, err.message);
      if (i === maxRetries - 1) throw err;
      await new Promise((resolve) => setTimeout(resolve, 5000 * (i + 1)));
    }
  }
  return false;
};

module.exports = {
  pool,
  withTransaction,
  retryConnection,
};
