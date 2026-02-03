from datetime import datetime
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
import json

from .models import DailySummary, Order, OrderLine


@require_http_methods(["GET"])
def health(request):
    return JsonResponse({"ok": True})


@csrf_exempt
@require_http_methods(["POST"])
def end_day(request):
    try:
        # Парсим JSON из тела запроса
        data = json.loads(request.body)
        orders_data = data.get("orders", [])

        today = datetime.now().strftime("%Y-%m-%d")

        # Получаем или создаём дневную сводку
        daily_summary, created = DailySummary.objects.get_or_create(
            date=today, defaults={"total_revenue": 0.0, "total_orders": 0}
        )

        # Получаем список уже сохранённых order_id для этого дня
        existing_order_ids = set(
            Order.objects.filter(daily_summary=daily_summary).values_list(
                "order_id", flat=True
            )
        )

        # Фильтруем только новые заказы
        new_orders_data = [
            order_data
            for order_data in orders_data
            if order_data["id"] not in existing_order_ids
        ]

        if not new_orders_data:
            return JsonResponse(
                {
                    "success": True,
                    "date": today,
                    "total_revenue": daily_summary.total_revenue,
                    "total_orders": daily_summary.total_orders,
                    "paid_orders": 0,
                    "unpaid_orders": 0,
                    "new_orders_count": 0,
                    "message": f"Все заказы за {today} уже сохранены. Новых заказов нет.",
                }
            )

        # Подсчитываем статистику только для новых заказов
        new_revenue = 0.0
        paid_orders = 0
        unpaid_orders = 0

        for order_data in new_orders_data:
            lines = order_data.get("lines", {})
            order_total = sum(line["price"] * line["qty"] for line in lines.values())
            new_revenue += order_total

            if order_data.get("isPaid", False):
                paid_orders += 1
            else:
                unpaid_orders += 1

        # Сохраняем новые заказы
        for order_data in new_orders_data:
            lines = order_data.get("lines", {})
            order_total = sum(line["price"] * line["qty"] for line in lines.values())

            # Преобразуем timestamps в datetime
            queued_at = None
            if order_data.get("queuedAt"):
                queued_at = datetime.fromtimestamp(order_data["queuedAt"] / 1000)

            handoff_at = None
            if order_data.get("handoffAt"):
                handoff_at = datetime.fromtimestamp(order_data["handoffAt"] / 1000)

            order = Order.objects.create(
                order_id=order_data["id"],
                name=order_data["name"],
                comment=order_data.get("comment", ""),
                status=order_data["status"],
                total=order_total,
                is_paid=order_data.get("isPaid", False),
                created_at=datetime.fromtimestamp(order_data["createdAt"] / 1000),
                queued_at=queued_at,
                handoff_at=handoff_at,
                daily_summary=daily_summary,
            )

            # Сохраняем позиции заказа
            for line_data in lines.values():
                OrderLine.objects.create(
                    order=order,
                    product_id=line_data["productId"],
                    name=line_data["name"],
                    price=line_data["price"],
                    qty=line_data["qty"],
                )

        # Обновляем дневную сводку
        all_orders = Order.objects.filter(daily_summary=daily_summary)
        daily_summary.total_revenue = sum(o.total for o in all_orders if o.is_paid)
        daily_summary.total_orders = all_orders.count()
        daily_summary.save()

        message = f"День {today} успешно закрыт."
        if created:
            message += f" Сохранено {len(new_orders_data)} заказов. Выручка: {daily_summary.total_revenue:.2f} ₽"
        else:
            message += f" Добавлено {len(new_orders_data)} новых заказов. Общая выручка: {daily_summary.total_revenue:.2f} ₽"

        return JsonResponse(
            {
                "success": True,
                "date": today,
                "total_revenue": daily_summary.total_revenue,
                "total_orders": daily_summary.total_orders,
                "paid_orders": paid_orders,
                "unpaid_orders": unpaid_orders,
                "new_orders_count": len(new_orders_data),
                "message": message,
            }
        )

    except Exception as e:
        import traceback

        traceback.print_exc()
        return JsonResponse(
            {"success": False, "message": f"Ошибка при закрытии дня: {str(e)}"},
            status=500,
        )
