// src/utils/fileHelpers.js
const fs = require('fs').promises;
const path = require('path');

const deleteFile = async (filePath) => {
  try {
    if (!filePath) return;
    
    // Удаляем начальный слеш, если он есть
    const normalizedPath = filePath.startsWith('/') ? filePath.slice(1) : filePath;
    
    // Получаем абсолютный путь к файлу относительно корня проекта
    const absolutePath = path.join(__dirname, '../../', normalizedPath);
    
    // Проверяем существование файла перед удалением
    await fs.access(absolutePath);
    await fs.unlink(absolutePath);
    console.log(`File deleted successfully: ${absolutePath}`);
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.log(`File does not exist: ${filePath}`);
      return;
    }
    console.error('Error deleting file:', error);
    throw error;
  }
};

module.exports = {
  deleteFile
};