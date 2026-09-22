from django.urls import path
from .views import add_student

urlpatterns = [
    path("students/add/", add_student, name="add_student"),
]
