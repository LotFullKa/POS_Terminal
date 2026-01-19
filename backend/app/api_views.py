import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from .models import User, Category, Product
from .auth import create_access_token, login_required, admin_required, get_current_user


@csrf_exempt
@require_http_methods(["POST"])
def login(request):
    try:
        data = json.loads(request.body)
        username = data.get("username")
        password = data.get("password")

        if not username or not password:
            return JsonResponse(
                {"error": "Требуется имя пользователя и пароль"}, status=400
            )

        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            return JsonResponse(
                {"error": "Неверное имя пользователя или пароль"}, status=401
            )

        if not user.check_password(password):
            return JsonResponse(
                {"error": "Неверное имя пользователя или пароль"}, status=401
            )

        token = create_access_token(user.id, user.username, user.role)

        return JsonResponse(
            {
                "token": token,
                "user": {"id": user.id, "username": user.username, "role": user.role},
            }
        )
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


@require_http_methods(["GET"])
@login_required
def me(request):
    user = request.user
    return JsonResponse({"id": user.id, "username": user.username, "role": user.role})


@require_http_methods(["GET"])
@login_required
def get_categories(request):
    categories = Category.objects.all()
    return JsonResponse(
        {
            "categories": [
                {"id": cat.id, "name": cat.name, "slug": cat.slug, "order": cat.order}
                for cat in categories
            ]
        }
    )


@csrf_exempt
@require_http_methods(["POST"])
@admin_required
def create_category(request):
    try:
        data = json.loads(request.body)
        name = data.get("name")
        slug = data.get("slug")

        if not name or not slug:
            return JsonResponse({"error": "Требуется название и slug"}, status=400)

        category = Category.objects.create(
            name=name, slug=slug, order=data.get("order", 0)
        )

        return JsonResponse(
            {
                "id": category.id,
                "name": category.name,
                "slug": category.slug,
                "order": category.order,
            }
        )
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


@csrf_exempt
@require_http_methods(["PUT"])
@admin_required
def update_category(request, category_id):
    try:
        category = Category.objects.get(id=category_id)
        data = json.loads(request.body)

        if "name" in data:
            category.name = data["name"]
        if "slug" in data:
            category.slug = data["slug"]
        if "order" in data:
            category.order = data["order"]

        category.save()

        return JsonResponse(
            {
                "id": category.id,
                "name": category.name,
                "slug": category.slug,
                "order": category.order,
            }
        )
    except Category.DoesNotExist:
        return JsonResponse({"error": "Категория не найдена"}, status=404)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


@csrf_exempt
@require_http_methods(["DELETE"])
@admin_required
def delete_category(request, category_id):
    try:
        category = Category.objects.get(id=category_id)
        category.delete()
        return JsonResponse({"success": True})
    except Category.DoesNotExist:
        return JsonResponse({"error": "Категория не найдена"}, status=404)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


@require_http_methods(["GET"])
@login_required
def get_products(request):
    category_id = request.GET.get("category_id")

    if category_id:
        products = Product.objects.filter(category_id=category_id, is_active=True)
    else:
        products = Product.objects.filter(is_active=True)

    return JsonResponse(
        {
            "products": [
                {
                    "id": prod.id,
                    "name": prod.name,
                    "price": prod.price,
                    "category_id": prod.category_id,
                    "is_active": prod.is_active,
                }
                for prod in products
            ]
        }
    )


@csrf_exempt
@require_http_methods(["POST"])
@admin_required
def create_product(request):
    try:
        data = json.loads(request.body)
        name = data.get("name")
        price = data.get("price")
        category_id = data.get("category_id")

        if not name or price is None or not category_id:
            return JsonResponse(
                {"error": "Требуется название, цена и категория"}, status=400
            )

        product = Product.objects.create(
            name=name,
            price=float(price),
            category_id=category_id,
            is_active=data.get("is_active", True),
        )

        return JsonResponse(
            {
                "id": product.id,
                "name": product.name,
                "price": product.price,
                "category_id": product.category_id,
                "is_active": product.is_active,
            }
        )
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


@csrf_exempt
@require_http_methods(["PUT"])
@admin_required
def update_product(request, product_id):
    try:
        product = Product.objects.get(id=product_id)
        data = json.loads(request.body)

        if "name" in data:
            product.name = data["name"]
        if "price" in data:
            product.price = float(data["price"])
        if "category_id" in data:
            product.category_id = data["category_id"]
        if "is_active" in data:
            product.is_active = data["is_active"]

        product.save()

        return JsonResponse(
            {
                "id": product.id,
                "name": product.name,
                "price": product.price,
                "category_id": product.category_id,
                "is_active": product.is_active,
            }
        )
    except Product.DoesNotExist:
        return JsonResponse({"error": "Продукт не найден"}, status=404)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


@csrf_exempt
@require_http_methods(["DELETE"])
@admin_required
def delete_product(request, product_id):
    try:
        product = Product.objects.get(id=product_id)
        product.delete()
        return JsonResponse({"success": True})
    except Product.DoesNotExist:
        return JsonResponse({"error": "Продукт не найден"}, status=404)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
