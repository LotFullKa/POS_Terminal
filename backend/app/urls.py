from django.urls import path, re_path
from . import views, api_views
from .main import serve_frontend

urlpatterns = [
    path("api/health", views.health, name="health"),
    path("api/end-day", views.end_day, name="end_day"),
    path("api/auth/login", api_views.login, name="login"),
    path("api/auth/me", api_views.me, name="me"),
    path("api/categories", api_views.get_categories, name="get_categories"),
    path("api/categories/create", api_views.create_category, name="create_category"),
    path(
        "api/categories/<int:category_id>",
        api_views.update_category,
        name="update_category",
    ),
    path(
        "api/categories/<int:category_id>/delete",
        api_views.delete_category,
        name="delete_category",
    ),
    path("api/products", api_views.get_products, name="get_products"),
    path("api/products/create", api_views.create_product, name="create_product"),
    path(
        "api/products/<int:product_id>", api_views.update_product, name="update_product"
    ),
    path(
        "api/products/<int:product_id>/delete",
        api_views.delete_product,
        name="delete_product",
    ),
    re_path(r"^(?P<path>.*)$", serve_frontend, name="frontend"),
]
