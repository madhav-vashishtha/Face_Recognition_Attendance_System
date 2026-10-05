import { useEffect, useMemo, useState } from 'react'
import AppLayout from '../../components/AppLayout/AppLayout'
import './StudentList.css'

function StudentList({ onNavigate }) {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [section, setSection] = useState('All Sections')
  const [branch, setBranch] = useState('All Branches')
  const [semester, setSemester] = useState('All Semesters')

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true)
        setError('')

        const response = await fetch(
          'http://127.0.0.1:8000/api/students/'
        )

        if (!response.ok) {
          throw new Error('Unable to load students.')
        }

        const data = await response.json()

        setStudents(data)
      } catch (error) {
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }

    fetchStudents()
  }, [])

  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  const getUniqueOptions = (field) => {
    return [
      ...new Set(
        students
          .map((student) => student[field])
          .filter(Boolean)
      ),
    ].sort()
  }

  const sections = getUniqueOptions('section')
  const branches = getUniqueOptions('branch')
  const semesters = getUniqueOptions('semester')

  const filteredStudents = useMemo(() => {
    const query = search.trim().toLowerCase()

    return students.filter((student) => {
      const matchesSearch =
        !query ||
        student.name?.toLowerCase().includes(query) ||
        student.roll_number?.toLowerCase().includes(query)

      const matchesSection =
        section === 'All Sections' ||
        student.section === section

      const matchesBranch =
        branch === 'All Branches' ||
        student.branch === branch

      const matchesSemester =
        semester === 'All Semesters' ||
        student.semester === semester

      return (
        matchesSearch &&
        matchesSection &&
        matchesBranch &&
        matchesSemester
      )
    })
  }, [
    students,
    search,
    section,
    branch,
    semester,
  ])

  useEffect(() => {
    setCurrentPage(1)
  }, [search, section, branch, semester])

  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / pageSize))
  const paginatedStudents = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredStudents.slice(start, start + pageSize)
  }, [filteredStudents, currentPage, pageSize])

  const getInitial = (name) => {
    return name?.trim()?.charAt(0)?.toUpperCase() || '?'
  }

  const getAvatarTone = (index) => {
    const tones = [
      'blue',
      'purple',
      'green',
      'orange',
      'violet',
    ]

    return tones[index % tones.length]
  }

  return (
    <AppLayout
      activePage="Student List"
      onNavigate={onNavigate}
    >
      <section className="page-body student-list-page">
        <div className="student-list-header">
          <div>
            <h1>Student List</h1>
            <p>
              Manage all registered students in the system.
            </p>
          </div>

          <button
            className="student-list-add"
            type="button"
            onClick={() => onNavigate('Add Student')}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 5v14" />
              <path d="M5 12h14" />
            </svg>
            Add Student
          </button>
        </div>

        <div className="student-list-filters">
          <label className="student-search">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="11" cy="11" r="7" />
              <path d="m16 16 4 4" />
            </svg>
            <input
              type="search"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value)
              }}
              placeholder="Search by name or roll number..."
            />
          </label>

          <select
            value={section}
            onChange={(event) => setSection(event.target.value)}
          >
            <option>All Sections</option>
            {sections.map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>

          <select
            value={branch}
            onChange={(event) => setBranch(event.target.value)}
          >
            <option>All Branches</option>
            {branches.map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>

          <select
            value={semester}
            onChange={(event) => setSemester(event.target.value)}
          >
            <option>All Semesters</option>
            {semesters.map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
        </div>

        <div className="student-list-card">
          <div className="student-list-summary">
            <div className="student-list-summary__icon">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M16 19a4 4 0 0 0-8 0" />
                <circle cx="12" cy="9" r="3" />
                <path d="M22 19a4 4 0 0 0-5-3.9" />
                <path d="M2 19a4 4 0 0 1 5-3.9" />
              </svg>
            </div>

            <div>
              <span>Total Students</span>
              <strong>{filteredStudents.length}</strong>
            </div>
          </div>

          {loading && (
            <div className="student-list-state">
              Loading students...
            </div>
          )}

          {error && (
            <div className="student-list-state student-list-state--error">
              {error}
            </div>
          )}

          {!loading && !error && filteredStudents.length === 0 && (
            <div className="student-list-state">
              No students found.
            </div>
          )}

          {!loading && !error && filteredStudents.length > 0 && (
            <div className="student-list-table-wrap">
              <table className="student-list-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Roll No.</th>
                    <th>Section</th>
                    <th>Branch</th>
                    <th>Semester</th>
                    <th>Phone</th>
                    <th>Email</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {paginatedStudents.map((student, index) => {
                    const attendance =
                      student.attendance_percentage || 0

                    return (
                      <tr key={student.id}>
                        <td>
                          <div className="student-name-cell">
                            <span
                              className={
                                'student-avatar ' +
                                `student-avatar--${getAvatarTone(index)}`
                              }
                            >
                              {getInitial(student.name)}
                            </span>
                            {student.name}
                          </div>
                        </td>
                        <td>{student.roll_number}</td>
                        <td>{student.section}</td>
                        <td>{student.branch}</td>
                        <td>{student.semester}</td>
                        <td>{student.phone || '-'}</td>
                        <td>{student.email || '-'}</td>
                       
                        <td>
                          <button
                            className="student-detail-button"
                            type="button"
                            onClick={() => onNavigate('Student Details', student.id)}
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          <div className="student-list-footer">
            <span>
              Showing {filteredStudents.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} -{' '}
              {Math.min(currentPage * pageSize, filteredStudents.length)} of {filteredStudents.length} students
            </span>

            <div className="student-list-pagination">
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                aria-label="Previous page"
              >
                ‹
              </button>
              <strong>{currentPage}</strong>
              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                aria-label="Next page"
              >
                ›
              </button>
            </div>
          </div>
        </div>
      </section>
    </AppLayout>
  )
}

export default StudentList
