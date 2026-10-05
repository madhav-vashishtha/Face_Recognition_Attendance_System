from django.db import models
from django.contrib.auth.models import User


# =========================================================
# STUDENT
# =========================================================

class Student(models.Model):

    name = models.CharField(
        max_length=100
    )

    section = models.CharField(
        max_length=50
    )

    roll_number = models.CharField(
        max_length=20,
        unique=True
    )

    email = models.EmailField(
        unique=True,
        blank=True,
        null=True
    )

    branch = models.CharField(
        max_length=100
    )

    phone = models.CharField(
        max_length=15,
        blank=True,
        null=True
    )

    semester = models.CharField(
        max_length=20
    )

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

    def __str__(self):
        return f"{self.name} - {self.roll_number}"


# =========================================================
# TIMETABLE
# =========================================================

class Timetable(models.Model):

    DAY_CHOICES = [
        (0, "Monday"),
        (1, "Tuesday"),
        (2, "Wednesday"),
        (3, "Thursday"),
        (4, "Friday"),
        (5, "Saturday"),
        (6, "Sunday"),
    ]

    day_of_week = models.PositiveSmallIntegerField(
        choices=DAY_CHOICES,
        default=0
    )

    subject = models.CharField(
        max_length=100
    )

    section = models.CharField(
        max_length=50
    )

    branch = models.CharField(
        max_length=100
    )

    semester = models.CharField(
        max_length=50
    )

    start_time = models.TimeField()

    end_time = models.TimeField()

    # Faculty name comes directly from college timetable
    teacher_name = models.CharField(
        max_length=150,
        blank=True,
        null=True
    )

    # Optional link to Django User.
    # This will be connected automatically later.
    teacher = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="timetable_entries"
    )

    room = models.CharField(
        max_length=100,
        blank=True,
        null=True
    )

    late_after_minutes = models.PositiveIntegerField(
        default=10
    )

    is_active = models.BooleanField(
        default=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    class Meta:

        ordering = [
            "day_of_week",
            "start_time"
        ]

        constraints = [
            models.UniqueConstraint(
                fields=[
                    "day_of_week",
                    "section",
                    "branch",
                    "semester",
                    "start_time",
                    "end_time",
                ],
                name="unique_timetable_slot",
            )
        ]

    def __str__(self):

        teacher = (
            self.teacher_name
            or "Teacher not specified"
        )

        return (
            f"{self.get_day_of_week_display()} - "
            f"{self.subject} - "
            f"{teacher} - "
            f"{self.start_time} to {self.end_time}"
        )


# =========================================================
# LECTURE
# =========================================================

class Lecture(models.Model):

    subject = models.CharField(
        max_length=100
    )

    section = models.CharField(
        max_length=50
    )

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
            f"{self.subject} - "
            f"{self.section} - "
            f"{self.date} "
            f"{self.start_time}"
        )


# =========================================================
# ATTENDANCE
# =========================================================

class Attendance(models.Model):

    STATUS_CHOICES = [
        ("Present", "Present"),
        ("Late", "Late"),
        ("Absent", "Absent"),
        ("On Leave", "On Leave"),
    ]

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
        choices=STATUS_CHOICES,
        default="Present"
    )

    marked_at = models.DateTimeField(
        auto_now_add=True
    )

    class Meta:

        constraints = [
            models.UniqueConstraint(
                fields=[
                    "student",
                    "lecture"
                ],
                name="unique_student_attendance_per_lecture"
            )
        ]

    def __str__(self):

        return (
            f"{self.student.name} - "
            f"{self.lecture.subject} - "
            f"{self.lecture.date} - "
            f"{self.status}"
        )


# =========================================================
# LEAVE
# =========================================================

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

        ordering = [
            "-applied_at",
            "-date"
        ]

    def __str__(self):

        return (
            f"{self.student.name} - "
            f"{self.reason} "
            f"({self.status})"
        )


# =========================================================
# USER PROFILE
# =========================================================

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

    # Only used for student accounts
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

        return (
            f"{self.user.username} "
            f"({self.role})"
        )