from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("attendance", "0010_leave"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.AlterModelOptions(
            name="leave",
            options={"ordering": ["-applied_at", "-date"]},
        ),
        migrations.AddField(
            model_name="leave",
            name="review_remarks",
            field=models.CharField(blank=True, max_length=255, null=True),
        ),
        migrations.AddField(
            model_name="leave",
            name="reviewed_by",
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
        migrations.AlterField(
            model_name="leave",
            name="status",
            field=models.CharField(default="Pending", max_length=20),
        ),
        migrations.CreateModel(
            name="UserProfile",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                (
                    "role",
                    models.CharField(
                        choices=[
                            ("admin", "Admin"),
                            ("teacher", "Teacher"),
                            ("student", "Student"),
                        ],
                        default="student",
                        max_length=20,
                    ),
                ),
                (
                    "department",
                    models.CharField(blank=True, max_length=100, null=True),
                ),
                (
                    "phone",
                    models.CharField(blank=True, max_length=20, null=True),
                ),
                (
                    "student",
                    models.OneToOneField(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="user_profile",
                        to="attendance.student",
                    ),
                ),
                (
                    "user",
                    models.OneToOneField(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="profile",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
        ),
    ]
