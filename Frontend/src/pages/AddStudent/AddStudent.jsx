import { useState } from 'react'
import AppLayout from '../../components/AppLayout/AppLayout'
import './AddStudent.css'

const fields = [
  ['Full Name', 'name', 'Enter full name', false],
  ['Section', 'section', 'Enter section', false],
  ['Roll Number', 'roll_number', 'Enter roll number', false],
  ['Email (Optional)', 'email', 'Enter email', true],
  ['Branch', 'branch', 'Enter branch', false],
  ['Phone (Optional)', 'phone', 'Enter phone number', true],
  ['Semester', 'semester', 'Enter semester', false],
]

function AddStudent({ onNavigate }) {
  const [formData, setFormData] = useState({
    name: '',
    section: '',
    roll_number: '',
    email: '',
    branch: '',
    phone: '',
    semester: '',
  })

  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (event) => {
    const { name, value } = event.target

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    setMessage('')
    setError('')
    setLoading(true)

    try {
      const response = await fetch(
        'http://127.0.0.1:8000/api/students/add/',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Student add nahi hua')
      }

      setMessage('Student added successfully!')

      setFormData({
        name: '',
        section: '',
        roll_number: '',
        email: '',
        branch: '',
        phone: '',
        semester: '',
      })
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AppLayout activePage="Add Student" onNavigate={onNavigate}>
      <section className="page-body add-student-page">

        <form
          className="page-card add-student-card"
          onSubmit={handleSubmit}
        >
          <h1>Add New Student</h1>

          <div className="student-form-grid">

            {fields.map(([label, name, placeholder, optional]) => (
              <label className="student-field" key={name}>
                <span>
                  {label}
                  {!optional && (
                    <span style={{ color: 'red' }}> *</span>
                  )}
                </span>

                <input
                  type="text"
                  name={name}
                  value={formData[name]}
                  onChange={handleChange}
                  placeholder={placeholder}
                  required={!optional}
                />
              </label>
            ))}

            <button
              className="add-student-button"
              type="submit"
              disabled={loading}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M15 19a6 6 0 0 0-12 0" />
                <circle cx="9" cy="8" r="4" />
                <path d="M19 8v6" />
                <path d="M16 11h6" />
              </svg>

              {loading ? 'Adding...' : 'Add Student'}
            </button>

          </div>

          {message && (
            <p style={{ color: 'green', fontWeight: 'bold' }}>
              {message}
            </p>
          )}

          {error && (
            <p style={{ color: 'red', fontWeight: 'bold' }}>
              {error}
            </p>
          )}

        </form>

        <aside className="page-card student-tip-card">
          <div className="student-scan-icon">
            <span></span>
          </div>

          <p>
            Make sure to enter accurate details for better face recognition.
          </p>
        </aside>

      </section>
    </AppLayout>
  )
}

export default AddStudent
