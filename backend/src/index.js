const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const { Pool } = require('pg');
const fs = require('fs').promises;

const app = express();
const port = process.env.PORT || 5002;

// CORS и базовые middleware остаются без изменений
app.use(cors({
  origin: ['http://localhost:3002', 'http://localhost:80', 'http://localhost'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
}));
app.use(express.json());
app.use('/uploads', express.static('uploads'));
app.options('*', cors());

// Конфигурация подключения к базе данных остается прежней
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Настраиваем multer для загрузки нескольких файлов
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    // Генерируем уникальное имя файла, добавляя timestamp
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

// Добавляем фильтр файлов для проверки типа загружаемых файлов
const fileFilter = (req, file, cb) => {
  // Разрешаем только изображения
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Разрешены только изображения!'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // Ограничиваем размер файла (5MB)
    files: 10 // Максимальное количество файлов за один запрос
  }
});

// Функция инициализации базы данных с новой таблицей для фотографий
async function initDB() {
  try {
    console.log('Подключение к базе данных...');
    await retryConnection();
    
    // Создаем таблицу продуктов
    await pool.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10,2),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Создаем отдельную таблицу для фотографий
    await pool.query(`
      CREATE TABLE IF NOT EXISTS product_images (
        id SERIAL PRIMARY KEY,
        product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
        image_url VARCHAR(255) NOT NULL,
        is_primary BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT one_primary_image UNIQUE (product_id, is_primary) 
        DEFERRABLE INITIALLY DEFERRED
      );
    `);

    console.log('База данных успешно инициализирована');
  } catch (error) {
    console.error('Ошибка при инициализации базы данных:', error.message);
    throw error;
  }
}

// Вспомогательная функция для работы с транзакциями
async function withTransaction(callback) {
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
}

// API эндпоинты

// Получение всех продуктов с их фотографиями
app.get('/api/products', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT 
        p.*,
        json_agg(
          json_build_object(
            'id', pi.id,
            'image_url', pi.image_url,
            'is_primary', pi.is_primary
          )
        ) as images
      FROM products p
      LEFT JOIN product_images pi ON p.id = pi.product_id
      GROUP BY p.id
      ORDER BY p.created_at DESC
    `);
    res.json(rows);
  } catch (error) {
    console.error('Ошибка при получении продуктов:', error);
    res.status(500).json({ error: error.message });
  }
});

// Получение одного продукта с фотографиями
app.get('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query(`
      SELECT 
        p.*,
        json_agg(
          json_build_object(
            'id', pi.id,
            'image_url', pi.image_url,
            'is_primary', pi.is_primary
          )
        ) as images
      FROM products p
      LEFT JOIN product_images pi ON p.id = pi.product_id
      WHERE p.id = $1
      GROUP BY p.id
    `, [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Продукт не найден' });
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error('Ошибка при получении продукта:', error);
    res.status(500).json({ error: error.message });
  }
});

// Создание продукта с несколькими фотографиями
app.post('/api/products', upload.array('images', 10), async (req, res) => {
  try {
    const { name, description, price } = req.body;
    const files = req.files || [];

    await withTransaction(async (client) => {
      // Создаем продукт
      const { rows: [product] } = await client.query(
        'INSERT INTO products (name, description, price) VALUES ($1, $2, $3) RETURNING *',
        [name, description, price]
      );

      // Загружаем фотографии
      for (let i = 0; i < files.length; i++) {
        const imageUrl = `/uploads/${files[i].filename}`;
        await client.query(
          'INSERT INTO product_images (product_id, image_url, is_primary) VALUES ($1, $2, $3)',
          [product.id, imageUrl, i === 0] // Первая фотография становится основной
        );
      }

      // Получаем продукт с загруженными фотографиями
      const { rows: [productWithImages] } = await client.query(`
        SELECT 
          p.*,
          json_agg(
            json_build_object(
              'id', pi.id,
              'image_url', pi.image_url,
              'is_primary', pi.is_primary
            )
          ) as images
        FROM products p
        LEFT JOIN product_images pi ON p.id = pi.product_id
        WHERE p.id = $1
        GROUP BY p.id
      `, [product.id]);

      res.status(201).json(productWithImages);
    });
  } catch (error) {
    // В случае ошибки удаляем загруженные файлы
    if (req.files) {
      for (const file of req.files) {
        await fs.unlink(file.path).catch(console.error);
      }
    }
    console.error('Ошибка при создании продукта:', error);
    res.status(500).json({ error: error.message });
  }
});

// Обновление продукта с фотографиями
app.put('/api/products/:id', upload.array('images', 10), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, deletedImages } = req.body;
    const files = req.files || [];

    await withTransaction(async (client) => {
      // Обновляем основную информацию о продукте
      const { rows: [product] } = await client.query(
        'UPDATE products SET name = $1, description = $2, price = $3 WHERE id = $4 RETURNING *',
        [name, description, price, id]
      );

      if (!product) {
        throw new Error('Продукт не найден');
      }

      // Удаляем выбранные фотографии
      if (deletedImages) {
        const imagesToDelete = JSON.parse(deletedImages);
        for (const imageId of imagesToDelete) {
          const { rows } = await client.query(
            'DELETE FROM product_images WHERE id = $1 RETURNING image_url',
            [imageId]
          );
          if (rows[0]) {
            // Удаляем файл с диска
            const filePath = path.join(__dirname, '..', rows[0].image_url);
            await fs.unlink(filePath).catch(console.error);
          }
        }
      }

      // Добавляем новые фотографии
      for (const file of files) {
        const imageUrl = `/uploads/${file.filename}`;
        await client.query(
          'INSERT INTO product_images (product_id, image_url, is_primary) VALUES ($1, $2, false)',
          [id, imageUrl]
        );
      }

      // Получаем обновленный продукт с фотографиями
      const { rows: [productWithImages] } = await client.query(`
        SELECT 
          p.*,
          json_agg(
            json_build_object(
              'id', pi.id,
              'image_url', pi.image_url,
              'is_primary', pi.is_primary
            )
          ) as images
        FROM products p
        LEFT JOIN product_images pi ON p.id = pi.product_id
        WHERE p.id = $1
        GROUP BY p.id
      `, [id]);

      res.json(productWithImages);
    });
  } catch (error) {
    // В случае ошибки удаляем новые загруженные файлы
    if (req.files) {
      for (const file of req.files) {
        await fs.unlink(file.path).catch(console.error);
      }
    }
    console.error('Ошибка при обновлении продукта:', error);
    res.status(500).json({ error: error.message });
  }
});

// Удаление продукта и всех связанных фотографий
app.delete('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;

    await withTransaction(async (client) => {
      // Получаем все фотографии продукта
      const { rows: images } = await client.query(
        'SELECT image_url FROM product_images WHERE product_id = $1',
        [id]
      );

      // Удаляем продукт (каскадно удалятся и фотографии из БД)
      const { rows } = await client.query(
        'DELETE FROM products WHERE id = $1 RETURNING *',
        [id]
      );

      if (rows.length === 0) {
        return res.status(404).json({ error: 'Продукт не найден' });
      }

      // Удаляем файлы фотографий с диска
      for (const image of images) {
        const filePath = path.join(__dirname, '..', image.image_url);
        await fs.unlink(filePath).catch(console.error);
      }
    });

    res.status(204).send();
  } catch (error) {
    console.error('Ошибка при удалении продукта:', error);
    res.status(500).json({ error: error.message });
  }
});

// Установка основной фотографии продукта
app.post('/api/products/:productId/images/:imageId/primary', async (req, res) => {
  try {
    await withTransaction(async (client) => {
      const { productId, imageId } = req.params;

      // Снимаем отметку основной фотографии со всех фотографий продукта
      await client.query(
        'UPDATE product_images SET is_primary = false WHERE product_id = $1',
        [productId]
      );

      // Устанавливаем новую основную фотографию
      const { rows } = await client.query(
        'UPDATE product_images SET is_primary = true WHERE id = $1 AND product_id = $2 RETURNING *',
        [imageId, productId]
      );

      if (rows.length === 0) {
        throw new Error('Фотография не найдена');
      }

      res.json(rows[0]);
    });
  } catch (error) {
    console.error('Ошибка при установке основной фотографии:', error);
    res.status(500).json({ error: error.message });
  }
});

// Функция повторного подключения к БД
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

// Handle graceful shutdown
process.on("SIGINT", async () => {
  try {
    await pool.end();
    console.log("Database pool has ended");
    process.exit(0);
  } catch (err) {
    console.error("Error during shutdown:", err);
    process.exit(1);
  }
});

// Start the server
startServer();
