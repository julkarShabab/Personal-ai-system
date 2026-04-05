import { Link, useLocation, useNavigate } from 'react-router-dom'
import '../styles/sidebar.css'

function Sidebar() {
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem('token')
    navigate('/login')
  }

  const links = [
    { path: '/dashboard', label: 'Dashboard', icon: '⬡', desc: 'Overview' },
    { path: '/tasks', label: 'Tasks', icon: '◈', desc: 'Manage tasks' },
    { path: '/expenses', label: 'Expenses', icon: '◎', desc: 'Track spending' },
    { path: '/chat', label: 'AI Assistant', icon: '◆', desc: 'Ask anything' },
  ]

  return (
    <div className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-brand-icon">🧠</div>
        <div>
          <h2>LifeOS</h2>
          <span>Personal AI System</span>
        </div>
      </div>

      <div className="sidebar-section-label">NAVIGATION</div>

      <nav className="sidebar-nav">
        {links.map(link => (
          <Link
            key={link.path}
            to={link.path}
            className={`sidebar-link ${location.pathname === link.path ? 'active' : ''}`}
          >
            <div className="sidebar-link-icon">{link.icon}</div>
            <div className="sidebar-link-text">
              <span className="sidebar-link-label">{link.label}</span>
              <span className="sidebar-link-desc">{link.desc}</span>
            </div>
            {location.pathname === link.path && (
              <div className="sidebar-link-dot" />
            )}
          </Link>
        ))}
      </nav>

      <div className="sidebar-divider" />

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-user-avatar">👤</div>
          <div className="sidebar-user-info">
            <span>My Account</span>
            <span>Personal</span>
          </div>
        </div>
        <button className="logout-btn" onClick={handleLogout}>
          <span>↪</span>
          Logout
        </button>
      </div>
    </div>
  )
}

export default Sidebar