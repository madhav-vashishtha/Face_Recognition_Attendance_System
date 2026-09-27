import './Sidebar.css'

const navItems = [
  {
    label: 'Dashboard',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M3 10.8 12 3l9 7.8" />
        <path d="M5.2 9.5V21h13.6V9.5" />
        <path d="M9 21v-6h6v6" />
      </svg>
    ),
  },

  {
    label: 'Add Student',
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
    label: 'Logout',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M14 8V5a2 2 0 0 0-2-2H5v18h7a2 2 0 0 0 2-2v-3" />
        <path d="M10 12h11" />
        <path d="m17 8 4 4-4 4" />
      </svg>
    ),
  },
]


function Sidebar({
  active = 'Dashboard',
  onNavigate
}) {

  return (

    <aside className="sidebar">

      {/* Logo / Brand */}

      <div className="sidebar__brand">

        <div className="sidebar__logo">

          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
          >

            <path d="M8 3H5a2 2 0 0 0-2 2v3" />

            <path d="M16 3h3a2 2 0 0 1 2 2v3" />

            <path d="M8 21H5a2 2 0 0 1-2-2v-3" />

            <path d="M16 21h3a2 2 0 0 0 2-2v-3" />

            <circle
              cx="12"
              cy="10"
              r="3"
            />

            <path d="M7.5 18a4.8 4.8 0 0 1 9 0" />

          </svg>

        </div>


        <div>

          <strong>
            Face Recognition
          </strong>

          <span>
            Attendance System
          </span>

        </div>

      </div>


      {/* Navigation */}

      <nav
        className="sidebar__nav"
        aria-label="Main navigation"
      >

        {navItems.map((item) => (

          <button
            className={
              `sidebar__link ${
                active === item.label
                  ? 'sidebar__link--active'
                  : ''
              }`
            }
            key={item.label}
            onClick={() =>
              onNavigate?.(item.label)
            }
            type="button"
          >

            {item.icon}

            <span>
              {item.label}
            </span>

          </button>

        ))}

      </nav>

    </aside>

  )
}


export default Sidebar
