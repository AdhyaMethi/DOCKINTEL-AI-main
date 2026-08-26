import React from 'react';
import { Link } from 'react-router-dom';
import { FileQuestion, ArrowLeft } from 'lucide-react';

export const NotFoundPage = () => {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-primary)', padding: '24px', textAlign: 'center' }}>
      <div className="glass-card" style={{ maxWidth: '500px', width: '100%', padding: '48px 32px' }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '16px', backgroundColor: 'rgba(239,68,68,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: '#f87171' }}>
          <FileQuestion size={32} />
        </div>
        <h2 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '8px' }}>404</h2>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '12px' }}>Page Not Found</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginBottom: '28px', lineHeight: 1.6 }}>
          The page or document intelligence resource you are looking for does not exist or has been moved.
        </p>
        <Link to="/dashboard" className="btn btn-primary" style={{ padding: '0.75rem 1.8rem' }}>
          <ArrowLeft size={16} />
          <span>Return to Dashboard</span>
        </Link>
      </div>
    </div>
  );
};
