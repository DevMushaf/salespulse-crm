import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  PlusCircle,
  LogOut,
  Menu,
  X,
  Zap,
} from 'lucide-react';

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/leads', label: 'Leads', icon: Users },
    { path: '/leads/new', label: 'New Lead', icon: PlusCircle },
  ];

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="app-layout">
      {/* Mobile Header */}
      <header className="mobile-header">
        <button
          className="menu-toggle"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          id="menu-toggle-btn"
        >
          {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
        <div className="mobile-logo">
          <Zap size={20} />
          <span>SalesPulse CRM</span>
        </div>
      </header>

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo">
            <div className="logo-icon">
              <Zap size={24} />
            </div>
            <div className="logo-text">
              <h1>SalesPulse</h1>
              <span>CRM Platform</span>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map(({ path, label, icon: Icon }) => (
            <Link
              key={path}
              to={path}
              className={`nav-item ${isActive(path) ? 'nav-active' : ''}`}
              onClick={() => setSidebarOpen(false)}
              id={`nav-${label.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <Icon size={20} />
              <span>{label}</span>
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-card">
            <div
              className="user-avatar"
              style={{ backgroundColor: user?.avatar_color || '#6366f1' }}
            >
              {user?.name?.charAt(0)?.toUpperCase()}
            </div>
            <div className="user-info">
              <p className="user-name">{user?.name}</p>
              <p className="user-role">{user?.role}</p>
            </div>
            <button
              className="logout-btn"
              onClick={handleLogout}
              title="Logout"
              id="logout-btn"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}
