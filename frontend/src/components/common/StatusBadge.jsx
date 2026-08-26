import React from 'react';
import { CheckCircle2, Loader2, AlertCircle, Clock } from 'lucide-react';

export const StatusBadge = ({ status }) => {
  const s = (status || 'unknown').toLowerCase();

  if (s === 'completed') {
    return (
      <span className="badge badge-completed">
        <CheckCircle2 size={13} />
        Completed
      </span>
    );
  }

  if (s === 'processing') {
    return (
      <span className="badge badge-processing">
        <Loader2 size={13} className="animate-spin" style={{ animation: 'spin 1.5s linear infinite' }} />
        Processing
      </span>
    );
  }

  if (s === 'failed') {
    return (
      <span className="badge badge-failed">
        <AlertCircle size={13} />
        Failed
      </span>
    );
  }

  return (
    <span className="badge badge-uploaded">
      <Clock size={13} />
      {status || 'Uploaded'}
    </span>
  );
};
