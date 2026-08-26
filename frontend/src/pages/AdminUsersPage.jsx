import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  Search,
  CheckCircle2,
  XCircle,
  Shield,
  User,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { adminApi } from '../api/admin';
import { useNotification } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';

export const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const { user: currentAdmin } = useAuth();
  const notify = useNotification();

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await adminApi.listUsers({ search, page, per_page: 15 });
      if (res.success && res.data) {
        setUsers(res.data.items);
        setTotal(res.data.total);
        setPages(res.data.pages);
      }
    } catch (err) {
      notify.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [search, page, notify]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleToggleStatus = async (user) => {
    if (user.id === currentAdmin.id) {
      notify.warning('You cannot deactivate your own account.');
      return;
    }

    try {
      await adminApi.toggleUserStatus(user.id, !user.is_active);
      notify.success(`User ${user.username} set to ${!user.is_active ? 'Active' : 'Deactivated'}`);
      fetchUsers();
    } catch (err) {
      notify.error(err.message || 'Failed to update user status');
    }
  };

  const handleChangeRole = async (user, newRole) => {
    if (user.id === currentAdmin.id) {
      notify.warning('You cannot change your own administrative role.');
      return;
    }

    try {
      await adminApi.changeUserRole(user.id, newRole);
      notify.success(`User ${user.username} role updated to ${newRole}`);
      fetchUsers();
    } catch (err) {
      notify.error(err.message || 'Failed to update role');
    }
  };

  return (
    <div style={{ maxWidth: '1300px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '4px' }}>
            User Management Directory
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
            View registered accounts, toggle active status, and assign RBAC administrator privileges ({total} total).
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="glass-card" style={{ padding: '16px 20px', marginBottom: '24px' }}>
        <div style={{ position: 'relative', maxWidth: '380px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="input-control"
            style={{ paddingLeft: '38px', height: '38px', fontSize: '0.85rem' }}
            placeholder="Search by username or email..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="glass-card" style={{ padding: '16px', overflowX: 'auto' }}>
        {loading ? (
          <div style={{ padding: '60px 20px', textAlign: 'center' }}>
            <div style={{ width: '40px', height: '40px', border: '3px solid rgba(139,92,246,0.2)', borderTopColor: '#8b5cf6', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
            <p style={{ color: 'var(--text-muted)' }}>Loading user accounts...</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Status</th>
                <th>Documents</th>
                <th>Joined</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem', color: 'var(--accent-primary)' }}>
                        {u.username?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <span style={{ fontWeight: 600, color: 'var(--text-primary)', display: 'block' }}>{u.username}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{u.email}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <select
                      className="input-control"
                      style={{ width: 'auto', padding: '4px 8px', fontSize: '0.78rem', height: '30px' }}
                      value={u.role}
                      disabled={u.id === currentAdmin.id}
                      onChange={(e) => handleChangeRole(u, e.target.value)}
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td>
                    {u.is_active ? (
                      <span className="badge badge-completed">
                        <CheckCircle2 size={12} /> Active
                      </span>
                    ) : (
                      <span className="badge badge-failed">
                        <XCircle size={12} /> Inactive
                      </span>
                    )}
                  </td>
                  <td>{u.document_count || 0}</td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                  <td>
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => handleToggleStatus(u)}
                        disabled={u.id === currentAdmin.id}
                        className={u.is_active ? 'btn btn-danger' : 'btn btn-secondary'}
                        style={{ padding: '4px 12px', fontSize: '0.78rem' }}
                      >
                        {u.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '24px' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Showing page {page} of {pages}
          </span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="btn btn-secondary"
              style={{ padding: '6px 12px', fontSize: '0.8rem' }}
            >
              <ChevronLeft size={16} />
              <span>Previous</span>
            </button>
            <button
              disabled={page >= pages}
              onClick={() => setPage((p) => Math.min(pages, p + 1))}
              className="btn btn-secondary"
              style={{ padding: '6px 12px', fontSize: '0.8rem' }}
            >
              <span>Next</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
