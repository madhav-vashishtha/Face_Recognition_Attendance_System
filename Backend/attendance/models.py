from django.db import models
from django.contrib.auth.models import User


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


class Lecture(models.Model):
    subject = models.CharField(max_length=100)

    section = models.CharField(max_length=50)

    date = models.DateField()

    start_time = models.TimeField()

    end_time = models.TimeField()

    created_by = models.CharField(
        max_length=100,
        blank=True,
        null=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=[
                    "subject",
                    "section",
                    "date",
                    "start_time",
                    "end_time"
                ],
                name="unique_lecture_slot"
            )
        ]

    def __str__(self):
        return (
            f"{self.subject} - {self.section} - "
            f"{self.date} {self.start_time}"
        )


class Attendance(models.Model):
    student = models.ForeignKey(
        Student,
        on_delete=models.CASCADE,
        related_name="attendance_records"
    )

    lecture = models.ForeignKey(
        Lecture,
        on_delete=models.CASCADE,
        related_name="attendance_records"
    )

    status = models.CharField(
        max_length=20,
        default="Present"
    )

    marked_at = models.DateTimeField(
        auto_now_add=True
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["student", "lecture"],
                name="unique_student_attendance_per_lecture"
            )
        ]

    def __str__(self):
        return (
            f"{self.student.name} - {self.lecture.subject} - "
            f"{self.lecture.date} - {self.status}"
        )


class Leave(models.Model):
    student = models.ForeignKey(
        Student,
        on_delete=models.CASCADE,
        related_name="leaves"
    )

    date = models.DateField()

    subject = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        default="All Subjects"
    )

    time_slot = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        default="Full Day"
    )

    reason = models.CharField(
        max_length=255
    )

    status = models.CharField(
        max_length=20,
        default="Pending"
    )

    applied_at = models.DateTimeField(
        auto_now_add=True
    )

    reviewed_by = models.CharField(
        max_length=100,
        blank=True,
        null=True
    )

    review_remarks = models.CharField(
        max_length=255,
        blank=True,
        null=True
    )

    class Meta:
        ordering = ["-applied_at", "-date"]

    def __str__(self):
        return f"{self.student.name} - {self.reason} ({self.status})"


class UserProfile(models.Model):
    ROLE_CHOICES = (
        ("admin", "Admin"),
        ("teacher", "Teacher"),
        ("student", "Student"),
    )

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="profile"
    )

    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default="student"
    )

    student = models.OneToOneField(
        Student,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="user_profile"
    )

    department = models.CharField(
        max_length=100,
        blank=True,
        null=True
    )

    phone = models.CharField(
        max_length=20,
        blank=True,
        null=True
    )

    def __str__(self):
        return f"{self.user.username} ({self.role})"
