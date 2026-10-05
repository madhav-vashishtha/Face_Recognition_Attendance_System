import Sidebar from '../Sidebar/Sidebar'
import Topbar from '../Topbar/Topbar'
import './AppLayout.css'

function AppLayout({ activePage, children, onNavigate, pendingCount = 0, currentUser }) {
  return (
    <div className="app-page">
      <div className="app-shell">
        <Sidebar
          active={activePage}
          onNavigate={onNavigate}
          pendingCount={pendingCount}
          currentUser={currentUser}
        />
        <main className="app-main">
          <Topbar
            title={activePage}
            currentUser={currentUser}
            pendingCount={pendingCount}
            onNavigate={onNavigate}
          />
          {children}
        </main>
      </div>
    </div>
  )
}

export default AppLayout
