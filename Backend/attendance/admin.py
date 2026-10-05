from django.contrib import admin
from .models import Student, Lecture, Attendance, Leave

admin.site.register(Student)
admin.site.register(Lecture)
admin.site.register(Attendance)
admin.site.register(Leave)
