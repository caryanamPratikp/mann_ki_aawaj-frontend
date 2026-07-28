import React from 'react';
import { InitialAvatar } from '../profile/InitialAvatar.jsx';
import { formatDate } from '../../utils/formatDate.js';
import { mockChatService } from '../../services/mockChatService.js';
import { MessageSquare } from 'lucide-react';

export function ConversationList({ conversations = [], activeConvId, onSelectConversation, currentUserUsername }) {
  if (!conversations.length) {
    return (
      <div className="p-md secondary-text text-center" style={{ padding: '32px 16px' }}>
        <MessageSquare size={28} style={{ color: 'var(--hurricane)', margin: '0 auto 8px auto' }} />
        No active conversations yet. Visit member profiles to start an anonymous chat!
      </div>
    );
  }

  return (
    <div className="flex-col gap-xs">
      {conversations.map((conv) => {
        const otherUsername = conv.participants.find(p => p.toLowerCase() !== currentUserUsername?.toLowerCase()) || conv.participants[0];
        const isActive = conv.id === activeConvId;
        const status = mockChatService.getUserRealtimeStatus(otherUsername);

        return (
          <button
            key={conv.id}
            onClick={() => onSelectConversation(conv.id)}
            className="flex-row items-center gap-md"
            style={{
              width: '100%',
              padding: '12px 14px',
              borderRadius: 'var(--radius-md)',
              background: isActive ? 'var(--deep-plum-light)' : 'transparent',
              border: isActive ? '1px solid var(--deep-plum)' : '1px solid transparent',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'background var(--transition-fast)',
            }}
          >
            <div style={{ position: 'relative' }}>
              <InitialAvatar username={otherUsername} size={42} />
              <span
                style={{
                  position: 'absolute',
                  bottom: '1px',
                  right: '1px',
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  backgroundColor: status.isOnline ? 'var(--success)' : 'var(--hurricane)',
                  border: '2px solid var(--pure-white)',
                }}
              />
            </div>

            <div className="flex-col" style={{ flex: 1, minWidth: 0 }}>
              <div className="flex-row justify-between items-center">
                <span className="bold" style={{ fontSize: '15px', color: 'var(--eclipse)' }}>
                  {otherUsername}
                </span>
                <span className="caption-text">{formatDate(conv.updatedAt)}</span>
              </div>
              <p
                className="secondary-text"
                style={{
                  fontSize: '13px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  marginTop: '2px',
                }}
              >
                {conv.lastMessage}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
