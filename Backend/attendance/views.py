import json
import datetime
import numpy as np

from django.shortcuts import get_object_or_404
from django.db.models import Q
from django.utils.dateparse import parse_date, parse_time
from django.utils import timezone
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from django.contrib.auth.models import User
from .models import Student, Lecture, Attendance, Leave, UserProfile
from .face_recognition import get_face_embedding


def lecture_to_dict(lecture):
    return {
        "id": lecture.id,
        "subject": lecture.subject,
        "section": lecture.section,
        "date": lecture.date,
        "start_time": lecture.start_time,
        "end_time": lecture.end_time,
        "created_by": lecture.created_by,
    }


def attendance_to_dict(attendance):
    return {
        "id": attendance.id,
        "student": attendance.student.name,
        "roll_number": attendance.student.roll_number,
        "lecture": lecture_to_dict(attendance.lecture),
        "status": attendance.status,
        "marked_at": attendance.marked_at,
    }


def get_lecture_from_request(request):
    lecture_id = request.data.get("lecture_id")

    if not lecture_id:
        return None, Response(
            {
                "error": "Lecture ID is required"
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        lecture = Lecture.objects.get(
            id=lecture_id
        )
    except Lecture.DoesNotExist:
        return None, Response(
            {
                "error": "Lecture not found"
            },
            status=status.HTTP_404_NOT_FOUND
        )

    return lecture, None


def validate_lecture_data(data):
    subject = data.get("subject")
    section = data.get("section") or "General"

    current_time = timezone.localtime()

    date = (
        parse_date(data.get("date") or "")
        or current_time.date()
    )

    start_time = (
        parse_time(data.get("start_time") or "")
        or current_time.time().replace(
            second=0,
            microsecond=0
        )
    )

    end_time = parse_time(data.get("end_time") or "")

    if not end_time:
        end_datetime = (
            datetime.datetime.combine(date, start_time)
            + datetime.timedelta(hours=1)
        )

        if end_datetime.date() != date:
            end_time = datetime.time(23, 59)
        else:
            end_time = end_datetime.time()

    created_by = data.get("created_by") or None

    if not subject:
        return None, "Subject is required"

    if end_time <= start_time:
        return None, "End time must be after start time"

    return {
        "subject": subject.strip(),
        "section": section.strip(),
        "date": date,
        "start_time": start_time,
        "end_time": end_time,
        "created_by": created_by.strip() if created_by else None,
    }, None


# ==========================================
# GET ALL STUDENTS
# ==========================================

@api_view(["GET"])
def student_list(request):

    students = Student.objects.all().order_by("-id")
    total_lectures_all = Lecture.objects.count()

    data = []

    for student in students:
        lectures_count = Lecture.objects.filter(
            Q(section__iexact=student.section) | Q(section="General")
        ).count()
        total_lectures = lectures_count if lectures_count > 0 else total_lectures_all

        present_attendance = student.attendance_records.filter(
            status="Present"
        ).count()

        late_attendance = student.attendance_records.filter(
            status="Late"
        ).count()

        effective_total = max(total_lectures, student.attendance_records.count())
        absent_attendance = max(0, effective_total - present_attendance - late_attendance)

        if effective_total > 0:
            attendance_percentage = round(
                (present_attendance / effective_total) * 100
            )
        else:
            attendance_percentage = 0

        data.append({
            "id": student.id,
            "name": student.name,
            "section": student.section,
            "roll_number": student.roll_number,
            "email": student.email or "",
            "branch": student.branch,
            "phone": student.phone or "",
            "semester": student.semester,
            "attendance_percentage": attendance_percentage,
            "attendance_status": (
                "Present"
                if attendance_percentage >= 75
                else "Absent"
            ),
            "total_lectures": effective_total,
            "present_count": present_attendance,
            "absent_count": absent_attendance,
            "late_count": late_attendance,
            "has_face": bool(student.face_embedding),
        })

    return Response(data)


# ==========================================
# STUDENT DETAILS, EDIT & DELETE
# ==========================================

@api_view(["GET", "PUT", "DELETE"])
def student_detail(request, student_id):

    student = get_object_or_404(Student, id=student_id)

    if request.method == "DELETE":
        student_name = student.name
        student.delete()
        return Response(
            {
                "message": f"Student '{student_name}' deleted successfully"
            },
            status=status.HTTP_200_OK
        )

    if request.method == "PUT":
        name = request.data.get("name")
        roll_number = request.data.get("roll_number")
        section = request.data.get("section")
        branch = request.data.get("branch")
        semester = request.data.get("semester")
        email = request.data.get("email")
        phone = request.data.get("phone")

        if not name or not roll_number or not section or not branch or not semester:
            return Response(
                {
                    "error": "Name, roll number, section, branch and semester are required"
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        if Student.objects.filter(roll_number=roll_number).exclude(id=student.id).exists():
            return Response(
                {
                    "error": "Roll number already exists for another student"
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        if email and Student.objects.filter(email=email).exclude(id=student.id).exists():
            return Response(
                {
                    "error": "Email already exists for another student"
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        student.name = name.strip()
        student.roll_number = roll_number.strip()
        student.section = section.strip()
        student.branch = branch.strip()
        student.semester = semester.strip()
        student.email = email.strip() if email else None
        student.phone = phone.strip() if phone else None
        student.save()

    # Lectures query
    lectures = Lecture.objects.filter(
        Q(section__iexact=student.section) | Q(section="General")
    ).order_by("-date", "-start_time")

    if not lectures.exists():
        lectures = Lecture.objects.all().order_by("-date", "-start_time")

    attendances = Attendance.objects.filter(student=student)
    att_by_lecture = {att.lecture_id: att for att in attendances}

    attendance_history = []
    for lec in lectures:
        att = att_by_lecture.get(lec.id)
        if att:
            current_status = att.status
            marked_time = (
                timezone.localtime(att.marked_at).strftime("%I:%M %p")
                if att.marked_at
                else lec.start_time.strftime("%I:%M %p")
            )
        else:
            current_status = "Absent"
            marked_time = lec.start_time.strftime("%I:%M %p")

        attendance_history.append({
            "id": att.id if att else f"lec-{lec.id}",
            "lecture_id": lec.id,
            "date": lec.date.strftime("%d %b"),
            "full_date": lec.date.strftime("%d %b %Y"),
            "raw_date": str(lec.date),
            "subject": lec.subject,
            "lecture_name": (
                lec.subject
                if "lecture" in lec.subject.lower()
                else f"Lecture {lec.id}"
            ),
            "time": marked_time,
            "status": current_status,
            "marked_at": att.marked_at if att else None,
        })

    total_lectures = len(attendance_history)
    present_count = sum(1 for h in attendance_history if h["status"] == "Present")
    late_count = sum(1 for h in attendance_history if h["status"] == "Late")
    absent_count = sum(1 for h in attendance_history if h["status"] == "Absent")

    if total_lectures > 0:
        attendance_percentage = round((present_count / total_lectures) * 100)
    else:
        attendance_percentage = 0

    leaves = Leave.objects.filter(student=student).order_by("-date", "-applied_at")
    leave_history = []
    for lv in leaves:
        leave_history.append({
            "id": lv.id,
            "date": lv.date.strftime("%d %b"),
            "full_date": lv.date.strftime("%d %b %Y"),
            "raw_date": str(lv.date),
            "subject": lv.subject or "All Subjects",
            "time_slot": lv.time_slot or "Full Day",
            "reason": lv.reason,
            "status": lv.status,
            "applied_at": lv.applied_at,
            "reviewed_by": lv.reviewed_by or "—",
            "review_remarks": lv.review_remarks or "—",
        })

    return Response({
        "student": {
            "id": student.id,
            "name": student.name,
            "roll_number": student.roll_number,
            "section": student.section,
            "branch": student.branch,
            "semester": student.semester,
            "email": student.email or "",
            "phone": student.phone or "",
            "face_image": student.face_image or None,
            "has_face": bool(student.face_embedding),
            "created_at": student.created_at,
        },
        "summary": {
            "total_lectures": total_lectures,
            "present": present_count,
            "absent": absent_count,
            "late": late_count,
            "attendance_percentage": attendance_percentage,
            "current_status": "Present" if attendance_percentage >= 75 else "Absent",
        },
        "attendance_history": attendance_history,
        "leave_history": leave_history,
    })


# ==========================================
# STUDENT LEAVE APPLICATION
# ==========================================

@api_view(["POST"])
def student_leaves(request, student_id):

    student = get_object_or_404(Student, id=student_id)
    date_str = request.data.get("date")
    subject_val = str(request.data.get("subject") or "All Subjects").strip()
    time_slot_val = str(request.data.get("time_slot") or "Full Day").strip()
    reason = str(request.data.get("reason") or "").strip()
    leave_status = str(request.data.get("status") or "Pending").strip()

    if not reason:
        return Response(
            {
                "error": "Reason is required"
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    leave_date = parse_date(date_str or "") or timezone.localdate()

    leave = Leave.objects.create(
        student=student,
        date=leave_date,
        subject=subject_val,
        time_slot=time_slot_val,
        reason=reason,
        status=leave_status
    )

    return Response(
        {
            "message": "Leave application recorded successfully",
            "leave": {
                "id": leave.id,
                "date": leave.date.strftime("%d %b"),
                "full_date": leave.date.strftime("%d %b %Y"),
                "raw_date": str(leave.date),
                "subject": leave.subject,
                "time_slot": leave.time_slot,
                "reason": leave.reason,
                "status": leave.status,
                "applied_at": leave.applied_at
            }
        },
        status=status.HTTP_201_CREATED
    )


# ==========================================
# TOGGLE / UPDATE STUDENT ATTENDANCE
# ==========================================

@api_view(["POST"])
def student_attendance_toggle(request, student_id):

    student = get_object_or_404(Student, id=student_id)
    lecture_id = request.data.get("lecture_id")
    new_status = request.data.get("status", "Present")

    if not lecture_id:
        return Response(
            {
                "error": "Lecture ID is required"
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    lecture = get_object_or_404(Lecture, id=lecture_id)

    att, created = Attendance.objects.get_or_create(
        student=student,
        lecture=lecture,
        defaults={"status": new_status}
    )

    if not created:
        att.status = new_status
        att.save(update_fields=["status"])

    return Response(
        {
            "message": f"Attendance updated to {new_status}",
            "attendance": attendance_to_dict(att)
        },
        status=status.HTTP_200_OK
    )


# ==========================================
# LECTURES
# ==========================================

@api_view(["GET", "POST"])
def lecture_list(request):

    if request.method == "GET":
        lectures = Lecture.objects.all().order_by(
            "-date",
            "-start_time",
            "subject"
        )

        data = [
            lecture_to_dict(lecture)
            for lecture in lectures
        ]

        return Response(data)

    lecture_data, error = validate_lecture_data(
        request.data
    )

    if error:
        return Response(
            {
                "error": error
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    lecture, created = Lecture.objects.get_or_create(
        subject=lecture_data["subject"],
        section=lecture_data["section"],
        date=lecture_data["date"],
        start_time=lecture_data["start_time"],
        end_time=lecture_data["end_time"],
        defaults={
            "created_by": lecture_data["created_by"],
        }
    )

    return Response(
        {
            "message": (
                "Lecture created successfully"
                if created
                else "Lecture already exists"
            ),
            "lecture": lecture_to_dict(lecture)
        },
        status=(
            status.HTTP_201_CREATED
            if created
            else status.HTTP_200_OK
        )
    )


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
    lecture, lecture_error = get_lecture_from_request(
        request
    )

    if not student_id:
        return Response(
            {
                "error": "Student ID is required"
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    if lecture_error:
        return lecture_error

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

    existing_attendance = Attendance.objects.filter(
        student=student,
        lecture=lecture
    ).first()

    if existing_attendance:
        return Response(
            {
                "message": "Attendance already marked for this lecture",
                "student": {
                    "id": student.id,
                    "name": student.name,
                    "roll_number": student.roll_number
                },
                "attendance": attendance_to_dict(
                    existing_attendance
                )
            },
            status=status.HTTP_200_OK
        )

    attendance = Attendance.objects.create(
        student=student,
        lecture=lecture,
        status="Present"
    )

    return Response(
        {
            "message": "Attendance marked successfully",
            "attendance": attendance_to_dict(
                attendance
            )
        },
        status=status.HTTP_201_CREATED
    )

# ==========================================
# RECOGNIZE FACE AND MARK ATTENDANCE
# ==========================================

@api_view(["POST"])
def recognize_face(request):

    face_image = request.data.get("face_image")
    lecture, lecture_error = get_lecture_from_request(
        request
    )

    if not face_image:
        return Response(
            {
                "error": "Face image is required"
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    if lecture_error:
        return lecture_error

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
    # Check lecture attendance
    # --------------------------------------

    existing_attendance = Attendance.objects.filter(
        student=best_student,
        lecture=lecture
    ).first()

    if existing_attendance:

        return Response(
            {
                "message": "Attendance already marked for this lecture",
                "student": {
                    "id": best_student.id,
                    "name": best_student.name,
                    "roll_number": best_student.roll_number
                },
                "similarity": round(
                    best_similarity,
                    4
                ),
                "attendance": attendance_to_dict(
                    existing_attendance
                )
            },
            status=status.HTTP_200_OK
        )

    # --------------------------------------
    # Mark attendance
    # --------------------------------------

    attendance = Attendance.objects.create(
        student=best_student,
        lecture=lecture,
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
            "attendance": attendance_to_dict(
                attendance
            )
        },
        status=status.HTTP_201_CREATED
    )

@api_view(["GET"])
def dashboard_data(request):

    today = timezone.localdate()

    total_students = Student.objects.count()

    present_today = Attendance.objects.filter(
        lecture__date=today,
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
        lecture__date=today
    ).select_related(
        "student",
        "lecture"
    ).order_by(
        "lecture__start_time",
        "lecture__subject",
        "-marked_at"
    )

    attendance_data = []

    for attendance in today_attendance:

        attendance_data.append({
            "id": attendance.id,
            "name": attendance.student.name,
            "roll_number": attendance.student.roll_number,
            "subject": attendance.lecture.subject,
            "section": attendance.lecture.section,
            "date": attendance.lecture.date,
            "start_time": attendance.lecture.start_time,
            "end_time": attendance.lecture.end_time,
            "marked_at": attendance.marked_at,
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


# ==========================================
# AUTHENTICATION: LOGIN
# ==========================================

@api_view(["POST"])
def auth_login(request):
    username_input = str(request.data.get("username") or "").strip()
    password = str(request.data.get("password") or "")
    requested_role = str(request.data.get("role") or "").strip().lower()

    if not username_input or not password:
        return Response(
            {"error": "Please enter username/email/roll number and password"},
            status=status.HTTP_400_BAD_REQUEST
        )

    user = User.objects.filter(username__iexact=username_input).first()

    if not user and "@" in username_input:
        user = User.objects.filter(email__iexact=username_input).first()

    if not user:
        student = Student.objects.filter(roll_number__iexact=username_input).first()
        if student and hasattr(student, "user_profile"):
            user = student.user_profile.user
        elif student:
            user = User.objects.filter(username__iexact=student.roll_number).first()

    if not user or not user.check_password(password):
        return Response(
            {"error": "Invalid login credentials. Please check your details and password."},
            status=status.HTTP_401_UNAUTHORIZED
        )

    profile, _ = UserProfile.objects.get_or_create(
        user=user,
        defaults={"role": "admin" if user.is_superuser else "student"}
    )

    if requested_role and profile.role != requested_role and not user.is_superuser:
        return Response(
            {"error": f"Account role mismatch: Selected '{requested_role}', but account is registered as '{profile.role}'"},
            status=status.HTTP_403_FORBIDDEN
        )

    student_obj = profile.student
    if not student_obj and profile.role == "student":
        student_obj = (
            Student.objects.filter(email__iexact=user.email).first()
            or Student.objects.filter(roll_number__iexact=user.username).first()
        )
        if student_obj:
            profile.student = student_obj
            profile.save(update_fields=["student"])

    user_data = {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "name": (
            student_obj.name if student_obj
            else f"{user.first_name} {user.last_name}".strip() or user.username
        ),
        "role": profile.role,
        "department": profile.department or "",
        "phone": profile.phone or (student_obj.phone if student_obj else ""),
        "student_id": student_obj.id if student_obj else None,
        "roll_number": student_obj.roll_number if student_obj else None,
        "section": student_obj.section if student_obj else None,
        "branch": student_obj.branch if student_obj else None,
        "semester": student_obj.semester if student_obj else None,
    }

    return Response({
        "message": "Login successful",
        "user": user_data,
        "token": f"token_{user.id}_{user.username}"
    }, status=status.HTTP_200_OK)


# ==========================================
# AUTHENTICATION: SIGNUP
# ==========================================

@api_view(["POST"])
def auth_signup(request):
    role = str(request.data.get("role") or "student").strip().lower()
    name = str(request.data.get("name") or "").strip()
    email = str(request.data.get("email") or "").strip()
    password = str(request.data.get("password") or "")

    if not name or not email or not password:
        return Response(
            {"error": "Name, email, and password are required"},
            status=status.HTTP_400_BAD_REQUEST
        )

    if User.objects.filter(email__iexact=email).exists():
        return Response(
            {"error": "An account with this email already exists"},
            status=status.HTTP_400_BAD_REQUEST
        )

    student_obj = None
    username = email.split("@")[0]

    if role == "student":
        roll_number = str(request.data.get("roll_number") or "").strip()
        section = str(request.data.get("section") or "A").strip()
        branch = str(request.data.get("branch") or "CSE").strip()
        semester = str(request.data.get("semester") or "1").strip()
        phone = str(request.data.get("phone") or "").strip()

        if not roll_number:
            return Response(
                {"error": "Roll number is required for student signup"},
                status=status.HTTP_400_BAD_REQUEST
            )

        if User.objects.filter(username__iexact=roll_number).exists():
            return Response(
                {"error": "User with this roll number already exists"},
                status=status.HTTP_400_BAD_REQUEST
            )

        username = roll_number

        student_obj, created = Student.objects.get_or_create(
            roll_number=roll_number,
            defaults={
                "name": name,
                "section": section,
                "branch": branch,
                "semester": semester,
                "email": email,
                "phone": phone or None,
            }
        )
        if not created:
            student_obj.name = name
            student_obj.email = email
            if phone:
                student_obj.phone = phone
            student_obj.save()

    name_parts = name.split(" ", 1)
    first_name = name_parts[0]
    last_name = name_parts[1] if len(name_parts) > 1 else ""

    base_username = username
    counter = 1
    while User.objects.filter(username=username).exists():
        username = f"{base_username}_{counter}"
        counter += 1

    user = User.objects.create_user(
        username=username,
        email=email,
        password=password,
        first_name=first_name,
        last_name=last_name
    )

    department = str(request.data.get("department") or "")
    phone = str(request.data.get("phone") or "")

    profile = UserProfile.objects.create(
        user=user,
        role=role,
        student=student_obj,
        department=department,
        phone=phone
    )

    user_data = {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "name": name,
        "role": profile.role,
        "department": profile.department or "",
        "phone": profile.phone or (student_obj.phone if student_obj else ""),
        "student_id": student_obj.id if student_obj else None,
        "roll_number": student_obj.roll_number if student_obj else None,
        "section": student_obj.section if student_obj else None,
        "branch": student_obj.branch if student_obj else None,
        "semester": student_obj.semester if student_obj else None,
    }

    return Response({
        "message": "Account created successfully",
        "user": user_data,
        "token": f"token_{user.id}_{user.username}"
    }, status=status.HTTP_201_CREATED)


# ==========================================
# LEAVE REQUESTS SECTION (FOR TEACHERS & ADMIN)
# ==========================================

@api_view(["GET", "POST"])
def leave_requests_list(request):
    if request.method == "POST":
        student_id = request.data.get("student_id")
        date_str = request.data.get("date")
        subject_val = str(request.data.get("subject") or "All Subjects").strip()
        time_slot_val = str(request.data.get("time_slot") or "Full Day").strip()
        reason = str(request.data.get("reason") or "").strip()
        status_val = str(request.data.get("status") or "Pending").strip()

        if not student_id or not reason:
            return Response(
                {"error": "Student ID and Reason are required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        student = get_object_or_404(Student, id=student_id)
        leave_date = parse_date(date_str or "") or timezone.localdate()

        leave = Leave.objects.create(
            student=student,
            date=leave_date,
            subject=subject_val,
            time_slot=time_slot_val,
            reason=reason,
            status=status_val
        )

        return Response({
            "message": "Leave request submitted successfully",
            "leave": {
                "id": leave.id,
                "student_id": student.id,
                "student_name": student.name,
                "roll_number": student.roll_number,
                "section": student.section,
                "branch": student.branch,
                "date": leave.date.strftime("%d %b %Y"),
                "subject": leave.subject,
                "time_slot": leave.time_slot,
                "reason": leave.reason,
                "status": leave.status,
                "applied_at": leave.applied_at
            }
        }, status=status.HTTP_201_CREATED)

    status_filter = request.GET.get("status", "All")
    student_id = request.GET.get("student_id")

    leaves_qs = Leave.objects.select_related("student").all()

    if student_id:
        leaves_qs = leaves_qs.filter(student_id=student_id)

    if status_filter and status_filter != "All":
        leaves_qs = leaves_qs.filter(status__iexact=status_filter)

    data = []
    for lv in leaves_qs:
        data.append({
            "id": lv.id,
            "student_id": lv.student.id,
            "student_name": lv.student.name,
            "roll_number": lv.student.roll_number,
            "section": lv.student.section,
            "branch": lv.student.branch,
            "semester": lv.student.semester,
            "email": lv.student.email or "",
            "phone": lv.student.phone or "",
            "date": lv.date.strftime("%d %b"),
            "full_date": lv.date.strftime("%d %b %Y"),
            "raw_date": str(lv.date),
            "subject": lv.subject or "All Subjects",
            "time_slot": lv.time_slot or "Full Day",
            "reason": lv.reason,
            "status": lv.status,
            "applied_at": lv.applied_at,
            "reviewed_by": lv.reviewed_by or "—",
            "review_remarks": lv.review_remarks or "—",
        })

    return Response(data)


@api_view(["POST"])
def leave_action(request, leave_id):
    leave = get_object_or_404(Leave, id=leave_id)
    action_type = str(request.data.get("action") or "").strip().lower()
    reviewer = str(request.data.get("reviewer") or "Teacher").strip()
    remarks = str(request.data.get("remarks") or "").strip()

    if action_type not in ["approve", "reject"]:
        return Response(
            {"error": "Action must be 'approve' or 'reject'"},
            status=status.HTTP_400_BAD_REQUEST
        )

    new_status = "Approved" if action_type == "approve" else "Rejected"
    leave.status = new_status
    leave.reviewed_by = reviewer
    if remarks:
        leave.review_remarks = remarks
    leave.save()

    return Response({
        "message": f"Leave request marked as {new_status} successfully",
        "leave": {
            "id": leave.id,
            "status": leave.status,
            "reviewed_by": leave.reviewed_by,
            "review_remarks": leave.review_remarks,
        }
    }, status=status.HTTP_200_OK)


@api_view(["GET"])
def pending_leaves_count(request):
    count = Leave.objects.filter(status="Pending").count()
    return Response({"pending_count": count})
