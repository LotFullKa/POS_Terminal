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

## Распространение

### Что включить в релиз:

1. **Исполняемый файл** (`CashMachine` или `CashMachine.exe`)
2. **Инструкция для пользователей** (создайте на основе README.md)
3. **(Опционально)** Инструкция по настройке Google Sheets

### Что НЕ включать:

- Исходный код (если не open source)
- Файл `backend/app/config.py` с вашими credentials
- Папки `build/`, `__pycache__/`, `node_modules/`

## Тестирование релиза

Перед распространением протестируйте:

1. **Запуск приложения**:
   ```bash
   ./dist/CashMachine  # Linux/macOS
   dist\CashMachine.exe  # Windows
   ```

2. **Проверьте функциональность**:
   - Создание заказов
   - Добавление продуктов
   - Редактирование меню
   - Закрытие дня
   - Сохранение в БД
   - (Если настроено) Экспорт в Google Sheets

3. **Проверьте на чистой системе**:
   - Скопируйте exe на другой компьютер без Python/Node.js
   - Убедитесь, что приложение запускается

## Размер релиза

Ожидаемый размер исполняемого файла:
- **Windows**: ~50-70 MB
- **Linux**: ~40-60 MB
- **macOS**: ~40-60 MB

## Troubleshooting

### Ошибка "Module not found" при сборке

Убедитесь, что установлены все зависимости:
```bash
pip install -r requirements-build.txt
```

### Ошибка при сборке фронтенда

Проверьте версию Node.js:
```bash
node --version  # Должна быть 18+
```

### Большой размер exe файла

Это нормально для PyInstaller. Можно уменьшить:
- Используйте `upx=True` в build.spec (уже включено)
- Исключите ненужные библиотеки в `excludes`

### Антивирус блокирует exe

PyInstaller файлы иногда помечаются как подозрительные:
- Добавьте в исключения антивируса
- Подпишите exe цифровой подписью (для Windows)

## Автоматизация

Для CI/CD можно использовать GitHub Actions:

```yaml
name: Build Release

on:
  push:
    tags:
      - 'v*'

jobs:
  build:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [ubuntu-latest, windows-latest, macos-latest]

    steps:
    - uses: actions/checkout@v2

    - name: Set up Python
      uses: actions/setup-python@v2
      with:
        python-version: '3.10'

    - name: Set up Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'

    - name: Build
      run: |
        pip install -r requirements-build.txt
        chmod +x build.sh
        ./build.sh

    - name: Upload artifact
      uses: actions/upload-artifact@v2
      with:
        name: CashMachine-${{ matrix.os }}
        path: dist/
```

## Версионирование

Рекомендуется использовать семантическое версионирование:
- **MAJOR.MINOR.PATCH** (например, 1.0.0)
- Обновляйте версию в коде перед сборкой

## Changelog

Ведите CHANGELOG.md для отслеживания изменений между версиями.
