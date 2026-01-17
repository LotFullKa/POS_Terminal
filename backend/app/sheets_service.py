"""Сервис для работы с Google Sheets"""

from datetime import datetime
from typing import Optional
import json

try:
    from google.oauth2 import service_account
    from googleapiclient.discovery import build

    GOOGLE_AVAILABLE = True
except ImportError:
    GOOGLE_AVAILABLE = False

from .config import GOOGLE_CREDENTIALS_JSON, GOOGLE_SHEET_ID, GOOGLE_SHEET_NAME


class GoogleSheetsService:
    """Сервис для записи данных в Google Sheets"""

    def __init__(self):
        self.sheet_id = GOOGLE_SHEET_ID
        self.sheet_name = GOOGLE_SHEET_NAME
        self.service = None

        if not GOOGLE_AVAILABLE:
            print(
                "⚠️  Google API библиотеки не установлены. Установите: pip install google-auth google-auth-oauthlib google-auth-httplib2 google-api-python-client"
            )
            return

        if GOOGLE_SHEET_ID == "YOUR_SHEET_ID_HERE":
            print("⚠️  Google Sheets не настроен. Отредактируйте backend/app/config.py")
            return

        try:
            credentials = service_account.Credentials.from_service_account_info(
                GOOGLE_CREDENTIALS_JSON,
                scopes=["https://www.googleapis.com/auth/spreadsheets"],
            )
            self.service = build("sheets", "v4", credentials=credentials)
            print("✅ Google Sheets API подключен")
        except Exception as e:
            print(f"❌ Ошибка подключения к Google Sheets: {e}")

    def append_daily_report(
        self,
        date: str,
        total_revenue: float,
        total_orders: int,
        paid_orders: int,
        unpaid_orders: int,
    ) -> bool:
        """
        Добавляет строку с дневным отчётом в таблицу

        Args:
            date: Дата в формате YYYY-MM-DD
            total_revenue: Общая выручка за день
            total_orders: Количество заказов
            paid_orders: Количество оплаченных заказов
            unpaid_orders: Количество неоплаченных заказов

        Returns:
            True если успешно, False если ошибка
        """
        if not self.service:
            print("⚠️  Google Sheets не настроен, пропускаем запись")
            return False

        try:
            # Проверяем существование листа, если нет - создаём
            self._ensure_sheet_exists()

            # Данные для записи
            timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            values = [
                [
                    date,
                    timestamp,
                    total_revenue,
                    total_orders,
                    paid_orders,
                    unpaid_orders,
                ]
            ]

            body = {"values": values}

            # Добавляем строку в конец таблицы
            result = (
                self.service.spreadsheets()
                .values()
                .append(
                    spreadsheetId=self.sheet_id,
                    range=f"{self.sheet_name}!A:F",
                    valueInputOption="RAW",
                    body=body,
                )
                .execute()
            )

            print(
                f"✅ Данные записаны в Google Sheets: {result.get('updates', {}).get('updatedCells', 0)} ячеек"
            )
            return True

        except Exception as e:
            print(f"❌ Ошибка записи в Google Sheets: {e}")
            return False

    def _ensure_sheet_exists(self):
        """Проверяет существование листа и создаёт его при необходимости"""
        try:
            # Получаем информацию о таблице
            spreadsheet = (
                self.service.spreadsheets().get(spreadsheetId=self.sheet_id).execute()
            )

            # Проверяем наличие нужного листа
            sheets = spreadsheet.get("sheets", [])
            sheet_exists = any(
                sheet["properties"]["title"] == self.sheet_name for sheet in sheets
            )

            if not sheet_exists:
                # Создаём новый лист
                requests = [{"addSheet": {"properties": {"title": self.sheet_name}}}]

                self.service.spreadsheets().batchUpdate(
                    spreadsheetId=self.sheet_id, body={"requests": requests}
                ).execute()

                # Добавляем заголовки
                headers = [
                    [
                        "Дата",
                        "Время закрытия",
                        "Выручка (₽)",
                        "Всего заказов",
                        "Оплачено",
                        "Не оплачено",
                    ]
                ]

                self.service.spreadsheets().values().update(
                    spreadsheetId=self.sheet_id,
                    range=f"{self.sheet_name}!A1:F1",
                    valueInputOption="RAW",
                    body={"values": headers},
                ).execute()

                print(f"✅ Создан новый лист '{self.sheet_name}' с заголовками")

        except Exception as e:
            print(f"⚠️  Ошибка при проверке/создании листа: {e}")


# Singleton instance
_sheets_service: Optional[GoogleSheetsService] = None


def get_sheets_service() -> GoogleSheetsService:
    """Получить экземпляр сервиса Google Sheets"""
    global _sheets_service
    if _sheets_service is None:
        _sheets_service = GoogleSheetsService()
    return _sheets_service
