from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("attendance", "0009_lecture_attendance_relation"),
    ]

    operations = [
        migrations.CreateModel(
            name="Leave",
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
                ("date", models.DateField()),
                ("reason", models.CharField(max_length=255)),
                (
                    "status",
                    models.CharField(
                        default="Approved",
                        max_length=20,
                    ),
                ),
                (
                    "applied_at",
                    models.DateTimeField(auto_now_add=True),
                ),
                (
                    "student",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="leaves",
                        to="attendance.student",
                    ),
                ),
            ],
            options={
                "ordering": ["-date", "-applied_at"],
            },
        ),
    ]
