import React from 'react';
import { FileQuestion } from 'lucide-react';

export const EmptyState = ({ title = 'No items found', description = 'Try adjusting your search filters or upload a new document.', action, icon: Icon = FileQuestion }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', textAlign: 'center' }}>
      <div style={{ width: '64px', height: '64px', borderRadius: '16px', backgroundColor: 'var(--bg-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', color: 'var(--accent-primary)' }}>
        <Icon size={32} />
      </div>
      <h4 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '6px', color: 'var(--text-primary)' }}>{title}</h4>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '400px', marginBottom: action ? '20px' : '0' }}>{description}</p>
      {action}
    </div>
  );
};
