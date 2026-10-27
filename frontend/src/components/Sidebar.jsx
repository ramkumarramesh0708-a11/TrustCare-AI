import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Shield,
  LayoutDashboard,
  Compass,
  FilePlus,
  History,
  AlertTriangle,
  UserCheck,
  Cpu,
  FileText,
  User,
  HelpCircle,
  LogOut,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ alertCount = 0 }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isReviewerOrAdmin = user && (user.role === 'reviewer' || user.role === 'veterinarian' || user.role === 'admin');

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo-icon">
          <Shield size={24} />
        </div>
        <div>
          <div className="sidebar-brand-name">AEGIS AI</div>
          <div className="sidebar-brand-tagline">Risk & Decision Support</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="sidebar-section-title">Screening & Insights</div>
        <NavLink to="/" end className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <LayoutDashboard size={18} />
          <span>Overview</span>
        </NavLink>
        <NavLink to="/modules" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <Compass size={18} />
          <span>Directory</span>
        </NavLink>
        <NavLink to="/assessments/new" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <FilePlus size={18} />
          <span>New Assessment</span>
        </NavLink>
        <NavLink to="/assessments" end className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <History size={18} />
          <span>Assessment History</span>
        </NavLink>

        <div className="sidebar-section-title">Clinical & Safety Review</div>
        <NavLink to="/alerts" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <AlertTriangle size={18} />
          <span>Alert Center</span>
          {alertCount > 0 && (
            <span style={{ marginLeft: 'auto', background: 'var(--color-red-600)', color: 'white', fontSize: '0.7rem', padding: '2px 7px', borderRadius: '10px', fontWeight: 'bold' }}>
              {alertCount}
            </span>
          )}
        </NavLink>

        {isReviewerOrAdmin && (
          <NavLink to="/review-workspace" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <UserCheck size={18} />
            <span>Review Workspace</span>
          </NavLink>
        )}

        <div className="sidebar-section-title">Governance & System</div>
        <NavLink to="/models" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <Cpu size={18} />
          <span>Model Registry</span>
        </NavLink>
        <NavLink to="/audit-logs" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <FileText size={18} />
          <span>Audit Logs</span>
        </NavLink>
        <NavLink to="/profile" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <User size={18} />
          <span>Profile & Consent</span>
        </NavLink>
        <NavLink to="/help" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <HelpCircle size={18} />
          <span>Help & Limitations</span>
        </NavLink>
      </nav>

      {/* User Status Footer */}
      <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.08)', background: 'rgba(0,0,0,0.2)' }}>
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: '600', color: 'white', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                {user.full_name}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--color-teal-500)', textTransform: 'capitalize' }}>
                Role: {user.role}
              </div>
            </div>
            <button
              onClick={handleLogout}
              style={{ background: 'transparent', border: 'none', color: 'var(--color-slate-400)', cursor: 'pointer', padding: '6px' }}
              title="Logout"
            >
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <NavLink to="/login" className="btn btn-primary btn-sm" style={{ width: '100%' }}>
            Sign In
          </NavLink>
        )}
      </div>
    </aside>
  );
}
