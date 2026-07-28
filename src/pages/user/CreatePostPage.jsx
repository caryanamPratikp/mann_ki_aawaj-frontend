import React, { useState } from 'react';
import { UserLayout } from '../../components/layout/UserLayout.jsx';
import { Input } from '../../components/common/Input.jsx';
import { Textarea } from '../../components/common/Textarea.jsx';
import { Select } from '../../components/common/Select.jsx';
import { Checkbox } from '../../components/common/Checkbox.jsx';
import { Button } from '../../components/common/Button.jsx';
import { ModerationIndicator } from '../../components/common/ModerationIndicator.jsx';
import { usePosts } from '../../context/PostContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { moderationCheck } from '../../utils/moderationCheck.js';
import { ArrowLeft, PenTool, Eye, ShieldAlert, Sparkles, Image as ImageIcon } from 'lucide-react';
import { Modal } from '../../components/common/Modal.jsx';

import { SUPPORTED_LANGUAGES } from '../../utils/translations.js';

export function CreatePostPage({ onNavigate }) {
  const { createPost } = usePosts();
  const { currentUser } = useAuth();
  const { addToast } = useToast();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [postType, setPostType] = useState('Thought');
  const [topic, setTopic] = useState('Life');
  const [language, setLanguage] = useState('English');
  const [imageUrl, setImageUrl] = useState('');
  const [allowComments, setAllowComments] = useState(true);

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const postTypes = ['Thought', 'Question', 'Experience', 'Need Advice', 'Confession', 'Something I Learned', 'Positive Note', 'Personal Challenge'];
  const topics = ['Life', 'Career', 'Relationships', 'Education', 'Student Life', 'Personal Growth', 'Workplace', 'Parenting', 'Technology', 'Creativity', 'Books', 'Entertainment', 'Financial Experiences', 'Positive Thoughts'];
  const languages = SUPPORTED_LANGUAGES.map(l => l.code);

  const fullText = `${title} ${content}`;
  const modResult = moderationCheck(fullText);
  const isBlocked = modResult.status === 'BLOCKED';

  const handlePublish = async (e) => {
    e.preventDefault();
    if (!content.trim()) {
      addToast('Post content cannot be empty.', 'error');
      return;
    }

    if (isBlocked) {
      addToast(`Post blocked: ${modResult.explanation}`, 'error');
      return;
    }

    setSubmitting(true);
    try {
      const newPost = await createPost({
        title: title.trim(),
        content: content.trim(),
        postType,
        topic,
        language,
        imageUrl: imageUrl.trim() || null,
        allowComments,
      });

      if (newPost.status === 'PENDING_REVIEW') {
        onNavigate('/my-posts');
      } else {
        onNavigate(`/post/${newPost.id}`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClear = () => {
    setTitle('');
    setContent('');
    setImageUrl('');
    addToast('Composer cleared.', 'info');
  };

  return (
    <UserLayout activeRoute="/create-post" onNavigate={onNavigate}>
      <div className="flex-col gap-md">
        <div className="flex-row items-center gap-sm">
          <Button variant="secondary" size="sm" onClick={() => onNavigate('/home')} icon={ArrowLeft}>
            Back to Feed
          </Button>
          <h1 className="page-heading">Create Anonymous Post</h1>
        </div>

        <form onSubmit={handlePublish} className="mka-card flex-col gap-md">
          {/* Post Type & Topic selector */}
          <div className="grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <Select
              label="Post Expression Type"
              options={postTypes}
              value={postType}
              onChange={(e) => setPostType(e.target.value)}
            />
            <Select
              label="Content Topic"
              options={topics}
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
            <Select
              label="Language"
              options={languages}
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            />
          </div>

          {/* Title */}
          <Input
            label="Optional Title"
            placeholder="Give your thought a short descriptive title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={120}
          />

          {/* Main Text Content */}
          <div className="flex-col gap-xs">
            <Textarea
              label="Post Content (Written Text) *"
              placeholder="Share your authentic thought, confession, or question respectfully..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
              maxLength={2500}
              showCounter
              required
            />
            <ModerationIndicator text={fullText} />
          </div>

          {/* Optional Image URL */}
          <Input
            label="Optional Image URL"
            icon={ImageIcon}
            placeholder="https://images.unsplash.com/..."
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            helperText="Enter a valid image link to attach an illustration or visual context."
          />

          {/* Options */}
          <div className="mka-panel flex-row justify-between items-center flex-wrap gap-sm">
            <Checkbox
              id="allowCommentsToggle"
              label="Allow comments & replies on this post"
              checked={allowComments}
              onChange={(e) => setAllowComments(e.target.checked)}
            />
          </div>

          {/* Moderation Status Banner if Flagged */}
          {modResult.status === 'NEEDS_EDITING' && (
            <div className="p-sm flex-row items-center gap-sm" style={{ background: 'var(--warning-bg)', color: 'var(--warning)', padding: '10px 14px', borderRadius: 'var(--radius-md)' }}>
              <ShieldAlert size={18} />
              <span style={{ fontSize: '13px' }}>
                Some wording may be harmful or disrespectful. Please review community guidelines before publishing.
              </span>
            </div>
          )}

          {/* Actions */}
          <div className="flex-row justify-between items-center border-t" style={{ paddingTop: '16px', borderTop: '1px solid var(--border-light)' }}>
            <div className="flex-row items-center gap-sm">
              <Button type="button" variant="secondary" size="sm" onClick={handleClear}>
                Clear
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={() => setIsPreviewOpen(true)} icon={Eye}>
                Preview
              </Button>
            </div>

            <Button
              type="submit"
              variant="primary"
              disabled={!content.trim() || isBlocked || submitting}
              icon={Sparkles}
            >
              {submitting ? 'Publishing...' : 'Publish Post'}
            </Button>
          </div>
        </form>
      </div>

      {/* Post Preview Modal */}
      <Modal isOpen={isPreviewOpen} onClose={() => setIsPreviewOpen(false)} title="Post Preview" maxWidth="640px">
        <div className="flex-col gap-md">
          <div className="mka-card">
            <div className="flex-row items-center gap-sm" style={{ marginBottom: '12px' }}>
              <span className="badge badge-plum">{postType}</span>
              <span className="badge badge-neutral">{topic}</span>
              <span className="caption-text">• {language}</span>
            </div>
            {title && <h2 className="card-heading" style={{ marginBottom: '8px' }}>{title}</h2>}
            <p className="body-text" style={{ whiteSpace: 'pre-line' }}>
              {content || '[Your content will appear here]'}
            </p>
            {imageUrl && (
              <div style={{ marginTop: '12px', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                <img src={imageUrl} alt="Preview attachment" style={{ width: '100%', maxHeight: '300px', objectFit: 'cover' }} />
              </div>
            )}
          </div>
          <div className="flex-row justify-end">
            <Button variant="secondary" onClick={() => setIsPreviewOpen(false)}>
              Close Preview
            </Button>
          </div>
        </div>
      </Modal>
    </UserLayout>
  );
}
