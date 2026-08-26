import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Send,
  Plus,
  Trash2,
  FileText,
  Sparkles,
  Bot,
  User as UserIcon,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { chatApi } from '../api/chat';
import { documentApi } from '../api/documents';
import { useNotification } from '../context/NotificationContext';

export const ChatPage = () => {
  const [searchParams] = useSearchParams();
  const docIdParam = searchParams.get('doc');
  const queryParam = searchParams.get('q');

  const [sessions, setSessions] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState(queryParam || '');
  const [documents, setDocuments] = useState([]);
  const [selectedDocId, setSelectedDocId] = useState(docIdParam || '');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef(null);
  const notify = useNotification();
  const navigate = useNavigate();

  useEffect(() => {
    fetchDocumentsAndSessions();
  }, []);

  const fetchDocumentsAndSessions = async () => {
    try {
      setLoading(true);
      const [docsRes, sessRes] = await Promise.all([
        documentApi.list({ per_page: 50 }),
        chatApi.listSessions(),
      ]);

      if (docsRes.success && docsRes.data) {
        setDocuments(docsRes.data.items);
      }

      if (sessRes.success && sessRes.data) {
        setSessions(sessRes.data);
        if (sessRes.data.length > 0) {
          // Load first session or create new
          loadSession(sessRes.data[0].id);
        } else {
          handleNewSession(docIdParam);
        }
      }
    } catch (err) {
      notify.error(err.message || 'Failed to initialize chat');
    } finally {
      setLoading(false);
    }
  };

  const loadSession = async (sessionId) => {
    try {
      const res = await chatApi.getSession(sessionId);
      if (res.success && res.data) {
        setActiveSession(res.data);
        setMessages(res.data.messages || []);
        setSelectedDocId(res.data.document_id || '');
      }
    } catch (err) {
      notify.error('Failed to load session history');
    }
  };

  const handleNewSession = async (docId = selectedDocId) => {
    try {
      const doc = documents.find((d) => d.id === docId);
      const title = doc ? `Chat with ${doc.title}` : 'New Document Chat';
      const res = await chatApi.createSession({
        title,
        document_id: docId || null,
        is_multi_doc: false,
      });

      if (res.success && res.data) {
        setSessions((prev) => [res.data, ...prev]);
        setActiveSession(res.data);
        setMessages([]);
      }
    } catch (err) {
      notify.error('Failed to create new chat session');
    }
  };

  const handleDeleteSession = async (e, sessionId) => {
    e.stopPropagation();
    try {
      await chatApi.deleteSession(sessionId);
      const updated = sessions.filter((s) => s.id !== sessionId);
      setSessions(updated);
      if (activeSession?.id === sessionId) {
        if (updated.length > 0) {
          loadSession(updated[0].id);
        } else {
          setActiveSession(null);
          setMessages([]);
        }
      }
      notify.success('Session deleted');
    } catch (err) {
      notify.error('Failed to delete session');
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || sending) return;

    if (!activeSession) {
      await handleNewSession();
      return;
    }

    const textToSend = inputText.trim();
    setInputText('');
    setSending(true);

    // Optimistically add user message
    const tempUserMsg = {
      id: 'temp-' + Date.now(),
      role: 'user',
      content: textToSend,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);

    try {
      const res = await chatApi.sendMessage(activeSession.id, textToSend);
      if (res.success && res.data) {
        setMessages((prev) => [
          ...prev.filter((m) => m.id !== tempUserMsg.id),
          res.data.user_message,
          res.data.assistant_message,
        ]);
      }
    } catch (err) {
      notify.error(err.message || 'Failed to generate RAG response');
    } finally {
      setSending(false);
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div style={{ display: 'flex', gap: '20px', height: 'calc(100vh - 120px)', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Session History Sidebar */}
      <div
        className="glass-card"
        style={{
          width: '280px',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
          padding: '16px',
        }}
      >
        <button
          className="btn btn-primary"
          style={{ width: '100%', marginBottom: '16px', fontSize: '0.85rem' }}
          onClick={() => handleNewSession()}
        >
          <Plus size={16} />
          <span>New Chat Session</span>
        </button>

        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', padding: '0 4px' }}>
          Recent Conversations
        </span>

        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {sessions.map((s) => (
            <div
              key={s.id}
              onClick={() => loadSession(s.id)}
              style={{
                padding: '10px 12px',
                borderRadius: '8px',
                backgroundColor: activeSession?.id === s.id ? 'var(--bg-surface)' : 'transparent',
                border: activeSession?.id === s.id ? '1px solid var(--border-glow)' : '1px solid transparent',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '0.85rem',
                color: activeSession?.id === s.id ? '#ffffff' : 'var(--text-secondary)',
                fontWeight: activeSession?.id === s.id ? 600 : 400,
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0, paddingRight: '8px' }}>
                {s.title}
              </div>
              <button
                onClick={(e) => handleDeleteSession(e, s.id)}
                style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', display: 'flex' }}
                title="Delete Session"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Interface */}
      <div
        className="glass-card"
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          overflow: 'hidden',
        }}
      >
        {/* Chat Header */}
        <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>
              {activeSession?.title || 'Document Intelligence Assistant'}
            </h3>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Retrieval Augmented Generation with verified page citations
            </span>
          </div>

          {/* Target Document Switcher */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Context Doc:</span>
            <select
              className="input-control"
              style={{ width: 'auto', height: '34px', fontSize: '0.8rem', padding: '4px 10px' }}
              value={selectedDocId}
              onChange={(e) => {
                setSelectedDocId(e.target.value);
                handleNewSession(e.target.value);
              }}
            >
              <option value="">All Documents (Full Knowledge Base)</option>
              {documents.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Message Thread */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {messages.length === 0 ? (
            <div style={{ textAlign: 'center', margin: 'auto', maxWidth: '480px' }}>
              <div style={{ width: '54px', height: '54px', borderRadius: '16px', backgroundColor: 'rgba(59,130,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: 'var(--accent-primary)' }}>
                <Sparkles size={26} />
              </div>
              <h4 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '8px' }}>Ask Questions About Your Documents</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.6 }}>
                The assistant retrieves relevant semantic chunks from your uploaded documents and synthesizes grounded answers with verifiable source citations.
              </p>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                style={{
                  display: 'flex',
                  gap: '14px',
                  alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '85%',
                }}
              >
                {msg.role === 'assistant' && (
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0, marginTop: '2px' }}>
                    <Bot size={18} />
                  </div>
                )}

                <div>
                  <div
                    style={{
                      padding: '14px 18px',
                      borderRadius: '14px',
                      backgroundColor: msg.role === 'user' ? 'var(--accent-primary)' : 'var(--bg-surface)',
                      color: msg.role === 'user' ? '#ffffff' : 'var(--text-primary)',
                      border: msg.role === 'user' ? 'none' : '1px solid var(--border-subtle)',
                      fontSize: '0.92rem',
                      lineHeight: 1.6,
                      whiteSpace: 'pre-wrap',
                    }}
                  >
                    {msg.content}
                  </div>

                  {/* Sources / Citations list */}
                  {msg.sources && msg.sources.length > 0 && (
                    <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Sources & Citations:
                      </span>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {msg.sources.map((src, i) => (
                          <div
                            key={i}
                            style={{
                              padding: '6px 10px',
                              backgroundColor: 'rgba(59,130,246,0.1)',
                              border: '1px solid rgba(59,130,246,0.25)',
                              borderRadius: '8px',
                              fontSize: '0.75rem',
                              color: '#93c5fd',
                            }}
                          >
                            <span style={{ fontWeight: 600 }}>{src.document_title}</span> • Page {src.page_number}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {msg.role === 'user' && (
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: 'var(--bg-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)', flexShrink: 0, marginTop: '2px' }}>
                    <UserIcon size={18} />
                  </div>
                )}
              </div>
            ))
          )}

          {sending && (
            <div style={{ display: 'flex', gap: '14px', alignSelf: 'flex-start' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0 }}>
                <Bot size={18} />
              </div>
              <div style={{ padding: '14px 18px', borderRadius: '14px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                <div style={{ width: '14px', height: '14px', border: '2px solid rgba(59,130,246,0.3)', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                <span>Retrieving context & generating answer...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSendMessage} style={{ padding: '16px 24px', borderTop: '1px solid var(--border-subtle)', display: 'flex', gap: '12px' }}>
          <input
            type="text"
            className="input-control"
            style={{ height: '46px', fontSize: '0.92rem' }}
            placeholder="Ask a question about the document context..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={sending}
          />
          <button type="submit" disabled={sending || !inputText.trim()} className="btn btn-primary" style={{ padding: '0 20px', height: '46px' }}>
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};
