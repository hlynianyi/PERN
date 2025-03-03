# backend/Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application code
COPY . .

# Create necessary upload directories
RUN mkdir -p uploads/images uploads/certificates uploads/homepage uploads/company

# Ensure upload directories are writable
RUN chmod -R 777 uploads

# Expose the application port
EXPOSE 5002

# Command to run the application - will use the NODE_ENV to determine which env file to load
CMD ["npm", "start"]