import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  Users,
  Files,
  HardDrive,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowUpRight,
} from 'lucide-react';
import { adminApi } from '../api/admin';
import { useNotification } from '../context/NotificationContext';

export const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const notify = useNotification();
  const navigate = useNavigate();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getStats();
      if (res.success && res.data) {
        setStats(res.data);
      }
    } catch (err) {
      notify.error('Failed to load administrator statistics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '80px 20px', textAlign: 'center' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid rgba(139,92,246,0.2)', borderTopColor: '#8b5cf6', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
        <p style={{ color: 'var(--text-muted)' }}>Loading administrative telemetry...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1300px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '4px' }}>
            System Administration Plane
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
            Monitor system health, user quotas, document throughput, and security compliance.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <Link to="/admin/users" className="btn btn-secondary">
            <Users size={16} />
            <span>Manage Users</span>
          </Link>
          <Link to="/admin/audit" className="btn btn-primary" style={{ background: '#7c3aed' }}>
            <Sparkles size={16} />
            <span>Audit Trail</span>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Registered Accounts</span>
            <Users size={18} color="#a855f7" />
          </div>
          <h3 style={{ fontSize: '1.8rem', fontWeight: 800 }}>{stats?.total_users || 0}</h3>
          <span style={{ fontSize: '0.75rem', color: '#34d399', marginTop: '4px', display: 'block' }}>
            {stats?.active_users || 0} active users
          </span>
        </div>

        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Ingested Docs</span>
            <Files size={18} color="#38bdf8" />
          </div>
          <h3 style={{ fontSize: '1.8rem', fontWeight: 800 }}>{stats?.total_documents || 0}</h3>
          <span style={{ fontSize: '0.75rem', color: '#34d399', marginTop: '4px', display: 'block' }}>
            {stats?.completed_documents || 0} completed
          </span>
        </div>

        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Pipeline Failures</span>
            <AlertCircle size={18} color="#f87171" />
          </div>
          <h3 style={{ fontSize: '1.8rem', fontWeight: 800 }}>{stats?.failed_documents || 0}</h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
            {stats?.processing_documents || 0} currently running
          </span>
        </div>

        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Global Storage</span>
            <HardDrive size={18} color="#67e8f9" />
          </div>
          <h3 style={{ fontSize: '1.8rem', fontWeight: 800 }}>{stats?.total_storage_mb || 0} MB</h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
            Encrypted file volume
          </span>
        </div>
      </div>

      {/* Quick Action Navigation Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <div style={{ padding: '10px', borderRadius: '10px', backgroundColor: 'rgba(124,58,237,0.15)', color: '#c084fc' }}>
              <Users size={22} />
            </div>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 700 }}>User Management</h4>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: '20px' }}>
            Activate or deactivate user accounts, adjust system permissions, assign administrative roles, and inspect user storage usage.
          </p>
          <Link to="/admin/users" className="btn btn-secondary" style={{ width: '100%' }}>
            <span>Open User Directory</span>
            <ArrowUpRight size={16} />
          </Link>
        </div>

        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <div style={{ padding: '10px', borderRadius: '10px', backgroundColor: 'rgba(59,130,246,0.15)', color: '#38bdf8' }}>
              <Sparkles size={22} />
            </div>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Audit Logs & Compliance</h4>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: '20px' }}>
            Inspect security events, login attempts, document downloads, deletions, and administrative actions with IP tracking.
          </p>
          <Link to="/admin/audit" className="btn btn-secondary" style={{ width: '100%' }}>
            <span>View Audit Trail</span>
            <ArrowUpRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
};
