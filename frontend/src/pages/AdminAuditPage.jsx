import React, { useState, useEffect, useCallback } from 'react';
import {
  Sparkles,
  Search,
  Filter,
  Eye,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Info,
} from 'lucide-react';
import { adminApi } from '../api/admin';
import { Modal } from '../components/common/Modal';
import { useNotification } from '../context/NotificationContext';

export const AdminAuditPage = () => {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [actionFilter, setActionFilter] = useState('all');
  const [selectedLog, setSelectedLog] = useState(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const notify = useNotification();

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      const res = await adminApi.getAuditLogs({ action: actionFilter, page, per_page: 20 });
      if (res.success && res.data) {
        setLogs(res.data.items);
        setTotal(res.data.total);
        setPages(res.data.pages);
      }
    } catch (err) {
      notify.error('Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  }, [actionFilter, page, notify]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const getActionColor = (act) => {
    if (act === 'LOGIN' || act === 'REGISTER') return '#34d399';
    if (act === 'DELETE') return '#f87171';
    if (act === 'UPLOAD' || act === 'PROCESS') return '#38bdf8';
    if (act === 'ADMIN_ACTION') return '#c084fc';
    return '#94a3b8';
  };

  return (
    <div style={{ maxWidth: '1300px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '4px' }}>
          Compliance & Security Audit Trail
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
          Immutable log of all user authentications, document ingestions, deletions, and administrative interventions ({total} events).
        </p>
      </div>

      {/* Filter Row */}
      <div className="glass-card" style={{ padding: '16px 20px', marginBottom: '24px', display: 'flex', gap: '16px', alignItems: 'center' }}>
        <select
          className="input-control"
          style={{ width: 'auto', minWidth: '180px', height: '38px', fontSize: '0.85rem' }}
          value={actionFilter}
          onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
        >
          <option value="all">All Audit Actions</option>
          <option value="LOGIN">LOGIN</option>
          <option value="REGISTER">REGISTER</option>
          <option value="UPLOAD">UPLOAD</option>
          <option value="DELETE">DELETE</option>
          <option value="RENAME">RENAME</option>
          <option value="PROCESS">PROCESS</option>
          <option value="ADMIN_ACTION">ADMIN_ACTION</option>
        </select>
      </div>

      {/* Logs Table */}
      <div className="glass-card" style={{ padding: '16px', overflowX: 'auto' }}>
        {loading ? (
          <div style={{ padding: '60px 20px', textAlign: 'center' }}>
            <div style={{ width: '40px', height: '40px', border: '3px solid rgba(139,92,246,0.2)', borderTopColor: '#8b5cf6', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
            <p style={{ color: 'var(--text-muted)' }}>Loading compliance logs...</p>
          </div>
        ) : logs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
            No audit logs found for this filter.
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Timestamp (UTC)</th>
                <th>User</th>
                <th>Action</th>
                <th>Resource Type</th>
                <th>IP Address</th>
                <th style={{ textAlign: 'right' }}>Metadata Details</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id}>
                  <td style={{ fontSize: '0.82rem', fontFamily: 'monospace', color: 'var(--text-secondary)' }}>
                    {new Date(log.created_at).toISOString().replace('T', ' ').substring(0, 19)}
                  </td>
                  <td>
                    <span style={{ fontWeight: 600 }}>{log.username || 'System'}</span>
                  </td>
                  <td>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        padding: '3px 8px',
                        borderRadius: '6px',
                        backgroundColor: 'var(--bg-surface)',
                        color: getActionColor(log.action),
                        border: '1px solid var(--border-subtle)',
                      }}
                    >
                      {log.action}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{log.resource_type || 'SYSTEM'}</span>
                  </td>
                  <td style={{ fontSize: '0.8rem', fontFamily: 'monospace', color: 'var(--text-muted)' }}>
                    {log.ip_address || '127.0.0.1'}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      className="btn btn-secondary"
                      style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                      onClick={() => { setSelectedLog(log); setDetailsModalOpen(true); }}
                    >
                      <Eye size={13} />
                      <span>Inspect JSON</span>
                    </button>
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

      {/* JSON Metadata Inspection Modal */}
      <Modal isOpen={detailsModalOpen} onClose={() => setDetailsModalOpen(false)} title="Audit Event Metadata Payload">
        <pre
          style={{
            backgroundColor: 'var(--bg-surface)',
            padding: '16px',
            borderRadius: '10px',
            overflowX: 'auto',
            fontSize: '0.85rem',
            color: '#38bdf8',
            maxHeight: '400px',
          }}
        >
          {JSON.stringify(selectedLog?.details, null, 2)}
        </pre>
      </Modal>
    </div>
  );
};
