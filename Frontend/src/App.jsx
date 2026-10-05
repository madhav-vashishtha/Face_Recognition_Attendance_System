import { useEffect, useState } from 'react'
import Login from './pages/Login/Login'
import Dashboard from './pages/Dashboard/Dashboard'
import StudentList from './pages/StudentList/StudentList'
import StudentDetails from './pages/StudentDetails/StudentDetails'
import LeaveRequests from './pages/LeaveRequests/LeaveRequests'
import AddStudent from './pages/AddStudent/AddStudent'
import CaptureFace from './pages/CaptureFace/CaptureFace'
import TakeAttendance from './pages/TakeAttendance/TakeAttendance'

function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('attendance_user')
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })

  const [activePage, setActivePage] = useState('Dashboard')
  const [selectedStudentId, setSelectedStudentId] = useState(null)
  const [pendingCount, setPendingCount] = useState(0)

  // Fetch pending leaves count for notifications
  const fetchPendingCount = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/leaves/pending-count/')
      if (response.ok) {
        const data = await response.json()
        setPendingCount(data.pending_count || 0)
      }
    } catch {
      // Ignore background errors
    }
  }

  useEffect(() => {
    if (currentUser) {
      if (currentUser.role === 'student') {
        setActivePage('Student Details')
        setSelectedStudentId(currentUser.student_id || 1)
      } else {
        fetchPendingCount()
      }
    }
  }, [currentUser])

  const handleNavigate = (page, data = null) => {
    if (page === 'Student Details' && data) {
      setSelectedStudentId(data)
    }
    setActivePage(page)
  }

  // If user is not logged in -> render Login / Signup Page
  if (!currentUser) {
    return (
      <Login
        onLoginSuccess={(user) => {
          setCurrentUser(user)
          if (user.role === 'student') {
            setActivePage('Student Details')
            setSelectedStudentId(user.student_id || 1)
          } else {
            setActivePage('Dashboard')
          }
        }}
      />
    )
  }

  const pages = {
    Dashboard: (
      <Dashboard
        onNavigate={handleNavigate}
        currentUser={currentUser}
        pendingCount={pendingCount}
      />
    ),
    'Student List': (
      <StudentList
        onNavigate={handleNavigate}
        currentUser={currentUser}
        pendingCount={pendingCount}
      />
    ),
    'Student Details': (
      <StudentDetails
        studentId={selectedStudentId || currentUser.student_id}
        onNavigate={handleNavigate}
        currentUser={currentUser}
        pendingCount={pendingCount}
      />
    ),
    'Leave Requests': (
      <LeaveRequests
        onNavigate={handleNavigate}
        currentUser={currentUser}
        onUpdatePendingCount={setPendingCount}
      />
    ),
    'Add Student': (
      <AddStudent
        onNavigate={handleNavigate}
        currentUser={currentUser}
        pendingCount={pendingCount}
      />
    ),
    'Capture Face': (
      <CaptureFace
        onNavigate={handleNavigate}
        currentUser={currentUser}
        pendingCount={pendingCount}
      />
    ),
    'Take Attendance': (
      <TakeAttendance
        onNavigate={handleNavigate}
        currentUser={currentUser}
        pendingCount={pendingCount}
      />
    ),
  }

  const defaultPage =
    currentUser.role === 'student' ? pages['Student Details'] : pages['Dashboard']

  return pages[activePage] ?? defaultPage
}

export default App
