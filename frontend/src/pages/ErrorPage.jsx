import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

export const ErrorPage = ({ error, resetErrorBoundary }) => {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-primary)', padding: '24px', textAlign: 'center' }}>
      <div className="glass-card" style={{ maxWidth: '520px', width: '100%', padding: '48px 32px' }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '16px', backgroundColor: 'rgba(239,68,68,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: '#f87171' }}>
          <AlertCircle size={32} />
        </div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '8px' }}>Something went wrong</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px', lineHeight: 1.6 }}>
          An unexpected interface error occurred. You can retry loading or return to safety.
        </p>
        {error?.message && (
          <div style={{ padding: '12px', backgroundColor: 'var(--bg-surface)', borderRadius: '8px', border: '1px solid var(--border-subtle)', fontFamily: 'monospace', fontSize: '0.8rem', color: '#f87171', marginBottom: '24px', textAlign: 'left', overflowX: 'auto' }}>
            {error.message}
          </div>
        )}
        <button
          onClick={() => (resetErrorBoundary ? resetErrorBoundary() : window.location.reload())}
          className="btn btn-primary"
        >
          <RefreshCw size={16} />
          <span>Reload Application</span>
        </button>
      </div>
    </div>
  );
};
