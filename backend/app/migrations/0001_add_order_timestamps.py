from django.db import migrations


def add_columns_if_not_exist(apps, schema_editor):
    """Добавляет колонки queued_at и handoff_at, если их еще нет"""
    from django.db import connection

    with connection.cursor() as cursor:
        # Проверяем существующие колонки
        cursor.execute("PRAGMA table_info(orders)")
        columns = [row[1] for row in cursor.fetchall()]

        # Добавляем queued_at если её нет
        if "queued_at" not in columns:
            cursor.execute("ALTER TABLE orders ADD COLUMN queued_at DATETIME NULL")
            print("✅ Добавлена колонка queued_at")
        else:
            print("ℹ️  Колонка queued_at уже существует")

        # Добавляем handoff_at если её нет
        if "handoff_at" not in columns:
            cursor.execute("ALTER TABLE orders ADD COLUMN handoff_at DATETIME NULL")
            print("✅ Добавлена колонка handoff_at")
        else:
            print("ℹ️  Колонка handoff_at уже существует")


class Migration(migrations.Migration):

    dependencies = []

    operations = [
        migrations.RunPython(add_columns_if_not_exist, migrations.RunPython.noop),
    ]
