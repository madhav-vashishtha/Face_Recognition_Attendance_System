import AppLayout from '../../components/AppLayout/AppLayout'
import './Dashboard.css'

const stats = [
  {
    label: 'Total Students',
    value: '120',
    link: 'View all students',
    tone: 'purple',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M16 19a4 4 0 0 0-8 0" />
        <circle cx="12" cy="9" r="3" />
        <path d="M22 19a4 4 0 0 0-5-3.9" />
        <path d="M2 19a4 4 0 0 1 5-3.9" />
      </svg>
    ),
  },
  {
    label: 'Present Today',
    value: '89',
    link: 'View attendance',
    tone: 'green',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="4" y="5" width="16" height="16" rx="2" />
        <path d="M8 3v4" />
        <path d="M16 3v4" />
        <path d="M4 10h16" />
        <path d="m8 15 2.5 2.5L16 12" />
      </svg>
    ),
  },
  {
    label: 'Absent Today',
    value: '31',
    link: 'View absence',
    tone: 'red',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M6 6l12 12" />
        <path d="M18 6 6 18" />
      </svg>
    ),
  },
  {
    label: 'Attendance %',
    value: '74.17%',
    link: 'View report',
    tone: 'blue',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="4" y="5" width="16" height="16" rx="2" />
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

const attendanceRows = [
  ['Anjali Sharma', '101', '09:02:15 AM', 'Present'],
  ['Rahul Verma', '102', '09:03:41 AM', 'Present'],
  ['Priya Singh', '103', '09:04:22 AM', 'Present'],
  ['Aditya Kumar', '104', '09:05:18 AM', 'Present'],
  ['Neha Gupta', '105', '09:06:33 AM', 'Present'],
]

function StatCard({ stat }) {
  return (
    <article className="stat-card">
      <div className={`stat-card__icon stat-card__icon--${stat.tone}`}>
        {stat.icon}
      </div>
      <div className="stat-card__content">
        <span>{stat.label}</span>
        <strong>{stat.value}</strong>
      </div>
      <a href="#">{stat.link} →</a>
    </article>
  )
}

function Dashboard({ onNavigate }) {
  return (
    <AppLayout activePage="Dashboard" onNavigate={onNavigate}>
          <section className="page-body dashboard-body">
            <div className="dashboard-header">
              <div>
                <h1>Welcome back, Admin 👋</h1>
                <p>Here's what's happening today.</p>
              </div>
              <div className="date-card">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <rect x="4" y="5" width="16" height="16" rx="2" />
                  <path d="M8 3v4" />
                  <path d="M16 3v4" />
                  <path d="M4 10h16" />
                  <path d="M8 14h3" />
                  <path d="M13 14h3" />
                </svg>
                <div>
                  <strong>31 July 2025</strong>
                  <span>Thursday</span>
                </div>
              </div>
            </div>

            <div className="stats-grid">
              {stats.map((stat) => (
                <StatCard stat={stat} key={stat.label} />
              ))}
            </div>

            <div className="dashboard-panels">
              <section className="dashboard-panel dashboard-panel--table">
                <div className="panel-title">
                  <h3>Today's Attendance</h3>
                  <a href="#">View All</a>
                </div>
                <table className="attendance-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Roll No.</th>
                      <th>Time</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendanceRows.map(([name, roll, time, status]) => (
                      <tr key={roll}>
                        <td>{name}</td>
                        <td>{roll}</td>
                        <td>{time}</td>
                        <td>
                          <span className="status-badge">{status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>

              <section className="dashboard-panel dashboard-panel--overview">
                <h3>Attendance Overview</h3>
                <div className="overview-content">
                  <div className="attendance-donut">
                    <strong>74.17%</strong>
                    <span>Present</span>
                  </div>
                  <div className="overview-legend">
                    <p>
                      <i className="overview-legend__dot overview-legend__dot--green"></i>
                      <span>Present -<br />89 (74.17%)</span>
                    </p>
                    <p>
                      <i className="overview-legend__dot overview-legend__dot--red"></i>
                      <span>Absent -<br />31 (25.83%)</span>
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
