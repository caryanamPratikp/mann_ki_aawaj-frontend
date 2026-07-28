import React, { useState } from 'react';
import { UserLayout } from '../../components/layout/UserLayout.jsx';
import { PostCard } from '../../components/posts/PostCard.jsx';
import { HoverDiscussionPanel } from '../../components/posts/HoverDiscussionPanel.jsx';
import { InitialAvatar } from '../../components/profile/InitialAvatar.jsx';
import { Modal } from '../../components/common/Modal.jsx';
import { usePosts } from '../../context/PostContext.jsx';
import { useComments } from '../../context/CommentContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useReports } from '../../context/ReportContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { PlusSquare, Sparkles, Filter, Send } from 'lucide-react';
import { EmptyState } from '../../components/common/EmptyState.jsx';
import { SUPPORTED_LANGUAGES } from '../../utils/translations.js';

export function HomePage({ onNavigate }) {
  const { posts, createPost } = usePosts();
  const { currentUser } = useAuth();
  const { blockedUsers } = useReports();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState('For You');
  const [selectedTopic, setSelectedTopic] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedLanguage, setSelectedLanguage] = useState('All');

  // Hovered post state for Live Discussion Panel
  const [hoveredPost, setHoveredPost] = useState(null);
  const [hoveredArrowTop, setHoveredArrowTop] = useState(40);

  const handlePostHover = (p, topY) => {
    setHoveredPost(p);
    if (topY) setHoveredArrowTop(topY);
  };

  // Create Post Modal Overlay State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [postTopic, setPostTopic] = useState('Life');
  const [postType, setPostType] = useState('Thought');
  const [postLanguage, setPostLanguage] = useState('English');
  const [submitting, setSubmitting] = useState(false);

  const topics = ['All', 'Life', 'Career', 'Relationships', 'Personal Growth', 'Workplace', 'Parenting', 'Technology', 'Creativity', 'Books', 'Positive Thoughts'];
  const postTypes = ['All', 'Thought', 'Question', 'Experience', 'Need Advice', 'Confession', 'Something I Learned', 'Positive Note'];
  const languages = ['All', ...SUPPORTED_LANGUAGES.map(l => l.code)];

  const availableTopics = topics.filter(t => t !== 'All');
  const availableTypes = postTypes.filter(t => t !== 'All');

  const handlePublish = async (e) => {
    e.preventDefault();
    if (!postContent.trim()) {
      addToast('Please write some content before publishing.', 'error');
      return;
    }
    setSubmitting(true);
    try {
      createPost({
        title: postTitle.trim(),
        content: postContent.trim(),
        topic: postTopic,
        postType: postType,
        language: postLanguage,
        username: currentUser?.username || '@anonymous',
        avatarInitials: currentUser?.avatarInitials || 'AN',
      });
      addToast('Thought published successfully!', 'success');
      setPostTitle('');
      setPostContent('');
      setIsCreateModalOpen(false);
    } catch (err) {
      console.error(err);
      addToast('Failed to publish post.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

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

  // Discussion panel renders ONLY when a post is hovered
  const activeDiscussionPost = hoveredPost;

  return (
    <UserLayout activeRoute="/home" onNavigate={onNavigate} wide={true}>
      <div
        onMouseLeave={() => setHoveredPost(null)}
        style={{
          display: 'flex',
          gap: '20px',
          alignItems: 'flex-start',
          width: '100%',
        }}
      >

        {/* ── LEFT MAIN FEED COLUMN ── */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '14px' }}>

          {/* ── TOP CREATE POST TRIGGER BAR ── */}
          <div
            style={{
              padding: '12px 16px',
              borderRadius: '16px',
              background: '#ffffff',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              border: '1px solid #9F9794',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <InitialAvatar
              username={currentUser?.username || '@writer'}
              initials={currentUser?.avatarInitials || 'AN'}
              size={34}
            />
            <div
              onClick={() => setIsCreateModalOpen(true)}
              style={{
                flex: 1,
                padding: '9px 14px',
                borderRadius: '20px',
                background: '#F5F2F1',
                border: '1px solid #9F9794',
                color: '#8C8385',
                fontSize: '13.5px',
                cursor: 'pointer',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#E1DCDB'}
              onMouseLeave={e => e.currentTarget.style.background = '#F5F2F1'}
            >
              Share your unspoken thoughts freely &amp; anonymously...
            </div>
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: '#6F405F',
                color: '#ffffff',
                padding: '8px 16px',
                borderRadius: '20px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                border: 'none',
                whiteSpace: 'nowrap',
              }}
            >
              <PlusSquare size={15} />
              Create
            </button>
          </div>

          {/* ── FEED TABS ── */}
          <div className="flex-row items-center gap-xs border-b" style={{ borderBottom: '1px solid #9F9794', overflowX: 'auto', paddingBottom: '2px' }}>
            {['For You', 'Latest', 'Most Helpful', 'Following Topics'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '8px 14px',
                  fontSize: '13.5px',
                  fontWeight: activeTab === tab ? 600 : 400,
                  color: activeTab === tab ? '#6F405F' : '#8C8385',
                  borderBottom: activeTab === tab ? '2px solid #6F405F' : '2px solid transparent',
                  whiteSpace: 'nowrap',
                  background: 'transparent',
                  cursor: 'pointer',
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* ── FIXED CLEAN FILTER TOOLBAR (REDUCED PICKLIST LENGTH, 1 SINGLE ROW) ── */}
          <div
            style={{
              padding: '6px 12px',
              background: '#F5F2F1',
              borderRadius: '12px',
              border: '1px solid #9F9794',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-start',
              gap: '10px',
              whiteSpace: 'nowrap',
              flexWrap: 'nowrap',
              width: '100%',
              boxSizing: 'border-box',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11.5px', fontWeight: 600, color: '#2D1D15' }}>
              <Filter size={12} color="#6F405F" />
              <span>Filters:</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ fontSize: '11px', color: '#8C8385' }}>Topic:</span>
              <select
                value={selectedTopic}
                onChange={(e) => setSelectedTopic(e.target.value)}
                style={{
                  padding: '2px 4px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  border: '1px solid #9F9794',
                  background: '#ffffff',
                  color: '#2D1D15',
                  width: '80px',
                  maxWidth: '85px',
                }}
              >
                {topics.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ fontSize: '11px', color: '#8C8385' }}>Type:</span>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                style={{
                  padding: '2px 4px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  border: '1px solid #9F9794',
                  background: '#ffffff',
                  color: '#2D1D15',
                  width: '80px',
                  maxWidth: '85px',
                }}
              >
                {postTypes.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ fontSize: '11px', color: '#8C8385' }}>Language:</span>
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                style={{
                  padding: '2px 4px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  border: '1px solid #9F9794',
                  background: '#ffffff',
                  color: '#2D1D15',
                  width: '75px',
                  maxWidth: '80px',
                }}
              >
                {languages.map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>
          </div>

          {/* ── POSTS FEED ── */}
          {filteredPosts.length === 0 ? (
            <EmptyState
              title="No thoughts found"
              description="Try selecting a different topic filter or publish a new thought to start the conversation."
              icon={Sparkles}
              actionText="Share a Thought"
              onAction={() => setIsCreateModalOpen(true)}
            />
          ) : (
            <div className="flex-col" style={{ gap: '12px' }}>
              {filteredPosts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onNavigate={onNavigate}
                  onPostHover={handlePostHover}
                  isHoverActive={activeDiscussionPost?.id === post.id}
                />
              ))}
            </div>
          )}
        </div>

        {/* ── RIGHT HOVER LIVE DISCUSSION PANEL (ONLY SHOWN WHEN A POST IS HOVERED) ── */}
        <div className="desktop-only" style={{ width: '380px', flexShrink: 0, position: 'sticky', top: '84px' }}>
          {activeDiscussionPost && (
            <HoverDiscussionPanel
              post={activeDiscussionPost}
              arrowTop={hoveredArrowTop}
              onClose={() => setHoveredPost(null)}
            />
          )}
        </div>

      </div>

      {/* ── CREATE POST MODAL OVERLAY ── */}
      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Create Anonymous Thought">
        <form onSubmit={handlePublish} className="flex-col gap-sm">
          <div className="flex-row items-center gap-sm" style={{ borderBottom: '1px solid #E1DCDB', paddingBottom: '8px' }}>
            <InitialAvatar
              username={currentUser?.username || '@writer'}
              initials={currentUser?.avatarInitials || 'AN'}
              size={32}
            />
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#2D1D15' }}>
              Posting as <span style={{ color: '#6F405F' }}>{currentUser?.username || '@anonymous'}</span>
            </span>
          </div>

          <input
            type="text"
            value={postTitle}
            onChange={e => setPostTitle(e.target.value)}
            placeholder="Post title or question (optional)"
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid #9F9794',
              fontSize: '14px',
              fontWeight: 600,
              outline: 'none',
              color: '#2D1D15',
              background: '#F5F2F1',
            }}
          />

          <textarea
            value={postContent}
            onChange={e => setPostContent(e.target.value)}
            placeholder="Write your thought, experience, or question..."
            rows={5}
            required
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: '8px',
              border: '1px solid #9F9794',
              fontSize: '13.5px',
              lineHeight: 1.45,
              outline: 'none',
              color: '#2D1D15',
              resize: 'vertical',
              fontFamily: 'inherit',
            }}
            autoFocus
          />

          {/* Post Type Selector */}
          <div className="flex-col gap-xs">
            <span style={{ fontSize: '11.5px', fontWeight: 600, color: '#8C8385' }}>Type:</span>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {availableTypes.map(t => {
                const active = postType === t;
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setPostType(t)}
                    style={{
                      padding: '3px 10px',
                      borderRadius: '16px',
                      fontSize: '12px',
                      fontWeight: active ? 600 : 400,
                      background: active ? '#6F405F' : '#F5F2F1',
                      color: active ? '#ffffff' : '#2D1D15',
                      border: active ? '1px solid #6F405F' : '1px solid #9F9794',
                      cursor: 'pointer',
                    }}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex-row justify-between items-center" style={{ borderTop: '1px solid #E1DCDB', paddingTop: '10px', marginTop: '6px' }}>
            <div className="flex-row items-center gap-sm">
              <select
                value={postTopic}
                onChange={e => setPostTopic(e.target.value)}
                style={{ padding: '4px 8px', borderRadius: '6px', fontSize: '12px', border: '1px solid #9F9794' }}
              >
                {availableTopics.map(t => (
                  <option key={t} value={t}>Topic: {t}</option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={submitting || !postContent.trim()}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: '#6F405F',
                color: '#ffffff',
                padding: '8px 18px',
                borderRadius: '20px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: (submitting || !postContent.trim()) ? 'not-allowed' : 'pointer',
                opacity: (!postContent.trim()) ? 0.6 : 1,
                border: 'none',
              }}
            >
              <Send size={13} />
              {submitting ? 'Publishing...' : 'Publish Thought'}
            </button>
          </div>
        </form>
      </Modal>
    </UserLayout>
  );
}
