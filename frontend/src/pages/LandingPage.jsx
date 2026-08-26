import React from 'react';
import { Link } from 'react-router-dom';
import {
  BrainCircuit,
  UploadCloud,
  FileText,
  Search,
  MessageSquare,
  GitCompare,
  ShieldCheck,
  Zap,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Layers,
  Cpu,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LandingPage = () => {
  const { isAuthenticated } = useAuth();

  const features = [
    {
      icon: UploadCloud,
      title: 'Universal Ingestion & OCR',
      desc: 'Seamlessly extract text from PDFs, DOCX, TXT, and scanned image documents with automated OCR fallback.',
      color: '#38bdf8',
    },
    {
      icon: Layers,
      title: 'Automatic Classification',
      desc: 'Instantly categorize documents into Resumes, Invoices, Research Papers, Contracts, Reports, and Certificates.',
      color: '#a855f7',
    },
    {
      icon: Cpu,
      title: 'NLP Entity & Metadata Extraction',
      desc: 'Extract PERSON, ORG, DATE, MONEY, EMAIL, and domain-specific structured metadata with zero manual effort.',
      color: '#34d399',
    },
    {
      icon: Search,
      title: 'Semantic Vector Search',
      desc: 'Search conceptually rather than exact keyword matches using high-performance 128-dim dense vector embeddings.',
      color: '#fbbf24',
    },
    {
      icon: MessageSquare,
      title: 'Conversational RAG Chat',
      desc: 'Ask questions and receive strictly grounded answers with verifiable page-level source citations and excerpts.',
      color: '#60a5fa',
    },
    {
      icon: GitCompare,
      title: 'Visual Document Comparison',
      desc: 'Side-by-side sentence diffing, identifying added, removed, and modified sections with lexical & semantic scores.',
      color: '#f43f5e',
    },
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      {/* Top Navigation */}
      <header
        className="glass-panel"
        style={{
          height: '74px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 48px',
          position: 'sticky',
          top: 0,
          zIndex: 50,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: '0 4px 15px rgba(59, 130, 246, 0.4)' }}>
            <BrainCircuit size={22} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.2rem', fontWeight: 800 }}>DocIntel AI</h1>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {isAuthenticated ? (
            <Link to="/dashboard" className="btn btn-primary">
              <span>Go to Dashboard</span>
              <ArrowRight size={16} />
            </Link>
          ) : (
            <>
              <Link to="/login" className="btn btn-secondary" style={{ padding: '0.5rem 1.2rem' }}>
                Sign In
              </Link>
              <Link to="/register" className="btn btn-primary" style={{ padding: '0.5rem 1.2rem' }}>
                <span>Get Started</span>
                <ArrowRight size={16} />
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section style={{ padding: '90px 24px 60px', maxWidth: '1200px', margin: '0 auto', textAlign: 'center', position: 'relative' }}>
        {/* Glow */}
        <div style={{ position: 'absolute', top: '10%', left: '50%', transform: 'translateX(-50%)', width: '600px', height: '350px', background: 'radial-gradient(circle, rgba(59,130,246,0.2) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div className="badge badge-tech" style={{ padding: '8px 18px', fontSize: '0.85rem', marginBottom: '24px' }}>
          <Sparkles size={16} /> Enterprise Document Intelligence & Semantic RAG
        </div>

        <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 4.2rem)', fontWeight: 800, lineHeight: 1.15, marginBottom: '24px', letterSpacing: '-0.03em' }}>
          Turn Unstructured Documents Into <br />
          <span style={{ background: 'linear-gradient(135deg, #38bdf8 0%, #818cf8 50%, #c084fc 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Intelligent, Searchable Knowledge
          </span>
        </h1>

        <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', maxWidth: '780px', margin: '0 auto 40px', lineHeight: 1.6 }}>
          Automate document ingestion, OCR parsing, NER entity extraction, multi-level summarization, and interactive RAG chat with page-level citations.
        </p>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <Link to="/register" className="btn btn-primary" style={{ padding: '0.85rem 2rem', fontSize: '1rem' }}>
            <span>Start Free Analysis</span>
            <ArrowRight size={18} />
          </Link>
          <Link to="/login" className="btn btn-secondary" style={{ padding: '0.85rem 1.8rem', fontSize: '1rem' }}>
            <span>Explore Demo</span>
          </Link>
        </div>

        {/* Pipeline Flow Visualization */}
        <div className="glass-card" style={{ marginTop: '70px', padding: '32px', textAlign: 'left' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            THE INTELLIGENCE PIPELINE
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', alignItems: 'center' }}>
            {[
              { step: '1. Ingestion', desc: 'PDF, DOCX, TXT, IMG' },
              { step: '2. OCR & Clean', desc: 'Normalized Text' },
              { step: '3. Classification', desc: '10 Doc Categories' },
              { step: '4. NER & Meta', desc: '9 Entity Classes' },
              { step: '5. Vector Chunks', desc: '128-Dim Embeddings' },
              { step: '6. Semantic RAG', desc: 'Citations & Answers' },
            ].map((p, idx) => (
              <div key={idx} style={{ padding: '16px', backgroundColor: 'var(--bg-surface)', borderRadius: '12px', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-primary)', display: 'block', marginBottom: '4px' }}>
                  {p.step}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section style={{ padding: '80px 24px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '14px' }}>Engineered for Enterprise Complexity</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', maxWidth: '650px', margin: '0 auto' }}>
            Everything you need to process thousands of unstructured documents reliably without manual review.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
          {features.map((f, i) => (
            <div key={i} className="glass-card" style={{ padding: '32px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'var(--bg-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', color: f.color }}>
                <f.icon size={24} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '10px' }}>{f.title}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border-subtle)', padding: '40px 24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
        <p>© 2026 DocIntel AI Platform. Built with Python Flask, React, and Semantic RAG.</p>
      </footer>
    </div>
  );
};
