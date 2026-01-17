# Настройка интеграции с Google Sheets

## Шаг 1: Создание проекта в Google Cloud Console

1. Перейдите на [Google Cloud Console](https://console.cloud.google.com/)
2. Создайте новый проект или выберите существующий
3. Запомните название проекта

## Шаг 2: Включение Google Sheets API

1. В меню слева выберите "APIs & Services" > "Library"
2. Найдите "Google Sheets API"
3. Нажмите "Enable"

## Шаг 3: Создание Service Account

1. Перейдите в "APIs & Services" > "Credentials"
2. Нажмите "Create Credentials" > "Service Account"
3. Заполните форму:
   - Service account name: `pos-system` (или любое другое имя)
   - Service account ID: будет создан автоматически
   - Нажмите "Create and Continue"
4. Пропустите опциональные шаги (Grant access, Grant users access)
5. Нажмите "Done"

## Шаг 4: Создание ключа для Service Account

1. В списке Service Accounts найдите созданный аккаунт
2. Нажмите на него
3. Перейдите на вкладку "Keys"
4. Нажмите "Add Key" > "Create new key"
5. Выберите формат "JSON"
6. Нажмите "Create"
7. Файл с ключом будет скачан на ваш компьютер

## Шаг 5: Создание Google Таблицы

1. Перейдите на [Google Sheets](https://sheets.google.com/)
2. Создайте новую таблицу
3. Скопируйте ID таблицы из URL:
   ```
   https://docs.google.com/spreadsheets/d/[ВОТ_ЭТОТ_ID]/edit
   ```
4. Откройте скачанный JSON файл и найдите поле `client_email`
5. В Google Таблице нажмите "Share" (Поделиться)
6. Вставьте email из `client_email` и дайте права "Editor" (Редактор)
7. Нажмите "Send" (Отправить)

## Шаг 6: Настройка приложения

1. Откройте файл `backend/app/config.py`
2. Замените `GOOGLE_SHEET_ID` на ID вашей таблицы
3. Откройте скачанный JSON файл с ключом
4. Скопируйте всё содержимое JSON файла
5. Вставьте его в переменную `GOOGLE_CREDENTIALS_JSON` в `config.py`

Пример:
```python
GOOGLE_SHEET_ID = "1AbC2DeF3GhI4JkL5MnO6PqR7StU8VwX9YzA"

GOOGLE_CREDENTIALS_JSON = {
    "type": "service_account",
    "project_id": "your-project-123456",
    "private_key_id": "abc123def456...",
    "private_key": "-----BEGIN PRIVATE KEY-----\nMIIE...\n-----END PRIVATE KEY-----\n",
    "client_email": "pos-system@your-project-123456.iam.gserviceaccount.com",
    # ... остальные поля из JSON
}
```

## Шаг 7: Установка зависимостей

Установите необходимые Python библиотеки:

```bash
pip install google-auth google-auth-oauthlib google-auth-httplib2 google-api-python-client
```

## Шаг 8: Проверка

1. Запустите приложение
2. Создайте несколько тестовых заказов
3. Нажмите кнопку "Закончить день"
4. Проверьте, что данные появились в Google Таблице

## Структура данных в таблице

Таблица будет содержать следующие колонки:
- **Дата** - дата закрытия дня (YYYY-MM-DD)
- **Время закрытия** - точное время закрытия (YYYY-MM-DD HH:MM:SS)
- **Выручка (₽)** - общая выручка за день
- **Всего заказов** - количество заказов
- **Оплачено** - количество оплаченных заказов
- **Не оплачено** - количество неоплаченных заказов

## Безопасность

⚠️ **ВАЖНО**: Файл `config.py` содержит конфиденциальные данные!

- Не публикуйте его в публичных репозиториях
- Добавьте `config.py` в `.gitignore`
- Храните резервную копию JSON ключа в безопасном месте

## Troubleshooting

### Ошибка "Permission denied"
- Убедитесь, что вы предоставили доступ Service Account email к таблице
- Проверьте, что права установлены как "Editor"

### Ошибка "Invalid credentials"
- Проверьте, что JSON в `config.py` скопирован полностью
- Убедитесь, что не потеряны кавычки или запятые

### Данные не появляются в таблице
- Проверьте консоль приложения на наличие ошибок
- Убедитесь, что Google Sheets API включен в проекте
- Проверьте правильность GOOGLE_SHEET_ID
