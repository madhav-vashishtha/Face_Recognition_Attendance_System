import './Sidebar.css'

function Sidebar({ active = 'Dashboard', onNavigate, currentUser, pendingCount = 0 }) {
  console.log(currentUser,"CURRENT USER")
  const role = currentUser?.role || 'admin'

  const allNavItems = [
    {
      label: 'Dashboard',
      roles: ['admin', 'teacher'],
      icon: (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M3 10.8 12 3l9 7.8" />
          <path d="M5.2 9.5V21h13.6V9.5" />
          <path d="M9 21v-6h6v6" />
        </svg>
      ),
    },

    {
      label: 'My Attendance',
      roles: ['student'],
      targetPage: 'Student Details',
      icon: (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      ),
    },

    {
      label: 'Apply Leave',
      roles: ['student'],
      icon: (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
        </svg>
      ),
    },

    {
      label: 'Student List',
      roles: ['admin', 'teacher'],
      icon: (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
    },

    {
      label: 'Add Student',
      roles: ['admin'],
      icon: (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M15 19a6 6 0 0 0-12 0" />
          <circle cx="9" cy="8" r="4" />
          <path d="M19 8v6" />
          <path d="M16 11h6" />
        </svg>
      ),
    },

    {
      label: 'Capture Face',
      roles: ['admin', 'teacher'],
      icon: (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <rect x="4" y="5" width="16" height="14" rx="2" />
          <circle cx="12" cy="12" r="3" />
          <path d="M8 19v2" />
          <path d="M16 19v2" />
        </svg>
      ),
    },

    {
      label: 'Take Attendance',
      roles: ['admin', 'teacher'],
      icon: (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <rect x="5" y="4" width="14" height="17" rx="2" />
          <path d="M9 8h6" />
          <path d="M9 12h6" />
          <path d="M9 16h4" />
        </svg>
      ),
    },

    {
      label: 'Leave Requests',
      roles: ['admin', 'teacher'],
      badge: pendingCount,
      icon: (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
        </svg>
      ),
    },

    {
      label: 'Logout',
      roles: ['admin', 'teacher', 'student'],
      icon: (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M14 8V5a2 2 0 0 0-2-2H5v18h7a2 2 0 0 0 2-2v-3" />
          <path d="M10 12h11" />
          <path d="m17 8 4 4-4 4" />
        </svg>
      ),
    },
  ]

  // Filter by user role
  const navItems = allNavItems.filter((item) => item.roles.includes(role))

  return (
    <aside className="sidebar">
      {/* Brand */}
      <div className="sidebar__brand">
        <div className="sidebar__logo">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M8 3H5a2 2 0 0 0-2 2v3" />
            <path d="M16 3h3a2 2 0 0 1 2 2v3" />
            <path d="M8 21H5a2 2 0 0 1-2-2v-3" />
            <path d="M16 21h3a2 2 0 0 0 2-2v-3" />
            <circle cx="12" cy="10" r="3" />
            <path d="M7.5 18a4.8 4.8 0 0 1 9 0" />
          </svg>
        </div>

        <div>
          <strong>Face Attendance</strong>
          <span>{role.toUpperCase()} PORTAL</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="sidebar__nav" aria-label="Main navigation">
        {navItems.map((item) => {
          const isItemActive =
            active === item.label ||
            (item.label === 'Student List' && active === 'Student Details' && role !== 'student') ||
            (item.label === 'My Attendance' && active === 'Student Details')

          return (
            <button
              className={`sidebar__link ${isItemActive ? 'sidebar__link--active' : ''}`}
              key={item.label}
              type="button"
              onClick={() => {
                if (item.label === 'Logout') {
                  localStorage.removeItem('attendance_user')
                  localStorage.removeItem('attendance_token')
                  window.location.reload()
                  return
                }

                if (item.targetPage) {
                  onNavigate?.(item.targetPage, currentUser?.student_id, { openLeave: Boolean(item.openLeaveModal) })
                } else {
                  onNavigate?.(item.label)
                }
              }}
            >
              {item.icon}
              <span className="sidebar__link-text">{item.label}</span>
              {Boolean(item.badge) && item.badge > 0 && (
                <span className="sidebar__badge">{item.badge}</span>
              )}
            </button>
          )
        })}
      </nav>
    </aside>
  )
}

export default Sidebar
