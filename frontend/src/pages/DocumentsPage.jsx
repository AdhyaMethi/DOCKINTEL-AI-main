import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Files,
  Search,
  Filter,
  Plus,
  Trash2,
  Edit2,
  Download,
  Eye,
  MessageSquare,
  Sparkles,
  RefreshCw,
  LayoutGrid,
  List,
  FileText,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { documentApi } from '../api/documents';
import { StatusBadge } from '../components/common/StatusBadge';
import { Modal } from '../components/common/Modal';
import { EmptyState } from '../components/common/EmptyState';
import { useNotification } from '../context/NotificationContext';

export const DocumentsPage = () => {
  const [documents, setDocuments] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filters
  const [query, setQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [order, setOrder] = useState('desc');
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'grid'

  // Modals
  const [renameModalOpen, setRenameModalOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [newTitle, setNewTitle] = useState('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const notify = useNotification();
  const navigate = useNavigate();

  const fetchDocuments = useCallback(async () => {
    try {
      setLoading(true);
      const res = await documentApi.list({
        q: query,
        type: selectedType,
        status: selectedStatus,
        sort_by: sortBy,
        order,
        page,
        per_page: 12,
      });
      if (res.success && res.data) {
        setDocuments(res.data.items);
        setTotal(res.data.total);
        setPages(res.data.pages);
      }
    } catch (err) {
      notify.error(err.message || 'Failed to load documents');
    } finally {
      setLoading(false);
    }
  }, [query, selectedType, selectedStatus, sortBy, order, page, notify]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const handleRename = async (e) => {
    e.preventDefault();
    if (!selectedDoc || !newTitle.trim()) return;

    try {
      setActionLoading(true);
      await documentApi.rename(selectedDoc.id, newTitle);
      notify.success('Document renamed successfully');
      setRenameModalOpen(false);
      fetchDocuments();
    } catch (err) {
      notify.error(err.message || 'Failed to rename document');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedDoc) return;
    try {
      setActionLoading(true);
      await documentApi.delete(selectedDoc.id);
      notify.success('Document deleted');
      setDeleteModalOpen(false);
      fetchDocuments();
    } catch (err) {
      notify.error(err.message || 'Failed to delete document');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReprocess = async (docId) => {
    try {
      await documentApi.reprocess(docId);
      notify.success('Re-processing started');
      fetchDocuments();
    } catch (err) {
      notify.error(err.message || 'Failed to reprocess');
    }
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '4px' }}>
            Document Repository
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
            Manage, filter, analyze, and query your knowledge base ({total} total).
          </p>
        </div>

        <button className="btn btn-primary" onClick={() => navigate('/upload')}>
          <Plus size={16} />
          <span>Upload Document</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-card" style={{ padding: '16px 20px', marginBottom: '24px', display: 'flex', flexWrap: 'wrap', gap: '14px', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', flex: 1, minWidth: '280px' }}>
          {/* Search Input */}
          <div style={{ position: 'relative', minWidth: '220px', flex: 1 }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search by title or filename..."
              className="input-control"
              style={{ paddingLeft: '38px', height: '38px', fontSize: '0.85rem' }}
              value={query}
              onChange={(e) => { setQuery(e.target.value); setPage(1); }}
            />
          </div>

          {/* Type Filter */}
          <select
            className="input-control"
            style={{ width: 'auto', minWidth: '150px', height: '38px', fontSize: '0.85rem' }}
            value={selectedType}
            onChange={(e) => { setSelectedType(e.target.value); setPage(1); }}
          >
            <option value="all">All Document Types</option>
            <option value="Research Paper">Research Paper</option>
            <option value="Resume">Resume</option>
            <option value="Invoice">Invoice</option>
            <option value="Contract">Contract</option>
            <option value="Report">Report</option>
            <option value="Certificate">Certificate</option>
            <option value="Notes">Notes</option>
            <option value="Manual">Manual</option>
            <option value="General Document">General Document</option>
          </select>

          {/* Status Filter */}
          <select
            className="input-control"
            style={{ width: 'auto', minWidth: '140px', height: '38px', fontSize: '0.85rem' }}
            value={selectedStatus}
            onChange={(e) => { setSelectedStatus(e.target.value); setPage(1); }}
          >
            <option value="all">All Statuses</option>
            <option value="completed">Completed</option>
            <option value="processing">Processing</option>
            <option value="failed">Failed</option>
            <option value="uploaded">Uploaded</option>
          </select>
        </div>

        {/* View Toggle */}
        <div style={{ display: 'flex', gap: '6px', backgroundColor: 'var(--bg-surface)', padding: '3px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
          <button
            onClick={() => setViewMode('table')}
            style={{
              background: viewMode === 'table' ? 'var(--accent-primary)' : 'transparent',
              color: viewMode === 'table' ? '#fff' : 'var(--text-muted)',
              border: 'none',
              borderRadius: '6px',
              padding: '6px 10px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <List size={16} />
          </button>
          <button
            onClick={() => setViewMode('grid')}
            style={{
              background: viewMode === 'grid' ? 'var(--accent-primary)' : 'transparent',
              color: viewMode === 'grid' ? '#fff' : 'var(--text-muted)',
              border: 'none',
              borderRadius: '6px',
              padding: '6px 10px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <LayoutGrid size={16} />
          </button>
        </div>
      </div>

      {/* Content View */}
      {loading ? (
        <div style={{ padding: '80px 20px', textAlign: 'center' }}>
          <div style={{ width: '40px', height: '40px', border: '3px solid rgba(59,130,246,0.2)', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
          <p style={{ color: 'var(--text-muted)' }}>Loading documents...</p>
        </div>
      ) : documents.length === 0 ? (
        <EmptyState
          title="No documents match your query"
          description="Try clearing your search query or upload new files to process."
          action={
            <button className="btn btn-primary" onClick={() => navigate('/upload')}>
              <Plus size={16} />
              <span>Upload Document</span>
            </button>
          }
        />
      ) : viewMode === 'table' ? (
        <div className="glass-card" style={{ padding: '16px', overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Document</th>
                <th>Classification</th>
                <th>Pages</th>
                <th>Words</th>
                <th>Status</th>
                <th>Uploaded</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {documents.map((doc) => (
                <tr key={doc.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: 'var(--bg-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)', flexShrink: 0 }}>
                        <FileText size={18} />
                      </div>
                      <div>
                        <Link to={`/documents/${doc.id}`} style={{ color: 'var(--text-primary)', fontWeight: 600, textDecoration: 'none', display: 'block' }}>
                          {doc.title}
                        </Link>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {doc.original_filename} • {(doc.file_size / 1024).toFixed(1)} KB
                        </span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-tech">{doc.document_type}</span>
                  </td>
                  <td>{doc.page_count || 1}</td>
                  <td>{doc.total_words?.toLocaleString() || 0}</td>
                  <td>
                    <StatusBadge status={doc.status} />
                  </td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {new Date(doc.created_at).toLocaleDateString()}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                      <Link to={`/documents/${doc.id}/view`} title="Read Pages" className="btn btn-secondary" style={{ padding: '6px 8px' }}>
                        <Eye size={14} />
                      </Link>
                      <Link to={`/documents/${doc.id}/analysis`} title="Deep NLP Analysis" className="btn btn-secondary" style={{ padding: '6px 8px' }}>
                        <Sparkles size={14} color="#38bdf8" />
                      </Link>
                      <Link to={`/chat?doc=${doc.id}`} title="Chat With Document" className="btn btn-primary" style={{ padding: '6px 8px' }}>
                        <MessageSquare size={14} />
                      </Link>
                      <a href={documentApi.getDownloadUrl(doc.id)} download title="Download Original" className="btn btn-secondary" style={{ padding: '6px 8px' }}>
                        <Download size={14} />
                      </a>
                      <button
                        onClick={() => { setSelectedDoc(doc); setNewTitle(doc.title); setRenameModalOpen(true); }}
                        title="Rename"
                        className="btn btn-secondary"
                        style={{ padding: '6px 8px' }}
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => { setSelectedDoc(doc); setDeleteModalOpen(true); }}
                        title="Delete"
                        className="btn btn-danger"
                        style={{ padding: '6px 8px' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* Grid Mode */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {documents.map((doc) => (
            <div key={doc.id} className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span className="badge badge-tech">{doc.document_type}</span>
                  <StatusBadge status={doc.status} />
                </div>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '6px' }}>
                  <Link to={`/documents/${doc.id}`} style={{ color: 'var(--text-primary)', textDecoration: 'none' }}>
                    {doc.title}
                  </Link>
                </h4>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                  {doc.original_filename} • {doc.page_count || 1} pages • {doc.total_words?.toLocaleString() || 0} words
                </p>
              </div>

              <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid var(--border-subtle)', paddingTop: '14px' }}>
                <Link to={`/documents/${doc.id}`} className="btn btn-secondary" style={{ flex: 1, padding: '6px', fontSize: '0.8rem' }}>
                  Overview
                </Link>
                <Link to={`/chat?doc=${doc.id}`} className="btn btn-primary" style={{ flex: 1, padding: '6px', fontSize: '0.8rem' }}>
                  <MessageSquare size={14} />
                  <span>Chat</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {pages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '28px' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Showing page {page} of {pages} ({total} documents)
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

      {/* Rename Modal */}
      <Modal isOpen={renameModalOpen} onClose={() => setRenameModalOpen(false)} title="Rename Document">
        <form onSubmit={handleRename}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px', color: 'var(--text-secondary)' }}>
              Document Title
            </label>
            <input
              type="text"
              required
              className="input-control"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setRenameModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" disabled={actionLoading} className="btn btn-primary">
              {actionLoading ? 'Saving...' : 'Save Title'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} title="Confirm Document Deletion">
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '20px' }}>
          Are you sure you want to delete <strong>"{selectedDoc?.title}"</strong>? This will permanently remove all extracted text, vector chunks, embeddings, and chat history for this file.
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button type="button" className="btn btn-secondary" onClick={() => setDeleteModalOpen(false)}>
            Cancel
          </button>
          <button type="button" disabled={actionLoading} className="btn btn-danger" onClick={handleDelete}>
            {actionLoading ? 'Deleting...' : 'Delete Document'}
          </button>
        </div>
      </Modal>
    </div>
  );
};
