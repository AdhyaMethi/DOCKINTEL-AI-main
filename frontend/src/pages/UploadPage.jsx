import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle,
  X,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { documentApi } from '../api/documents';
import { useNotification } from '../context/NotificationContext';

const ALLOWED_EXTS = ['pdf', 'docx', 'txt', 'jpg', 'jpeg', 'png'];

export const UploadPage = () => {
  const [dragOver, setDragOver] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedDocs, setUploadedDocs] = useState([]);

  const fileInputRef = useRef(null);
  const notify = useNotification();
  const navigate = useNavigate();

  const handleFiles = (files) => {
    const valid = [];
    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      const ext = f.name.split('.').pop().toLowerCase();
      if (ALLOWED_EXTS.includes(ext)) {
        valid.push({
          file: f,
          customTitle: f.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' '),
        });
      } else {
        notify.warning(`Skipped "${f.name}": Unsupported format. Allowed: ${ALLOWED_EXTS.join(', ').toUpperCase()}`);
      }
    }
    setSelectedFiles((prev) => [...prev, ...valid]);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const removeFile = (idx) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateTitle = (idx, val) => {
    setSelectedFiles((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, customTitle: val } : item))
    );
  };

  const handleUploadAll = async () => {
    if (selectedFiles.length === 0) return;
    setUploading(true);
    setUploadProgress(10);

    const completed = [];

    for (let i = 0; i < selectedFiles.length; i++) {
      const item = selectedFiles[i];
      const formData = new FormData();
      formData.append('file', item.file);
      formData.append('title', item.customTitle);

      try {
        const res = await documentApi.upload(formData, (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percent);
        });

        if (res.success && res.data) {
          completed.push(res.data);
        }
      } catch (err) {
        notify.error(`Failed to upload ${item.file.name}: ${err.message}`);
      }
    }

    setUploadedDocs(completed);
    setSelectedFiles([]);
    setUploading(false);
    setUploadProgress(100);
    notify.success(`Successfully uploaded ${completed.length} document(s). Processing pipeline running.`);
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '4px' }}>
          Upload Documents
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
          Ingest unstructured files for automatic text extraction, OCR, NER classification, and vector embedding.
        </p>
      </div>

      {/* Drag & Drop Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
        style={{
          border: `2px dashed ${dragOver ? 'var(--accent-primary)' : 'var(--border-subtle)'}`,
          borderRadius: '16px',
          padding: '48px 24px',
          textAlign: 'center',
          backgroundColor: dragOver ? 'rgba(59,130,246,0.06)' : 'var(--bg-secondary)',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          marginBottom: '24px',
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.docx,.txt,.jpg,.jpeg,.png"
          style={{ display: 'none' }}
          onChange={(e) => handleFiles(e.target.files)}
        />
        <div style={{ width: '64px', height: '64px', borderRadius: '16px', backgroundColor: 'var(--bg-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: 'var(--accent-primary)' }}>
          <UploadCloud size={32} />
        </div>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '6px' }}>
          Drag & Drop files here, or <span style={{ color: 'var(--accent-primary)' }}>browse</span>
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '14px' }}>
          Supported formats: PDF, DOCX, TXT, JPG, PNG (Max file size: 50MB)
        </p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#64748b', fontSize: '0.75rem' }}>
          <ShieldCheck size={14} color="#10b981" />
          <span>Encrypted with AES-256 in secure storage</span>
        </div>
      </div>

      {/* Selected File Queue */}
      {selectedFiles.length > 0 && (
        <div className="glass-card" style={{ padding: '24px', marginBottom: '24px' }}>
          <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '16px' }}>
            Selected Documents ({selectedFiles.length})
          </h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
            {selectedFiles.map((item, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '12px 16px',
                  backgroundColor: 'var(--bg-surface)',
                  borderRadius: '10px',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <FileText size={20} color="#38bdf8" />
                <div style={{ flex: 1 }}>
                  <input
                    type="text"
                    className="input-control"
                    style={{ padding: '4px 10px', fontSize: '0.85rem', marginBottom: '4px' }}
                    value={item.customTitle}
                    onChange={(e) => updateTitle(idx, e.target.value)}
                    placeholder="Custom document title..."
                  />
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {item.file.name} • {(item.file.size / 1024).toFixed(1)} KB
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(idx)}
                  style={{ background: 'transparent', border: 'none', color: '#f87171', cursor: 'pointer', padding: '6px' }}
                >
                  <X size={18} />
                </button>
              </div>
            ))}
          </div>

          {uploading && (
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                <span>Uploading & Queueing Processing...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--bg-surface)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: `${uploadProgress}%`, height: '100%', backgroundColor: 'var(--accent-primary)', transition: 'width 0.3s ease' }} />
              </div>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button className="btn btn-secondary" onClick={() => setSelectedFiles([])} disabled={uploading}>
              Clear All
            </button>
            <button className="btn btn-primary" onClick={handleUploadAll} disabled={uploading}>
              {uploading ? 'Processing Pipeline...' : `Upload ${selectedFiles.length} Document(s)`}
            </button>
          </div>
        </div>
      )}

      {/* Uploaded Documents Result List */}
      {uploadedDocs.length > 0 && (
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#34d399', marginBottom: '16px' }}>
            <CheckCircle2 size={20} />
            <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc' }}>
              Successfully Ingested Documents
            </h4>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {uploadedDocs.map((doc) => (
              <div
                key={doc.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  backgroundColor: 'var(--bg-surface)',
                  borderRadius: '10px',
                }}
              >
                <div>
                  <h5 style={{ fontSize: '0.95rem', fontWeight: 600 }}>{doc.title}</h5>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Status: In Processing Pipeline</span>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <Link to={`/documents/${doc.id}`} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                    View Analysis
                  </Link>
                  <Link to={`/chat?doc=${doc.id}`} className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                    Chat RAG
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
