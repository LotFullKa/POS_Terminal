from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = []

    operations = [
        migrations.AddField(
            model_name="category",
            name="is_addon",
            field=models.BooleanField(default=False),
        ),
    ]
