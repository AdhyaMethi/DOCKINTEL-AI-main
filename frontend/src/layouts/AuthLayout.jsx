import React from 'react';
import { Outlet, Link, Navigate } from 'react-router-dom';
import { BrainCircuit, ShieldCheck, Zap, Search, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AuthLayout = () => {
  const { isAuthenticated, loading } = useAuth();

  if (!loading && isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', backgroundColor: 'var(--bg-primary)' }}>
      {/* Left Branding Hero Showcase */}
      <div
        style={{
          flex: 1,
          background: 'linear-gradient(135deg, #090d16 0%, #0f172a 50%, #1e1b4b 100%)',
          borderRight: '1px solid var(--border-subtle)',
          padding: '48px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative',
          overflow: 'hidden',
        }}
        className="auth-hero-pane"
      >
        {/* Glow Orb */}
        <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(59,130,246,0.25) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '450px', height: '450px', background: 'radial-gradient(circle, rgba(139,92,246,0.2) 0%, transparent 70%)', pointerEvents: 'none' }} />

        {/* Top Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none', zIndex: 10 }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: '0 4px 15px rgba(59, 130, 246, 0.4)' }}>
            <BrainCircuit size={24} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff' }}>DocIntel AI</h1>
            <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Intelligent Document Intelligence</p>
          </div>
        </Link>

        {/* Center Content */}
        <div style={{ maxWidth: '520px', zIndex: 10, margin: '60px 0' }}>
          <div className="badge badge-tech" style={{ marginBottom: '18px', padding: '6px 14px' }}>
            <Sparkles size={14} /> Next-Generation Document Processing
          </div>
          <h2 style={{ fontSize: '2.5rem', lineHeight: 1.2, fontWeight: 800, color: '#ffffff', marginBottom: '20px' }}>
            Transform unstructured files into actionable intelligence.
          </h2>
          <p style={{ fontSize: '1.05rem', color: '#94a3b8', lineHeight: 1.6, marginBottom: '32px' }}>
            Automated OCR, entity recognition, sentence-aware vector chunking, and grounded conversational RAG with verified citations.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="glass-card" style={{ padding: '16px' }}>
              <Zap size={20} color="#38bdf8" style={{ marginBottom: '8px' }} />
              <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#f8fafc' }}>Instant OCR & Parse</h4>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>PDFs, DOCX, TXT, Scanned Images.</p>
            </div>
            <div className="glass-card" style={{ padding: '16px' }}>
              <Search size={20} color="#a855f7" style={{ marginBottom: '8px' }} />
              <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#f8fafc' }}>Semantic Vector RAG</h4>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Page-level verifiable source citations.</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '0.8rem', zIndex: 10 }}>
          <ShieldCheck size={16} color="#10b981" />
          <span>SOC2 Ready • AES-256 Storage Encryption • Role-Based Access</span>
        </div>
      </div>

      {/* Right Form Container */}
      <div
        style={{
          width: '560px',
          maxWidth: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px',
          backgroundColor: 'var(--bg-secondary)',
        }}
      >
        <div style={{ width: '100%', maxWidth: '420px' }}>
          <Outlet />
        </div>
      </div>
    </div>
  );
};
