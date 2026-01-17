FROM python:3.10-slim

WORKDIR /app

# Установка Node.js для сборки фронтенда
RUN apt-get update && \
    apt-get install -y curl && \
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Копирование requirements и установка Python зависимостей
COPY requirements-build.txt .
RUN pip install --no-cache-dir -r requirements-build.txt

# Копирование и сборка фронтенда
COPY frontend/package*.json frontend/
WORKDIR /app/frontend
RUN npm ci
COPY frontend/ .
RUN npm run build

# Копирование backend
WORKDIR /app
COPY backend/ backend/

# Копирование собранного фронтенда в backend
RUN cp -r frontend/dist backend/app/dist

# Создание директории для БД
RUN mkdir -p /data

# Порт приложения
EXPOSE 8080

# Запуск приложения
CMD ["python", "backend/launcher.py"]
