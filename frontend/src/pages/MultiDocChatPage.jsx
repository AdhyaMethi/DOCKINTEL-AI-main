import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Plus,
  MessagesSquare,
  Bot,
  User as UserIcon,
  CheckSquare,
  Square,
  Sparkles,
  FileText,
} from 'lucide-react';
import { chatApi } from '../api/chat';
import { documentApi } from '../api/documents';
import { useNotification } from '../context/NotificationContext';

export const MultiDocChatPage = () => {
  const [documents, setDocuments] = useState([]);
  const [selectedDocIds, setSelectedDocIds] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef(null);
  const notify = useNotification();

  useEffect(() => {
    fetchDocsAndSessions();
  }, []);

  const fetchDocsAndSessions = async () => {
    try {
      setLoading(true);
      const [docsRes, sessRes] = await Promise.all([
        documentApi.list({ per_page: 50 }),
        chatApi.listSessions(),
      ]);

      if (docsRes.success && docsRes.data) {
        const docs = docsRes.data.items;
        setDocuments(docs);
        // Default select first two docs if available
        if (docs.length >= 2) {
          setSelectedDocIds([docs[0].id, docs[1].id]);
        } else if (docs.length === 1) {
          setSelectedDocIds([docs[0].id]);
        }
      }

      if (sessRes.success && sessRes.data) {
        const multiSessions = sessRes.data.filter((s) => s.is_multi_doc);
        setSessions(multiSessions);
        if (multiSessions.length > 0) {
          loadSession(multiSessions[0].id);
        } else {
          handleNewSession();
        }
      }
    } catch (err) {
      notify.error(err.message || 'Failed to initialize multi-document chat');
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
        if (res.data.selected_doc_ids?.length > 0) {
          setSelectedDocIds(res.data.selected_doc_ids);
        }
      }
    } catch (err) {
      notify.error('Failed to load session');
    }
  };

  const toggleDocSelection = (id) => {
    setSelectedDocIds((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]
    );
  };

  const handleNewSession = async () => {
    try {
      const res = await chatApi.createSession({
        title: `Multi-Document Research (${selectedDocIds.length} Docs)`,
        is_multi_doc: true,
        selected_doc_ids: selectedDocIds,
      });

      if (res.success && res.data) {
        setSessions((prev) => [res.data, ...prev]);
        setActiveSession(res.data);
        setMessages([]);
      }
    } catch (err) {
      notify.error('Failed to create new session');
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

    const tempMsg = {
      id: 'temp-' + Date.now(),
      role: 'user',
      content: textToSend,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempMsg]);

    try {
      const res = await chatApi.sendMessage(activeSession.id, textToSend);
      if (res.success && res.data) {
        setMessages((prev) => [
          ...prev.filter((m) => m.id !== tempMsg.id),
          res.data.user_message,
          res.data.assistant_message,
        ]);
      }
    } catch (err) {
      notify.error(err.message || 'RAG multi-document generation failed');
    } finally {
      setSending(false);
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div style={{ display: 'flex', gap: '20px', height: 'calc(100vh - 120px)', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Left Multi-Doc Selector Drawer */}
      <div
        className="glass-card"
        style={{
          width: '320px',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
          padding: '20px',
        }}
      >
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '6px' }}>Select Target Documents</h3>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
          Choose documents to compare and synthesize across ({selectedDocIds.length} selected).
        </p>

        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
          {documents.map((d) => {
            const isSelected = selectedDocIds.includes(d.id);
            return (
              <div
                key={d.id}
                onClick={() => toggleDocSelection(d.id)}
                style={{
                  padding: '10px 12px',
                  borderRadius: '10px',
                  backgroundColor: isSelected ? 'rgba(59,130,246,0.12)' : 'var(--bg-surface)',
                  border: isSelected ? '1px solid var(--border-glow)' : '1px solid var(--border-subtle)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  transition: 'all 0.15s ease',
                }}
              >
                {isSelected ? (
                  <CheckSquare size={18} color="var(--accent-primary)" />
                ) : (
                  <Square size={18} color="var(--text-muted)" />
                )}
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: '0.85rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {d.title}
                  </p>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{d.document_type}</span>
                </div>
              </div>
            );
          })}
        </div>

        <button className="btn btn-primary" onClick={handleNewSession} style={{ width: '100%', fontSize: '0.85rem' }}>
          <Plus size={16} />
          <span>Start Synthesized Chat</span>
        </button>
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
        {/* Header */}
        <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MessagesSquare size={20} color="#8b5cf6" />
              <span>Multi-Document Comparative Synthesis</span>
            </h3>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Retrieving context from {selectedDocIds.length} selected document source(s)
            </span>
          </div>
        </div>

        {/* Message Stream */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {messages.length === 0 ? (
            <div style={{ textAlign: 'center', margin: 'auto', maxWidth: '520px' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '16px', backgroundColor: 'rgba(139,92,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: '#c084fc' }}>
                <Sparkles size={28} />
              </div>
              <h4 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '8px' }}>Cross-Document Question Answering</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                Ask complex questions to synthesize insights across multiple documents (e.g. "Compare the methodologies used", "Which invoice has the highest total amount?").
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
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0, marginTop: '2px' }}>
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

                  {msg.sources && msg.sources.length > 0 && (
                    <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                        Sources Referenced:
                      </span>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {msg.sources.map((src, i) => (
                          <div
                            key={i}
                            style={{
                              padding: '6px 10px',
                              backgroundColor: 'rgba(139,92,246,0.12)',
                              border: '1px solid rgba(139,92,246,0.3)',
                              borderRadius: '8px',
                              fontSize: '0.75rem',
                              color: '#c084fc',
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
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0 }}>
                <Bot size={18} />
              </div>
              <div style={{ padding: '14px 18px', borderRadius: '14px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                <div style={{ width: '14px', height: '14px', border: '2px solid rgba(139,92,246,0.4)', borderTopColor: '#8b5cf6', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                <span>Synthesizing cross-document analysis...</span>
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
            placeholder="Ask a question comparing or analyzing selected documents..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={sending}
          />
          <button type="submit" disabled={sending || !inputText.trim()} className="btn btn-primary" style={{ padding: '0 20px', height: '46px', background: 'linear-gradient(135deg, #7c3aed 0%, #6366f1 100%)' }}>
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};
