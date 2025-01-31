// src/utils/fileHelpers.js
const fs = require('fs').promises;
const path = require('path');

const deleteFile = async (filePath) => {
  try {
    await fs.unlink(path.join(__dirname, '../../', filePath));
  } catch (error) {
    console.error('Error deleting file:', error);
  }
};

module.exports = {
  deleteFile
};