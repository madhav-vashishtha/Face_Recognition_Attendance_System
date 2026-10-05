import { useEffect, useState, useMemo } from 'react'
import AppLayout from '../../components/AppLayout/AppLayout'
import './StudentDetails.css'

function StudentDetails({ studentId, onNavigate }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  // Modals state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState('')

  // Attendance History filter
  const [attendanceFilter, setAttendanceFilter] = useState('All')

  // Edit form state
  const [editForm, setEditForm] = useState({
    name: '',
    roll_number: '',
    section: '',
    branch: '',
    semester: '',
    email: '',
    phone: '',
  })

  // Leave form state
  const [leaveForm, setLeaveForm] = useState({
    date: new Date().toISOString().split('T')[0],
    reason: 'Medical Leave',
    status: 'Approved',
  })

  // Fetch student details from Backend API
  const fetchStudentData = async (id) => {
    try {
      setLoading(true)
      setError('')

      let targetId = id

      // If no id was passed, fetch the list of students first to get an ID
      if (!targetId) {
        const listRes = await fetch('http://127.0.0.1:8000/api/students/')
        if (!listRes.ok) throw new Error('Failed to load students.')
        const students = await listRes.json()
        if (students && students.length > 0) {
          targetId = students[0].id
        } else {
          throw new Error('No students found in system.')
        }
      }

      const response = await fetch(`http://127.0.0.1:8000/api/students/${targetId}/`)
      if (!response.ok) {
        throw new Error('Unable to load student details.')
      }

      const studentJson = await response.json()
      setData(studentJson)
      setEditForm({
        name: studentJson.student?.name || '',
        roll_number: studentJson.student?.roll_number || '',
        section: studentJson.student?.section || '',
        branch: studentJson.student?.branch || '',
        semester: studentJson.student?.semester || '',
        email: studentJson.student?.email || '',
        phone: studentJson.student?.phone || '',
      })
    } catch (err) {
      console.error('Error fetching student details:', err)
      setError(err.message || 'Error loading student details.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStudentData(studentId)
  }, [studentId])

  const showNotification = (msg) => {
    setSuccessMessage(msg)
    setTimeout(() => {
      setSuccessMessage('')
    }, 3500)
  }

  // Handle Edit Submit
  const handleEditSubmit = async (e) => {
    e.preventDefault()
    if (!data?.student?.id) return

    try {
      setIsSubmitting(true)
      setFormError('')

      const response = await fetch(`http://127.0.0.1:8000/api/students/${data.student.id}/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      })

      const resData = await response.json()
      if (!response.ok) {
        throw new Error(resData.error || 'Failed to update student.')
      }

      setData(resData)
      setIsEditModalOpen(false)
      showNotification('Student profile updated successfully!')
    } catch (err) {
      setFormError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle Delete Student
  const handleDeleteSubmit = async () => {
    if (!data?.student?.id) return

    try {
      setIsSubmitting(true)
      const response = await fetch(`http://127.0.0.1:8000/api/students/${data.student.id}/`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete student.')
      }

      setIsDeleteModalOpen(false)
      onNavigate('Student List')
    } catch (err) {
      alert(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle Apply Leave
  const handleLeaveSubmit = async (e) => {
    e.preventDefault()
    if (!data?.student?.id) return

    try {
      setIsSubmitting(true)
      setFormError('')

      const response = await fetch(`http://127.0.0.1:8000/api/students/${data.student.id}/leaves/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leaveForm),
      })

      const resData = await response.json()
      if (!response.ok) {
        throw new Error(resData.error || 'Failed to apply leave.')
      }

      setIsLeaveModalOpen(false)
      // Refetch updated student data to recalculate
      fetchStudentData(data.student.id)
      showNotification('Leave applied successfully!')
    } catch (err) {
      setFormError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle Toggle Attendance from History table
  const handleToggleAttendance = async (lectureId, newStatus) => {
    if (!data?.student?.id) return
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/students/${data.student.id}/attendance/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lecture_id: lectureId,
          status: newStatus,
        }),
      })

      if (response.ok) {
        fetchStudentData(data.student.id)
        showNotification(`Attendance marked as ${newStatus}`)
      }
    } catch (err) {
      console.error('Error toggling attendance:', err)
    }
  }

  // Filtered attendance history
  const filteredAttendance = useMemo(() => {
    if (!data?.attendance_history) return []
    if (attendanceFilter === 'All') return data.attendance_history
    return data.attendance_history.filter((item) => item.status === attendanceFilter)
  }, [data, attendanceFilter])

  const getInitial = (name) => {
    return name?.trim()?.charAt(0)?.toUpperCase() || 'S'
  }

  const student = data?.student
  const summary = data?.summary || {
    total_lectures: 0,
    present: 0,
    absent: 0,
    late: 0,
    attendance_percentage: 0,
    current_status: 'Absent',
  }

  const attendancePct = summary.attendance_percentage || 0
  const isGoodStanding = attendancePct >= 75

  return (
    <AppLayout activePage="Student Details" onNavigate={onNavigate}>
      <div className="student-details-container">
        {/* Top Notification Toast */}
        {successMessage && (
          <div className="sd-toast">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M20 6L9 17l-5-5" />
            </svg>
            <span>{successMessage}</span>
          </div>
        )}

        {/* Navigation & Actions Bar */}
        <div className="sd-action-bar">
          <button
            type="button"
            className="sd-back-btn"
            onClick={() => onNavigate('Student List')}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M19 12H5" />
              <path d="M12 19l-7-7 7-7" />
            </svg>
            Back to Student List
          </button>

          <div className="sd-header-actions">
            <button
              type="button"
              className="sd-btn sd-btn--leave"
              onClick={() => {
                setFormError('')
                setIsLeaveModalOpen(true)
              }}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <path d="M14 2v6h6" />
                <path d="M12 18v-6" />
                <path d="M9 15h6" />
              </svg>
              Apply Leave
            </button>

            <button
              type="button"
              className="sd-btn sd-btn--edit"
              onClick={() => {
                setFormError('')
                setIsEditModalOpen(true)
              }}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
              </svg>
              Edit Student
            </button>

            <button
              type="button"
              className="sd-btn sd-btn--danger"
              onClick={() => setIsDeleteModalOpen(true)}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
              Delete
            </button>
          </div>
        </div>

        {/* Loading / Error States */}
        {loading && (
          <div className="sd-state-box">
            <div className="sd-spinner"></div>
            <p>Loading student information...</p>
          </div>
        )}

        {error && (
          <div className="sd-state-box sd-state-box--error">
            <p>{error}</p>
            <button
              type="button"
              className="sd-btn sd-btn--edit"
              onClick={() => fetchStudentData(studentId)}
            >
              Try Again
            </button>
          </div>
        )}

        {/* Main Content */}
        {!loading && !error && student && (
          <>
            {/* Profile Hero Header Card */}
            <div className="sd-hero-card">
              <div className="sd-hero-main">
                <div className="sd-avatar-wrap">
                  {student.face_image ? (
                    <img
                      src={student.face_image}
                      alt={student.name}
                      className="sd-avatar-img"
                    />
                  ) : (
                    <span className="sd-avatar-fallback">
                      {getInitial(student.name)}
                    </span>
                  )}
                  {student.has_face && (
                    <span className="sd-avatar-badge" title="Face Biometric Active">
                      ✓
                    </span>
                  )}
                </div>

                <div className="sd-hero-meta">
                  <div className="sd-hero-title-row">
                    <h2>{student.name}</h2>
                    <span className="sd-pill sd-pill--roll">
                      Roll No: {student.roll_number}
                    </span>
                  </div>

                  <div className="sd-hero-tags">
                    <span className="sd-tag">
                      <strong>Section:</strong> {student.section}
                    </span>
                    <span className="sd-tag">
                      <strong>Branch:</strong> {student.branch}
                    </span>
                    <span className="sd-tag">
                      <strong>Semester:</strong> {student.semester}
                    </span>
                    <span className={`sd-badge ${student.has_face ? 'sd-badge--success' : 'sd-badge--warning'}`}>
                      {student.has_face ? '● Face Registered' : '○ Face Pending'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="sd-hero-quick-summary">
                <div className="sd-quick-stat">
                  <span className="sd-quick-stat__label">Attendance</span>
                  <strong className={`sd-quick-stat__value ${isGoodStanding ? 'sd-text--green' : 'sd-text--red'}`}>
                    {attendancePct}%
                  </strong>
                </div>
                <div className="sd-quick-divider"></div>
                <div className="sd-quick-stat">
                  <span className="sd-quick-stat__label">Lectures</span>
                  <strong className="sd-quick-stat__value">
                    {summary.present} / {summary.total_lectures}
                  </strong>
                </div>
              </div>
            </div>

            {/* 2-Column Layout */}
            <div className="sd-content-grid">
              {/* Left Column: Details & Tables */}
              <div className="sd-main-col">
                {/* Basic & Academic Information */}
                <div className="sd-card">
                  <div className="sd-card__header">
                    <div className="sd-card__title">
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                      <div>
                        <h3>Basic Information</h3>
                        <p>Personal, contact and academic details</p>
                      </div>
                    </div>
                  </div>

                  <div className="sd-info-grid">
                    <div className="sd-info-item">
                      <span className="sd-info-label">Full Name</span>
                      <strong className="sd-info-value">{student.name}</strong>
                    </div>

                    <div className="sd-info-item">
                      <span className="sd-info-label">Roll Number</span>
                      <strong className="sd-info-value">{student.roll_number}</strong>
                    </div>

                    <div className="sd-info-item">
                      <span className="sd-info-label">Section</span>
                      <strong className="sd-info-value">{student.section}</strong>
                    </div>

                    <div className="sd-info-item">
                      <span className="sd-info-label">Branch</span>
                      <strong className="sd-info-value">{student.branch}</strong>
                    </div>

                    <div className="sd-info-item">
                      <span className="sd-info-label">Semester</span>
                      <strong className="sd-info-value">{student.semester}</strong>
                    </div>

                    <div className="sd-info-item">
                      <span className="sd-info-label">Email Address</span>
                      <strong className="sd-info-value">
                        {student.email ? (
                          <a href={`mailto:${student.email}`} className="sd-link">
                            {student.email}
                          </a>
                        ) : (
                          '—'
                        )}
                      </strong>
                    </div>

                    <div className="sd-info-item">
                      <span className="sd-info-label">Phone Number</span>
                      <strong className="sd-info-value">
                        {student.phone ? (
                          <a href={`tel:${student.phone}`} className="sd-link">
                            {student.phone}
                          </a>
                        ) : (
                          '—'
                        )}
                      </strong>
                    </div>

                    <div className="sd-info-item">
                      <span className="sd-info-label">Face Biometric Status</span>
                      <strong className="sd-info-value">
                        <span className={`sd-status-dot ${student.has_face ? 'sd-status-dot--green' : 'sd-status-dot--orange'}`}></span>
                        {student.has_face ? 'Verified & Active' : 'Not Registered'}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Attendance History Table Card */}
                <div className="sd-card">
                  <div className="sd-card__header sd-card__header--split">
                    <div className="sd-card__title">
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                      <div>
                        <h3>Attendance History</h3>
                        <p>Detailed log of student lecture attendance</p>
                      </div>
                    </div>

                    {/* Filter Tabs */}
                    <div className="sd-tabs">
                      {['All', 'Present', 'Absent', 'Late'].map((f) => (
                        <button
                          key={f}
                          type="button"
                          className={`sd-tab ${attendanceFilter === f ? 'sd-tab--active' : ''}`}
                          onClick={() => setAttendanceFilter(f)}
                        >
                          {f}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="sd-table-wrap">
                    <table className="sd-table">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Subject</th>
                          <th>Lecture</th>
                          <th>Time</th>
                          <th>Status</th>
                          <th>Quick Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredAttendance.length === 0 ? (
                          <tr>
                            <td colSpan="6" className="sd-table-empty">
                              No attendance records found for "{attendanceFilter}".
                            </td>
                          </tr>
                        ) : (
                          filteredAttendance.map((item) => (
                            <tr key={item.id}>
                              <td>
                                <strong className="sd-date-cell">{item.date}</strong>
                              </td>
                              <td>{item.subject || '—'}</td>
                              <td>
                                <span className="sd-lecture-tag">{item.lecture_name}</span>
                              </td>
                              <td className="sd-time-cell">{item.time}</td>
                              <td>
                                {item.status === 'Present' && (
                                  <span className="sd-status-pill sd-status-pill--present">
                                    <span className="sd-status-dot sd-status-dot--green"></span>
                                    Present
                                  </span>
                                )}
                                {item.status === 'Absent' && (
                                  <span className="sd-status-pill sd-status-pill--absent">
                                    <span className="sd-status-dot sd-status-dot--red"></span>
                                    Absent
                                  </span>
                                )}
                                {item.status === 'Late' && (
                                  <span className="sd-status-pill sd-status-pill--late">
                                    <span className="sd-status-dot sd-status-dot--yellow"></span>
                                    Late
                                  </span>
                                )}
                              </td>
                              <td>
                                <div className="sd-quick-actions">
                                  {item.status !== 'Present' && (
                                    <button
                                      type="button"
                                      title="Mark Present"
                                      className="sd-action-mini sd-action-mini--present"
                                      onClick={() => handleToggleAttendance(item.lecture_id, 'Present')}
                                    >
                                      Present
                                    </button>
                                  )}
                                  {item.status !== 'Late' && (
                                    <button
                                      type="button"
                                      title="Mark Late"
                                      className="sd-action-mini sd-action-mini--late"
                                      onClick={() => handleToggleAttendance(item.lecture_id, 'Late')}
                                    >
                                      Late
                                    </button>
                                  )}
                                  {item.status !== 'Absent' && (
                                    <button
                                      type="button"
                                      title="Mark Absent"
                                      className="sd-action-mini sd-action-mini--absent"
                                      onClick={() => handleToggleAttendance(item.lecture_id, 'Absent')}
                                    >
                                      Absent
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Leave History Table Card */}
                <div className="sd-card">
                  <div className="sd-card__header sd-card__header--split">
                    <div className="sd-card__title">
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                        <line x1="16" y1="13" x2="8" y2="13" />
                        <line x1="16" y1="17" x2="8" y2="17" />
                        <polyline points="10 9 9 9 8 9" />
                      </svg>
                      <div>
                        <h3>Leave History</h3>
                        <p>Applications, reasons and approval status</p>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="sd-btn-link"
                      onClick={() => setIsLeaveModalOpen(true)}
                    >
                      + New Leave
                    </button>
                  </div>

                  <div className="sd-table-wrap">
                    <table className="sd-table">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Reason</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {!data?.leave_history || data.leave_history.length === 0 ? (
                          <tr>
                            <td colSpan="3" className="sd-table-empty">
                              No leave records submitted for this student.
                            </td>
                          </tr>
                        ) : (
                          data.leave_history.map((leave) => (
                            <tr key={leave.id}>
                              <td>
                                <strong className="sd-date-cell">{leave.date}</strong>
                              </td>
                              <td>{leave.reason}</td>
                              <td>
                                {leave.status === 'Approved' && (
                                  <span className="sd-status-pill sd-status-pill--present">
                                    <span className="sd-status-dot sd-status-dot--green"></span>
                                    Approved
                                  </span>
                                )}
                                {leave.status === 'Rejected' && (
                                  <span className="sd-status-pill sd-status-pill--absent">
                                    <span className="sd-status-dot sd-status-dot--red"></span>
                                    Rejected
                                  </span>
                                )}
                                {leave.status === 'Pending' && (
                                  <span className="sd-status-pill sd-status-pill--late">
                                    <span className="sd-status-dot sd-status-dot--yellow"></span>
                                    Pending
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Right Column: Attendance Summary & Biometrics */}
              <div className="sd-side-col">
                {/* Attendance Summary Gauge Card */}
                <div className="sd-card sd-summary-card">
                  <div className="sd-card__header">
                    <div className="sd-card__title">
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                      <div>
                        <h3>Attendance Summary</h3>
                        <p>Academic term overview</p>
                      </div>
                    </div>
                  </div>

                  {/* Circular Conic Ring Gauge */}
                  <div className="sd-gauge-box">
                    <div
                      className={`sd-gauge-ring ${isGoodStanding ? 'sd-gauge-ring--present' : 'sd-gauge-ring--absent'}`}
                      style={{
                        '--gauge-val': `${attendancePct * 3.6}deg`,
                      }}
                    >
                      <div className="sd-gauge-inner">
                        <strong>{attendancePct}%</strong>
                        <span>Overall Rate</span>
                      </div>
                    </div>

                    <div className={`sd-gauge-status ${isGoodStanding ? 'sd-gauge-status--good' : 'sd-gauge-status--danger'}`}>
                      <span className="sd-status-dot"></span>
                      <strong>
                        {isGoodStanding ? 'Current Status: Regular' : 'Current Status: Shortage'}
                      </strong>
                      <p>
                        {isGoodStanding
                          ? 'Attendance is above the mandatory 75% threshold.'
                          : 'Student is below 75% criteria. Need improvement.'}
                      </p>
                    </div>
                  </div>

                  {/* Metrics 4-Box Grid */}
                  <div className="sd-metrics-grid">
                    <div className="sd-metric-box">
                      <span className="sd-metric-box__label">Total Lectures</span>
                      <strong className="sd-metric-box__value">{summary.total_lectures}</strong>
                    </div>

                    <div className="sd-metric-box sd-metric-box--present">
                      <span className="sd-metric-box__label">Present</span>
                      <strong className="sd-metric-box__value">{summary.present}</strong>
                    </div>

                    <div className="sd-metric-box sd-metric-box--absent">
                      <span className="sd-metric-box__label">Absent</span>
                      <strong className="sd-metric-box__value">{summary.absent}</strong>
                    </div>

                    <div className="sd-metric-box sd-metric-box--late">
                      <span className="sd-metric-box__label">Late</span>
                      <strong className="sd-metric-box__value">{summary.late}</strong>
                    </div>
                  </div>

                  {/* Visual Progress Bar */}
                  <div className="sd-progress-section">
                    <div className="sd-progress-labels">
                      <span>Threshold Requirement</span>
                      <strong>75% Target</strong>
                    </div>
                    <div className="sd-progress-track">
                      <div
                        className={`sd-progress-bar ${isGoodStanding ? 'sd-progress-bar--green' : 'sd-progress-bar--red'}`}
                        style={{ width: `${Math.min(100, attendancePct)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Biometric Face Profile Card */}
                <div className="sd-card">
                  <div className="sd-card__header">
                    <div className="sd-card__title">
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M8 3H5a2 2 0 0 0-2 2v3" />
                        <path d="M16 3h3a2 2 0 0 1 2 2v3" />
                        <path d="M8 21H5a2 2 0 0 1-2-2v-3" />
                        <path d="M16 21h3a2 2 0 0 0 2-2v-3" />
                        <circle cx="12" cy="10" r="3" />
                        <path d="M7.5 18a4.8 4.8 0 0 1 9 0" />
                      </svg>
                      <div>
                        <h3>Biometric Profile</h3>
                        <p>Face Recognition Model</p>
                      </div>
                    </div>
                  </div>

                  <div className="sd-biometric-body">
                    {student.face_image ? (
                      <div className="sd-bio-preview">
                        <img
                          src={student.face_image}
                          alt="Face capture preview"
                          className="sd-bio-img"
                        />
                        <div className="sd-bio-badge">
                          <span>✓ Biometric Vector Active</span>
                        </div>
                      </div>
                    ) : (
                      <div className="sd-bio-empty">
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                          <circle cx="12" cy="12" r="10" />
                          <line x1="12" y1="8" x2="12" y2="12" />
                          <line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                        <p>No face photo registered for this student yet.</p>
                      </div>
                    )}

                    <button
                      type="button"
                      className="sd-btn-bio"
                      onClick={() => onNavigate('Capture Face')}
                    >
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <rect x="4" y="5" width="16" height="14" rx="2" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                      {student.has_face ? 'Re-capture Face Biometric' : 'Capture Face Now'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* =========================================
            MODAL: EDIT STUDENT
        ========================================= */}
        {isEditModalOpen && (
          <div className="sd-modal-backdrop" onClick={() => setIsEditModalOpen(false)}>
            <div className="sd-modal" onClick={(e) => e.stopPropagation()}>
              <div className="sd-modal__header">
                <div>
                  <h3>Edit Student Information</h3>
                  <p>Update personal, academic or contact details</p>
                </div>
                <button
                  type="button"
                  className="sd-modal__close"
                  onClick={() => setIsEditModalOpen(false)}
                >
                  ✕
                </button>
              </div>

              {formError && <div className="sd-modal__error">{formError}</div>}

              <form onSubmit={handleEditSubmit} className="sd-modal__form">
                <div className="sd-form-row">
                  <label>
                    <span>Full Name *</span>
                    <input
                      type="text"
                      required
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      placeholder="e.g. Madhav Vashishtha"
                    />
                  </label>

                  <label>
                    <span>Roll Number *</span>
                    <input
                      type="text"
                      required
                      value={editForm.roll_number}
                      onChange={(e) => setEditForm({ ...editForm, roll_number: e.target.value })}
                      placeholder="e.g. 2503400100023"
                    />
                  </label>
                </div>

                <div className="sd-form-row sd-form-row--3">
                  <label>
                    <span>Section *</span>
                    <input
                      type="text"
                      required
                      value={editForm.section}
                      onChange={(e) => setEditForm({ ...editForm, section: e.target.value })}
                      placeholder="e.g. A"
                    />
                  </label>

                  <label>
                    <span>Branch *</span>
                    <input
                      type="text"
                      required
                      value={editForm.branch}
                      onChange={(e) => setEditForm({ ...editForm, branch: e.target.value })}
                      placeholder="e.g. CSE or BCA"
                    />
                  </label>

                  <label>
                    <span>Semester *</span>
                    <input
                      type="text"
                      required
                      value={editForm.semester}
                      onChange={(e) => setEditForm({ ...editForm, semester: e.target.value })}
                      placeholder="e.g. 5"
                    />
                  </label>
                </div>

                <div className="sd-form-row">
                  <label>
                    <span>Email Address</span>
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      placeholder="student@example.com"
                    />
                  </label>

                  <label>
                    <span>Phone Number</span>
                    <input
                      type="tel"
                      value={editForm.phone}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                      placeholder="9876543210"
                    />
                  </label>
                </div>

                <div className="sd-modal__footer">
                  <button
                    type="button"
                    className="sd-btn-cancel"
                    onClick={() => setIsEditModalOpen(false)}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="sd-btn sd-btn--edit"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Saving Changes...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* =========================================
            MODAL: APPLY LEAVE
        ========================================= */}
        {isLeaveModalOpen && (
          <div className="sd-modal-backdrop" onClick={() => setIsLeaveModalOpen(false)}>
            <div className="sd-modal" onClick={(e) => e.stopPropagation()}>
              <div className="sd-modal__header">
                <div>
                  <h3>Record Leave Application</h3>
                  <p>Add official leave record for {student?.name}</p>
                </div>
                <button
                  type="button"
                  className="sd-modal__close"
                  onClick={() => setIsLeaveModalOpen(false)}
                >
                  ✕
                </button>
              </div>

              {formError && <div className="sd-modal__error">{formError}</div>}

              <form onSubmit={handleLeaveSubmit} className="sd-modal__form">
                <label>
                  <span>Leave Date *</span>
                  <input
                    type="date"
                    required
                    value={leaveForm.date}
                    onChange={(e) => setLeaveForm({ ...leaveForm, date: e.target.value })}
                  />
                </label>

                <label>
                  <span>Reason *</span>
                  <input
                    type="text"
                    required
                    value={leaveForm.reason}
                    onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                    placeholder="e.g. Medical Leave / Family Emergency"
                  />
                </label>

                <label>
                  <span>Approval Status</span>
                  <select
                    value={leaveForm.status}
                    onChange={(e) => setLeaveForm({ ...leaveForm, status: e.target.value })}
                  >
                    <option value="Approved">Approved (Green)</option>
                    <option value="Pending">Pending (Yellow)</option>
                    <option value="Rejected">Rejected (Red)</option>
                  </select>
                </label>

                <div className="sd-modal__footer">
                  <button
                    type="button"
                    className="sd-btn-cancel"
                    onClick={() => setIsLeaveModalOpen(false)}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="sd-btn sd-btn--leave"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Submitting...' : 'Record Leave'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* =========================================
            MODAL: DELETE CONFIRMATION
        ========================================= */}
        {isDeleteModalOpen && (
          <div className="sd-modal-backdrop" onClick={() => setIsDeleteModalOpen(false)}>
            <div className="sd-modal sd-modal--danger" onClick={(e) => e.stopPropagation()}>
              <div className="sd-modal__header">
                <div>
                  <h3 style={{ color: '#dc2626' }}>Delete Student</h3>
                  <p>This action cannot be undone.</p>
                </div>
                <button
                  type="button"
                  className="sd-modal__close"
                  onClick={() => setIsDeleteModalOpen(false)}
                >
                  ✕
                </button>
              </div>

              <div className="sd-modal__body">
                <p>
                  Are you sure you want to permanently remove <strong>{student?.name}</strong> (Roll No: {student?.roll_number})?
                  All associated attendance and leave history will be removed.
                </p>
              </div>

              <div className="sd-modal__footer">
                <button
                  type="button"
                  className="sd-btn-cancel"
                  onClick={() => setIsDeleteModalOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="sd-btn sd-btn--danger"
                  onClick={handleDeleteSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Deleting...' : 'Yes, Delete Student'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}

export default StudentDetails
