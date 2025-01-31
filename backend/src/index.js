// src/index.js
const express = require('express');
const cors = require('cors');
const path = require('path');
const routes = require('./routes');
const Product = require('./models/product');
const { retryConnection } = require('./utils/database');

const app = express();
const port = process.env.PORT || 5002;

// Middleware
app.use(cors({
  origin: ['http://localhost:3002', 'http://localhost:80', 'http://localhost'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200
}));

app.use(express.json());
app.use('/uploads', express.static('uploads'));
app.options('*', cors());

// Routes
app.use('/api', routes);

// Инициализация базы данных
async function initDB() {
  try {
    console.log('Подключение к базе данных...');
    await retryConnection();
    await Product.initTable();
    console.log('База данных успешно инициализирована');
  } catch (error) {
    console.error('Ошибка при инициализации базы данных:', error.message);
    throw error;
  }
}

// Запуск сервера
const startServer = async () => {
  try {
    await initDB();
    app.listen(port, () => {
      console.log(`Сервер запущен на порту ${port}`);
    });
  } catch (err) {
    console.error('Ошибка при запуске сервера:', err);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGINT', async () => {
  try {
    const pool = require('./config/database');
    await pool.end();
    console.log('Соединение с базой данных закрыто');
    process.exit(0);
  } catch (err) {
    console.error('Ошибка при закрытии:', err);
    process.exit(1);
  }
});

// Запускаем сервер
startServer();