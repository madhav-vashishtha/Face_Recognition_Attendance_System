from django.urls import path

from .views import (
    student_list,
    add_student,
    save_face,
    mark_attendance,
    recognize_face,
    dashboard_data
)


urlpatterns = [

    # Get all students
    path(
        "students/",
        student_list,
        name="student_list"
    ),

    # Add student
    path(
        "students/add/",
        add_student,
        name="add_student"
    ),

    # Save face
    path(
        "students/save-face/",
        save_face,
        name="save_face"
    ),

    # Attendance
    path(
    "attendance/mark/",
    mark_attendance,
    name="mark_attendance"
    ),

    path(
    "attendance/recognize/",
    recognize_face,
    name="recognize_face"
    ),

    path(
    "dashboard/",
    dashboard_data,
    name="dashboard_data"
    ),
]
