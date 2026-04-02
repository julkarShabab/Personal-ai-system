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
        { path: '/dashboard', label: 'Dashboard', icon: '🏠' },
        { path: '/tasks', label: 'Tasks', icon: '✅' },
        { path: '/expenses', label: 'Expenses', icon: '💰' },
        { path: '/chat', label: 'AI Assistant', icon: '🤖' },
    ]
    return (
        <div className="sidebar">
            <div className="sidebar-logo">
                <h2>🧠 LifeOS</h2>
            </div>

            <nav className="sidebar-nav">
                {links.map(link => (
                    <Link
                        key={link.path}
                        to={link.path}
                        className={`sidebar-link ${location.pathname === link.path ? 'active' : ''}`}
                    >
                        <span className="sidebar-icon">{link.icon}</span>
                        <span>{link.label}</span>
                    </Link>
                ))}
            </nav>

            <div className="sidebar-footer">
                <button className="logout-btn" onClick={handleLogout}>
                    🚪 Logout
                </button>
            </div>
        </div>
    )
}

export default Sidebar
