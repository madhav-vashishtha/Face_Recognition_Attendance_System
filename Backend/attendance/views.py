from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from .models import Student


@api_view(["GET", "POST"])
def add_student(request):

    if request.method == "GET":
        return Response({
            "message": "Student API is working",
            "method": "POST",
            "required_fields": [
                "name",
                "roll_number",
                "email",
                "course"
            ]
        })

    name = request.data.get("name")
    roll_number = request.data.get("roll_number")
    email = request.data.get("email")
    course = request.data.get("course")

    if not name or not roll_number or not email or not course:
        return Response(
            {"error": "All fields are required"},
            status=status.HTTP_400_BAD_REQUEST
        )

    if Student.objects.filter(roll_number=roll_number).exists():
        return Response(
            {"error": "Roll number already exists"},
            status=status.HTTP_400_BAD_REQUEST
        )

    if Student.objects.filter(email=email).exists():
        return Response(
            {"error": "Email already exists"},
            status=status.HTTP_400_BAD_REQUEST
        )

    student = Student.objects.create(
        name=name,
        roll_number=roll_number,
        email=email,
        course=course
    )

    return Response(
        {
            "message": "Student added successfully",
            "student": {
                "id": student.id,
                "name": student.name,
                "roll_number": student.roll_number,
                "email": student.email,
                "course": student.course
            }
        },
        status=status.HTTP_201_CREATED
    )
