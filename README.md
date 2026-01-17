# POS Terminal
for MIPT 6ka Coffee

Система кассового терминала для кофейни с поддержкой:
- Управления заказами и продуктами
- Редактируемого меню с категориями
- Отслеживания оплаты
- Сохранения данных в локальную БД
- Экспорта отчётов в Google Sheets

## 🚀 Быстрый старт (для разработки)

### Требования
- Python 3.10+
- Node.js 18+
- npm или yarn

### Установка

1. Клонируйте репозиторий:
```bash
git clone <repository-url>
cd CashMachine
```

2. Установите Python зависимости:
```bash
pip install -r requirements-build.txt
```

3. Установите Node.js зависимости:
```bash
cd frontend
npm install
cd ..
```

### Запуск в режиме разработки

1. Соберите фронтенд:
```bash
cd frontend
npm run build
cd ..
```

2. Скопируйте dist в backend:
```bash
cp -r frontend/dist backend/app/dist
```

3. Запустите приложение:
```bash
python backend/launcher.py
```

Приложение откроется в браузере по адресу http://localhost:8000

## 📦 Сборка релиза

### Подготовка

1. Убедитесь, что установлены все зависимости:
```bash
pip install -r requirements-build.txt
cd frontend && npm install && cd ..
```

### Сборка

#### Linux/macOS:
```bash
chmod +x build.sh
./build.sh
```

#### Windows:
```bash
build.bat
```

### Результат

После успешной сборки исполняемый файл будет находиться в:
- **Linux/macOS**: `dist/CashMachine`
- **Windows**: `dist/CashMachine.exe`

Просто запустите файл - приложение автоматически откроется в браузере.

## ⚙️ Настройка Google Sheets (опционально)

Для экспорта дневных отчётов в Google Sheets:

1. Следуйте инструкциям в [`backend/SETUP_GOOGLE_SHEETS.md`](backend/SETUP_GOOGLE_SHEETS.md)
2. Отредактируйте [`backend/app/config.py`](backend/app/config.py)
3. Пересоберите приложение

## 📊 Функциональность

### Управление заказами
- Создание и редактирование заказов
- Добавление позиций из меню
- Отслеживание статуса оплаты
- Комментарии к заказам

### Управление меню
- Создание/редактирование/удаление продуктов
- Настройка цен
- Создание категорий
- Переключение между категориями

### Закрытие дня
- Сохранение всех заказов в локальную БД
- Экспорт сводки в Google Sheets
- Подсчёт выручки и статистики

## 🗄️ База данных

Локальная SQLite база данных создаётся автоматически в:
- **Windows**: `%LOCALAPPDATA%\MyPOS\pos.sqlite`
- **macOS**: `~/Library/Application Support/MyPOS/pos.sqlite`
- **Linux**: `~/.local/share/MyPOS/pos.sqlite`

## 🛠️ Технологии

### Frontend
- React 18
- TypeScript
- Material-UI (MUI)
- Zustand (state management)
- Vite

### Backend
- FastAPI
- SQLAlchemy
- SQLite
- Uvicorn
- Google Sheets API

### Сборка
- PyInstaller
- Vite build

## 📝 Лицензия

MIT

## 🤝 Разработка

Для внесения изменений:

1. Создайте ветку: `git checkout -b feature/my-feature`
2. Внесите изменения
3. Соберите и протестируйте: `./build.sh`
4. Создайте Pull Request

## 🐛 Troubleshooting

### Приложение не запускается
- Проверьте, что порт 8000 свободен
- Убедитесь, что все зависимости установлены

### Ошибка при сборке
- Убедитесь, что установлен PyInstaller: `pip install pyinstaller`
- Проверьте версию Python (требуется 3.10+)

### Google Sheets не работает
- Проверьте настройки в `backend/app/config.py`
- Убедитесь, что Service Account имеет доступ к таблице
- См. подробности в `backend/SETUP_GOOGLE_SHEETS.md`
