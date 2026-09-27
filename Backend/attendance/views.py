import json
import numpy as np

from django.utils import timezone
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from .models import Student, Attendance
from .face_recognition import get_face_embedding

# ==========================================
# GET ALL STUDENTS
# ==========================================

@api_view(["GET"])
def student_list(request):

    students = Student.objects.all().order_by("-id")

    data = []

    for student in students:
        data.append({
            "id": student.id,
            "name": student.name,
            "section": student.section,
            "roll_number": student.roll_number,
            "email": student.email,
            "branch": student.branch,
            "phone": student.phone,
            "semester": student.semester,
        })

    return Response(data)


# ==========================================
# ADD STUDENT
# ==========================================

@api_view(["GET", "POST"])
def add_student(request):

    # Test API
    if request.method == "GET":
        return Response({
            "message": "Student API is working",
            "method": "POST"
        })

    # Get data from frontend
    name = request.data.get("name")
    section = request.data.get("section")
    roll_number = request.data.get("roll_number")
    email = request.data.get("email")
    branch = request.data.get("branch")
    phone = request.data.get("phone")
    semester = request.data.get("semester")

    # Required fields
    if not name or not section or not roll_number or not branch or not semester:
        return Response(
            {
                "error": "Please fill all required fields"
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    # Check duplicate roll number
    if Student.objects.filter(
        roll_number=roll_number
    ).exists():

        return Response(
            {
                "error": "Roll number already exists"
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    # Check duplicate email
    if email and Student.objects.filter(
        email=email
    ).exists():

        return Response(
            {
                "error": "Email already exists"
            },
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

    # Response
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

# ==========================================
# SAVE FACE
# ==========================================

@api_view(["POST"])
def save_face(request):

    student_id = request.data.get("student_id")
    face_image = request.data.get("face_image")

    if not student_id:
        return Response(
            {
                "error": "Student ID is required"
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    if not face_image:
        return Response(
            {
                "error": "Face image is required"
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        student = Student.objects.get(
            id=student_id
        )

    except Student.DoesNotExist:
        return Response(
            {
                "error": "Student not found"
            },
            status=status.HTTP_404_NOT_FOUND
        )

    # Generate face embedding
    try:
        embedding = get_face_embedding(
            face_image
        )

    except ValueError as error:
        return Response(
            {
                "error": str(error)
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    # Convert numpy embedding into normal Python list
    embedding_list = embedding.tolist()

    # Save image and embedding
    student.face_image = face_image

    student.face_embedding = json.dumps(
        embedding_list
    )

    student.save()

    return Response(
        {
            "message": "Face and face embedding saved successfully",
            "student": {
                "id": student.id,
                "name": student.name,
                "roll_number": student.roll_number
            }
        },
        status=status.HTTP_200_OK
    )

# ==========================================
# MARK ATTENDANCE
# ==========================================

@api_view(["POST"])
def mark_attendance(request):

    student_id = request.data.get("student_id")

    if not student_id:
        return Response(
            {
                "error": "Student ID is required"
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        student = Student.objects.get(
            id=student_id
        )

    except Student.DoesNotExist:
        return Response(
            {
                "error": "Student not found"
            },
            status=status.HTTP_404_NOT_FOUND
        )

    # Check if attendance already exists today
    today = timezone.localdate()

    existing_attendance = Attendance.objects.filter(
        student=student,
        date=today
    ).first()

    if existing_attendance:
        return Response(
            {
                "message": "Attendance already marked today",
                "student": {
                    "id": student.id,
                    "name": student.name,
                    "roll_number": student.roll_number
                }
            },
            status=status.HTTP_200_OK
        )

    attendance = Attendance.objects.create(
        student=student,
        status="Present"
    )

    return Response(
        {
            "message": "Attendance marked successfully",
            "attendance": {
                "id": attendance.id,
                "student": student.name,
                "roll_number": student.roll_number,
                "date": attendance.date,
                "time": attendance.time,
                "status": attendance.status
            }
        },
        status=status.HTTP_201_CREATED
    )

# ==========================================
# RECOGNIZE FACE AND MARK ATTENDANCE
# ==========================================

@api_view(["POST"])
def recognize_face(request):

    face_image = request.data.get("face_image")

    if not face_image:
        return Response(
            {
                "error": "Face image is required"
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    # --------------------------------------
    # Generate embedding from camera image
    # --------------------------------------

    try:
        current_embedding = get_face_embedding(
            face_image
        )

    except ValueError as error:
        return Response(
            {
                "error": str(error)
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    # --------------------------------------
    # Compare with saved student embeddings
    # --------------------------------------

    best_student = None
    best_similarity = -1.0

    students = Student.objects.exclude(
        face_embedding__isnull=True
    ).exclude(
        face_embedding=""
    )

    for student in students:

        try:
            saved_embedding = np.array(
                json.loads(student.face_embedding),
                dtype=np.float32
            )

            current = np.array(
                current_embedding,
                dtype=np.float32
            )

            # Cosine similarity
            denominator = (
                np.linalg.norm(current)
                * np.linalg.norm(saved_embedding)
            )

            if denominator == 0:
                continue

            similarity = float(
                np.dot(current, saved_embedding)
                / denominator
            )

            if similarity > best_similarity:
                best_similarity = similarity
                best_student = student

        except Exception as error:
            print(
                f"Embedding error for student {student.id}:",
                error
            )

    # --------------------------------------
    # Recognition threshold
    # --------------------------------------

    RECOGNITION_THRESHOLD = 0.45

    if (
        best_student is None
        or best_similarity < RECOGNITION_THRESHOLD
    ):
        return Response(
            {
                "message": "Face not recognized",
                "similarity": round(
                    best_similarity,
                    4
                )
            },
            status=status.HTTP_404_NOT_FOUND
        )

    # --------------------------------------
    # Check today's attendance
    # --------------------------------------

    today = timezone.localdate()

    existing_attendance = Attendance.objects.filter(
        student=best_student,
        date=today
    ).first()

    if existing_attendance:

        return Response(
            {
                "message": "Attendance already marked today",
                "student": {
                    "id": best_student.id,
                    "name": best_student.name,
                    "roll_number": best_student.roll_number
                },
                "similarity": round(
                    best_similarity,
                    4
                ),
                "attendance": {
                    "date": existing_attendance.date,
                    "time": existing_attendance.time,
                    "status": existing_attendance.status
                }
            },
            status=status.HTTP_200_OK
        )

    # --------------------------------------
    # Mark attendance
    # --------------------------------------

    attendance = Attendance.objects.create(
        student=best_student,
        status="Present"
    )

    return Response(
        {
            "message": "Face recognized and attendance marked successfully",
            "student": {
                "id": best_student.id,
                "name": best_student.name,
                "roll_number": best_student.roll_number
            },
            "similarity": round(
                best_similarity,
                4
            ),
            "attendance": {
                "id": attendance.id,
                "date": attendance.date,
                "time": attendance.time,
                "status": attendance.status
            }
        },
        status=status.HTTP_201_CREATED
    )

@api_view(["GET"])
def dashboard_data(request):

    today = timezone.localdate()

    total_students = Student.objects.count()

    present_today = Attendance.objects.filter(
        date=today,
        status="Present"
    ).values("student").distinct().count()

    absent_today = max(
        total_students - present_today,
        0
    )

    if total_students > 0:
        attendance_percentage = round(
            (present_today / total_students) * 100,
            2
        )
    else:
        attendance_percentage = 0

    today_attendance = Attendance.objects.filter(
        date=today
    ).select_related(
        "student"
    ).order_by("-time")

    attendance_data = []

    for attendance in today_attendance:

        attendance_data.append({
            "id": attendance.id,
            "name": attendance.student.name,
            "roll_number": attendance.student.roll_number,
            "time": attendance.time,
            "status": attendance.status,
        })

    return Response({
        "date": today,
        "total_students": total_students,
        "present_today": present_today,
        "absent_today": absent_today,
        "attendance_percentage": attendance_percentage,
        "today_attendance": attendance_data,
    })
