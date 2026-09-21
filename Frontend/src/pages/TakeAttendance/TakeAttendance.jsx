import AppLayout from '../../components/AppLayout/AppLayout'
import './TakeAttendance.css'

function TakeAttendance({ onNavigate }) {
  return (
    <AppLayout activePage="Take Attendance" onNavigate={onNavigate}>
      <section className="page-body take-attendance-page">
        <div className="attendance-camera">
          <span className="recognized-badge">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="m7 12 3 3 7-7" />
            </svg>
            RECOGNIZED
          </span>
          <div className="attendance-face-box"></div>
        </div>

        <aside className="page-card attendance-result-card">
          <p className="attendance-success">
            <span>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="m6 12 4 4 8-8" />
              </svg>
            </span>
            Attendance Marked
          </p>
          <h1>Rahul Verma</h1>
          <p>Roll No: 102</p>
          <p>Time: 31 July 2025, 09:15:32 AM</p>
        </aside>

        <button className="start-attendance-button" type="button">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M15 19a6 6 0 0 0-12 0" />
            <circle cx="9" cy="8" r="4" />
            <path d="M19 8v6" />
            <path d="M16 11h6" />
          </svg>
          Start Attendance
        </button>

        <p className="attendance-note">
          <span>i</span>
          Look at the camera for attendance. Multiple faces are not allowed.
        </p>
      </section>
    </AppLayout>
  )
}

export default TakeAttendance
