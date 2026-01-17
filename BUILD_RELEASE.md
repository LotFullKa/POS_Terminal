# Инструкция по сборке релиза

## Подготовка окружения

### 1. Установите зависимости

#### Python зависимости:
```bash
pip install -r requirements-build.txt
```

#### Node.js зависимости:
```bash
cd frontend
npm install
cd ..
```

### 2. (Опционально) Настройте Google Sheets

Если хотите включить интеграцию с Google Sheets:
1. Следуйте инструкциям в `backend/SETUP_GOOGLE_SHEETS.md`
2. Отредактируйте `backend/app/config.py`

## Сборка

### Linux/macOS:

```bash
chmod +x build.sh
./build.sh
```

### Windows:

```bash
build.bat
```

## Результат

После успешной сборки:
- Исполняемый файл будет в папке `dist/`
- **Linux/macOS**: `dist/CashMachine`
- **Windows**: `dist/CashMachine.exe`
