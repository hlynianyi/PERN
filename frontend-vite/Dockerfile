# Frontend Dockerfile
FROM node:18-alpine

WORKDIR /app

# Устанавливаем pnpm глобально
RUN npm install -g pnpm

# Копируем только файлы для установки зависимостей
COPY package.json ./

# Очистка node_modules перед установкой
RUN rm -rf node_modules

# Устанавливаем зависимости
RUN pnpm install

# Копируем остальные файлы проекта
COPY . .

EXPOSE 3002

# Используем dev сервер Vite
CMD ["pnpm", "run", "dev", "--host"]