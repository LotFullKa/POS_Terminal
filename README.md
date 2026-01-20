# CashMachine

POS-терминал для кофейни МФТИ 6ка

## Что это

Касса с интерфейсом в браузере. Работает локально, данные хранятся в SQLite.

Основное:
- Заказы с оплатой и комментариями
- Редактируемое меню с категориями
- Закрытие дня с сохранением в БД
- Аналитика продаж

## Запуск

Скачайте готовый билд из релизов и запустите:

**macOS/Linux:**
```bash
./CashMachine
```

**Windows:**
```
CashMachine.exe
```

Откроется браузер на `http://localhost:8000`

## Сборка из исходников

Нужны Python 3.10+ и Node.js 18+

```bash
# Установить зависимости
pip install -r requirements-build.txt
cd frontend && npm install && cd ..

# Собрать
./build.sh          # macOS/Linux
build.bat           # Windows
```

Результат в `dist/CashMachine`

## Docker (для VPS)

### Быстрый старт

```bash
docker-compose -f docker-compose.simple.yml up -d
```

Приложение будет доступно на порту 80.

### С nginx и SSL

1. Положите SSL сертификаты в `ssl/cert.pem` и `ssl/key.pem`
2. Раскомментируйте SSL настройки в `nginx.conf`
3. Запустите:

```bash
docker-compose up -d
```

### Управление

```bash
# Логи
docker-compose logs -f

# Остановка
docker-compose down

# Пересборка
docker-compose up -d --build
```

## Разработка

Быстрый запуск для тестов:

```bash
cd frontend
npm run build
cd ..
cp -r frontend/dist backend/app/dist
python backend/launcher.py
```

## База данных

SQLite создаётся автоматически:
- **macOS**: `~/Library/Application Support/MyPOS/pos.sqlite`
- **Linux**: `~/.local/share/MyPOS/pos.sqlite`
- **Windows**: `%LOCALAPPDATA%\MyPOS\pos.sqlite`

## Стек

Frontend: React + TypeScript + MUI + Zustand
Backend: Django + SQLite
Сборка: PyInstaller + Vite

## Лицензия

MIT
