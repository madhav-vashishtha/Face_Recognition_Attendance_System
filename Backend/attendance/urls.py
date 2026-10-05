from django.urls import path

from .views import (
    student_list,
    student_detail,
    student_leaves,
    student_attendance_toggle,
    lecture_list,
    add_student,
    save_face,
    mark_attendance,
    recognize_face,
    dashboard_data,
    auth_login,
    auth_signup,
    leave_requests_list,
    leave_action,
    pending_leaves_count
)


urlpatterns = [

    # Auth Endpoints
    path("auth/login/", auth_login, name="auth_login"),
    path("auth/signup/", auth_signup, name="auth_signup"),

    # Leave Management (Teacher / Admin)
    path("leaves/", leave_requests_list, name="leave_requests_list"),
    path("leaves/<int:leave_id>/action/", leave_action, name="leave_action"),
    path("leaves/pending-count/", pending_leaves_count, name="pending_leaves_count"),

    # Get all students
    path(
        "students/",
        student_list,
        name="student_list"
    ),

    # Student Details, Edit & Delete
    path(
        "students/<int:student_id>/",
        student_detail,
        name="student_detail"
    ),

    # Student Leaves
    path(
        "students/<int:student_id>/leaves/",
        student_leaves,
        name="student_leaves"
    ),

    # Student Attendance toggle
    path(
        "students/<int:student_id>/attendance/",
        student_attendance_toggle,
        name="student_attendance_toggle"
    ),

    # Lectures
    path(
    "lectures/",
    lecture_list,
    name="lecture_list"
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
