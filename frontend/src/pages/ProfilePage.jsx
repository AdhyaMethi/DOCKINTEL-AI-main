import React, { useState } from 'react';
import { User, Mail, Lock, Key, ShieldCheck, CheckCircle2, Save } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

export const ProfilePage = () => {
  const { user, updateProfile } = useAuth();
  const [customKey, setCustomKey] = useState(user?.custom_llm_key || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingKey, setSavingKey] = useState(false);
  const [savingPass, setSavingPass] = useState(false);

  const notify = useNotification();

  const handleSaveKey = async (e) => {
    e.preventDefault();
    setSavingKey(true);
    try {
      await updateProfile({ custom_llm_key: customKey });
      notify.success('AI Provider key updated');
    } catch (err) {
      notify.error(err.message || 'Failed to update key');
    } finally {
      setSavingKey(false);
    }
  };

  const handleSavePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      notify.error('Passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      notify.error('Password must be at least 6 characters');
      return;
    }

    setSavingPass(true);
    try {
      await updateProfile({ password: newPassword });
      setNewPassword('');
      setConfirmPassword('');
      notify.success('Password changed successfully');
    } catch (err) {
      notify.error(err.message || 'Failed to update password');
    } finally {
      setSavingPass(false);
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '4px' }}>
          User Profile & Credentials
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
          Manage your account credentials, security settings, and external AI provider keys.
        </p>
      </div>

      {/* Profile Overview Card */}
      <div className="glass-card" style={{ padding: '24px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'var(--bg-surface)', border: '2px solid var(--border-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-primary)' }}>
          {user?.username?.charAt(0).toUpperCase() || 'U'}
        </div>
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '2px' }}>{user?.username}</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '6px' }}>{user?.email}</p>
          <div style={{ display: 'flex', gap: '8px' }}>
            <span className="badge badge-tech">{user?.role}</span>
            <span className="badge badge-completed">Active Account</span>
          </div>
        </div>
      </div>

      {/* AI Key Config */}
      <div className="glass-card" style={{ padding: '24px', marginBottom: '24px' }}>
        <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Key size={18} color="#38bdf8" /> Custom AI Provider Key (BYOK)
        </h4>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '16px' }}>
          Optionally supply your personal OpenAI API key for generative RAG responses. If left blank, the platform automatically operates in high-performance local deterministic fallback mode.
        </p>

        <form onSubmit={handleSaveKey}>
          <div style={{ marginBottom: '16px' }}>
            <input
              type="password"
              className="input-control"
              placeholder="sk-proj-..."
              value={customKey}
              onChange={(e) => setCustomKey(e.target.value)}
            />
          </div>
          <button type="submit" disabled={savingKey} className="btn btn-primary">
            <Save size={16} />
            <span>{savingKey ? 'Saving...' : 'Save AI Key'}</span>
          </button>
        </form>
      </div>

      {/* Password Change */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Lock size={18} color="#a855f7" /> Change Password
        </h4>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '16px' }}>
          Update your secure login password (minimum 6 characters).
        </p>

        <form onSubmit={handleSavePassword} style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxWidth: '400px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
              New Password
            </label>
            <input
              type="password"
              required
              className="input-control"
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
              Confirm New Password
            </label>
            <input
              type="password"
              required
              className="input-control"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          <button type="submit" disabled={savingPass} className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>
            {savingPass ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
};
