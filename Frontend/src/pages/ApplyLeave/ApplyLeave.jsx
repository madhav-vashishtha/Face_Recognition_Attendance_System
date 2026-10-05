import { useEffect, useState, useMemo } from 'react'
import AppLayout from '../../components/AppLayout/AppLayout'
import './ApplyLeave.css'

function ApplyLeave({ currentUser, onNavigate }) {
  const studentId = currentUser?.student_id || 1

  const [studentInfo, setStudentInfo] = useState(null)
  const [leaves, setLeaves] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [filter, setFilter] = useState('All')

  // Form State
  const [leaveForm, setLeaveForm] = useState({
    date: new Date().toISOString().split('T')[0],
    subject: 'All Subjects',
    time_slot: 'Full Day',
    reasonCategory: 'Medical Leave',
    customReason: '',
  })

  // Fetch Student Leaves & Info
  const fetchLeaveData = async () => {
    try {
      setLoading(true)
      setError('')

      const res = await fetch(`http://127.0.0.1:8000/api/students/${studentId}/`)
      if (!res.ok) {
        throw new Error('Failed to load leave history.')
      }

      const json = await res.json()
      setStudentInfo(json.student)
      setLeaves(json.leave_history || [])
    } catch (err) {
      console.error('Error loading leaves:', err)
      setError(err.message || 'Unable to load leave history.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLeaveData()
  }, [studentId])

  const showToast = (msg) => {
    setSuccessMessage(msg)
    setTimeout(() => {
      setSuccessMessage('')
    }, 4000)
  }

  // Submit Leave Form
  const handleSubmitLeave = async (e) => {
    e.preventDefault()
    try {
      setIsSubmitting(true)
      const finalReason = leaveForm.customReason.trim()
        ? `${leaveForm.reasonCategory}: ${leaveForm.customReason.trim()}`
        : leaveForm.reasonCategory

      const response = await fetch(`http://127.0.0.1:8000/api/students/${studentId}/leaves/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: leaveForm.date,
          subject: leaveForm.subject,
          time_slot: leaveForm.time_slot,
          reason: finalReason,
          status: 'Pending',
        }),
      })

      const resData = await response.json()
      if (!response.ok) {
        throw new Error(resData.error || 'Failed to submit leave application.')
      }

      showToast('Leave application submitted successfully! Pending approval.')
      setLeaveForm({
        date: new Date().toISOString().split('T')[0],
        subject: 'All Subjects',
        time_slot: 'Full Day',
        reasonCategory: 'Medical Leave',
        customReason: '',
      })
      fetchLeaveData()
    } catch (err) {
      alert(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const filteredLeaves = useMemo(() => {
    if (filter === 'All') return leaves
    return leaves.filter((l) => l.status.toLowerCase() === filter.toLowerCase())
  }, [leaves, filter])

  return (
    <AppLayout activePage="Apply Leave" onNavigate={onNavigate} currentUser={currentUser}>
      <div className="apply-leave-container">
        {/* Toast Notification */}
        {successMessage && (
          <div className="al-toast">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M20 6L9 17l-5-5" />
            </svg>
            <span>{successMessage}</span>
          </div>
        )}

        {/* Page Header */}
        <div className="al-header">
          <div>
            <h1>Student Leave Application</h1>
            <p>
              Submit leave requests directly to college faculty and track your application approval status.
            </p>
          </div>
          {studentInfo && (
            <div className="al-student-meta">
              <strong>{studentInfo.name}</strong>
              <span>Roll No: {studentInfo.roll_number} ({studentInfo.branch} - Sec {studentInfo.section})</span>
            </div>
          )}
        </div>

        <div className="al-grid">
          {/* Left Column: Apply Form */}
          <div className="al-card al-form-card">
            <div className="al-card__header">
              <div className="al-card__title">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <div>
                  <h3>Apply for New Leave</h3>
                  <p>Fill in leave details for approval</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmitLeave} className="al-form">
              <div className="al-field">
                <label>Leave Date *</label>
                <input
                  type="date"
                  required
                  value={leaveForm.date}
                  onChange={(e) => setLeaveForm({ ...leaveForm, date: e.target.value })}
                />
              </div>

              <div className="al-field-row">
                <div className="al-field">
                  <label>Subject / Lecture *</label>
                  <select
                    value={leaveForm.subject}
                    onChange={(e) => setLeaveForm({ ...leaveForm, subject: e.target.value })}
                  >
                    <option value="All Subjects">All Subjects (Full Day)</option>
                    <option value="COA">COA</option>
                    <option value="MATHS 4">MATHS 4</option>
                    <option value="DSTL">DSTL</option>
                    <option value="DS">DS</option>
                    <option value="UHV">UHV</option>
                    <option value="CS">CS</option>
                    <option value="MINI PROJECT">MINI PROJECT</option>
                  </select>
                </div>

                <div className="al-field">
                  <label>Time Slot *</label>
                  <select
                    value={leaveForm.time_slot}
                    onChange={(e) => setLeaveForm({ ...leaveForm, time_slot: e.target.value })}
                  >
                    <option value="Full Day">Full Day</option>
                    <option value="Morning Slot (09:00 - 12:00)">Morning Slot</option>
                    <option value="Afternoon Slot (01:00 - 04:00)">Afternoon Slot</option>
                  </select>
                </div>
              </div>

              <div className="al-field">
                <label>Leave Reason Category *</label>
                <select
                  value={leaveForm.reasonCategory}
                  onChange={(e) => setLeaveForm({ ...leaveForm, reasonCategory: e.target.value })}
                >
                  <option value="Medical Leave">Medical Leave / Illness</option>
                  <option value="Family Emergency">Family Emergency / Function</option>
                  <option value="Personal Leave">Personal Work</option>
                  <option value="External Exam / Placement">External Exam / Placement Drive</option>
                  <option value="Other Reason">Other Reason</option>
                </select>
              </div>

              <div className="al-field">
                <label>Additional Notes / Reason Details (Optional)</label>
                <textarea
                  rows="3"
                  placeholder="Provide any additional details or notes for the faculty..."
                  value={leaveForm.customReason}
                  onChange={(e) => setLeaveForm({ ...leaveForm, customReason: e.target.value })}
                ></textarea>
              </div>

              <button type="submit" className="al-submit-btn" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting Leave...' : 'Submit Leave Application'}
              </button>
            </form>
          </div>

          {/* Right Column: Submitted Leaves */}
          <div className="al-card al-history-card">
            <div className="al-card__header al-card__header--split">
              <div className="al-card__title">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <div>
                  <h3>My Submitted Applications</h3>
                  <p>Track request approval status</p>
                </div>
              </div>

              {/* Status Filter Tabs */}
              <div className="al-tabs">
                {['All', 'Pending', 'Approved', 'Rejected'].map((t) => (
                  <button
                    key={t}
                    type="button"
                    className={`al-tab ${filter === t ? 'al-tab--active' : ''}`}
                    onClick={() => setFilter(t)}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <div className="al-state">Loading leave history...</div>
            ) : error ? (
              <div className="al-state al-state--error">{error}</div>
            ) : filteredLeaves.length === 0 ? (
              <div className="al-empty">
                <span>📄</span>
                <strong>No leave records found</strong>
                <p>Submit a new leave application using the form on the left.</p>
              </div>
            ) : (
              <div className="al-list">
                {filteredLeaves.map((item) => (
                  <div className="al-item" key={item.id}>
                    <div className="al-item-header">
                      <div>
                        <strong className="al-item-date">{item.full_date || item.date}</strong>
                        <span className="al-item-slot">{item.time_slot || 'Full Day'} • {item.subject || 'All Subjects'}</span>
                      </div>
                      <span className={`al-badge al-badge--${item.status.toLowerCase()}`}>
                        {item.status}
                      </span>
                    </div>

                    <p className="al-item-reason">{item.reason}</p>

                    {item.reviewed_by !== '—' && (
                      <div className="al-item-review">
                        <span>Reviewed by: <strong>{item.reviewed_by}</strong></span>
                        {item.review_remarks && item.review_remarks !== '—' && (
                          <small>Note: {item.review_remarks}</small>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  )
}

export default ApplyLeave
