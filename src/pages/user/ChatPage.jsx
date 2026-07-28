import React, { useEffect } from 'react';
import { UserLayout } from '../../components/layout/UserLayout.jsx';
import { useChat } from '../../context/ChatContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { ConversationList } from '../../components/chat/ConversationList.jsx';
import { ChatWindow } from '../../components/chat/ChatWindow.jsx';

export function ChatPage({ targetUsername, onNavigate }) {
  const { conversations, activeConversation, activeMessages, openChatWithUser, selectConversation, sendMessage } = useChat();
  const { currentUser } = useAuth();

  useEffect(() => {
    if (targetUsername) {
      openChatWithUser(targetUsername);
    }
  }, [targetUsername, openChatWithUser]);

  return (
    <UserLayout activeRoute="/chat" onNavigate={onNavigate} wide={true}>
      <div
        className="grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(260px, 320px) 1fr',
          gap: '16px',
          alignItems: 'stretch',
          height: 'calc(100vh - 116px)',
          overflow: 'hidden',
        }}
      >
        <div
          className="mka-card flex-col gap-sm"
          style={{
            height: '100%',
            overflowY: 'auto',
            background: 'var(--pure-white)',
            padding: '16px',
          }}
        >
          <h3 className="card-heading" style={{ fontSize: '17px', paddingBottom: '4px' }}>
            Conversations {conversations.length > 0 ? `(${conversations.length})` : ''}
          </h3>
          <ConversationList
            conversations={conversations}
            activeConvId={activeConversation?.id}
            onSelectConversation={selectConversation}
            currentUserUsername={currentUser?.username}
          />
        </div>

        <ChatWindow
          conversation={activeConversation}
          messages={activeMessages}
          currentUserUsername={currentUser?.username}
          onSendMessage={sendMessage}
          onNavigate={onNavigate}
        />
      </div>
    </UserLayout>
  );
}
