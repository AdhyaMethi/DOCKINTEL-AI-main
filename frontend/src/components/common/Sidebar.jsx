import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Files,
  UploadCloud,
  Search,
  MessageSquare,
  MessagesSquare,
  GitCompare,
  User,
  ShieldAlert,
  Settings,
  LogOut,
  BrainCircuit,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Sidebar = ({ isOpen, onClose }) => {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/documents', label: 'Documents', icon: Files },
    { to: '/upload', label: 'Upload Document', icon: UploadCloud },
    { to: '/search', label: 'Semantic Search', icon: Search },
    { to: '/chat', label: 'Document Chat', icon: MessageSquare },
    { to: '/multi-chat', label: 'Multi-Doc Chat', icon: MessagesSquare },
    { to: '/compare', label: 'Compare Docs', icon: GitCompare },
  ];

  const adminItems = [
    { to: '/admin', label: 'Admin Dashboard', icon: ShieldAlert },
    { to: '/admin/users', label: 'Manage Users', icon: User },
    { to: '/admin/audit', label: 'Audit Logs', icon: Sparkles },
  ];

  return (
    <aside
      style={{
        width: '260px',
        backgroundColor: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        position: 'sticky',
        top: 0,
        zIndex: 40,
        flexShrink: 0,
      }}
    >
      {/* Brand Header */}
      <div style={{ padding: '24px 20px', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid var(--border-subtle)' }}>
        <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)' }}>
          <BrainCircuit size={22} />
        </div>
        <div>
          <h2 style={{ fontSize: '1.05rem', fontWeight: 800, letterSpacing: '-0.02em', background: 'linear-gradient(135deg, #ffffff 0%, #94a3b8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            DocIntel AI
          </h2>
          <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--accent-primary)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            Enterprise Platform
          </span>
        </div>
      </div>

      {/* Nav links */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '8px 12px 4px' }}>
          Document Intelligence
        </span>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onClose}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '10px 14px',
              borderRadius: '10px',
              color: isActive ? '#ffffff' : 'var(--text-secondary)',
              backgroundColor: isActive ? 'var(--accent-primary)' : 'transparent',
              textDecoration: 'none',
              fontSize: '0.875rem',
              fontWeight: isActive ? 600 : 500,
              transition: 'all 0.15s ease',
            })}
          >
            <item.icon size={18} />
            <span>{item.label}</span>
          </NavLink>
        ))}

        {isAdmin && (
          <>
            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '16px 12px 4px' }}>
              Administration
            </span>
            {adminItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  color: isActive ? '#ffffff' : 'var(--text-secondary)',
                  backgroundColor: isActive ? '#7c3aed' : 'transparent',
                  textDecoration: 'none',
                  fontSize: '0.875rem',
                  fontWeight: isActive ? 600 : 500,
                  transition: 'all 0.15s ease',
                })}
              >
                <item.icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </>
        )}

        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '16px 12px 4px' }}>
          Preferences
        </span>
        <NavLink
          to="/profile"
          onClick={onClose}
          style={({ isActive }) => ({
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '10px 14px',
            borderRadius: '10px',
            color: isActive ? '#ffffff' : 'var(--text-secondary)',
            backgroundColor: isActive ? 'var(--bg-surface)' : 'transparent',
            textDecoration: 'none',
            fontSize: '0.875rem',
            fontWeight: isActive ? 600 : 500,
          })}
        >
          <User size={18} />
          <span>Profile & API Keys</span>
        </NavLink>
        <NavLink
          to="/settings"
          onClick={onClose}
          style={({ isActive }) => ({
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '10px 14px',
            borderRadius: '10px',
            color: isActive ? '#ffffff' : 'var(--text-secondary)',
            backgroundColor: isActive ? 'var(--bg-surface)' : 'transparent',
            textDecoration: 'none',
            fontSize: '0.875rem',
            fontWeight: isActive ? 600 : 500,
          })}
        >
          <Settings size={18} />
          <span>System Settings</span>
        </NavLink>
      </div>

      {/* User Footer Card */}
      <div style={{ padding: '16px', borderTop: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
          <div style={{ width: '34px', height: '34px', borderRadius: '50%', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem', color: 'var(--accent-primary)', flexShrink: 0 }}>
            {user?.username?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div style={{ minWidth: 0, overflow: 'hidden' }}>
            <p style={{ fontSize: '0.85rem', fontWeight: 600, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{user?.username || 'User'}</p>
            <span style={{ fontSize: '0.7rem', color: user?.role === 'admin' ? '#a78bfa' : 'var(--text-muted)', textTransform: 'capitalize' }}>
              {user?.role || 'user'}
            </span>
          </div>
        </div>
        <button
          onClick={handleLogout}
          title="Log Out"
          style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '6px', borderRadius: '8px', display: 'flex', alignItems: 'center' }}
        >
          <LogOut size={18} />
        </button>
      </div>
    </aside>
  );
};
