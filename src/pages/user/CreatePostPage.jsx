import React from 'react';
import { UserLayout } from '../../components/layout/UserLayout.jsx';
import { TopicCreateModal } from '../../components/topics/TopicCreateModal.jsx';

export function CreatePostPage({ onNavigate }) {
  const close = () => onNavigate('/home');
  return <UserLayout activeRoute="/create-post" onNavigate={onNavigate}>
    <div style={{ minHeight: '65vh', background: 'linear-gradient(135deg, rgba(255,255,255,.78), rgba(236,216,230,.75))', borderRadius: 24 }} />
    <TopicCreateModal isOpen onClose={close} onCreated={(topic) => onNavigate(`/topic/${topic.id}`)} />
  </UserLayout>;
}
