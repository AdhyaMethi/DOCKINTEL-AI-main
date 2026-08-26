import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Search,
  Sliders,
  FileText,
  Eye,
  MessageSquare,
  Sparkles,
  ArrowRight,
  Zap,
} from 'lucide-react';
import { searchApi } from '../api/search';
import { useNotification } from '../context/NotificationContext';
import { EmptyState } from '../components/common/EmptyState';

export const SemanticSearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [query, setQuery] = useState(initialQuery);
  const [searchType, setSearchType] = useState('semantic'); // 'semantic' | 'keyword'
  const [minScore, setMinScore] = useState(0.05);
  const [selectedType, setSelectedType] = useState('all');
  const [results, setResults] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const notify = useNotification();
  const navigate = useNavigate();

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setSearchParams({ q: query });

    try {
      if (searchType === 'semantic') {
        const res = await searchApi.semanticSearch({
          query: query.trim(),
          document_type: selectedType,
          top_k: 10,
          min_score: parseFloat(minScore),
        });
        if (res.success && res.data) {
          setResults(res.data.items || []);
          setTotal(res.data.total || 0);
        }
      } else {
        const res = await searchApi.keywordSearch({
          q: query.trim(),
          type: selectedType,
          per_page: 15,
        });
        if (res.success && res.data) {
          setResults(res.data.items || []);
          setTotal(res.data.total || 0);
        }
      }
    } catch (err) {
      notify.error(err.message || 'Search query failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialQuery) {
      handleSearch();
    }
  }, []);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '4px' }}>
          Semantic & Vector Search
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
          Search concepts, facts, and passages across all ingested documents even without exact keyword matches.
        </p>
      </div>

      {/* Query Card */}
      <div className="glass-card" style={{ padding: '24px', marginBottom: '28px' }}>
        <form onSubmit={handleSearch}>
          <div style={{ display: 'flex', gap: '12px', marginBottom: '18px' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                className="input-control"
                style={{ paddingLeft: '44px', height: '46px', fontSize: '0.95rem' }}
                placeholder="Ask a question or search concepts (e.g. 'What was the experimental accuracy on ImageNet?')..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <button type="submit" disabled={loading} className="btn btn-primary" style={{ padding: '0 24px', height: '46px', fontSize: '0.95rem' }}>
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>

          {/* Search Controls */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setSearchType('semantic')}
                style={{
                  padding: '6px 14px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-subtle)',
                  background: searchType === 'semantic' ? 'var(--accent-primary)' : 'var(--bg-surface)',
                  color: searchType === 'semantic' ? '#fff' : 'var(--text-secondary)',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Sparkles size={14} />
                <span>Semantic Vector Search</span>
              </button>
              <button
                type="button"
                onClick={() => setSearchType('keyword')}
                style={{
                  padding: '6px 14px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-subtle)',
                  background: searchType === 'keyword' ? 'var(--accent-primary)' : 'var(--bg-surface)',
                  color: searchType === 'keyword' ? '#fff' : 'var(--text-secondary)',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Zap size={14} />
                <span>Lexical Keyword Search</span>
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              {searchType === 'semantic' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  <span>Min Similarity: {Math.round(minScore * 100)}%</span>
                  <input
                    type="range"
                    min="0.0"
                    max="0.5"
                    step="0.05"
                    value={minScore}
                    onChange={(e) => setMinScore(e.target.value)}
                    style={{ cursor: 'pointer', width: '90px' }}
                  />
                </div>
              )}

              <select
                className="input-control"
                style={{ width: 'auto', padding: '4px 10px', height: '32px', fontSize: '0.8rem' }}
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
              >
                <option value="all">All Document Types</option>
                <option value="Research Paper">Research Paper</option>
                <option value="Resume">Resume</option>
                <option value="Invoice">Invoice</option>
                <option value="Contract">Contract</option>
                <option value="Report">Report</option>
              </select>
            </div>
          </div>
        </form>
      </div>

      {/* Results List */}
      <div>
        {loading ? (
          <div style={{ padding: '60px 20px', textAlign: 'center' }}>
            <div style={{ width: '40px', height: '40px', border: '3px solid rgba(59,130,246,0.2)', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
            <p style={{ color: 'var(--text-muted)' }}>Computing vector embeddings & ranking passages...</p>
          </div>
        ) : results.length === 0 ? (
          <EmptyState
            title={query ? 'No matching passages found' : 'Ready to search'}
            description={query ? 'Try lowering the minimum similarity threshold or using different query terms.' : 'Type a question above to perform semantic vector search across your documents.'}
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                Retrieved {results.length} relevant passage(s)
              </span>
            </div>

            {results.map((item, idx) => (
              <div key={idx} className="glass-card" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span className="badge badge-tech">{item.document_type || 'General'}</span>
                    <Link to={`/documents/${item.document_id}`} style={{ color: 'var(--text-primary)', fontWeight: 700, textDecoration: 'none', fontSize: '1.05rem' }}>
                      {item.document_title}
                    </Link>
                    {item.page_number && (
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', backgroundColor: 'var(--bg-surface)', padding: '2px 8px', borderRadius: '4px' }}>
                        Page {item.page_number}
                      </span>
                    )}
                  </div>

                  {item.score !== undefined && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 600, color: item.score > 0.4 ? '#34d399' : '#38bdf8' }}>
                      <Sparkles size={14} />
                      <span>{Math.round(item.score * 100)}% Similarity</span>
                    </div>
                  )}
                </div>

                <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.7, marginBottom: '16px', backgroundColor: 'var(--bg-surface)', padding: '14px', borderRadius: '10px', borderLeft: '3px solid var(--accent-primary)' }}>
                  "{item.text_content || item.snippet}"
                </p>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                  <Link to={`/documents/${item.document_id}/view`} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                    <Eye size={14} />
                    <span>View Page</span>
                  </Link>
                  <Link to={`/chat?doc=${item.document_id}&q=${encodeURIComponent(query)}`} className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                    <MessageSquare size={14} />
                    <span>Ask in Chat</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
