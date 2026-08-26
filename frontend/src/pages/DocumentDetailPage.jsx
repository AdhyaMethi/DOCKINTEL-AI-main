import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  FileText,
  Eye,
  MessageSquare,
  Sparkles,
  Download,
  RefreshCw,
  Clock,
  Layers,
  Cpu,
  Key,
  BookOpen,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Hash,
} from 'lucide-react';
import { documentApi } from '../api/documents';
import { StatusBadge } from '../components/common/StatusBadge';
import { EntityBadge } from '../components/common/EntityBadge';
import { useNotification } from '../context/NotificationContext';

export const DocumentDetailPage = () => {
  const { id } = useParams();
  const [doc, setDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'summary' | 'text' | 'entities' | 'keywords' | 'metadata' | 'pipeline'

  const notify = useNotification();
  const navigate = useNavigate();

  useEffect(() => {
    fetchDoc();
  }, [id]);

  const fetchDoc = async () => {
    try {
      setLoading(true);
      const res = await documentApi.get(id);
      if (res.success && res.data) {
        setDoc(res.data);
      }
    } catch (err) {
      notify.error(err.message || 'Failed to load document');
    } finally {
      setLoading(false);
    }
  };

  const handleReprocess = async () => {
    try {
      await documentApi.reprocess(id);
      notify.success('Re-processing pipeline started');
      fetchDoc();
    } catch (err) {
      notify.error(err.message || 'Failed to reprocess document');
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '80px 20px', textAlign: 'center' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid rgba(59,130,246,0.2)', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
        <p style={{ color: 'var(--text-muted)' }}>Loading document details...</p>
      </div>
    );
  }

  if (!doc) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>Document not found</p>
        <Link to="/documents" className="btn btn-secondary">
          <ArrowLeft size={16} />
          <span>Back to Documents</span>
        </Link>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Layers },
    { id: 'summary', label: 'AI Summary', icon: Sparkles },
    { id: 'text', label: 'Extracted Text', icon: BookOpen },
    { id: 'entities', label: `Entities (${doc.entities?.length || 0})`, icon: Cpu },
    { id: 'keywords', label: `Keywords (${doc.keywords?.length || 0})`, icon: Key },
    { id: 'metadata', label: 'Metadata', icon: Hash },
    { id: 'pipeline', label: 'Processing Logs', icon: Clock },
  ];

  return (
    <div style={{ maxWidth: '1300px', margin: '0 auto' }}>
      {/* Back Button & Header */}
      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={() => navigate('/documents')}
          style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', marginBottom: '12px' }}
        >
          <ArrowLeft size={16} />
          <span>Back to Documents</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <span className="badge badge-tech">{doc.document_type}</span>
              <StatusBadge status={doc.status} />
              {doc.ocr_applied && <span className="badge badge-org">OCR Applied</span>}
            </div>
            <h2 style={{ fontSize: '1.85rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '6px' }}>
              {doc.title}
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              {doc.original_filename} • {(doc.file_size / 1024).toFixed(1)} KB • {doc.page_count || 1} Pages • {doc.total_words?.toLocaleString() || 0} Words
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn btn-secondary" onClick={handleReprocess} title="Reprocess Pipeline">
              <RefreshCw size={15} />
              <span>Reprocess</span>
            </button>
            <a href={documentApi.getDownloadUrl(doc.id)} download className="btn btn-secondary">
              <Download size={15} />
              <span>Download Original</span>
            </a>
            <Link to={`/documents/${doc.id}/view`} className="btn btn-secondary">
              <Eye size={15} />
              <span>Page Reader</span>
            </Link>
            <Link to={`/chat?doc=${doc.id}`} className="btn btn-primary">
              <MessageSquare size={15} />
              <span>Chat RAG</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Tabs Row */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-subtle)', marginBottom: '24px', overflowX: 'auto', paddingBottom: '4px' }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 16px',
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === tab.id ? '2px solid var(--accent-primary)' : '2px solid transparent',
              color: activeTab === tab.id ? '#ffffff' : 'var(--text-muted)',
              fontWeight: activeTab === tab.id ? 700 : 500,
              fontSize: '0.875rem',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s ease',
            }}
          >
            <tab.icon size={16} color={activeTab === tab.id ? 'var(--accent-primary)' : 'var(--text-muted)'} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      {/* 1. Overview */}
      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
          <div className="glass-card" style={{ padding: '24px' }}>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={18} color="#38bdf8" /> Executive Summary
            </h4>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.95rem', marginBottom: '20px' }}>
              {doc.summary?.short_summary || 'Summary pending processing...'}
            </p>

            <h5 style={{ fontSize: '0.9rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '10px' }}>
              Key Highlights
            </h5>
            <ul style={{ paddingLeft: '20px', color: 'var(--text-secondary)', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {doc.summary?.key_points?.map((pt, idx) => (
                <li key={idx}>{pt}</li>
              )) || <li>No key points extracted yet.</li>}
            </ul>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Classification & Confidence */}
            <div className="glass-card" style={{ padding: '20px' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '12px' }}>Classification Model</h4>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Classified As</span>
                <span className="badge badge-tech" style={{ fontSize: '0.85rem' }}>{doc.document_type}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Confidence Score</span>
                <span style={{ fontWeight: 750, color: '#34d399' }}>{Math.round((doc.classification_confidence || 0.95) * 100)}%</span>
              </div>
            </div>

            {/* Quick Entity Preview */}
            <div className="glass-card" style={{ padding: '20px' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '12px' }}>Top Extracted Entities</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {doc.entities?.slice(0, 10).map((e) => (
                  <EntityBadge key={e.id} type={e.entity_type} value={e.entity_value} count={e.count} />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. AI Summary */}
      {activeTab === 'summary' && (
        <div className="glass-card" style={{ padding: '28px' }}>
          <div style={{ marginBottom: '28px' }}>
            <h4 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '8px' }}>Short Summary</h4>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.95rem' }}>
              {doc.summary?.short_summary || 'No summary available.'}
            </p>
          </div>

          <div style={{ marginBottom: '28px' }}>
            <h4 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '8px' }}>Detailed Narrative</h4>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: '0.95rem', whiteSpace: 'pre-line' }}>
              {doc.summary?.detailed_summary || 'No detailed narrative available.'}
            </p>
          </div>

          <div>
            <h4 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '12px' }}>Bullet Points</h4>
            <ul style={{ paddingLeft: '20px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {doc.summary?.key_points?.map((p, i) => (
                <li key={i}>{p}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* 3. Extracted Text */}
      {activeTab === 'text' && (
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Cleaned & Normalized Full Text</h4>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {doc.total_characters?.toLocaleString()} Characters • {doc.total_words?.toLocaleString()} Words
            </span>
          </div>
          <div
            style={{
              backgroundColor: 'var(--bg-surface)',
              padding: '20px',
              borderRadius: '10px',
              maxHeight: '600px',
              overflowY: 'auto',
              whiteSpace: 'pre-wrap',
              fontFamily: 'monospace',
              fontSize: '0.85rem',
              lineHeight: 1.7,
              color: 'var(--text-primary)',
            }}
          >
            {doc.cleaned_text || doc.raw_text || 'No text extracted.'}
          </div>
        </div>
      )}

      {/* 4. Entities */}
      {activeTab === 'entities' && (
        <div className="glass-card" style={{ padding: '24px' }}>
          <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px' }}>Named Entity Recognition (NER)</h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {doc.entities?.map((e) => (
              <EntityBadge key={e.id} type={e.entity_type} value={e.entity_value} count={e.count} />
            ))}
          </div>
        </div>
      )}

      {/* 5. Keywords */}
      {activeTab === 'keywords' && (
        <div className="glass-card" style={{ padding: '24px' }}>
          <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px' }}>Key Terms & Frequency Weights</h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {doc.keywords?.map((k) => (
              <span
                key={k.id}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 14px',
                  backgroundColor: 'var(--bg-surface)',
                  borderRadius: '10px',
                  border: '1px solid var(--border-subtle)',
                  fontSize: '0.875rem',
                }}
              >
                <span style={{ fontWeight: 600 }}>{k.keyword}</span>
                <span style={{ color: 'var(--accent-primary)', fontSize: '0.75rem' }}>freq: {k.frequency}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 6. Metadata */}
      {activeTab === 'metadata' && (
        <div className="glass-card" style={{ padding: '24px' }}>
          <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px' }}>Structured JSON Metadata</h4>
          <pre
            style={{
              backgroundColor: 'var(--bg-surface)',
              padding: '20px',
              borderRadius: '10px',
              overflowX: 'auto',
              fontSize: '0.85rem',
              color: '#38bdf8',
            }}
          >
            {JSON.stringify(doc.metadata, null, 2)}
          </pre>
        </div>
      )}

      {/* 7. Pipeline History */}
      {activeTab === 'pipeline' && (
        <div className="glass-card" style={{ padding: '24px' }}>
          <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px' }}>Processing Pipeline History</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {doc.jobs?.map((job) => (
              <div
                key={job.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 18px',
                  backgroundColor: 'var(--bg-surface)',
                  borderRadius: '10px',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <CheckCircle2 size={16} color="#34d399" />
                    <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{job.current_step}</span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Started: {new Date(job.started_at).toLocaleString()}
                  </span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <StatusBadge status={job.status} />
                  <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    {job.progress_percentage}% Completed
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
