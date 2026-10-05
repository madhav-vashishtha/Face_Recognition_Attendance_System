from datetime import time

from django.core.management.base import BaseCommand

from attendance.models import Timetable


class Command(BaseCommand):

    help = "Load the official CSE Section A Odd Semester 2026-27 timetable"


    def handle(self, *args, **options):

        self.stdout.write(
            self.style.WARNING(
                "Clearing old timetable entries..."
            )
        )

        # Remove previously loaded timetable entries
        Timetable.objects.all().delete()


        # =========================================================
        # COMMON INFORMATION FROM COLLEGE TIMETABLE
        # =========================================================

        branch = "CSE"

        section = "A"

        semester = "Odd Semester 2026-2027"

        room = "A007"

        late_after_minutes = 10


        # =========================================================
        # FACULTY NAMES
        # =========================================================

        KK = "MR. KULDEEP KUMAR"

        NAK = "DR. NASEEM AHAMAD KHAN"

        HEM = "MS. HEMLATA CHAUDHRY"

        ALG = "MR. ALOK GUPTA"

        SHS = "MS. SHIVANI SARSWAT"

        GDS = "MR. GAGANDEEP SINGH"

        FZN = "DR. FAIZAN NASIR"


        # =========================================================
        # TIME SLOTS
        # =========================================================

        T1_START = time(9, 0)
        T1_END = time(9, 50)

        T2_START = time(9, 50)
        T2_END = time(10, 40)

        T3_START = time(10, 40)
        T3_END = time(11, 30)

        T4_START = time(11, 30)
        T4_END = time(12, 20)

        T6_START = time(13, 10)
        T6_END = time(14, 0)

        T7_START = time(14, 0)
        T7_END = time(14, 50)

        T8_START = time(14, 50)
        T8_END = time(15, 40)


        # =========================================================
        # TIMETABLE DATA
        #
        # Day:
        # 0 = Monday
        # 1 = Tuesday
        # 2 = Wednesday
        # 3 = Thursday
        # 4 = Friday
        # 5 = Saturday
        #
        # Lunch 12:20 - 1:10 is intentionally not stored.
        # =========================================================

        timetable_data = [

            # =====================================================
            # MONDAY
            # =====================================================

            {
                "day_of_week": 0,
                "subject": "COA",
                "start_time": T1_START,
                "end_time": T1_END,
                "teacher_name": KK,
            },

            {
                "day_of_week": 0,
                "subject": "MATHS 4",
                "start_time": T2_START,
                "end_time": T2_END,
                "teacher_name": NAK,
            },

            {
                "day_of_week": 0,
                "subject": "DSTL",
                "start_time": T3_START,
                "end_time": T3_END,
                "teacher_name": HEM,
            },

            {
                "day_of_week": 0,
                "subject": "DS",
                "start_time": T4_START,
                "end_time": T4_END,
                "teacher_name": ALG,
            },

            {
                "day_of_week": 0,
                "subject": "UHV",
                "start_time": T6_START,
                "end_time": T6_END,
                "teacher_name": SHS,
            },

            {
                "day_of_week": 0,
                "subject": "CS",
                "start_time": T7_START,
                "end_time": T7_END,
                "teacher_name": GDS,
            },

            {
                "day_of_week": 0,
                "subject": "MINI PROJECT",
                "start_time": T8_START,
                "end_time": T8_END,
                "teacher_name": FZN,
            },


            # =====================================================
            # TUESDAY
            # =====================================================

            {
                "day_of_week": 1,
                "subject": "COA",
                "start_time": T1_START,
                "end_time": T1_END,
                "teacher_name": KK,
            },

            {
                "day_of_week": 1,
                "subject": "MATHS 4",
                "start_time": T2_START,
                "end_time": T2_END,
                "teacher_name": NAK,
            },

            {
                "day_of_week": 1,
                "subject": "DSTL",
                "start_time": T3_START,
                "end_time": T3_END,
                "teacher_name": HEM,
            },

            {
                "day_of_week": 1,
                "subject": "DS",
                "start_time": T4_START,
                "end_time": T4_END,
                "teacher_name": ALG,
            },

            {
                "day_of_week": 1,
                "subject": "UHV",
                "start_time": T6_START,
                "end_time": T6_END,
                "teacher_name": SHS,
            },

            {
                "day_of_week": 1,
                "subject": "CS",
                "start_time": T7_START,
                "end_time": T7_END,
                "teacher_name": GDS,
            },

            {
                "day_of_week": 1,
                "subject": "MINI PROJECT",
                "start_time": T8_START,
                "end_time": T8_END,
                "teacher_name": FZN,
            },


            # =====================================================
            # WEDNESDAY
            # =====================================================

            {
                "day_of_week": 2,
                "subject": "COA",
                "start_time": T1_START,
                "end_time": T1_END,
                "teacher_name": KK,
            },

            {
                "day_of_week": 2,
                "subject": "MATHS 4",
                "start_time": T2_START,
                "end_time": T2_END,
                "teacher_name": NAK,
            },

            {
                "day_of_week": 2,
                "subject": "DSTL",
                "start_time": T3_START,
                "end_time": T3_END,
                "teacher_name": HEM,
            },

            {
                "day_of_week": 2,
                "subject": "DS",
                "start_time": T4_START,
                "end_time": T4_END,
                "teacher_name": ALG,
            },

            {
                "day_of_week": 2,
                "subject": "UHV",
                "start_time": T6_START,
                "end_time": T6_END,
                "teacher_name": SHS,
            },

            {
                "day_of_week": 2,
                "subject": "DS LAB",
                "start_time": T7_START,
                "end_time": T8_END,
                "teacher_name": ALG,
            },


            # =====================================================
            # THURSDAY
            # =====================================================

            {
                "day_of_week": 3,
                "subject": "COA",
                "start_time": T1_START,
                "end_time": T1_END,
                "teacher_name": KK,
            },

            {
                "day_of_week": 3,
                "subject": "MATHS 4",
                "start_time": T2_START,
                "end_time": T2_END,
                "teacher_name": NAK,
            },

            {
                "day_of_week": 3,
                "subject": "DSTL",
                "start_time": T3_START,
                "end_time": T3_END,
                "teacher_name": HEM,
            },

            {
                "day_of_week": 3,
                "subject": "DS",
                "start_time": T4_START,
                "end_time": T4_END,
                "teacher_name": ALG,
            },

            {
                "day_of_week": 3,
                "subject": "UHV",
                "start_time": T6_START,
                "end_time": T6_END,
                "teacher_name": SHS,
            },

            {
                "day_of_week": 3,
                "subject": "MATHS 4",
                "start_time": T7_START,
                "end_time": T7_END,
                "teacher_name": NAK,
            },

            {
                "day_of_week": 3,
                "subject": "CS",
                "start_time": T8_START,
                "end_time": T8_END,
                "teacher_name": GDS,
            },


            # =====================================================
            # FRIDAY
            # =====================================================

            {
                "day_of_week": 4,
                "subject": "COA",
                "start_time": T1_START,
                "end_time": T1_END,
                "teacher_name": KK,
            },

            {
                "day_of_week": 4,
                "subject": "MATHS 4",
                "start_time": T2_START,
                "end_time": T2_END,
                "teacher_name": NAK,
            },

            {
                "day_of_week": 4,
                "subject": "DSTL",
                "start_time": T3_START,
                "end_time": T3_END,
                "teacher_name": HEM,
            },

            {
                "day_of_week": 4,
                "subject": "DS",
                "start_time": T4_START,
                "end_time": T4_END,
                "teacher_name": ALG,
            },

            {
                "day_of_week": 4,
                "subject": "CS",
                "start_time": T6_START,
                "end_time": T6_END,
                "teacher_name": GDS,
            },

            {
                "day_of_week": 4,
                "subject": "WD WS",
                "start_time": T7_START,
                "end_time": T8_END,
                "teacher_name": GDS,
            },


            # =====================================================
            # SATURDAY
            # =====================================================

            {
                "day_of_week": 5,
                "subject": "COA",
                "start_time": T1_START,
                "end_time": T1_END,
                "teacher_name": KK,
            },

            {
                "day_of_week": 5,
                "subject": "MATHS 4",
                "start_time": T2_START,
                "end_time": T2_END,
                "teacher_name": NAK,
            },

            {
                "day_of_week": 5,
                "subject": "DSTL",
                "start_time": T3_START,
                "end_time": T3_END,
                "teacher_name": HEM,
            },

            {
                "day_of_week": 5,
                "subject": "DS",
                "start_time": T4_START,
                "end_time": T4_END,
                "teacher_name": ALG,
            },

            {
                "day_of_week": 5,
                "subject": "COA LAB",
                "start_time": T6_START,
                "end_time": T6_END,
                "teacher_name": ALG,
            },

            {
                "day_of_week": 5,
                "subject": "CS",
                "start_time": T7_START,
                "end_time": T7_END,
                "teacher_name": GDS,
            },

            {
                "day_of_week": 5,
                "subject": "SPORTS",
                "start_time": T8_START,
                "end_time": T8_END,
                "teacher_name": None,
            },

        ]


        # =========================================================
        # CREATE TIMETABLE ENTRIES
        # =========================================================

        created_count = 0


        for entry in timetable_data:

            Timetable.objects.create(

                day_of_week=entry["day_of_week"],

                subject=entry["subject"],

                section=section,

                branch=branch,

                semester=semester,

                start_time=entry["start_time"],

                end_time=entry["end_time"],

                teacher_name=entry["teacher_name"],

                teacher=None,

                room=room,

                late_after_minutes=late_after_minutes,

                is_active=True,
            )

            created_count += 1


        # =========================================================
        # RESULT
        # =========================================================

        self.stdout.write("")

        self.stdout.write(
            self.style.SUCCESS(
                "Timetable loading complete."
            )
        )

        self.stdout.write(
            self.style.SUCCESS(
                f"Total entries created: {created_count}"
            )
        )

        self.stdout.write(
            self.style.SUCCESS(
                "Branch: CSE"
            )
        )

        self.stdout.write(
            self.style.SUCCESS(
                "Section: A"
            )
        )

        self.stdout.write(
            self.style.SUCCESS(
                "Semester: Odd Semester 2026-2027"
            )
        )

        self.stdout.write(
            self.style.SUCCESS(
                "Room: A007"
            )
        )