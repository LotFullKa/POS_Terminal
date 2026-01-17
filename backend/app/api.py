from datetime import datetime
from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from .db import get_db
from .models import DailySummary, Order, OrderLine
from .sheets_service import get_sheets_service

router = APIRouter()


class OrderLineData(BaseModel):
    productId: str
    name: str
    price: float
    qty: int


class OrderData(BaseModel):
    id: str
    name: str
    comment: str
    status: str
    isPaid: bool
    createdAt: int
    lines: Dict[str, OrderLineData]


class EndDayRequest(BaseModel):
    orders: List[OrderData]


class EndDayResponse(BaseModel):
    success: bool
    date: str
    total_revenue: float
    total_orders: int
    paid_orders: int
    unpaid_orders: int
    saved_to_db: bool
    saved_to_sheets: bool
    message: str


@router.get("/health")
def health():
    return {"ok": True}


@router.post("/end-day", response_model=EndDayResponse)
def end_day(request: EndDayRequest, db: Session = Depends(get_db)):
    """
    Закрывает день: сохраняет все заказы в БД и отправляет сводку в Google Sheets
    """
    try:
        today = datetime.now().strftime("%Y-%m-%d")

        # Проверяем, не закрыт ли уже день
        existing = db.query(DailySummary).filter(DailySummary.date == today).first()
        if existing:
            raise HTTPException(
                status_code=400,
                detail=f"День {today} уже закрыт. Удалите запись из БД если хотите закрыть заново.",
            )

        # Подсчитываем статистику
        total_revenue = 0.0
        paid_orders = 0
        unpaid_orders = 0

        for order_data in request.orders:
            order_total = sum(
                line.price * line.qty for line in order_data.lines.values()
            )
            total_revenue += order_total

            if order_data.isPaid:
                paid_orders += 1
            else:
                unpaid_orders += 1

        total_orders = len(request.orders)

        # Создаём запись дневной сводки
        daily_summary = DailySummary(
            date=today, total_revenue=total_revenue, total_orders=total_orders
        )
        db.add(daily_summary)
        db.flush()  # Получаем ID

        # Сохраняем заказы
        for order_data in request.orders:
            order_total = sum(
                line.price * line.qty for line in order_data.lines.values()
            )

            order = Order(
                order_id=order_data.id,
                name=order_data.name,
                comment=order_data.comment,
                status=order_data.status,
                total=order_total,
                is_paid=1 if order_data.isPaid else 0,
                created_at=datetime.fromtimestamp(order_data.createdAt / 1000),
                daily_summary_id=daily_summary.id,
            )
            db.add(order)
            db.flush()

            # Сохраняем позиции заказа
            for line_data in order_data.lines.values():
                line = OrderLine(
                    order_id=order.id,
                    product_id=line_data.productId,
                    name=line_data.name,
                    price=line_data.price,
                    qty=line_data.qty,
                )
                db.add(line)

        db.commit()
        saved_to_db = True

        # Отправляем в Google Sheets
        sheets_service = get_sheets_service()
        saved_to_sheets = sheets_service.append_daily_report(
            date=today,
            total_revenue=total_revenue,
            total_orders=total_orders,
            paid_orders=paid_orders,
            unpaid_orders=unpaid_orders,
        )

        return EndDayResponse(
            success=True,
            date=today,
            total_revenue=total_revenue,
            total_orders=total_orders,
            paid_orders=paid_orders,
            unpaid_orders=unpaid_orders,
            saved_to_db=saved_to_db,
            saved_to_sheets=saved_to_sheets,
            message=f"День {today} успешно закрыт. Выручка: {total_revenue:.2f} ₽",
        )

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500, detail=f"Ошибка при закрытии дня: {str(e)}"
        )
