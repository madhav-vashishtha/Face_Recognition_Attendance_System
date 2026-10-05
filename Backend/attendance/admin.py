from django.contrib import admin

from .models import (
    Student,
    Lecture,
    Attendance,
    Leave,
    Timetable,
)


admin.site.register(Student)

admin.site.register(Lecture)

admin.site.register(Attendance)

admin.site.register(Leave)

admin.site.register(Timetable)