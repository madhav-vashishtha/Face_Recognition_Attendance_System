from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from .models import Student


# =========================================================
# ADD STUDENT
# =========================================================

@api_view(["GET", "POST"])
def add_student(request):

    if request.method == "GET":
        return Response({
            "message": "Student API is working",
            "method": "POST",
            "required_fields": [
                "name",
                "section",
                "roll_number",
                "email",
                "branch",
                "phone",
                "semester"
            ]
        })

    name = request.data.get("name")
    section = request.data.get("section")
    roll_number = request.data.get("roll_number")
    email = request.data.get("email")
    branch = request.data.get("branch")
    phone = request.data.get("phone")
    semester = request.data.get("semester")

    # Required fields check
    if not name or not section or not roll_number or not branch or not semester:
        return Response(
            {"error": "Please fill all required fields"},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Roll number duplicate check
    if Student.objects.filter(roll_number=roll_number).exists():
        return Response(
            {"error": "Roll number already exists"},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Email duplicate check
    if email and Student.objects.filter(email=email).exists():
        return Response(
            {"error": "Email already exists"},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Create student
    student = Student.objects.create(
        name=name,
        section=section,
        roll_number=roll_number,
        email=email or None,
        branch=branch,
        phone=phone or None,
        semester=semester
    )

    return Response(
        {
            "message": "Student added successfully",
            "student": {
                "id": student.id,
                "name": student.name,
                "section": student.section,
                "roll_number": student.roll_number,
                "email": student.email,
                "branch": student.branch,
                "phone": student.phone,
                "semester": student.semester
            }
        },
        status=status.HTTP_201_CREATED
    )


# =========================================================
# STUDENT LIST
# =========================================================

@api_view(["GET"])
def student_list(request):

    students = Student.objects.all().order_by("name")

    data = []

    for student in students:
        data.append({
            "id": student.id,
            "name": student.name,
            "roll_number": student.roll_number,
            "section": student.section,
            "branch": student.branch,
            "semester": student.semester,
        })

    return Response(data)


# =========================================================
# SAVE FACE
# =========================================================

@api_view(["POST"])
def save_face(request, student_id):

    # Find student
    try:
        student = Student.objects.get(id=student_id)

    except Student.DoesNotExist:
        return Response(
            {"error": "Student not found"},
            status=status.HTTP_404_NOT_FOUND
        )

    # Get uploaded face image
    face_image = request.FILES.get("face_image")

    if not face_image:
        return Response(
            {"error": "Face image is required"},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Save image
    student.face_image = face_image
    student.save()

    return Response(
        {
            "message": "Face saved successfully",
            "student": {
                "id": student.id,
                "name": student.name,
                "roll_number": student.roll_number
            }
        },
        status=status.HTTP_200_OK
    )
