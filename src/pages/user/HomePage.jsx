import React, { useState, useMemo, useEffect, useRef } from 'react';
import { UserLayout } from '../../components/layout/UserLayout.jsx';
import { PostCard } from '../../components/posts/PostCard.jsx';
import { Modal } from '../../components/common/Modal.jsx';
import { usePosts } from '../../context/PostContext.jsx';
import { useComments } from '../../context/CommentContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useReports } from '../../context/ReportContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { useVoiceRecorder } from '../../hooks/useVoiceRecorder.js';
import { useSpokenLanguage } from '../../hooks/useSpokenLanguage.js';
import { PlusSquare, TrendingUp, Mic, MicOff, Loader2, Upload, X, ShieldAlert, Clock, MessageSquare, Sparkles, Search, ChevronDown, ChevronUp } from 'lucide-react';
import { EmptyState } from '../../components/common/EmptyState.jsx';
import { formatDate } from '../../utils/formatDate.js';
import { apiClient } from '../../services/apiClient.js';
import { apiMoodService } from '../../services/apiMoodService.js';
import { getMediaUrl } from '../../config/env.js';
import { SleekCommentSidePanel } from '../../components/posts/SleekCommentSidePanel.jsx';
import { AvatarThumbnail } from '../../components/avatar/AvatarThumbnail.jsx';
import { SYSTEM_TOPICS, computeTopicStats, saveCustomTopic } from '../../utils/topicUtils.js';
import { TopicBackgroundRotator } from '../../components/topics/TopicBackgroundRotator.jsx';
import { useMoodMusic } from '../../context/MoodMusicContext.jsx';

export function HomePage({ onNavigate }) {
  const { posts, loading, createPost } = usePosts();
  const { commentsByPost } = useComments();
  const { currentUser } = useAuth();
  const { blockedUsers, mutedUsers = [] } = useReports();
  const { addToast } = useToast();
  const { t } = useLanguage();
  const [spokenLanguage] = useSpokenLanguage();
  const { isPlaying, currentTrack } = useMoodMusic();

  const [activeTab, setActiveTab] = useState('Latest');
  const [selectedTopic, setSelectedTopic] = useState('All');
  const [selectedMood, setSelectedMood] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCommentsPost, setActiveCommentsPost] = useState(null);

  // Check URL param ?create=true
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(() => {
    return window.location.search.includes('create=true');
  });

  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [postTopic, setPostTopic] = useState('GENERAL');
  const [customTopic, setCustomTopic] = useState('');
  const [postType, setPostType] = useState('Thought');
  const [imageUrl, setImageUrl] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Feature 11: Movie Review States
  const [movieName, setMovieName] = useState('');
  const [movieRating, setMovieRating] = useState(5);
  const [isSpoiler, setIsSpoiler] = useState(false);

  // Feature 18: DB-backed Mood of India State (No dummy data, initial collapsed style, click-outside collapse)
  const [moodVotes, setMoodVotes] = useState({});
  const [totalMoodVotes, setTotalMoodVotes] = useState(0);
  const [userSelectedMood, setUserSelectedMood] = useState('');
  const [isMoodWidgetExpanded, setIsMoodWidgetExpanded] = useState(false);
  const moodWidgetRef = useRef(null);

  // Manual Create Topic Modal state
  const [isCreateTopicModalOpen, setIsCreateTopicModalOpen] = useState(false);
  const [newTopicInput, setNewTopicInput] = useState('');

  const DAILY_QUESTIONS = [
    "What is something you have never told anyone?",
    "Who do you miss the most today?",
    "What would you tell your younger self?",
    "Which movie or story completely changed your thinking?",
    "What is your biggest frustration at work right now?",
    "What is one secret dream you have never shared with anyone?",
    "If you could apologize to one person from your past, who would it be?",
    "What is the hardest lesson life has taught you so far?",
    "What makes you feel truly happy when you are alone?",
    "What is something you wish people understood about you?"
  ];

  // Calendar date-based daily automatic rotation (Changes at midnight 12:00 AM every day)
  const dailyQuestionIdx = useMemo(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now - start;
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);
    return dayOfYear % DAILY_QUESTIONS.length;
  }, []);

  const MOOD_OPTIONS = [
    { label: 'Happy', emoji: '😊' },
    { label: 'Love', emoji: '❤️' },
    { label: 'Sad', emoji: '😔' },
    { label: 'Angry', emoji: '😡' },
    { label: 'Heartbroken', emoji: '💔' },
    { label: 'Tired', emoji: '😴' },
    { label: 'Hopeful', emoji: '🤗' }
  ];

  // Fetch real Mood of India data from Backend DB API on mount & currentUser login change
  useEffect(() => {
    let isMounted = true;
    apiMoodService.getMoodOfIndia().then((res) => {
      if (!isMounted) return;
      if (res?.data) {
        setMoodVotes(res.data.moodCounts || {});
        setTotalMoodVotes(res.data.totalVotes || 0);
        setUserSelectedMood(res.data.userMood || '');
      }
    }).catch(console.error);

    return () => { isMounted = false; };
  }, [currentUser]);

  // Click Outside Listener to collapse Mood of India widget
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (moodWidgetRef.current && !moodWidgetRef.current.contains(event.target)) {
        setIsMoodWidgetExpanded(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleVoteMood = async (moodLabel) => {
    try {
      const res = await apiMoodService.voteMood(moodLabel);
      if (res?.data) {
        setMoodVotes(res.data.moodCounts || {});
        setTotalMoodVotes(res.data.totalVotes || 0);
        const newMood = res.data.userMood || '';
        setUserSelectedMood(newMood);
        if (newMood) {
          addToast(`Mood updated! (${newMood})`, 'success');
        } else {
          addToast('Mood vote cleared.', 'info');
        }
      }
    } catch (err) {
      console.error(err);
      addToast('Please login to update your mood', 'error');
    }
  };

  // Compute live percentages from real DB counts (No dummy data!)
  const moodStats = useMemo(() => {
    return MOOD_OPTIONS.map((m) => {
      const cnt = moodVotes[m.label.toUpperCase()] || moodVotes[m.label] || 0;
      const pct = totalMoodVotes > 0 ? Math.round((cnt / totalMoodVotes) * 100) : 0;
      return { ...m, count: cnt, percentage: pct };
    }).sort((a, b) => b.count - a.count);
  }, [moodVotes, totalMoodVotes]);

  const isUserMuted = Boolean(
    (currentUser?.mutedUntil && new Date(currentUser.mutedUntil) > new Date()) ||
    currentUser?.warningCount >= 3 ||
    currentUser?.active === false ||
    currentUser?.isMuted
  );

  // Compute 100% dynamic topic stats and sort Trending/New topics to the top
  const sortedTopics = useMemo(() => {
    return computeTopicStats(posts);
  }, [posts]);

  const handleImageFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      addToast('Only valid image files (JPEG, PNG, WEBP) are allowed.', 'error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      addToast('Image size must be less than 5MB.', 'error');
      return;
    }

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await apiClient.post('/api/upload/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 45000,
      });

      if (response.data?.success && response.data?.data?.imageUrl) {
        const uploadedUrl = response.data.data.imageUrl;
        setImageUrl(uploadedUrl);
        addToast('Image uploaded & verified by AI safety.', 'success');
      } else {
        throw new Error(response.data?.message || 'Failed to upload image');
      }
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || err.message || 'Image upload failed';
      addToast(msg, 'error');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleOpenGeneralCreateModal = () => {
    setPostTitle('');
    setPostContent('');
    setImageUrl('');
    setMovieName('');
    setIsSpoiler(false);
    setPostTopic('GENERAL');
    setIsCreateModalOpen(true);
  };

  const { isRecording, isTranscribing, bindMicProps } = useVoiceRecorder((transcribedText) => {
    setPostContent((prev) => (prev ? `${prev} ${transcribedText}` : transcribedText));
    setIsCreateModalOpen(true);
  }, spokenLanguage);

  const handlePublish = async (e) => {
    e.preventDefault();
    if (!postContent.trim()) {
      addToast('Please write some content for your thought.', 'error');
      return;
    }
    setSubmitting(true);
    try {
      const finalTopic = postTopic === 'CUSTOM'
        ? (customTopic.trim().toUpperCase().replace(/[^A-Z0-9_]/g, '') || 'GENERAL')
        : postTopic;

      if (postTopic === 'CUSTOM' && finalTopic !== 'GENERAL') {
        saveCustomTopic(finalTopic);
      }

      await createPost({
        title: postTitle.trim(),
        content: postContent.trim(),
        topic: finalTopic,
        postType: postType,
        imageUrl: imageUrl.trim() || null,
        movieName: movieName.trim() || null,
        movieRating: movieRating || null,
        isSpoiler: isSpoiler || false,
        mood: userSelectedMood || null,
      });

      setPostTitle('');
      setPostContent('');
      setCustomTopic('');
      setPostTopic('GENERAL');
      setImageUrl('');
      setMovieName('');
      setMovieRating(5);
      setIsSpoiler(false);
      setPostMood('');
      setIsCreateModalOpen(false);
      addToast('Thought shared successfully!', 'success');
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  // Filter posts
  const filteredPosts = isUserMuted
    ? []
    : posts.filter((p) => {
        if (!p) return false;
        const authorHandle = (p.username || p.authorUsername || p.handle || '').toLowerCase().replace(/^@/, '').trim();
        const isBlockedOrMuted =
          Boolean(authorHandle) && (
            blockedUsers.some((b) => (b || '').toLowerCase().replace(/^@/, '').trim() === authorHandle) ||
            mutedUsers.some((m) => (m || '').toLowerCase().replace(/^@/, '').trim() === authorHandle)
          ) || p.isMuted || p.muted;

        if (isBlockedOrMuted) return false;

        if (selectedMood && p.mood !== selectedMood) {
          return false;
        }

        if (activeTab === 'My Topics') {
          const favTopics = currentUser?.preferredTopics?.length
            ? currentUser.preferredTopics
            : ['BOLLYWOOD', 'CRICKET', 'POLITICS', 'TECHNOLOGY'];
          const pTopic = (p.topic || 'GENERAL').toUpperCase();
          if (!favTopics.some((fav) => fav.toUpperCase() === pTopic)) {
            return false;
          }
        }

        if (selectedTopic !== 'All') {
          const pTopic = (p.topic || 'GENERAL').toLowerCase();
          const sTopic = selectedTopic.toLowerCase();
          if (pTopic !== sTopic && !pTopic.includes(sTopic) && !sTopic.includes(pTopic)) return false;
        }

        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const title = (p.title || '').toLowerCase();
          const content = (p.content || '').toLowerCase();
          const author = (p.username || p.authorUsername || p.handle || '').toLowerCase();
          const topic = (p.topic || '').toLowerCase();
          if (!title.includes(q) && !content.includes(q) && !author.includes(q) && !topic.includes(q)) {
            return false;
          }
        }
        return true;
      });

  return (
    <UserLayout activeRoute="/home" onNavigate={onNavigate} wide={true}>
      <TopicBackgroundRotator topicName={selectedTopic === 'All' ? 'ALL' : selectedTopic}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>

        {isUserMuted && (
          <div
            style={{
              padding: '16px 20px',
              borderRadius: '14px',
              backgroundColor: 'rgba(239, 68, 68, 0.08)',
              border: '1.5px solid rgba(239, 68, 68, 0.3)',
              color: '#DC2626',
              fontSize: '13.5px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <ShieldAlert size={22} color="#DC2626" />
            <div>
              <div style={{ fontWeight: 700, fontSize: '14.5px' }}>Account Restricted</div>
              <div>Your account is currently restricted from creating or viewing thoughts due to a safety warning.</div>
            </div>
          </div>
        )}

        {/* ── TOP ACTION BAR: Simple Clean Action Bar ── */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            flexWrap: 'wrap',
            padding: '10px 16px',
            borderRadius: '20px',
            background: '#FFFFFF',
            border: '1px solid var(--border-light)',
            boxShadow: '0 4px 14px rgba(45, 29, 21, 0.04)',
          }}
        >
          {/* Simple Filter Pills */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {['Latest', 'Most Helpful', 'Trending', 'My Topics'].map((tab) => {
              const isSelected = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    padding: '7px 16px',
                    borderRadius: '20px',
                    fontSize: '13px',
                    fontWeight: isSelected ? 700 : 500,
                    color: isSelected ? '#FFFFFF' : 'var(--eclipse)',
                    background: isSelected ? 'var(--deep-plum)' : '#FAF8F7',
                    border: isSelected ? 'none' : '1px solid var(--border-light)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {
                    tab === 'Latest' ? t('latest', 'Latest') :
                    tab === 'Most Helpful' ? t('mostHelpful', 'Most Helpful') :
                    tab === 'Trending' ? t('trending', 'Trending') :
                    t('myTopics', 'My Topics')
                  }
                </button>
              );
            })}
          </div>

          {/* Right Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Mic Dictation Button */}
            <button
              type="button"
              {...bindMicProps}
              title={isRecording ? 'Release to stop recording' : 'Hold microphone to speak'}
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                backgroundColor: isRecording ? '#B33A3A' : 'rgba(111,64,95,0.12)',
                color: isRecording ? '#FFFFFF' : '#6F405F',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                userSelect: 'none',
              }}
            >
              {isTranscribing ? <Loader2 size={16} className="spin-animation" /> : isRecording ? <MicOff size={16} /> : <Mic size={16} />}
            </button>

            <button
              onClick={handleOpenGeneralCreateModal}
              style={{
                padding: '8px 16px',
                borderRadius: '20px',
                background: 'var(--deep-plum)',
                color: '#FFF',
                fontWeight: 700,
                fontSize: '13px',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <PlusSquare size={16} /> {t('createThought', '+ Create Thought')}
            </button>
          </div>
        </div>

        {/* ── SINGLE-LINE COLLAPSED TOPICS STRIP (WHEN A TOPIC IS OPENED) ── */}
        {selectedTopic !== 'All' && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              padding: '10px 16px',
              borderRadius: '20px',
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 242, 246, 0.95) 100%)',
              border: '1.5px solid rgba(111, 64, 95, 0.18)',
              boxShadow: '0 4px 16px rgba(45, 29, 21, 0.05)',
              overflowX: 'auto',
            }}
            className="hide-scrollbar"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
              <span style={{ fontSize: '13px', fontWeight: 800, color: '#2D1D15' }}>Active Topic:</span>
              <span
                style={{
                  fontSize: '12.5px',
                  fontWeight: 800,
                  color: '#FFFFFF',
                  background: 'linear-gradient(135deg, #6F405F 0%, #3D2334 100%)',
                  padding: '4px 12px',
                  borderRadius: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                #{t(selectedTopic, selectedTopic)}
              </span>
            </div>

            {/* Horizontal Topics Stream Pills */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflowX: 'auto' }} className="hide-scrollbar">
              <button
                onClick={() => setSelectedTopic('All')}
                style={{
                  padding: '6px 14px',
                  borderRadius: '14px',
                  fontSize: '12px',
                  fontWeight: 800,
                  color: '#6F405F',
                  background: '#F3EBF0',
                  border: '1px solid rgba(111, 64, 95, 0.2)',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                ✕ View All Topics
              </button>
              {sortedTopics.map((tStat) => {
                const isSelected = selectedTopic.toUpperCase() === tStat.name;
                return (
                  <button
                    key={tStat.name}
                    onClick={() => setSelectedTopic(isSelected ? 'All' : tStat.name)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '14px',
                      fontSize: '12px',
                      fontWeight: isSelected ? 800 : 600,
                      color: isSelected ? '#FFFFFF' : '#4A3E3D',
                      background: isSelected ? 'linear-gradient(135deg, #6F405F 0%, #3D2334 100%)' : '#FFFFFF',
                      border: isSelected ? 'none' : '1.5px solid #EFEAE8',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      boxShadow: isSelected ? '0 3px 10px rgba(111, 64, 95, 0.3)' : 'none',
                    }}
                  >
                    #{t(tStat.name, tStat.name)} ({tStat.count})
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── MAIN LAYOUT: Full-Width Posts Feed (Only posts shown on Home Screen) ── */}
        <div
          style={{
            maxWidth: '100%',
            width: '100%',
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          {/* Feature 17: Today's Question Interactive Banner */}
          <div
            style={{
              padding: '18px 24px',
              borderRadius: '20px',
              background: 'linear-gradient(135deg, #6F405F 0%, #3D2334 100%)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px',
              width: '100%',
              boxSizing: 'border-box',
              boxShadow: '0 8px 24px rgba(61, 35, 52, 0.25)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', zIndex: 1, flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '11px', fontWeight: 900, background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: '10px', letterSpacing: '0.04em' }}>
                  ❤️ {t('todaysQuestion', "Today's Question")}
                </span>
              </div>
              <h3 style={{ fontSize: '16.5px', fontWeight: 800, margin: '4px 0 0 0', color: '#FFFFFF', lineHeight: 1.3 }}>
                "{DAILY_QUESTIONS[dailyQuestionIdx]}"
              </h3>
            </div>

            <button
              type="button"
              onClick={() => {
                setPostTitle(`Re: Today's Question - "${DAILY_QUESTIONS[dailyQuestionIdx]}"`);
                setPostTopic('FEELINGS');
                setIsCreateModalOpen(true);
              }}
              style={{
                padding: '10px 18px',
                borderRadius: '20px',
                background: '#FFFFFF',
                color: '#6F405F',
                fontSize: '12.5px',
                fontWeight: 800,
                border: 'none',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                flexShrink: 0,
                zIndex: 1,
                transition: 'transform 0.2s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.04)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            >
              💬 {t('answerAnonymously', 'Answer Anonymously')} →
            </button>
          </div>

          {/* Posts Feed */}
          {filteredPosts.length === 0 ? (
            <EmptyState
              icon={MessageSquare}
              title="No thoughts found"
              description="Be the first author to share a thought under this topic."
              actionLabel="Share Thought"
              onAction={handleOpenGeneralCreateModal}
            />
          ) : (
            filteredPosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onNavigate={onNavigate}
                onToggleComments={() => {
                  if (activeCommentsPost?.id === post.id) setActiveCommentsPost(null);
                  else setActiveCommentsPost(post);
                }}
                activeCommentsPostId={activeCommentsPost?.id}
              />
            ))
          )}
        </div>
      </div>
    </TopicBackgroundRotator>

      {/* ── CREATE POST MODAL OVERLAY WITH BLUR BACKDROP & GOOGLE MIC INPUT ── */}
      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title={t('createAnonymousThought', 'Create Anonymous Thought')}>
        <form onSubmit={handlePublish} className="flex-col gap-sm">
          <div className="flex-row items-center gap-sm" style={{ borderBottom: '1px solid #E1DCDB', paddingBottom: '8px' }}>
            <AvatarThumbnail
              username={currentUser?.username || '@writer'}
              initials={currentUser?.avatarInitials || 'AN'}
              config={currentUser?.avatarConfig}
              size={32}
            />
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#2D1D15' }}>
              {t('postingAs', 'Posting as')} <span style={{ color: '#6F405F' }}>{currentUser?.username || '@anonymous'}</span>
            </span>
          </div>

          <input
            type="text"
            placeholder={t('titlePlaceholder', 'Title / Headline (optional)...')}
            value={postTitle}
            onChange={(e) => setPostTitle(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid #D4CECC',
              fontSize: '13px',
              outline: 'none',
            }}
          />

          <div style={{ position: 'relative', width: '100%' }}>
            <textarea
              rows={4}
              placeholder={t('shareThoughtsFreely', "What's on your mind? Share your unspoken thoughts anonymously...")}
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '10px 40px 10px 12px',
                borderRadius: '8px',
                border: '1px solid #D4CECC',
                fontSize: '13.5px',
                outline: 'none',
                resize: 'vertical',
                boxSizing: 'border-box',
              }}
            />

            {/* Google-Style Mic Button inside Modal Overlay (Press & Hold to Speak) */}
            <button
              type="button"
              {...bindMicProps}
              title={isRecording ? 'Release to stop recording' : 'Hold microphone to speak'}
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                backgroundColor: isRecording ? '#B33A3A' : 'rgba(111,64,95,0.12)',
                color: isRecording ? '#FFFFFF' : '#6F405F',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: 'none',
                cursor: 'pointer',
                userSelect: 'none',
              }}
            >
              {isTranscribing ? <Loader2 size={14} className="spin-animation" /> : isRecording ? <MicOff size={14} /> : <Mic size={14} />}
            </button>
          </div>

          {/* Image File Attachment Field */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#6F405F' }}>
              {t('uploadImage', 'Attach Image (Optional)')}
            </label>
            {imageUrl ? (
              <div style={{ position: 'relative', display: 'inline-block', maxWidth: '240px' }}>
                <img
                  src={getMediaUrl(imageUrl)}
                  alt="Attachment preview"
                  style={{ width: '100%', maxHeight: '140px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #D4CECC' }}
                />
                <button
                  type="button"
                  onClick={() => setImageUrl('')}
                  style={{
                    position: 'absolute',
                    top: '4px',
                    right: '4px',
                    background: 'rgba(0,0,0,0.7)',
                    color: '#FFF',
                    border: 'none',
                    borderRadius: '50%',
                    width: '22px',
                    height: '22px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <X size={12} />
                </button>
              </div>
            ) : (
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1.5px dashed #D4CECC',
                  background: '#FAF8F7',
                  cursor: 'pointer',
                  fontSize: '12.5px',
                  color: '#6F405F',
                  fontWeight: 600,
                }}
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageFileChange}
                  disabled={uploadingImage}
                  style={{ display: 'none' }}
                />
                {uploadingImage ? (
                  <>
                    <Loader2 size={16} className="spin-animation" />
                    <span>{t('uploadingImage', 'Uploading Image...')}</span>
                  </>
                ) : (
                  <>
                    <Upload size={16} />
                    <span>{t('chooseImage', 'Attach Image (JPEG, PNG, WEBP)')}</span>
                  </>
                )}
              </label>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '11px', fontWeight: 700, color: '#6F405F', display: 'block', marginBottom: '2px' }}>
              {t('contentTopic', 'Content Topic')} *
            </label>
            <select
              value={postTopic}
              onChange={(e) => setPostTopic(e.target.value)}
              style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #D4CECC', fontSize: '12.5px', fontWeight: 600 }}
            >
              {SYSTEM_TOPICS.map(tKey => (
                <option key={tKey} value={tKey}>{t(tKey, tKey)}</option>
              ))}
              <option value="CUSTOM">✨ + Create Custom Topic...</option>
            </select>

            {postTopic === 'CUSTOM' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '13px', fontWeight: 800, color: '#6F405F' }}>#</span>
                <input
                  type="text"
                  placeholder="e.g. MEDITATION, POETRY, GAMING..."
                  value={customTopic}
                  onChange={(e) => setCustomTopic(e.target.value.toUpperCase().replace(/\s+/g, '_'))}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1.5px solid #6F405F',
                    fontSize: '13px',
                    fontWeight: 700,
                    outline: 'none',
                  }}
                />
              </div>
            )}
          </div>

          {/* Feature 11: Movie Review Subsystem */}
          {(postTopic === 'ENTERTAINMENT' || postTopic === 'MOVIE_REVIEW') && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '12px', borderRadius: '12px', background: '#FAF4F8', border: '1px solid rgba(111, 64, 95, 0.2)' }}>
              <div style={{ fontSize: '12px', fontWeight: 800, color: '#6F405F', display: 'flex', alignItems: 'center', gap: '6px' }}>
                🎬 {t('movieReview', 'Movie Review Subsystem')}
              </div>
              
              <input
                type="text"
                placeholder="Movie / Web Series Name (e.g. Kantara, Stree 2, Pushpa 2)..."
                value={movieName}
                onChange={(e) => setMovieName(e.target.value)}
                style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #D4CECC', fontSize: '13px', outline: 'none' }}
              />

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#2D1D15' }}>Rating:</span>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setMovieRating(star)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', padding: 0 }}
                    >
                      {star <= movieRating ? '⭐' : '☆'}
                    </button>
                  ))}
                </div>

                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700, color: '#2D1D15', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={isSpoiler}
                    onChange={(e) => setIsSpoiler(e.target.checked)}
                  />
                  <span>Contains Spoilers? (⚠️ Tap to reveal mask)</span>
                </label>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid #D4CECC', background: '#FFF', fontSize: '13px' }}
            >
              {t('cancel', 'Cancel')}
            </button>
            <button
              type="submit"
              disabled={submitting || !postContent.trim()}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                background: 'var(--deep-plum)',
                color: '#FFF',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {submitting ? t('publishing', 'Publishing...') : t('publishThought', 'Publish Thought')}
            </button>
          </div>
        </form>
      </Modal>

      {/* Create Custom Topic Modal */}
      <Modal
        isOpen={isCreateTopicModalOpen}
        onClose={() => setIsCreateTopicModalOpen(false)}
        title="Create New Custom Topic"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!newTopicInput.trim()) {
              addToast('Please enter a valid topic name.', 'error');
              return;
            }
            const cleanName = newTopicInput.trim().toUpperCase().replace(/[^A-Z0-9_]/g, '');
            if (!cleanName) {
              addToast('Invalid topic name. Use letters, numbers, and underscores.', 'error');
              return;
            }
            saveCustomTopic(cleanName);
            setSelectedTopic(cleanName);
            setNewTopicInput('');
            setIsCreateTopicModalOpen(false);
            addToast(`Topic #${cleanName} created! Marked with 👤 USER ADDED badge.`, 'success');
          }}
          style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}
        >
          <div>
            <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#6F405F', display: 'block', marginBottom: '6px' }}>
              Topic Category Name *
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '15px', fontWeight: 900, color: '#6F405F' }}>#</span>
              <input
                type="text"
                placeholder="e.g. PHILOSOPHY, MEDITATION, STARTUPS..."
                value={newTopicInput}
                onChange={(e) => setNewTopicInput(e.target.value.toUpperCase().replace(/\s+/g, '_'))}
                required
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: '1.5px solid #6F405F',
                  fontSize: '14px',
                  fontWeight: 700,
                  outline: 'none',
                }}
              />
            </div>
            <p style={{ fontSize: '11.5px', color: '#8C8385', margin: '6px 0 0 0' }}>
              User-created topics are visible to all users with a <strong>👤 USER ADDED</strong> badge in the corner.
            </p>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
            <button
              type="button"
              onClick={() => setIsCreateTopicModalOpen(false)}
              style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid #D4CECC', background: '#FFF', fontSize: '13px' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                background: 'linear-gradient(135deg, #6F405F 0%, #3D2334 100%)',
                color: '#FFF',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Create Topic
            </button>
          </div>
        </form>
      </Modal>
    </UserLayout>
  );
}
