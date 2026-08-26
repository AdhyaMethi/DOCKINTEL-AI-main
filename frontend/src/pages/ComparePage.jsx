import React, { useState, useEffect } from 'react';
import {
  GitCompare,
  ArrowRight,
  Plus,
  Minus,
  Sparkles,
  FileText,
  Percent,
} from 'lucide-react';
import { documentApi } from '../api/documents';
import { useNotification } from '../context/NotificationContext';

export const ComparePage = () => {
  const [documents, setDocuments] = useState([]);
  const [docIdA, setDocIdA] = useState('');
  const [docIdB, setDocIdB] = useState('');
  const [comparison, setComparison] = useState(null);
  const [loading, setLoading] = useState(false);

  const notify = useNotification();

  useEffect(() => {
    fetchDocs();
  }, []);

  const fetchDocs = async () => {
    try {
      const res = await documentApi.list({ per_page: 50 });
      if (res.success && res.data) {
        const docs = res.data.items;
        setDocuments(docs);
        if (docs.length >= 2) {
          setDocIdA(docs[0].id);
          setDocIdB(docs[1].id);
        }
      }
    } catch (err) {
      notify.error('Failed to load documents for comparison');
    }
  };

  const handleCompare = async (e) => {
    if (e) e.preventDefault();
    if (!docIdA || !docIdB) return;
    if (docIdA === docIdB) {
      notify.warning('Please select two distinct documents to compare');
      return;
    }

    setLoading(true);
    try {
      const res = await documentApi.compare(docIdA, docIdB);
      if (res.success && res.data) {
        setComparison(res.data);
      }
    } catch (err) {
      notify.error(err.message || 'Comparison failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '1300px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '4px' }}>
          Document Diff & Comparison
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
          Perform sentence-level structural diffs and calculate semantic vector overlap between two documents.
        </p>
      </div>

      {/* Selectors Bar */}
      <div className="glass-card" style={{ padding: '24px', marginBottom: '28px' }}>
        <form onSubmit={handleCompare} style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr auto', gap: '16px', alignItems: 'flex-end' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px', color: 'var(--text-secondary)' }}>
              Document A (Base Version)
            </label>
            <select
              className="input-control"
              value={docIdA}
              onChange={(e) => setDocIdA(e.target.value)}
              style={{ height: '42px', fontSize: '0.9rem' }}
            >
              {documents.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.title} ({d.document_type})
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '42px', color: 'var(--text-muted)' }}>
            <ArrowRight size={20} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px', color: 'var(--text-secondary)' }}>
              Document B (Target Version)
            </label>
            <select
              className="input-control"
              value={docIdB}
              onChange={(e) => setDocIdB(e.target.value)}
              style={{ height: '42px', fontSize: '0.9rem' }}
            >
              {documents.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.title} ({d.document_type})
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={loading || !docIdA || !docIdB}
            className="btn btn-primary"
            style={{ height: '42px', padding: '0 20px', whiteSpace: 'nowrap' }}
          >
            <GitCompare size={16} />
            <span>{loading ? 'Comparing...' : 'Compare Diffs'}</span>
          </button>
        </form>
      </div>

      {/* Comparison Results */}
      {comparison && (
        <div>
          {/* Similarity Gauges Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '28px' }}>
            <div className="glass-card" style={{ padding: '20px' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Lexical Text Match</span>
              <h3 style={{ fontSize: '2rem', fontWeight: 800, marginTop: '6px', color: '#38bdf8' }}>
                {comparison.metrics.lexical_similarity_pct}%
              </h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Sequence exact ratio</span>
            </div>

            <div className="glass-card" style={{ padding: '20px' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Semantic Vector Match</span>
              <h3 style={{ fontSize: '2rem', fontWeight: 800, marginTop: '6px', color: '#a855f7' }}>
                {comparison.metrics.semantic_similarity_pct}%
              </h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Cosine conceptual overlap</span>
            </div>

            <div className="glass-card" style={{ padding: '20px' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Added Sentences</span>
              <h3 style={{ fontSize: '2rem', fontWeight: 800, marginTop: '6px', color: '#34d399' }}>
                +{comparison.metrics.added_sentences}
              </h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Present only in Doc B</span>
            </div>

            <div className="glass-card" style={{ padding: '20px' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Removed Sentences</span>
              <h3 style={{ fontSize: '2rem', fontWeight: 800, marginTop: '6px', color: '#f87171' }}>
                -{comparison.metrics.removed_sentences}
              </h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Present only in Doc A</span>
            </div>
          </div>

          {/* Visual Diff Reader */}
          <div className="glass-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Visual Sentence-Level Diff</h4>
              <div style={{ display: 'flex', gap: '12px', fontSize: '0.8rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#34d399' }}>
                  <Plus size={14} /> Added in B
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#f87171' }}>
                  <Minus size={14} /> Removed from A
                </span>
              </div>
            </div>

            <div
              style={{
                backgroundColor: 'var(--bg-surface)',
                borderRadius: '12px',
                padding: '20px',
                maxHeight: '560px',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                fontFamily: 'monospace',
                fontSize: '0.88rem',
                lineHeight: 1.6,
              }}
            >
              {comparison.diff.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '6px',
                    backgroundColor:
                      item.type === 'added'
                        ? 'rgba(16, 185, 129, 0.15)'
                        : item.type === 'removed'
                        ? 'rgba(239, 68, 68, 0.15)'
                        : 'transparent',
                    color:
                      item.type === 'added'
                        ? '#34d399'
                        : item.type === 'removed'
                        ? '#f87171'
                        : 'var(--text-secondary)',
                    borderLeft: `3px solid ${
                      item.type === 'added' ? '#10b981' : item.type === 'removed' ? '#ef4444' : 'transparent'
                    }`,
                  }}
                >
                  <span style={{ fontWeight: 700, marginRight: '8px' }}>
                    {item.type === 'added' ? '+ ' : item.type === 'removed' ? '- ' : '  '}
                  </span>
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
