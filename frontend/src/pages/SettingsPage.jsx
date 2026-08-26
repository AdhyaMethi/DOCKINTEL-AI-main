import React, { useState, useEffect } from 'react';
import {
  Settings,
  Activity,
  CheckCircle2,
  HardDrive,
  Cpu,
  RefreshCw,
  ShieldCheck,
  Server,
  Zap,
} from 'lucide-react';
import apiClient from '../api/client';
import { useNotification } from '../context/NotificationContext';

export const SettingsPage = () => {
  const [healthData, setHealthData] = useState(null);
  const [loading, setLoading] = useState(true);

  const notify = useNotification();

  const fetchHealth = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/api/health');
      setHealthData(res);
    } catch (err) {
      notify.error('Backend health check failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '4px' }}>
            System Diagnostics & Engine Settings
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
            Inspect pipeline engines, storage volumes, vector backend, and fallback modes.
          </p>
        </div>

        <button className="btn btn-secondary" onClick={fetchHealth} disabled={loading}>
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          <span>Run Health Check</span>
        </button>
      </div>

      {/* Engine Status Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        {/* Core API Server */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Server size={20} color="#38bdf8" />
              <h4 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Flask Core API</h4>
            </div>
            <span className="badge badge-completed">
              <CheckCircle2 size={12} /> Online
            </span>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
            Version: {healthData?.version || '1.0.0'} • REST Blueprint Microservices
          </p>
        </div>

        {/* Database */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Activity size={20} color="#34d399" />
              <h4 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Database Layer</h4>
            </div>
            <span className="badge badge-completed">
              <CheckCircle2 size={12} /> {healthData?.database || 'Connected'}
            </span>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
            SQLAlchemy ORM with connection pooling & transaction isolation.
          </p>
        </div>

        {/* OCR Engine */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Zap size={20} color="#fbbf24" />
              <h4 style={{ fontSize: '1.05rem', fontWeight: 700 }}>OCR Engine</h4>
            </div>
            <span className="badge badge-tech">
              {healthData?.ocr_engine || 'Active'}
            </span>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
            Tesseract / EasyOCR with automatic image preprocessing.
          </p>
        </div>

        {/* AI & Vector Subsystem */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Cpu size={20} color="#c084fc" />
              <h4 style={{ fontSize: '1.05rem', fontWeight: 700 }}>AI Subsystem</h4>
            </div>
            <span className="badge badge-tech">
              Mode: {healthData?.ai_engine?.mode || 'fallback'}
            </span>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
            Deterministic TextRank Summarizer + 128-Dim Vector Embedding Engine.
          </p>
        </div>
      </div>

      {/* Raw Health Diagnostics JSON */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '14px' }}>Live Diagnostics Response</h4>
        <pre
          style={{
            backgroundColor: 'var(--bg-surface)',
            padding: '16px',
            borderRadius: '10px',
            overflowX: 'auto',
            fontSize: '0.85rem',
            color: '#34d399',
          }}
        >
          {JSON.stringify(healthData, null, 2)}
        </pre>
      </div>
    </div>
  );
};
