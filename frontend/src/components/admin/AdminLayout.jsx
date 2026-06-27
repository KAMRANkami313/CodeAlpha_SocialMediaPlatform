import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Flag,
  Users,
  ArrowLeft,
  Menu,
  X,
  ShieldCheck,
  ExternalLink
} from 'lucide-react';
import Avatar from '../common/Avatar';
import VerifiedBadge from '../common/VerifiedBadge';

const NAV_ITEMS = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { to: '/admin/reports', label: 'Reports', icon: Flag },
  { to: '/admin/users', label: 'Users', icon: Users }
];

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
  const isSuperAdmin = storedUser.role === 'super_admin';

  const isActive = (item) => {
    if (item.exact) return location.pathname === item.to;
    return location.pathname.startsWith(item.to);
  };

  const handleNavClick = () => {
    setMobileNavOpen(false);
  };

  return (
    <div className="admin-layout">
      <aside className={`admin-sidebar ${mobileNavOpen ? 'open' : ''}`}>
        <div className="admin-sidebar-header">
          <ShieldCheck size={22} className="admin-sidebar-logo" />
          <span className="admin-sidebar-title">Admin Panel</span>
        </div>

        <div className="admin-sidebar-user">
          <Avatar
            src={storedUser.profilePicture}
            alt="Avatar"
            className="admin-sidebar-avatar"
          />
          <div className="admin-sidebar-userinfo">
            <span className="admin-sidebar-username">
              {storedUser.username || 'Admin'}
              <VerifiedBadge show={isSuperAdmin} size="small" />
            </span>
            <span className="admin-sidebar-role">
              {isSuperAdmin ? 'Super Admin' : 'Admin'}
            </span>
          </div>
        </div>

        <nav className="admin-nav">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`admin-nav-item ${isActive(item) ? 'active' : ''}`}
                onClick={handleNavClick}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="admin-sidebar-footer">
          <button
            className="admin-nav-item"
            onClick={() => navigate('/')}
          >
            <ArrowLeft size={18} />
            <span>Back to App</span>
          </button>
        </div>
      </aside>

      {mobileNavOpen && (
        <div
          className="admin-sidebar-backdrop"
          onClick={() => setMobileNavOpen(false)}
          aria-hidden="true"
        />
      )}

      <div className="admin-main">
        <header className="admin-topbar">
          <button
            className="admin-mobile-toggle"
            onClick={() => setMobileNavOpen(o => !o)}
            aria-label="Toggle navigation"
            aria-expanded={mobileNavOpen}
          >
            {mobileNavOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <Link to="/" className="admin-topbar-link">
            <ExternalLink size={14} />
            View Site
          </Link>
        </header>

        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;