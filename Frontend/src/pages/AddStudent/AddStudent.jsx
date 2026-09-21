import AppLayout from '../../components/AppLayout/AppLayout'
import './AddStudent.css'

const fields = [
  ['Full Name', 'Enter full name'],
  ['Section', 'Enter section'],
  ['Roll Number', 'Enter roll number'],
  ['Email (Optional)', 'Enter email'],
  ['Branch', 'Enter branch'],
  ['Phone (Optional)', 'Enter phone number'],
  ['Semester', 'Enter semester'],
]

function AddStudent({ onNavigate }) {
  return (
    <AppLayout activePage="Add Student" onNavigate={onNavigate}>
      <section className="page-body add-student-page">
        <form className="page-card add-student-card">
          <h1>Add New Student</h1>
          <div className="student-form-grid">
            {fields.map(([label, placeholder]) => (
              <label className="student-field" key={label}>
                <span>{label}</span>
                <input placeholder={placeholder} type="text" />
              </label>
            ))}
            <button className="add-student-button" type="button">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M15 19a6 6 0 0 0-12 0" />
                <circle cx="9" cy="8" r="4" />
                <path d="M19 8v6" />
                <path d="M16 11h6" />
              </svg>
              Add Student
            </button>
          </div>
        </form>

        <aside className="page-card student-tip-card">
          <div className="student-scan-icon">
            <span></span>
          </div>
          <p>Make sure to enter accurate details for better face recognition.</p>
        </aside>
      </section>
    </AppLayout>
  )
}

export default AddStudent
