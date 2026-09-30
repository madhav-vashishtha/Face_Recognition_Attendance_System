from django.db import models


class Student(models.Model):

    name = models.CharField(max_length=100)

    section = models.CharField(max_length=50)

    roll_number = models.CharField(
        max_length=20,
        unique=True
    )

    email = models.EmailField(
        unique=True,
        blank=True,
        null=True
    )

    branch = models.CharField(max_length=100)

    phone = models.CharField(
        max_length=15,
        blank=True,
        null=True
    )

    semester = models.CharField(max_length=20)

    # Captured face image
    face_image = models.TextField(
        blank=True,
        null=True
    )

    face_embedding = models.TextField(
    blank=True,
    null=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

class Attendance(models.Model):
    student = models.ForeignKey(
        Student,
        on_delete=models.CASCADE,
        related_name="attendance_records"
    )

    date = models.DateField(
        auto_now_add=True
    )

    time = models.TimeField(
        auto_now_add=True
    )

    status = models.CharField(
        max_length=20,
        default="Present"
    )
    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["student", "date"],
                name="unique_student_attendance_per_day"
            )
        ]
    def __str__(self):
        return f"{self.student.name} - {self.date} - {self.status}"
        