import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  ArrowLeft,
  Cpu,
  Key,
  Layers,
  Clock,
  BookOpen,
  PieChart as PieChartIcon,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from 'recharts';
import { documentApi } from '../api/documents';
import { EntityBadge } from '../components/common/EntityBadge';
import { useNotification } from '../context/NotificationContext';

export const DocumentAnalysisPage = () => {
  const { id } = useParams();
  const [doc, setDoc] = useState(null);
  const [loading, setLoading] = useState(true);

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
      notify.error(err.message || 'Failed to load document analysis');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '80px 20px', textAlign: 'center' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid rgba(59,130,246,0.2)', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
        <p style={{ color: 'var(--text-muted)' }}>Analyzing document semantics...</p>
      </div>
    );
  }

  // Calculate entity counts by type for chart
  const entityTypeCounts = {};
  doc?.entities?.forEach((e) => {
    entityTypeCounts[e.entity_type] = (entityTypeCounts[e.entity_type] || 0) + e.count;
  });
  const entityChartData = Object.entries(entityTypeCounts).map(([name, count]) => ({
    name,
    count,
  }));

  const BAR_COLORS = ['#8b5cf6', '#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#f43f5e', '#6366f1'];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <button
          onClick={() => navigate(`/documents/${id}`)}
          style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', marginBottom: '8px' }}
        >
          <ArrowLeft size={16} />
          <span>Back to Document</span>
        </button>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '4px' }}>
          Deep NLP & Semantic Analysis
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
          Analytical inspection for: <strong>{doc?.title}</strong>
        </p>
      </div>

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '28px' }}>
        <div className="glass-card" style={{ padding: '20px' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Classification Confidence</span>
          <h3 style={{ fontSize: '1.7rem', fontWeight: 800, marginTop: '8px', color: '#38bdf8' }}>
            {Math.round((doc?.classification_confidence || 0.95) * 100)}%
          </h3>
          <span className="badge badge-tech" style={{ marginTop: '6px' }}>{doc?.document_type}</span>
        </div>

        <div className="glass-card" style={{ padding: '20px' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Distinct Entities</span>
          <h3 style={{ fontSize: '1.7rem', fontWeight: 800, marginTop: '8px', color: '#c084fc' }}>
            {doc?.entities?.length || 0}
          </h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: '6px' }}>Across 9 entity types</span>
        </div>

        <div className="glass-card" style={{ padding: '20px' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Key Terms Identified</span>
          <h3 style={{ fontSize: '1.7rem', fontWeight: 800, marginTop: '8px', color: '#34d399' }}>
            {doc?.keywords?.length || 0}
          </h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: '6px' }}>TF-IDF scored</span>
        </div>

        <div className="glass-card" style={{ padding: '20px' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Vector Chunk Chunks</span>
          <h3 style={{ fontSize: '1.7rem', fontWeight: 800, marginTop: '8px', color: '#fbbf24' }}>
            {doc?.chunks_count || 1}
          </h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: '6px' }}>128-dim dense vectors</span>
        </div>
      </div>

      {/* Entity Chart & Keyword Cloud */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '24px', marginBottom: '28px' }}>
        {/* Entity Distribution Chart */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px' }}>Entity Distribution</h4>
          <div style={{ height: '240px' }}>
            {entityChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={entityChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} allowDecimals={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {entityChartData.map((_, index) => (
                      <Cell key={`bar-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>No entities recorded</div>
            )}
          </div>
        </div>

        {/* Keyword Weights Cloud */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px' }}>Top Keyphrases by Relevance Weight</h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', maxHeight: '240px', overflowY: 'auto' }}>
            {doc?.keywords?.map((k, idx) => (
              <div
                key={k.id || idx}
                style={{
                  padding: '8px 14px',
                  backgroundColor: 'var(--bg-surface)',
                  borderRadius: '10px',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{k.keyword}</span>
                <span style={{ fontSize: '0.75rem', color: '#38bdf8', backgroundColor: 'rgba(56, 189, 248, 0.15)', padding: '2px 6px', borderRadius: '4px' }}>
                  {k.score}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
