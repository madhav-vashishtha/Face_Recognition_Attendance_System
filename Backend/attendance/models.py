from django.db import models


class Student(models.Model):
    name = models.CharField(max_length=100)
    section = models.CharField(max_length=50)
    roll_number = models.CharField(max_length=20, unique=True)
    email = models.EmailField(unique=True, blank=True, null=True)
    branch = models.CharField(max_length=100)
    phone = models.CharField(max_length=15, blank=True, null=True)
    semester = models.CharField(max_length=20)

    face_image = models.ImageField(
        upload_to="faces/",
        blank=True,
        null=True
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} - {self.roll_number}"
    