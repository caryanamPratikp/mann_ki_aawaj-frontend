import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserLayout } from '../../components/layout/UserLayout.jsx';
import { PostCard } from '../../components/posts/PostCard.jsx';
import { LargeDiscussionWindow } from '../../components/posts/LargeDiscussionWindow.jsx';
import { AvatarThumbnail } from '../../components/avatar/AvatarThumbnail.jsx';
import { Modal } from '../../components/common/Modal.jsx';
import { usePosts } from '../../context/PostContext.jsx';
import { useComments } from '../../context/CommentContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useReports } from '../../context/ReportContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { useVoiceRecorder } from '../../hooks/useVoiceRecorder.js';
import { useSpokenLanguage } from '../../hooks/useSpokenLanguage.js';
import { SpokenLanguageSelector } from '../../components/common/SpokenLanguageSelector.jsx';
import { PlusSquare, Sparkles, Filter, TrendingUp, MessageSquare, Edit3, Mic, MicOff, Loader2 } from 'lucide-react';
import { EmptyState } from '../../components/common/EmptyState.jsx';
import { SUPPORTED_LANGUAGES } from '../../utils/translations.js';
import { formatDate } from '../../utils/formatDate.js';

export function HomePage({ onNavigate }) {
  const { posts, loading, isFetching, createPost } = usePosts();
  const { commentsByPost, fetchComments, createComment, reactToComment } = useComments();
  const { currentUser } = useAuth();
  const { blockedUsers } = useReports();
  const { addToast } = useToast();
  const { currentLanguage } = useLanguage();
  const [spokenLanguage, setSpokenLanguage] = useSpokenLanguage();

  const [activeTab, setActiveTab] = useState('Latest');
  const [selectedTopic, setSelectedTopic] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedLanguageFilter, setSelectedLanguageFilter] = useState('ALL');

  // Currently selected active post (click again to collapse / set null)
  const [selectedPostId, setSelectedPostId] = useState(null);

  // Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [postTopic, setPostTopic] = useState('General');
  const [postType, setPostType] = useState('Thought');
  const [postLanguage, setPostLanguage] = useState('EN');
  const [submitting, setSubmitting] = useState(false);

  // Voice to text recorder for post creation using dedicated spoken language state
  const { isRecording, isTranscribing, toggleRecording } = useVoiceRecorder((transcribedText) => {
    setPostContent((prev) => (prev ? `${prev} ${transcribedText}` : transcribedText));
    setIsCreateModalOpen(true);
  }, spokenLanguage);

  // Fetch comments when active post changes
  useEffect(() => {
    if (selectedPostId) {
      fetchComments(selectedPostId);
    }
  }, [selectedPostId, fetchComments]);

  const activePost = posts.find((p) => p.id === selectedPostId) || null;
  const activePostComments = selectedPostId ? (commentsByPost[selectedPostId] || []) : [];

  const handlePostClick = (postId) => {
    setSelectedPostId((prev) => (prev === postId ? null : postId));
  };

  const handlePublish = async (e) => {
    e.preventDefault();
    if (!postContent.trim()) {
      addToast('Please write some content for your thought.', 'error');
      return;
    }
    setSubmitting(true);
    try {
      const newPost = await createPost({
        title: postTitle.trim(),
        content: postContent.trim(),
        topic: postTopic,
        postType: postType,
        language: postLanguage,
        username: currentUser?.username || '@anonymous',
        avatarInitials: currentUser?.avatarInitials || 'AN',
        avatarConfig: currentUser?.avatarConfig,
      });

      if (newPost?.id) {
        setSelectedPostId(newPost.id);
      }
      setPostTitle('');
      setPostContent('');
      setIsCreateModalOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddComment = (postId, text) => {
    try {
      const targetPost = posts.find((p) => p.id === postId);
      createComment(postId, text, targetPost?.username);
    } catch (err) {
      console.error(err);
    }
  };

  const handleReactComment = (commentId, emoji) => {
    if (reactToComment) {
      reactToComment(commentId, emoji);
    }
  };

  const topics = ['All', 'General', 'Mental Health', 'Career', 'Relationships', 'Tech & Society', 'Confessions'];
  const postTypes = ['All', 'Thought', 'Question', 'Vent', 'Story', 'Advice'];

  // Filter posts
  const filteredPosts = posts.filter((p) => {
    if (blockedUsers.includes(p.username)) return false;
    if (selectedTopic !== 'All') {
      const pTopic = (p.topic || 'General').toLowerCase();
      const sTopic = selectedTopic.toLowerCase();
      if (pTopic !== sTopic && !pTopic.includes(sTopic) && !sTopic.includes(pTopic)) return false;
    }
    if (selectedType !== 'All' && p.postType !== selectedType) return false;
    if (selectedLanguageFilter !== 'ALL' && selectedLanguageFilter !== 'All' && (p.language || 'EN') !== selectedLanguageFilter) return false;
    return true;
  });

  return (
    <UserLayout activeRoute="/home" onNavigate={onNavigate} wide={true}>
      {/* ── SUBTLE BACKGROUND TRANSLATION FETCHING INDICATOR ── */}
      {isFetching && !loading && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'rgba(111, 64, 95, 0.08)',
            color: '#6F405F',
            padding: '6px 14px',
            borderRadius: '10px',
            fontSize: '12px',
            fontWeight: 600,
            marginBottom: '10px',
            border: '1px solid rgba(111, 64, 95, 0.20)',
          }}
        >
          <Loader2 size={14} className="spin-animation" />
          <span>Updating translations in background...</span>
        </div>
      )}
      {/* ── TOP ACTION BAR: Feed Tabs (Left) & Quick Prompt Bar (Right) ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          marginBottom: '12px',
          flexWrap: 'wrap',
        }}
      >
        {/* Feed Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflowX: 'auto' }}>
          {['Latest', 'Most Helpful', 'Following Topics'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '6px 14px',
                borderRadius: '20px',
                fontSize: '12.5px',
                fontWeight: activeTab === tab ? 700 : 500,
                color: activeTab === tab ? '#FFFFFF' : '#6E625F',
                backgroundColor: activeTab === tab ? '#6F405F' : '#FFFFFF',
                border: '1px solid #D4CECC',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                whiteSpace: 'nowrap',
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Quick Share Prompt Bar with Voice-to-Text Microphone */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#FFFFFF',
            padding: '4px 8px 4px 6px',
            borderRadius: '24px',
            border: '1.5px solid #D4CECC',
            boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
            transition: 'all 0.15s ease',
          }}
        >
          <div
            onClick={() => setIsCreateModalOpen(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
          >
            <AvatarThumbnail
              username={currentUser?.username || '@writer'}
              initials={currentUser?.avatarInitials || 'AN'}
              config={currentUser?.avatarConfig}
              size={28}
            />
            <span style={{ fontSize: '12.5px', color: '#7A6E6B', fontWeight: 500 }}>
              Share an unspoken thought...
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {/* Voice to text mic icon button */}
            <button
              type="button"
              onClick={toggleRecording}
              disabled={isTranscribing}
              title={isRecording ? 'Click to stop recording' : 'Speak thought (Voice-to-Text)'}
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                backgroundColor: isRecording ? '#B33A3A' : 'rgba(111,64,95,0.10)',
                color: isRecording ? '#FFFFFF' : '#6F405F',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              {isTranscribing ? (
                <Loader2 size={13} className="spin-animation" />
              ) : isRecording ? (
                <MicOff size={13} />
              ) : (
                <Mic size={13} />
              )}
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            style={{
              fontSize: '11.5px',
              fontWeight: 700,
              backgroundColor: '#6F405F',
              color: '#FFFFFF',
              padding: '4px 12px',
              borderRadius: '16px',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <Edit3 size={12} /> Post
          </button>
        </div>
      </div>

      {/* ── 2-COLUMN MAIN CONTENT ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(340px, 1.2fr) minmax(320px, 1fr)',
          gap: '16px',
          alignItems: 'start',
        }}
      >
        {/* ── LEFT COLUMN: LARGE LIVE DISCUSSION WINDOW ── */}
        <div>
          <LargeDiscussionWindow
            post={activePost}
            comments={activePostComments}
            onAddComment={handleAddComment}
            onReactComment={handleReactComment}
            onNavigate={onNavigate}
          />
        </div>

        {/* ── RIGHT COLUMN: ANIMATED TOPIC STREAM ── */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            border: '1px solid #EDE8E6',
            padding: '16px',
            boxShadow: '0 2px 12px rgba(0,0,0,0.03)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          {/* Right Header: Filter & Count */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingBottom: '10px',
              borderBottom: '1px solid #EDE8E6',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <TrendingUp size={16} color="#6F405F" />
              <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#2D1D15', margin: 0 }}>
                Topics Stream
              </h3>
            </div>

            {/* Filter Dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <select
                value={selectedTopic}
                onChange={(e) => setSelectedTopic(e.target.value)}
                style={{
                  fontSize: '11.5px',
                  fontWeight: 600,
                  padding: '4px 8px',
                  borderRadius: '12px',
                  border: '1px solid #D4CECC',
                  backgroundColor: '#F7F4F3',
                  color: '#2D1D15',
                  outline: 'none',
                  cursor: 'pointer',
                }}
              >
                {topics.map((topic) => (
                  <option key={topic} value={topic}>
                    Topic: {topic}
                  </option>
                ))}
              </select>

              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  backgroundColor: '#6F405F',
                  color: '#FFFFFF',
                  borderRadius: '10px',
                  padding: '2px 7px',
                }}
              >
                {filteredPosts.length}
              </span>
            </div>
          </div>

          {/* Animated Posts Stream List */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              maxHeight: 'calc(100vh - 200px)',
              overflowY: 'auto',
              paddingRight: '2px',
            }}
          >
            <AnimatePresence initial={false}>
              {filteredPosts.length > 0 ? (
                filteredPosts.map((post) => {
                  const isSelected = selectedPostId === post.id;

                  return (
                    <motion.div
                      key={post.id}
                      layout
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div
                        onClick={() => handlePostClick(post.id)}
                        style={{
                          border: isSelected ? '2px solid #6F405F' : '1px solid #E8DDD4',
                          borderRadius: '14px',
                          backgroundColor: isSelected ? '#FFFDFB' : '#FFFFFF',
                          padding: '12px 14px',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '8px',
                          transition: 'all 0.2s ease',
                          boxShadow: isSelected ? '0 4px 14px rgba(111,64,95,0.12)' : '0 2px 6px rgba(0,0,0,0.02)',
                        }}
                      >
                        {/* ── COLLAPSED HEADER: Avatar, Username, Topic Tag, Time & Three Dots ── */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onNavigate(`/profile/${post.username.replace('@', '')}`);
                              }}
                              style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', flexShrink: 0 }}
                              title={`View ${post.username}'s profile`}
                            >
                              <AvatarThumbnail
                                username={post.username}
                                initials={post.avatarInitials}
                                config={post.avatarConfig}
                                size={28}
                              />
                            </button>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onNavigate(`/profile/${post.username.replace('@', '')}`);
                                  }}
                                  style={{
                                    background: 'none',
                                    border: 'none',
                                    padding: 0,
                                    cursor: 'pointer',
                                    fontSize: '13px',
                                    fontWeight: 700,
                                    color: '#181818',
                                    textAlign: 'left',
                                  }}
                                  onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
                                  onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
                                >
                                  {post.username}
                                </button>
                                <span
                                  style={{
                                    fontSize: '10.5px',
                                    fontWeight: 700,
                                    padding: '2px 8px',
                                    borderRadius: '10px',
                                    backgroundColor: '#D89C7A',
                                    color: '#0B0A16',
                                  }}
                                >
                                  🏷️ {post.topic || 'General'}
                                </span>
                              </div>
                              <div style={{ fontSize: '11px', color: '#666666' }}>
                                {formatDate(post.createdAt)} {post.language ? `• 🌐 ${post.language}` : ''}
                              </div>
                            </div>
                          </div>

                          <div style={{ fontSize: '16px', color: '#666666', padding: '0 4px', fontWeight: 900 }}>•••</div>
                        </div>

                        {/* ── EXPANDED CONTENT & REACTIONS WHEN CLICKED ── */}
                        {isSelected && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingTop: '8px', borderTop: '1px solid #F0E8E2' }}>
                            {post.title && (
                              <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#181818' }}>
                                {post.title}
                              </div>
                            )}
                            <p style={{ fontSize: '12.5px', color: '#4A3E3D', margin: 0, lineHeight: 1.45 }}>
                              {post.content}
                            </p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                <EmptyState
                  icon={MessageSquare}
                  title="No thoughts found"
                  description="Be the first to share an unspoken thought on this topic!"
                  actionLabel="+ Share Thought"
                  onAction={() => setIsCreateModalOpen(true)}
                />
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* ── CREATE POST MODAL OVERLAY ── */}
      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Create Anonymous Thought">
        <form onSubmit={handlePublish} className="flex-col gap-sm">
          <div className="flex-row items-center gap-sm" style={{ borderBottom: '1px solid #E1DCDB', paddingBottom: '8px' }}>
            <AvatarThumbnail
              username={currentUser?.username || '@writer'}
              initials={currentUser?.avatarInitials || 'AN'}
              config={currentUser?.avatarConfig}
              size={32}
            />
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#2D1D15' }}>
              Posting as <span style={{ color: '#6F405F' }}>{currentUser?.username || '@anonymous'}</span>
            </span>
          </div>

          <input
            type="text"
            placeholder="Title / Summary (optional)..."
            value={postTitle}
            onChange={(e) => setPostTitle(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid #D4CECC',
              fontSize: '13.5px',
            }}
          />

          <div style={{ position: 'relative' }}>
            <textarea
              rows={4}
              placeholder={
                isRecording
                  ? 'Recording spoken thought...'
                  : isTranscribing
                  ? 'Transcribing audio to text...'
                  : 'Share your unspoken thoughts freely...'
              }
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 42px 10px 12px',
                borderRadius: '8px',
                border: isRecording ? '1.5px solid #B33A3A' : '1px solid #D4CECC',
                fontSize: '13.5px',
                resize: 'vertical',
                boxSizing: 'border-box',
                backgroundColor: isRecording ? 'rgba(179,58,58,0.05)' : '#FFFFFF',
              }}
            />

            <div style={{ position: 'absolute', right: '10px', bottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              {/* Voice-to-Text Microphone button inside textarea */}
              <button
                type="button"
                onClick={toggleRecording}
                disabled={isTranscribing}
                title={isRecording ? 'Stop recording' : 'Speak thought'}
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  backgroundColor: isRecording ? '#B33A3A' : 'rgba(111,64,95,0.10)',
                  color: isRecording ? '#FFFFFF' : '#6F405F',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                {isTranscribing ? (
                  <Loader2 size={14} className="spin-animation" />
                ) : isRecording ? (
                  <MicOff size={14} />
                ) : (
                  <Mic size={14} />
                )}
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '11px', fontWeight: 700, color: '#6F405F', display: 'block', marginBottom: '4px' }}>
                Topic:
              </label>
              <select
                value={postTopic}
                onChange={(e) => setPostTopic(e.target.value)}
                style={{ width: '100%', padding: '6px', borderRadius: '6px', border: '1px solid #D4CECC', fontSize: '12px' }}
              >
                {topics.filter(t => t !== 'All').map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '11px', fontWeight: 700, color: '#6F405F', display: 'block', marginBottom: '4px' }}>
                Post Type:
              </label>
              <select
                value={postType}
                onChange={(e) => setPostType(e.target.value)}
                style={{ width: '100%', padding: '6px', borderRadius: '6px', border: '1px solid #D4CECC', fontSize: '12px' }}
              >
                {postTypes.filter(t => t !== 'All').map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            style={{
              padding: '10px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: '#6F405F',
              color: '#FFFFFF',
              fontWeight: 700,
              fontSize: '14px',
              cursor: 'pointer',
              marginTop: '10px',
            }}
          >
            {submitting ? 'Publishing...' : 'Publish Anonymously'}
          </button>
        </form>
      </Modal>
    </UserLayout>
  );
}
