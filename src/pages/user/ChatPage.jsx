import React, { useEffect } from 'react';
import { UserLayout } from '../../components/layout/UserLayout.jsx';
import { useChat } from '../../context/ChatContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { ConversationList } from '../../components/chat/ConversationList.jsx';
import { ChatWindow } from '../../components/chat/ChatWindow.jsx';

export function ChatPage({ targetUsername, onNavigate }) {
  const { conversations, activeConversation, activeMessages, openChatWithUser, selectConversation, sendMessage, acceptChatRequest, declineChatRequest } = useChat();
  const { currentUser } = useAuth();
  const { t } = useLanguage();

  useEffect(() => {
    if (targetUsername) {
      openChatWithUser(targetUsername);
    }
  }, [targetUsername, openChatWithUser]);

  return (
    <UserLayout activeRoute="/chat" onNavigate={onNavigate} wide={true}>
      <div
        className="chat-layout-grid"
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
          className={`mka-card flex-col gap-sm chat-sidebar-card ${activeConversation ? 'hide-on-mobile' : ''}`}
          style={{
            height: '100%',
            overflowY: 'auto',
            background: 'var(--pure-white)',
            padding: '16px',
          }}
        >
          <h3 className="card-heading" style={{ fontSize: '17px', paddingBottom: '4px' }}>
            {t('conversations')} {conversations.length > 0 ? `(${conversations.length})` : ''}
          </h3>
          <ConversationList
            conversations={conversations}
            activeConvId={activeConversation?.id}
            onSelectConversation={selectConversation}
            currentUserUsername={currentUser?.username}
          />
        </div>

        <div className={`chat-window-wrapper ${!activeConversation ? 'hide-on-mobile' : ''}`} style={{ height: '100%', minWidth: 0 }}>
          <ChatWindow
            conversation={activeConversation}
            messages={activeMessages}
            currentUserUsername={currentUser?.username}
            onSendMessage={sendMessage}
            onAcceptRequest={acceptChatRequest}
            onDeclineRequest={declineChatRequest}
            onNavigate={onNavigate}
            onBackToList={() => selectConversation(null)}
          />
        </div>
      </div>
    </UserLayout>
  );
}
