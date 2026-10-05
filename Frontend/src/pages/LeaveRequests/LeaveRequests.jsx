import { useEffect, useState, useMemo } from 'react'
import AppLayout from '../../components/AppLayout/AppLayout'
import './LeaveRequests.css'

function LeaveRequests({ currentUser, onNavigate, onUpdatePendingCount }) {
  const [leaves, setLeaves] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('All')
  const [search, setSearch] = useState('')

  // Action Modal State
  const [selectedLeave, setSelectedLeave] = useState(null)
  const [actionType, setActionType] = useState('') // 'approve' or 'reject'
  const [remarks, setRemarks] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

  const fetchLeaves = async () => {
    try {
      setLoading(true)
      setError('')

      const response = await fetch('http://127.0.0.1:8000/api/leaves/')
      if (!response.ok) {
        throw new Error('Failed to load leave requests.')
      }

      const data = await response.json()
      setLeaves(data)

      // Notify parent to update badge count
      const pending = data.filter((item) => item.status === 'Pending').length
      onUpdatePendingCount?.(pending)
    } catch (err) {
      console.error('Error fetching leaves:', err)
      setError(err.message || 'Error loading leave requests.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLeaves()
  }, [])

  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => {
      setToastMessage('')
    }, 3500)
  }

  // Handle Approve or Reject
  const handleActionSubmit = async (e) => {
    e.preventDefault()
    if (!selectedLeave || !actionType) return

    try {
      setIsSubmitting(true)

      const reviewerName =
        currentUser?.name ||
        (currentUser?.role === 'teacher' ? 'Prof. Teacher' : 'Administrator')

      const response = await fetch(
        `http://127.0.0.1:8000/api/leaves/${selectedLeave.id}/action/`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: actionType,
            reviewer: reviewerName,
            remarks: remarks.trim() || (actionType === 'approve' ? 'Approved by staff.' : 'Rejected by staff.'),
          }),
        }
      )

      const resData = await response.json()
      if (!response.ok) {
        throw new Error(resData.error || 'Failed to process leave action.')
      }

      showToast(
        `Leave request for ${selectedLeave.student_name} marked as ${
          actionType === 'approve' ? 'Approved' : 'Rejected'
        }!`
      )

      setSelectedLeave(null)
      setRemarks('')
      fetchLeaves()
    } catch (err) {
      alert(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Filter & Search
  const filteredLeaves = useMemo(() => {
    const query = search.trim().toLowerCase()
    return leaves.filter((item) => {
      const matchesFilter =
        filter === 'All' || item.status.toLowerCase() === filter.toLowerCase()

      const matchesSearch =
        !query ||
        item.student_name?.toLowerCase().includes(query) ||
        item.roll_number?.toLowerCase().includes(query) ||
        item.reason?.toLowerCase().includes(query)

      return matchesFilter && matchesSearch
    })
  }, [leaves, filter, search])

  const pendingCount = useMemo(() => {
    return leaves.filter((item) => item.status === 'Pending').length
  }, [leaves])

  const getInitial = (name) => {
    return name?.trim()?.charAt(0)?.toUpperCase() || 'S'
  }

  return (
    <AppLayout activePage="Leave Requests" onNavigate={onNavigate} pendingCount={pendingCount} currentUser={currentUser}>
      <div className="leave-requests-container">
        
        {/* Toast */}
        {toastMessage && (
          <div className="lr-toast">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M20 6L9 17l-5-5" />
            </svg>
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Page Header */}
        <div className="lr-header">
          <div>
            <h1>Leave Requests Section</h1>
            <p>Review, approve, or reject official student leave applications.</p>
          </div>

          <div className="lr-pending-badge">
            <span className="lr-pending-badge__count">{pendingCount}</span>
            <span className="lr-pending-badge__label">Pending Action</span>
          </div>
        </div>

        {/* Filter Controls & Search Bar */}
        <div className="lr-controls">
          <div className="lr-search">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="11" cy="11" r="7" />
              <path d="m16 16 4 4" />
            </svg>
            <input
              type="search"
              placeholder="Search by student name, roll no, or leave reason..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="lr-tabs">
            {['All', 'Pending', 'Approved', 'Rejected'].map((tab) => (
              <button
                key={tab}
                type="button"
                className={`lr-tab ${filter === tab ? 'lr-tab--active' : ''}`}
                onClick={() => setFilter(tab)}
              >
                {tab}
                <span className="lr-tab-count">
                  {tab === 'All'
                    ? leaves.length
                    : leaves.filter((i) => i.status.toLowerCase() === tab.toLowerCase()).length}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Content Table Card */}
        <div className="lr-card">
          {loading && (
            <div className="lr-state">
              <div className="lr-spinner"></div>
              <p>Loading leave requests...</p>
            </div>
          )}

          {error && <div className="lr-state lr-state--error">{error}</div>}

          {!loading && !error && filteredLeaves.length === 0 && (
            <div className="lr-state">
              <p>No leave requests found for filter "{filter}".</p>
            </div>
          )}

          {!loading && !error && filteredLeaves.length > 0 && (
            <div className="lr-table-wrap">
              <table className="lr-table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Roll No.</th>
                    <th>Section / Branch</th>
                    <th>Leave Date</th>
                    <th>Reason</th>
                    <th>Status</th>
                    <th>Reviewed By</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredLeaves.map((item) => (
                    <tr key={item.id} className={item.status === 'Pending' ? 'lr-row--pending' : ''}>
                      <td>
                        <div className="lr-student-cell">
                          <span className="lr-avatar">{getInitial(item.student_name)}</span>
                          <div>
                            <strong className="lr-student-name">{item.student_name}</strong>
                            <span className="lr-student-email">{item.email}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="lr-roll-badge">{item.roll_number}</span>
                      </td>
                      <td>
                        <span className="lr-sec-badge">
                          Sec {item.section} ({item.branch})
                        </span>
                      </td>
                      <td>
                        <strong className="lr-date-text">{item.full_date || item.date}</strong>
                      </td>
                      <td>
                        <p className="lr-reason-text">{item.reason}</p>
                      </td>
                      <td>
                        {item.status === 'Approved' && (
                          <span className="lr-status-pill lr-status-pill--approved">
                            <span className="lr-dot lr-dot--green"></span>
                            Approved
                          </span>
                        )}
                        {item.status === 'Rejected' && (
                          <span className="lr-status-pill lr-status-pill--rejected">
                            <span className="lr-dot lr-dot--red"></span>
                            Rejected
                          </span>
                        )}
                        {item.status === 'Pending' && (
                          <span className="lr-status-pill lr-status-pill--pending">
                            <span className="lr-dot lr-dot--yellow"></span>
                            Pending Approval
                          </span>
                        )}
                      </td>
                      <td>
                        <div className="lr-reviewer-cell">
                          <span>{item.reviewed_by}</span>
                          {item.review_remarks !== '—' && (
                            <small className="lr-remarks">{item.review_remarks}</small>
                          )}
                        </div>
                      </td>
                      <td>
                        {item.status === 'Pending' ? (
                          <div className="lr-action-btns">
                            <button
                              type="button"
                              className="lr-btn lr-btn--approve"
                              onClick={() => {
                                setSelectedLeave(item)
                                setActionType('approve')
                                setRemarks('')
                              }}
                            >
                              Approve
                            </button>
                            <button
                              type="button"
                              className="lr-btn lr-btn--reject"
                              onClick={() => {
                                setSelectedLeave(item)
                                setActionType('reject')
                                setRemarks('')
                              }}
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            className="lr-btn-reconsider"
                            onClick={() => {
                              setSelectedLeave(item)
                              setActionType(item.status === 'Approved' ? 'reject' : 'approve')
                              setRemarks('')
                            }}
                          >
                            Change Status
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* =========================================
            MODAL: APPROVE / REJECT LEAVE ACTION
        ========================================= */}
        {selectedLeave && (
          <div className="lr-modal-backdrop" onClick={() => setSelectedLeave(null)}>
            <div className="lr-modal" onClick={(e) => e.stopPropagation()}>
              <div className="lr-modal__header">
                <div>
                  <h3>
                    {actionType === 'approve' ? '🟢 Approve Leave Request' : '🔴 Reject Leave Request'}
                  </h3>
                  <p>
                    Student: <strong>{selectedLeave.student_name}</strong> (Roll: {selectedLeave.roll_number})
                  </p>
                </div>
                <button
                  type="button"
                  className="lr-modal__close"
                  onClick={() => setSelectedLeave(null)}
                >
                  ✕
                </button>
              </div>

              <div className="lr-modal__info-box">
                <p>
                  <strong>Date:</strong> {selectedLeave.full_date || selectedLeave.date}
                </p>
                <p>
                  <strong>Reason:</strong> "{selectedLeave.reason}"
                </p>
              </div>

              <form onSubmit={handleActionSubmit} className="lr-modal__form">
                <label>
                  <span>Review Remarks (Optional)</span>
                  <input
                    type="text"
                    placeholder={
                      actionType === 'approve'
                        ? 'e.g. Approved with leave of absence'
                        : 'e.g. Insufficient documentation'
                    }
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                  />
                </label>

                <div className="lr-modal__footer">
                  <button
                    type="button"
                    className="lr-btn-cancel"
                    onClick={() => setSelectedLeave(null)}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={`lr-modal-submit ${
                      actionType === 'approve' ? 'lr-modal-submit--approve' : 'lr-modal-submit--reject'
                    }`}
                    disabled={isSubmitting}
                  >
                    {isSubmitting
                      ? 'Processing...'
                      : actionType === 'approve'
                      ? 'Confirm Approval'
                      : 'Confirm Rejection'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </AppLayout>
  )
}

export default LeaveRequests
