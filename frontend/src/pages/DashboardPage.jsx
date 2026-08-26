import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Files,
  CheckCircle2,
  Loader2,
  AlertCircle,
  HardDrive,
  BookOpen,
  UploadCloud,
  Search,
  MessageSquare,
  ArrowUpRight,
  TrendingUp,
  FileText,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { analyticsApi } from '../api/analytics';
import { StatusBadge } from '../components/common/StatusBadge';

const PIE_COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#06b6d4', '#ec4899', '#6366f1', '#64748b'];

export const DashboardPage = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await analyticsApi.getDashboard();
      if (res.success && res.data) {
        setDashboardData(res.data);
      }
    } catch (err) {
      console.error('Failed to load dashboard metrics', err);
    } finally {
      setLoading(false);
    }
  };

  const summary = dashboardData?.summary || {
    total_documents: 0,
    completed_documents: 0,
    processing_documents: 0,
    failed_documents: 0,
    total_words: 0,
    storage_used_mb: 0,
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header & Quick Action Row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '4px' }}>
            Intelligence Dashboard
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
            Real-time status of ingested documents, NLP pipelines, and vector embeddings.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-secondary" onClick={() => navigate('/search')}>
            <Search size={16} />
            <span>Semantic Search</span>
          </button>
          <button className="btn btn-primary" onClick={() => navigate('/upload')}>
            <UploadCloud size={16} />
            <span>Upload Document</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '28px' }}>
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Ingested</span>
            <div style={{ padding: '8px', borderRadius: '10px', backgroundColor: 'rgba(59,130,246,0.15)', color: '#38bdf8' }}>
              <Files size={18} />
            </div>
          </div>
          <h3 style={{ fontSize: '1.8rem', fontWeight: 800 }}>{summary.total_documents}</h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
            <TrendingUp size={13} /> {summary.completed_documents} fully processed
          </span>
        </div>

        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Completed</span>
            <div style={{ padding: '8px', borderRadius: '10px', backgroundColor: 'rgba(16,185,129,0.15)', color: '#34d399' }}>
              <CheckCircle2 size={18} />
            </div>
          </div>
          <h3 style={{ fontSize: '1.8rem', fontWeight: 800 }}>{summary.completed_documents}</h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
            Ready for RAG & search
          </span>
        </div>

        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>In Pipeline</span>
            <div style={{ padding: '8px', borderRadius: '10px', backgroundColor: 'rgba(59,130,246,0.15)', color: '#60a5fa' }}>
              <Loader2 size={18} className={summary.processing_documents > 0 ? "animate-spin" : ""} />
            </div>
          </div>
          <h3 style={{ fontSize: '1.8rem', fontWeight: 800 }}>{summary.processing_documents}</h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
            OCR & vector chunking
          </span>
        </div>

        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Indexed Words</span>
            <div style={{ padding: '8px', borderRadius: '10px', backgroundColor: 'rgba(139,92,246,0.15)', color: '#c084fc' }}>
              <BookOpen size={18} />
            </div>
          </div>
          <h3 style={{ fontSize: '1.8rem', fontWeight: 800 }}>{summary.total_words.toLocaleString()}</h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
            Across all pages
          </span>
        </div>

        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Storage Footprint</span>
            <div style={{ padding: '8px', borderRadius: '10px', backgroundColor: 'rgba(6,182,212,0.15)', color: '#67e8f9' }}>
              <HardDrive size={18} />
            </div>
          </div>
          <h3 style={{ fontSize: '1.8rem', fontWeight: 800 }}>{summary.storage_used_mb} MB</h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
            AES-256 encrypted
          </span>
        </div>
      </div>

      {/* Visual Analytics Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        {/* Upload Activity Trend Chart */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
            <div>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 700 }}>7-Day Ingestion Velocity</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Daily document uploads & processing</p>
            </div>
          </div>
          <div style={{ height: '260px', width: '100%' }}>
            {dashboardData?.upload_trends ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dashboardData.upload_trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorUploads" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" stroke="#64748b" fontSize={12} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={12} allowDecimals={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                  />
                  <Area type="monotone" dataKey="uploads" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorUploads)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>Loading trends...</div>
            )}
          </div>
        </div>

        {/* Document Classification Pie Chart */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
            <div>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Document Classification Breakdown</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Distribution by extracted category</p>
            </div>
          </div>
          <div style={{ height: '260px', width: '100%' }}>
            {dashboardData?.document_types ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dashboardData.document_types}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={95}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {dashboardData.document_types.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '0.8rem', color: '#94a3b8' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>Loading breakdown...</div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Ingested Documents Table */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Recently Ingested Documents</h4>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Latest files processed by the intelligence engine</p>
          </div>
          <Link to="/documents" className="btn btn-secondary" style={{ padding: '6px 14px', fontSize: '0.8rem' }}>
            <span>View All Documents</span>
            <ArrowUpRight size={14} />
          </Link>
        </div>

        {dashboardData?.recent_documents && dashboardData.recent_documents.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Document Title</th>
                  <th>Type</th>
                  <th>Pages</th>
                  <th>Status</th>
                  <th>Uploaded</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {dashboardData.recent_documents.map((doc) => (
                  <tr key={doc.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'var(--bg-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)' }}>
                          <FileText size={16} />
                        </div>
                        <div>
                          <Link to={`/documents/${doc.id}`} style={{ color: 'var(--text-primary)', fontWeight: 600, textDecoration: 'none' }}>
                            {doc.title}
                          </Link>
                          <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {doc.original_filename}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-tech">{doc.document_type}</span>
                    </td>
                    <td>{doc.page_count || 1}</td>
                    <td>
                      <StatusBadge status={doc.status} />
                    </td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {new Date(doc.created_at).toLocaleDateString()}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          className="btn btn-secondary"
                          style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                          onClick={() => navigate(`/documents/${doc.id}`)}
                        >
                          Details
                        </button>
                        <button
                          className="btn btn-primary"
                          style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                          onClick={() => navigate(`/chat?doc=${doc.id}`)}
                        >
                          <MessageSquare size={13} />
                          <span>Chat</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
            <p>No documents uploaded yet. Upload your first document to get started.</p>
            <button className="btn btn-primary" style={{ marginTop: '14px' }} onClick={() => navigate('/upload')}>
              <UploadCloud size={16} />
              <span>Upload Document</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
