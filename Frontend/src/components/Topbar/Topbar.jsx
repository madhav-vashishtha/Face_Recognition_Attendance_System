import './Topbar.css'

function Topbar({ title = 'Dashboard' }) {
  return (
    <header className="topbar">
      <button className="topbar__menu" type="button" aria-label="Open menu">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 7h16" />
          <path d="M4 12h16" />
          <path d="M4 17h16" />
        </svg>
      </button>
      <h2>{title}</h2>
      <button className="topbar__admin" type="button" aria-label="Admin menu">
        <span className="topbar__avatar" aria-hidden="true"></span>
        <strong>Admin</strong>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
    </header>
  )
}

export default Topbar
