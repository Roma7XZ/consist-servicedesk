# Используем легковесный образ Node.js
FROM node:20-alpine

# Указываем рабочую директорию внутри контейнера
WORKDIR /app

# Копируем файлы зависимостей
COPY package*.json ./
COPY prisma ./prisma/

# Устанавливаем зависимости и генерируем клиент Prisma
RUN npm install
RUN npx prisma generate

# Копируем остальной исходный код
COPY . .

# Открываем порт бэкенда
EXPOSE 3000

# Команда для запуска сервера
CMD ["node", "index.js"]