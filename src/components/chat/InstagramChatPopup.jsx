import React, { useState, useEffect } from 'react';
import { InitialAvatar } from '../profile/InitialAvatar.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { mockChatService } from '../../services/mockChatService.js';
import { X, Send, Shield, CheckCircle2, Lock, ArrowLeft } from 'lucide-react';
import { formatDate } from '../../utils/formatDate.js';

export function InstagramChatPopup({ targetUsername, onClose, onNavigate }) {
  const { currentUser } = useAuth();
  const { addToast } = useToast();

  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [requestStatus, setRequestStatus] = useState('NONE'); // NONE | SENT | RECEIVED | ACCEPTED
  const [submitting, setSubmitting] = useState(false);

  const cleanTarget = targetUsername ? (targetUsername.startsWith('@') ? targetUsername : `@${targetUsername}`) : null;
  const cleanSelf = currentUser?.username ? (currentUser.username.startsWith('@') ? currentUser.username : `@${currentUser.username}`) : '@quietchapter';

  useEffect(() => {
    if (!currentUser || !cleanTarget) return;

    // Load or create conversation
    const conv = mockChatService.getOrCreateConversation(cleanSelf, cleanTarget);
    setConversation(conv);

    const msgs = mockChatService.getMessagesForConversation(conv.id);
    setMessages(msgs);

    // Determine Instagram request status
    if (!conv.requestStatus || conv.requestStatus === 'ACCEPTED') {
      if (msgs.length === 0) {
        setRequestStatus('NONE'); // Needs initial message
      } else {
        setRequestStatus(conv.requestStatus || 'ACCEPTED');
      }
    } else {
      // Check who sent the request
      if (conv.requestSender === cleanSelf) {
        setRequestStatus('SENT');
      } else {
        setRequestStatus('RECEIVED');
      }
    }
  }, [cleanTarget, currentUser, cleanSelf]);

  const handleSendInitialRequest = (e) => {
    e.preventDefault();
    if (!inputText.trim() || submitting) return;
    setSubmitting(true);
    try {
      const msg = mockChatService.sendMessage(conversation.id, inputText.trim(), cleanSelf, cleanTarget);
      
      // Update conversation with request status
      const convs = mockChatService.getConversations();
      const idx = convs.findIndex(c => c.id === conversation.id);
      if (idx !== -1) {
        convs[idx].requestStatus = 'PENDING';
        convs[idx].requestSender = cleanSelf;
        localStorage.setItem('mka_chat_conversations', JSON.stringify(convs));
      }

      setMessages(prev => [...prev, msg]);
      setRequestStatus('SENT');
      setInputText('');
      addToast(`Chat request sent to ${cleanTarget}!`, 'success');
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAcceptRequest = () => {
    const convs = mockChatService.getConversations();
    const idx = convs.findIndex(c => c.id === conversation.id);
    if (idx !== -1) {
      convs[idx].requestStatus = 'ACCEPTED';
      localStorage.setItem('mka_chat_conversations', JSON.stringify(convs));
    }
    setRequestStatus('ACCEPTED');
    addToast('Chat request accepted!', 'success');
  };

  const handleDeclineRequest = () => {
    const convs = mockChatService.getConversations();
    const filtered = convs.filter(c => c.id !== conversation.id);
    localStorage.setItem('mka_chat_conversations', JSON.stringify(filtered));
    addToast('Chat request declined.', 'info');
    onClose();
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim() || submitting) return;
    setSubmitting(true);
    try {
      const msg = mockChatService.sendMessage(conversation.id, inputText.trim(), cleanSelf, cleanTarget);
      setMessages(prev => [...prev, msg]);
      setInputText('');
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (!cleanTarget) return null;

  return (
    <div
      className="animate-slide-in-right"
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '24px',
        width: '380px',
        height: '520px',
        background: '#ffffff',
        borderRadius: '16px',
        border: '1.5px solid #6F405F',
        boxShadow: '0 12px 36px rgba(45,29,21,0.20), 0 4px 12px rgba(0,0,0,0.10)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        zIndex: 1000,
      }}
    >
      {/* ── CHAT POPUP HEADER ── */}
      <div
        style={{
          padding: '12px 16px',
          background: '#6F405F',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <InitialAvatar username={cleanTarget} size={32} />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '14px', fontWeight: 700, color: '#ffffff' }}>
              {cleanTarget}
            </span>
            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.8)' }}>
              Anonymous Private Chat
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: '#ffffff',
            cursor: 'pointer',
            padding: '4px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <X size={18} />
        </button>
      </div>

      {/* ── CHAT BODY / MESSAGES ── */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '14px',
          background: '#F5F2F1',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
        }}
      >
        {/* Safety Banner */}
        <div
          style={{
            padding: '8px 12px',
            borderRadius: '8px',
            background: 'rgba(111,64,95,0.06)',
            border: '1px solid rgba(111,64,95,0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '11.5px',
            color: '#6F405F',
          }}
        >
          <Shield size={14} style={{ flexShrink: 0 }} />
          <span>Real identity is protected. Keep conversations respectful.</span>
        </div>

        {/* Message Log */}
        {messages.map((m) => {
          const isSelfMsg = m.senderUsername === cleanSelf || m.senderUsername === currentUser?.username;
          return (
            <div
              key={m.id}
              style={{
                alignSelf: isSelfMsg ? 'flex-end' : 'flex-start',
                maxWidth: '80%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: isSelfMsg ? 'flex-end' : 'flex-start',
              }}
            >
              <div
                style={{
                  padding: '8px 12px',
                  borderRadius: isSelfMsg ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                  background: isSelfMsg ? '#6F405F' : '#ffffff',
                  color: isSelfMsg ? '#ffffff' : '#2D1D15',
                  border: isSelfMsg ? 'none' : '1px solid #D4CECC',
                  fontSize: '13px',
                  lineHeight: 1.4,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                }}
              >
                {m.text}
              </div>
              <span style={{ fontSize: '10px', color: '#8C8385', marginTop: '2px' }}>
                {formatDate(m.createdAt)}
              </span>
            </div>
          );
        })}

        {/* ── INSTAGRAM STYLE REQUEST BANNERS ── */}

        {/* Request Sent State */}
        {requestStatus === 'SENT' && (
          <div
            style={{
              padding: '12px',
              borderRadius: '10px',
              background: '#ffffff',
              border: '1px dashed #6F405F',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '6px',
              marginTop: 'auto',
            }}
          >
            <Lock size={18} color="#6F405F" />
            <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#2D1D15' }}>
              Chat Request Sent ⏳
            </span>
            <span style={{ fontSize: '11.5px', color: '#8C8385' }}>
              {cleanTarget} must accept your chat request before further messages can be delivered.
            </span>
          </div>
        )}

        {/* Request Received State (Accept / Decline Banner) */}
        {requestStatus === 'RECEIVED' && (
          <div
            style={{
              padding: '12px',
              borderRadius: '12px',
              background: '#ffffff',
              border: '1.5px solid #6F405F',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              marginTop: 'auto',
              boxShadow: '0 4px 14px rgba(111,64,95,0.12)',
            }}
          >
            <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#6F405F' }}>
              📩 {cleanTarget} sent you a chat request.
            </span>
            <span style={{ fontSize: '11.5px', color: '#2D1D15' }}>
              Do you want to accept this request and start talking anonymously?
            </span>
            <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
              <button
                type="button"
                onClick={handleAcceptRequest}
                style={{
                  flex: 1,
                  padding: '8px',
                  borderRadius: '16px',
                  background: '#6F405F',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Accept Request
              </button>
              <button
                type="button"
                onClick={handleDeclineRequest}
                style={{
                  padding: '8px 12px',
                  borderRadius: '16px',
                  background: '#F5F2F1',
                  color: '#8C8385',
                  border: '1px solid #9F9794',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Decline
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── FOOTER INPUT BAR ── */}
      {requestStatus === 'NONE' ? (
        /* Initial Request Composer */
        <form
          onSubmit={handleSendInitialRequest}
          style={{
            padding: '10px 12px',
            background: '#ffffff',
            borderTop: '1px solid #D4CECC',
            display: 'flex',
            gap: '8px',
            alignItems: 'center',
          }}
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={`Send chat request to ${cleanTarget}...`}
            autoFocus
            style={{
              flex: 1,
              padding: '8px 12px',
              fontSize: '12.5px',
              borderRadius: '20px',
              border: '1.5px solid #6F405F',
              background: '#F5F2F1',
              outline: 'none',
              color: '#2D1D15',
            }}
          />
          <button
            type="submit"
            disabled={!inputText.trim() || submitting}
            style={{
              padding: '8px 14px',
              borderRadius: '20px',
              background: inputText.trim() ? '#6F405F' : '#9F9794',
              color: '#ffffff',
              border: 'none',
              fontSize: '12px',
              fontWeight: 700,
              cursor: inputText.trim() ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              whiteSpace: 'nowrap',
            }}
          >
            <Send size={12} /> Send Request
          </button>
        </form>
      ) : requestStatus === 'ACCEPTED' ? (
        /* Active Conversation Composer */
        <form
          onSubmit={handleSendMessage}
          style={{
            padding: '10px 12px',
            background: '#ffffff',
            borderTop: '1px solid #D4CECC',
            display: 'flex',
            gap: '8px',
            alignItems: 'center',
          }}
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type a message..."
            autoFocus
            style={{
              flex: 1,
              padding: '8px 12px',
              fontSize: '12.5px',
              borderRadius: '20px',
              border: '1px solid #9F9794',
              background: '#F5F2F1',
              outline: 'none',
              color: '#2D1D15',
            }}
          />
          <button
            type="submit"
            disabled={!inputText.trim() || submitting}
            style={{
              padding: '8px 14px',
              borderRadius: '20px',
              background: inputText.trim() ? '#6F405F' : '#9F9794',
              color: '#ffffff',
              border: 'none',
              fontSize: '12px',
              fontWeight: 700,
              cursor: inputText.trim() ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <Send size={12} /> Send
          </button>
        </form>
      ) : null}
    </div>
  );
}
