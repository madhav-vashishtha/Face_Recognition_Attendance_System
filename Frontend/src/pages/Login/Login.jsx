import { useState } from 'react'
import './Login.css'

function Login({ onLoginSuccess }) {
  const [activeTab, setActiveTab] = useState('login') // 'login' or 'signup'
  const [role, setRole] = useState('student') // 'student', 'teacher', 'admin'
  
  // Login form state
  const [loginForm, setLoginForm] = useState({
    username: '',
    password: '',
  })

  // Signup form state
  const [signupForm, setSignupForm] = useState({
    name: '',
    email: '',
    password: '',
    roll_number: '',
    section: 'A',
    branch: 'CSE',
    semester: '5',
    department: 'Computer Science & Engineering',
    phone: '',
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  // Quick Demo Accounts Fill
  const fillDemoAccount = (demoRole) => {
    setRole(demoRole)
    setActiveTab('login')
    setError('')
    if (demoRole === 'student') {
      setLoginForm({ username: '2503400100023', password: 'student123' })
    } else if (demoRole === 'teacher') {
      setLoginForm({ username: 'teacher', password: 'teacher123' })
    } else if (demoRole === 'admin') {
      setLoginForm({ username: 'admin', password: 'admin123' })
    }
  }

  // Handle Login Submit
  const handleLoginSubmit = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      setError('')
      setMessage('')

      const response = await fetch('http://127.0.0.1:8000/api/auth/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: loginForm.username,
          password: loginForm.password,
          role: role,
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Login failed. Please check credentials.')
      }

      // Store in localStorage
      localStorage.setItem('attendance_user', JSON.stringify(data.user))
      localStorage.setItem('attendance_token', data.token)

      if (onLoginSuccess) {
        onLoginSuccess(data.user)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Handle Signup Submit
  const handleSignupSubmit = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      setError('')
      setMessage('')

      const payload = {
        role,
        name: signupForm.name,
        email: signupForm.email,
        password: signupForm.password,
        phone: signupForm.phone,
        ...(role === 'student' && {
          roll_number: signupForm.roll_number,
          section: signupForm.section,
          branch: signupForm.branch,
          semester: signupForm.semester,
        }),
        ...(role === 'teacher' && {
          department: signupForm.department,
        }),
      }

      const response = await fetch('http://127.0.0.1:8000/api/auth/signup/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Signup failed. Please check details.')
      }

      // Store in localStorage and auto-login
      localStorage.setItem('attendance_user', JSON.stringify(data.user))
      localStorage.setItem('attendance_token', data.token)

      if (onLoginSuccess) {
        onLoginSuccess(data.user)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        
        {/* Left Branding Panel */}
        <div className="auth-brand-panel">
          <div className="auth-brand-content">
            <div className="auth-logo">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h1>Smart Face Recognition</h1>
            <h2>Attendance Management System</h2>
            <p>
              AI-driven InsightFace biometric verification, automated attendance tracking, and real-time leave management.
            </p>

            {/* Quick Fill Demo Badges */}
            <div className="demo-accounts-box">
              <span className="demo-title">⚡ Quick Login Testing Accounts:</span>
              <div className="demo-buttons">
                <button
                  type="button"
                  className="demo-btn demo-btn--student"
                  onClick={() => fillDemoAccount('student')}
                >
                  🎓 Student Login
                </button>
                <button
                  type="button"
                  className="demo-btn demo-btn--teacher"
                  onClick={() => fillDemoAccount('teacher')}
                >
                  👨‍🏫 Teacher Login
                </button>
                <button
                  type="button"
                  className="demo-btn demo-btn--admin"
                  onClick={() => fillDemoAccount('admin')}
                >
                  🛡️ Admin Login
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Auth Form Box */}
        <div className="auth-form-card">
          
          {/* Role Selector Tabs */}
          <div className="role-selector">
            <button
              type="button"
              className={`role-tab ${role === 'student' ? 'role-tab--active' : ''}`}
              onClick={() => {
                setRole('student')
                setError('')
              }}
            >
              <span className="role-icon">🎓</span>
              <span>Student</span>
            </button>

            <button
              type="button"
              className={`role-tab ${role === 'teacher' ? 'role-tab--active' : ''}`}
              onClick={() => {
                setRole('teacher')
                setError('')
              }}
            >
              <span className="role-icon">👨‍🏫</span>
              <span>Teacher</span>
            </button>

            <button
              type="button"
              className={`role-tab ${role === 'admin' ? 'role-tab--active' : ''}`}
              onClick={() => {
                setRole('admin')
                setError('')
              }}
            >
              <span className="role-icon">🛡️</span>
              <span>Admin</span>
            </button>
          </div>

          {/* Login vs Signup Mode Tabs */}
          <div className="auth-mode-switch">
            <button
              type="button"
              className={`mode-btn ${activeTab === 'login' ? 'mode-btn--active' : ''}`}
              onClick={() => {
                setActiveTab('login')
                setError('')
              }}
            >
              Sign In
            </button>
            <button
              type="button"
              className={`mode-btn ${activeTab === 'signup' ? 'mode-btn--active' : ''}`}
              onClick={() => {
                setActiveTab('signup')
                setError('')
              }}
            >
              Create Account
            </button>
          </div>

          {/* Alerts */}
          {error && <div className="auth-alert auth-alert--error">{error}</div>}
          {message && <div className="auth-alert auth-alert--success">{message}</div>}

          {/* Form Content */}
          {activeTab === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="auth-form">
              <div className="auth-field">
                <label>
                  {role === 'student' ? 'Roll Number / Email' : 'Email or Username'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={
                    role === 'student'
                      ? 'e.g. 2503400100023 or email'
                      : role === 'teacher'
                      ? 'e.g. teacher@gmail.com'
                      : 'e.g. admin or admin@gmail.com'
                  }
                  value={loginForm.username}
                  onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                />
              </div>

              <div className="auth-field">
                <label>Password</label>
                <input
                  type="password"
                  required
                  placeholder="Enter your password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                />
              </div>

              <button type="submit" className="auth-submit-btn" disabled={loading}>
                {loading ? 'Authenticating...' : `Login as ${role.toUpperCase()}`}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignupSubmit} className="auth-form">
              <div className="auth-field">
                <label>Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Madhav Vashishtha"
                  value={signupForm.name}
                  onChange={(e) => setSignupForm({ ...signupForm, name: e.target.value })}
                />
              </div>

              <div className="auth-field-row">
                <div className="auth-field">
                  <label>Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="user@gmail.com"
                    value={signupForm.email}
                    onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                  />
                </div>

                <div className="auth-field">
                  <label>Password *</label>
                  <input
                    type="password"
                    required
                    placeholder="Min 6 characters"
                    value={signupForm.password}
                    onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                  />
                </div>
              </div>

              {/* Student specific fields */}
              {role === 'student' && (
                <>
                  <div className="auth-field-row">
                    <div className="auth-field">
                      <label>Roll Number *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. 2503400100023"
                        value={signupForm.roll_number}
                        onChange={(e) => setSignupForm({ ...signupForm, roll_number: e.target.value })}
                      />
                    </div>

                    <div className="auth-field">
                      <label>Section *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. A"
                        value={signupForm.section}
                        onChange={(e) => setSignupForm({ ...signupForm, section: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="auth-field-row">
                    <div className="auth-field">
                      <label>Branch *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. CSE or BCA"
                        value={signupForm.branch}
                        onChange={(e) => setSignupForm({ ...signupForm, branch: e.target.value })}
                      />
                    </div>

                    <div className="auth-field">
                      <label>Semester *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. 5"
                        value={signupForm.semester}
                        onChange={(e) => setSignupForm({ ...signupForm, semester: e.target.value })}
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Teacher specific fields */}
              {role === 'teacher' && (
                <div className="auth-field">
                  <label>Department *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Computer Science & Engineering"
                    value={signupForm.department}
                    onChange={(e) => setSignupForm({ ...signupForm, department: e.target.value })}
                  />
                </div>
              )}

              <div className="auth-field">
                <label>Phone Number (Optional)</label>
                <input
                  type="tel"
                  placeholder="9876543210"
                  value={signupForm.phone}
                  onChange={(e) => setSignupForm({ ...signupForm, phone: e.target.value })}
                />
              </div>

              <button type="submit" className="auth-submit-btn" disabled={loading}>
                {loading ? 'Creating Account...' : `Register as ${role.toUpperCase()}`}
              </button>
            </form>
          )}

          <div className="auth-footer-hint">
            <p>Secured with PBKDF2 Password Hashing & Role-based Access Control.</p>
          </div>
        </div>

      </div>
    </div>
  )
}

export default Login
