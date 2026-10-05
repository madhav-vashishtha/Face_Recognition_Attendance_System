import { useEffect, useState } from 'react'
import AppLayout from '../../components/AppLayout/AppLayout'
import './Dashboard.css'


function Dashboard({ onNavigate }) {

  const [dashboardData, setDashboardData] = useState(null)
  const [todayTimetable, setTodayTimetable] = useState([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')


  // =========================
  // Fetch Dashboard + Timetable
  // =========================

  useEffect(() => {

    const fetchDashboardData = async () => {

      try {

        setLoading(true)
        setError('')

        const [
          dashboardResponse,
          timetableResponse
        ] = await Promise.all([

          fetch(
            'http://127.0.0.1:8000/api/dashboard/'
          ),

          fetch(
            'http://127.0.0.1:8000/api/timetable/today/'
          ),

        ])


        if (!dashboardResponse.ok) {
          throw new Error(
            'Unable to load dashboard data.'
          )
        }


        if (!timetableResponse.ok) {
          throw new Error(
            'Unable to load today timetable.'
          )
        }


        const dashboard =
          await dashboardResponse.json()

        const timetable =
          await timetableResponse.json()


        setDashboardData(dashboard)

        setTodayTimetable(
          timetable.timetable || []
        )


      } catch (error) {

        console.error(
          'Dashboard error:',
          error
        )

        setError(
          error.message ||
          'Unable to load dashboard data.'
        )


      } finally {

        setLoading(false)

      }

    }


    fetchDashboardData()

  }, [])


  // =========================
  // Loading
  // =========================

  if (loading) {

    return (
      <AppLayout
        activePage="Dashboard"
        onNavigate={onNavigate}
      >

        <section className="page-body dashboard-body">

          <div className="dashboard-loading">
            Loading dashboard...
          </div>

        </section>

      </AppLayout>
    )

  }


  // =========================
  // Error
  // =========================

  if (error || !dashboardData) {

    return (
      <AppLayout
        activePage="Dashboard"
        onNavigate={onNavigate}
      >

        <section className="page-body dashboard-body">

          <div className="dashboard-error">
            {error || 'Unable to load dashboard.'}
          </div>

        </section>

      </AppLayout>
    )

  }


  // =========================
  // Format Time - 12 Hour
  // =========================

  const formatTime = (time) => {

    if (!time) {
      return '-'
    }


    const parts = time.split(':')

    const hours = Number(parts[0])
    const minutes = parts[1] || '00'
    const seconds = parts[2] || '00'


    const hour12 =
      hours % 12 || 12


    const period =
      hours >= 12 ? 'PM' : 'AM'


    return (
      `${String(hour12).padStart(2, '0')}:` +
      `${minutes}:` +
      `${seconds.split('.')[0]} ` +
      `${period}`
    )

  }


  // =========================
  // Convert Time To Minutes
  // =========================

  const timeToMinutes = (time) => {

    if (!time) {
      return 0
    }


    const [hours, minutes] =
      time.split(':').map(Number)


    return (
      hours * 60 +
      minutes
    )

  }


  // =========================
  // Get Lecture Status
  // =========================

  const getLectureStatus = (
    startTime,
    endTime
  ) => {

    const now = new Date()

    const currentMinutes =
      now.getHours() * 60 +
      now.getMinutes()


    const startMinutes =
      timeToMinutes(startTime)


    const endMinutes =
      timeToMinutes(endTime)


    if (
      currentMinutes >= startMinutes &&
      currentMinutes < endMinutes
    ) {

      return 'Live'

    }


    if (currentMinutes >= endMinutes) {

      return 'Completed'

    }


    return 'Upcoming'

  }


  // =========================
  // Data
  // =========================

  const totalStudents =
    dashboardData.total_students


  const presentToday =
    dashboardData.present_today


  const absentToday =
    dashboardData.absent_today


  const attendancePercentage =
    dashboardData.attendance_percentage


  const attendanceRows =
    dashboardData.today_attendance || []


  // =========================
  // Date
  // =========================

  const today = new Date()


  const formattedDate =
    today.toLocaleDateString(
      'en-IN',
      {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }
    )


  const formattedDay =
    today.toLocaleDateString(
      'en-IN',
      {
        weekday: 'long',
      }
    )


  // =========================
  // Statistics
  // =========================

  const stats = [

    {
      label: 'Total Students',

      value: totalStudents,

      link: 'View all students',

      tone: 'purple',

      icon: (
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
        >

          <path d="M16 19a4 4 0 0 0-8 0" />

          <circle
            cx="12"
            cy="9"
            r="3"
          />

          <path d="M22 19a4 4 0 0 0-5-3.9" />

          <path d="M2 19a4 4 0 0 1 5-3.9" />

        </svg>
      ),
    },


    {
      label: 'Present Today',

      value: presentToday,

      link: 'View attendance',

      tone: 'green',

      icon: (
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
        >

          <rect
            x="4"
            y="5"
            width="16"
            height="16"
            rx="2"
          />

          <path d="M8 3v4" />

          <path d="M16 3v4" />

          <path d="M4 10h16" />

          <path d="m8 15 2.5 2.5L16 12" />

        </svg>
      ),
    },


    {
      label: 'Absent Today',

      value: absentToday,

      link: 'View absence',

      tone: 'red',

      icon: (
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
        >

          <path d="M6 6l12 12" />

          <path d="M18 6 6 18" />

        </svg>
      ),
    },


    {
      label: 'Attendance %',

      value: `${attendancePercentage}%`,

      link: 'View attendance',

      tone: 'blue',

      icon: (
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
        >

          <rect
            x="4"
            y="5"
            width="16"
            height="16"
            rx="2"
          />

          <path d="M8 3v4" />

          <path d="M16 3v4" />

          <path d="M4 10h16" />

          <path d="M8 14h3" />

          <path d="M13 14h3" />

          <path d="M8 17h3" />

          <path d="M13 17h3" />

        </svg>
      ),
    },

  ]


  // =========================
  // Stat Card
  // =========================

  function StatCard({ stat }) {

    const handleClick = (event) => {

      event.preventDefault()


      if (
        stat.label === 'Total Students'
      ) {

        onNavigate('Add Student')

      }


      if (
        stat.label === 'Present Today' ||
        stat.label === 'Attendance %'
      ) {

        onNavigate('Take Attendance')

      }

    }


    return (

      <article className="stat-card">

        <div
          className={
            `stat-card__icon stat-card__icon--${stat.tone}`
          }
        >

          {stat.icon}

        </div>


        <div className="stat-card__content">

          <span>
            {stat.label}
          </span>

          <strong>
            {stat.value}
          </strong>

        </div>


        <a
          href="#"
          onClick={handleClick}
        >
          {stat.link} →
        </a>

      </article>

    )

  }


  // =========================
  // Dashboard
  // =========================

  return (

    <AppLayout
      activePage="Dashboard"
      onNavigate={onNavigate}
    >

      <section className="page-body dashboard-body">


        {/* =========================
            Dashboard Header
        ========================= */}

        <div className="dashboard-header">

          <div>

            <h1>
              Welcome back, Admin 👋
            </h1>

            <p>
              Here's what's happening today.
            </p>

          </div>


          <div className="date-card">

            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
            >

              <rect
                x="4"
                y="5"
                width="16"
                height="16"
                rx="2"
              />

              <path d="M8 3v4" />

              <path d="M16 3v4" />

              <path d="M4 10h16" />

              <path d="M8 14h3" />

              <path d="M13 14h3" />

            </svg>


            <div>

              <strong>
                {formattedDate}
              </strong>

              <span>
                {formattedDay}
              </span>

            </div>

          </div>

        </div>


        {/* =========================
            Statistics
        ========================= */}

        <div className="stats-grid">

          {stats.map((stat) => (

            <StatCard
              stat={stat}
              key={stat.label}
            />

          ))}

        </div>


        {/* =========================
    Today's Timetable
========================= */}

        <section className="dashboard-panel today-timetable-panel">

          <div className="today-timetable-header">

            <div className="today-timetable-title">

              <div className="today-timetable-icon">
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <rect
                    x="4"
                    y="5"
                    width="16"
                    height="16"
                    rx="2"
                  />

                  <path d="M8 3v4" />

                  <path d="M16 3v4" />

                  <path d="M4 10h16" />

                  <path d="M8 14h3" />

                  <path d="M13 14h3" />

                  <path d="M8 17h3" />

                  <path d="M13 17h3" />
                </svg>
              </div>

              <div>
                <h3>
                  Today's Timetable
                </h3>

                <p>
                  {formattedDay}, {formattedDate}
                </p>
              </div>

            </div>


            <div className="today-timetable-count">
              <strong>
                {todayTimetable.length}
              </strong>

              <span>
                Lectures
              </span>
            </div>

          </div>


          {todayTimetable.length === 0 ? (

            <div className="empty-timetable">

              <div className="empty-timetable-icon">
                📅
              </div>

              <strong>
                No lectures scheduled today
              </strong>

              <span>
                There is no timetable available for today.
              </span>

            </div>

          ) : (

            <div className="timetable-list">

              {todayTimetable.map((lecture) => {

                const lectureStatus =
                  getLectureStatus(
                    lecture.start_time,
                    lecture.end_time
                  )


                return (

                  <div
                    className={
                      `timetable-row ${lectureStatus === 'Live'
                        ? 'timetable-row--live'
                        : ''
                      }`
                    }
                    key={lecture.id}
                  >

                    {/* Time */}

                    <div className="timetable-time">

                      <strong>
                        {formatTime(
                          lecture.start_time
                        )}
                      </strong>

                      <span>
                        to
                      </span>

                      <strong>
                        {formatTime(
                          lecture.end_time
                        )}
                      </strong>

                    </div>


                    {/* Subject */}

                    <div className="timetable-subject">

                      <strong>
                        {lecture.subject}
                      </strong>

                      <span>
                        Section {lecture.section}

                        {lecture.room
                          ? ` • Room ${lecture.room}`
                          : ''
                        }
                      </span>

                    </div>


                    {/* Teacher */}

                    <div className="timetable-teacher">

                      <span>
                        Faculty
                      </span>

                      <strong>
                        {lecture.teacher_name ||
                          'Not specified'}
                      </strong>

                    </div>


                    {/* Status */}

                    <div
                      className={
                        `timetable-status timetable-status--${lectureStatus.toLowerCase()}`
                      }
                    >

                      {lectureStatus === 'Live' && (
                        <span className="live-dot"></span>
                      )}

                      {lectureStatus}

                    </div>


                    {/* Action */}

                    <div className="timetable-action">

                      {lectureStatus === 'Live' && (

                        <button
                          type="button"
                          className="timetable-start-btn"
                          onClick={() => {
                            onNavigate('Take Attendance')
                          }}
                        >
                          Start Attendance →
                        </button>

                      )}

                    </div>

                  </div>

                )

              })}

            </div>

          )}

        </section>


        {/* =========================
            Dashboard Panels
        ========================= */}

        <div className="dashboard-panels">


          {/* =========================
              Today's Attendance
          ========================= */}

          <section
            className={
              'dashboard-panel dashboard-panel--table'
            }
            style={{marginTop:'1rem'}}
          >

            <div className="panel-title">

              <h3>
                Today's Attendance
              </h3>

              <span>
                Today
              </span>

            </div>


            {attendanceRows.length === 0 ? (

              <div className="empty-attendance">

                No attendance marked today.

              </div>

            ) : (

              <table className="attendance-table">

                <thead>

                  <tr>

                    <th>
                      Name
                    </th>

                    <th>
                      Roll No.
                    </th>

                    <th>
                      Subject
                    </th>

                    <th>
                      Section
                    </th>

                    <th>
                      Time
                    </th>

                    <th>
                      Status
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {attendanceRows.map(
                    (attendance) => (

                      <tr
                        key={attendance.id}
                      >

                        <td>
                          {attendance.name}
                        </td>

                        <td>
                          {attendance.roll_number}
                        </td>

                        <td>
                          {attendance.subject}
                        </td>

                        <td>
                          {attendance.section}
                        </td>

                        <td>

                          {formatTime(
                            attendance.start_time
                          )}

                          {' - '}

                          {formatTime(
                            attendance.end_time
                          )}

                        </td>

                        <td>

                          <span
                            className="status-badge"
                          >
                            {attendance.status}
                          </span>

                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            )}

          </section>


          {/* =========================
              Attendance Overview
          ========================= */}

          <section
            className={
              'dashboard-panel dashboard-panel--overview'
            }
            style={{marginTop:'1rem'}}
          >

            <h3>
              Attendance Overview
            </h3>


            <div className="overview-content">


              {/* Donut */}

              <div
                className="attendance-donut"
                style={{
                  '--attendance':
                    `${attendancePercentage * 3.6}deg`,
                }}
              >

                <strong>
                  {attendancePercentage}%
                </strong>

                <span>
                  Present
                </span>

              </div>


              {/* Legend */}

              <div className="overview-legend">

                <p>

                  <i
                    className={
                      'overview-legend__dot ' +
                      'overview-legend__dot--green'
                    }
                  ></i>

                  <span>

                    Present -
                    <br />

                    {presentToday} (
                    {attendancePercentage}
                    %)

                  </span>

                </p>


                <p>

                  <i
                    className={
                      'overview-legend__dot ' +
                      'overview-legend__dot--red'
                    }
                  ></i>

                  <span>

                    Absent -
                    <br />

                    {absentToday} (

                    {totalStudents > 0
                      ? (
                        100 -
                        attendancePercentage
                      ).toFixed(2)
                      : '0.00'}

                    %)

                  </span>

                </p>

              </div>

            </div>

          </section>

        </div>

      </section>

    </AppLayout>

  )

}


export default Dashboard