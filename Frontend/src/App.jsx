import { useState } from 'react'
import AddStudent from './pages/AddStudent/AddStudent'
import CaptureFace from './pages/CaptureFace/CaptureFace'
import Dashboard from './pages/Dashboard/Dashboard'
import TakeAttendance from './pages/TakeAttendance/TakeAttendance'

function App() {
  const [activePage, setActivePage] = useState('Dashboard')

  const pages = {
    Dashboard: <Dashboard onNavigate={setActivePage} />,
    'Add Student': <AddStudent onNavigate={setActivePage} />,
    'Capture Face': <CaptureFace onNavigate={setActivePage} />,
    'Take Attendance': <TakeAttendance onNavigate={setActivePage} />,
  }

  return pages[activePage] ?? <Dashboard onNavigate={setActivePage} />
}

export default App
