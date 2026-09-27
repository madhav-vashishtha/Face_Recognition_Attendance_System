import { useEffect, useState } from 'react'
import AppLayout from '../../components/AppLayout/AppLayout'
import './Dashboard.css'


function Dashboard({ onNavigate }) {

  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')


  // =========================
  // Fetch Dashboard Data
  // =========================

  useEffect(() => {

    const fetchDashboardData = async () => {

      try {

        setLoading(true)
        setError('')

        const response = await fetch(
          'http://127.0.0.1:8000/api/dashboard/'
        )

        if (!response.ok) {
          throw new Error(
            'Unable to load dashboard data.'
          )
        }

        const data = await response.json()

        setDashboardData(data)

      } catch (error) {

        console.error(
          'Dashboard error:',
          error
        )

        setError(
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
    dashboardData.today_attendance


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
  // Stats
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
  // Component
  // =========================

  function StatCard({ stat }) {

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

        <a href="#">
          {stat.link} →
        </a>

      </article>

    )

  }


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
                          {attendance.time}
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
