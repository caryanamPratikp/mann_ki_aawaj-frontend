import React, { useState } from 'react';
import { UserLayout } from '../../components/layout/UserLayout.jsx';
import { PostCard } from '../../components/posts/PostCard.jsx';
import { usePosts } from '../../context/PostContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useReports } from '../../context/ReportContext.jsx';
import { PlusSquare, Sparkles, Filter, MessageSquare } from 'lucide-react';
import { Button } from '../../components/common/Button.jsx';
import { EmptyState } from '../../components/common/EmptyState.jsx';

import { SUPPORTED_LANGUAGES } from '../../utils/translations.js';

export function HomePage({ onNavigate }) {
  const { posts, loading } = usePosts();
  const { currentUser } = useAuth();
  const { blockedUsers } = useReports();

  const [activeTab, setActiveTab] = useState('For You'); // For You, Latest, Most Helpful, Following Topics
  const [selectedTopic, setSelectedTopic] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedLanguage, setSelectedLanguage] = useState('All');

  const topics = ['All', 'Life', 'Career', 'Relationships', 'Personal Growth', 'Workplace', 'Parenting', 'Technology', 'Creativity', 'Books', 'Positive Thoughts'];
  const postTypes = ['All', 'Thought', 'Question', 'Experience', 'Need Advice', 'Confession', 'Something I Learned', 'Positive Note'];
  const languages = ['All', ...SUPPORTED_LANGUAGES.map(l => l.code)];

  // Filter & sort posts
  let filteredPosts = posts.filter((p) => {
    if (p.status !== 'PUBLISHED') return false;
    if (blockedUsers.includes(p.username)) return false;
    if (selectedTopic !== 'All' && p.topic !== selectedTopic) return false;
    if (selectedType !== 'All' && p.postType !== selectedType) return false;
    if (selectedLanguage !== 'All' && p.language !== selectedLanguage) return false;
    return true;
  });

  if (activeTab === 'Latest') {
    filteredPosts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } else if (activeTab === 'Most Helpful') {
    filteredPosts.sort((a, b) => {
      const scoreA = (a.reactions?.helpful || 0) + (a.reactions?.wellSaid || 0) + (a.reactions?.relate || 0);
      const scoreB = (b.reactions?.helpful || 0) + (b.reactions?.wellSaid || 0) + (b.reactions?.relate || 0);
      return scoreB - scoreA;
    });
  } else if (activeTab === 'Following Topics' && currentUser?.interests) {
    filteredPosts = filteredPosts.filter((p) => currentUser.interests.includes(p.topic));
  }

  return (
    <UserLayout activeRoute="/home" onNavigate={onNavigate}>
      <div className="flex-col gap-md">
        {/* User Greeting & Quick Composer Banner */}
        <div className="mka-card flex-col gap-sm" style={{ background: 'linear-gradient(135deg, var(--soft-white) 0%, var(--swiss-coffee) 100%)' }}>
          <div className="flex-row justify-between items-center">
            <div>
              <h1 className="card-heading" style={{ fontSize: '22px' }}>
                Welcome back, {currentUser?.username || 'Writer'}
              </h1>
              <p className="secondary-text" style={{ fontSize: '14px' }}>
                Share your unspoken thoughts freely & anonymously.
              </p>
            </div>
            <Button variant="primary" onClick={() => onNavigate('/create-post')} icon={PlusSquare}>
              Create Thought
            </Button>
          </div>
        </div>

        {/* Feed Tabs */}
        <div className="flex-row items-center gap-xs border-b" style={{ borderBottom: '1px solid var(--border-light)', overflowX: 'auto', paddingBottom: '2px' }}>
          {['For You', 'Latest', 'Most Helpful', 'Following Topics'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '10px 16px',
                fontSize: '14px',
                fontWeight: activeTab === tab ? 600 : 400,
                color: activeTab === tab ? 'var(--deep-plum)' : 'var(--hurricane)',
                borderBottom: activeTab === tab ? '2px solid var(--deep-plum)' : '2px solid transparent',
                whiteSpace: 'nowrap',
                background: 'transparent',
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Filter Toolbar */}
        <div className="mka-panel flex-row items-center gap-md flex-wrap">
          <div className="flex-row items-center gap-xs secondary-text" style={{ fontSize: '13px', fontWeight: 500 }}>
            <Filter size={14} />
            <span>Filters:</span>
          </div>

          <div className="flex-row items-center gap-xs">
            <span className="caption-text">Topic:</span>
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              style={{ padding: '4px 8px', borderRadius: 'var(--radius-sm)', fontSize: '13px', border: '1px solid var(--border-light)' }}
            >
              {topics.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div className="flex-row items-center gap-xs">
            <span className="caption-text">Type:</span>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              style={{ padding: '4px 8px', borderRadius: 'var(--radius-sm)', fontSize: '13px', border: '1px solid var(--border-light)' }}
            >
              {postTypes.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div className="flex-row items-center gap-xs">
            <span className="caption-text">Language:</span>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              style={{ padding: '4px 8px', borderRadius: 'var(--radius-sm)', fontSize: '13px', border: '1px solid var(--border-light)' }}
            >
              {languages.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Posts Feed */}
        {filteredPosts.length === 0 ? (
          <EmptyState
            title="No thoughts found"
            description="Try selecting a different topic filter or publish a new thought to start the conversation."
            icon={Sparkles}
            actionText="Share a Thought"
            onAction={() => onNavigate('/create-post')}
          />
        ) : (
          <div className="flex-col gap-md">
            {filteredPosts.map((post) => (
              <PostCard key={post.id} post={post} onNavigate={onNavigate} />
            ))}
          </div>
        )}
      </div>
    </UserLayout>
  );
}
