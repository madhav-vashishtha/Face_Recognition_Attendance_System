from django.urls import path
from .views import add_student, student_list, save_face


urlpatterns = [
    path("students/add/", add_student, name="add_student"),
    path("students/", student_list, name="student_list"),
    path(
        "students/<int:student_id>/save-face/",
        save_face,
        name="save_face"
    ),
]
