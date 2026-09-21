import Sidebar from '../Sidebar/Sidebar'
import Topbar from '../Topbar/Topbar'
import './AppLayout.css'

function AppLayout({ activePage, children, onNavigate }) {
  return (
    <div className="app-page">
      <div className="app-shell">
        <Sidebar active={activePage} onNavigate={onNavigate} />
        <main className="app-main">
          <Topbar title={activePage} />
          {children}
        </main>
      </div>
    </div>
  )
}

export default AppLayout
