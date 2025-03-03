# frontend-vite/Dockerfile
FROM node:18-alpine

WORKDIR /app

# Install dependencies properly - choose ONE approach:
# Option 1: Using npm (simpler and matches your package.json setup)
COPY package*.json ./
RUN npm install

# Option 2: If you prefer pnpm (but need to ensure pnpm-lock.yaml exists)
# RUN npm install -g pnpm
# COPY package.json pnpm-lock.yaml* ./
# RUN pnpm install --frozen-lockfile

# Copy the rest of the application code
COPY . .

# Expose the application port
EXPOSE 3002

# Command to run the application - explicitly specify host and port
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "3002"]

# If using pnpm, the command would be:
# CMD ["pnpm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "3002"]