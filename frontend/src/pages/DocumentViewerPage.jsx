import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Search,
  Download,
  MessageSquare,
  FileText,
} from 'lucide-react';
import { documentApi } from '../api/documents';
import { useNotification } from '../context/NotificationContext';

export const DocumentViewerPage = () => {
  const { id } = useParams();
  const [docData, setDocData] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchHighlight, setSearchHighlight] = useState('');
  const [loading, setLoading] = useState(true);

  const notify = useNotification();
  const navigate = useNavigate();

  useEffect(() => {
    fetchPages();
  }, [id]);

  const fetchPages = async () => {
    try {
      setLoading(true);
      const res = await documentApi.getPages(id);
      if (res.success && res.data) {
        setDocData(res.data);
      }
    } catch (err) {
      notify.error(err.message || 'Failed to load document pages');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '80px 20px', textAlign: 'center' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid rgba(59,130,246,0.2)', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
        <p style={{ color: 'var(--text-muted)' }}>Loading page text...</p>
      </div>
    );
  }

  const pages = docData?.pages || [];
  const activePageObj = pages.find((p) => p.page_number === currentPage) || pages[0] || { text_content: '' };

  const renderHighlightedText = (text, term) => {
    if (!term || !term.trim()) return text;
    const parts = text.split(new RegExp(`(${term})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === term.toLowerCase() ? (
        <mark key={i} style={{ backgroundColor: '#fbbf24', color: '#000', borderRadius: '2px', padding: '0 2px' }}>
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <button
            onClick={() => navigate(`/documents/${id}`)}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', marginBottom: '8px' }}
          >
            <ArrowLeft size={16} />
            <span>Back to Details</span>
          </button>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800 }}>{docData?.title}</h2>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Page-by-Page Interactive Document Reader
          </span>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <Link to={`/chat?doc=${id}`} className="btn btn-primary">
            <MessageSquare size={16} />
            <span>Chat RAG</span>
          </Link>
          <a href={documentApi.getDownloadUrl(id)} download className="btn btn-secondary">
            <Download size={16} />
            <span>Original</span>
          </a>
        </div>
      </div>

      {/* Reader Controls Bar */}
      <div className="glass-card" style={{ padding: '12px 20px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        {/* Page Nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="btn btn-secondary"
            style={{ padding: '6px 10px' }}
          >
            <ChevronLeft size={16} />
          </button>
          <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>
            Page {currentPage} of {pages.length || 1}
          </span>
          <button
            disabled={currentPage >= pages.length}
            onClick={() => setCurrentPage((p) => Math.min(pages.length, p + 1))}
            className="btn btn-secondary"
            style={{ padding: '6px 10px' }}
          >
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Search Highlight in page */}
        <div style={{ position: 'relative', minWidth: '240px' }}>
          <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="input-control"
            style={{ paddingLeft: '32px', height: '34px', fontSize: '0.8rem' }}
            placeholder="Highlight word in page..."
            value={searchHighlight}
            onChange={(e) => setSearchHighlight(e.target.value)}
          />
        </div>
      </div>

      {/* Page Paper View */}
      <div
        className="glass-card"
        style={{
          padding: '40px 48px',
          minHeight: '600px',
          backgroundColor: 'var(--bg-secondary)',
          borderRadius: '16px',
          border: '1px solid var(--border-subtle)',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px', marginBottom: '24px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          <span>PAGE {currentPage}</span>
          <span>{activePageObj.char_count || activePageObj.text_content?.length || 0} CHARACTERS</span>
        </div>

        <div
          style={{
            fontSize: '0.95rem',
            lineHeight: 1.8,
            color: 'var(--text-primary)',
            whiteSpace: 'pre-wrap',
            fontFamily: 'system-ui, -apple-system, sans-serif',
          }}
        >
          {renderHighlightedText(activePageObj.text_content || 'No text on this page.', searchHighlight)}
        </div>
      </div>
    </div>
  );
};
