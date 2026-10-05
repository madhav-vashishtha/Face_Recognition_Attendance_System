import { useState } from 'react'
import './Topbar.css'

function Topbar({ title = 'Dashboard', currentUser, pendingCount = 0, onNavigate }) {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const role = currentUser?.role || 'admin'
  const name = currentUser?.name || 'Admin'

  const handleLogout = () => {
    localStorage.removeItem('attendance_user')
    localStorage.removeItem('attendance_token')
    window.location.reload()
  }

  return (
    <header className="topbar">
      <div className="topbar__left">
        <button className="topbar__menu" type="button" aria-label="Open menu">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 7h16" />
            <path d="M4 12h16" />
            <path d="M4 17h16" />
          </svg>
        </button>
        <h2>{title}</h2>
      </div>

      <div className="topbar__right">
        {/* Bell Notification for Teachers & Admins */}
        {(role === 'teacher' || role === 'admin') && (
          <button
            type="button"
            className="topbar__notif"
            onClick={() => onNavigate?.('Leave Requests')}
            title="Pending Leave Requests"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {pendingCount > 0 && (
              <span className="topbar__notif-badge">{pendingCount}</span>
            )}
          </button>
        )}

        {/* User Profile Dropdown */}
        <div className="topbar__user-wrap">
          <button
            className="topbar__admin"
            type="button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            <span className="topbar__avatar">
              {name.charAt(0).toUpperCase()}
            </span>
            <div className="topbar__user-info">
              <strong>{name}</strong>
              <span className={`topbar__role-tag topbar__role-tag--${role}`}>
                {role.toUpperCase()}
              </span>
            </div>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>

          {dropdownOpen && (
            <div className="topbar__dropdown">
              <div className="topbar__dropdown-header">
                <p>Signed in as</p>
                <strong>{currentUser?.email || currentUser?.username}</strong>
              </div>
              <button
                type="button"
                className="topbar__dropdown-item"
                onClick={handleLogout}
              >
                Logout Account
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Topbar
