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
import { useLanguage } from '../../context/LanguageContext.jsx';
import { moderationCheck } from '../../utils/moderationCheck.js';
import { SYSTEM_TOPICS } from '../../utils/topicUtils.js';
import { ArrowLeft, Eye, ShieldAlert, Sparkles, Image as ImageIcon, Upload, Loader2, CheckCircle2, X } from 'lucide-react';
import { Modal } from '../../components/common/Modal.jsx';
import { apiClient } from '../../services/apiClient.js';

import { getMediaUrl } from '../../config/env.js';

export function CreatePostPage({ onNavigate }) {
  const { createPost } = usePosts();
  const { currentUser } = useAuth();
  const { addToast } = useToast();
  const { t } = useLanguage();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [postType, setPostType] = useState('Thought');
  const [topic, setTopic] = useState('GENERAL');
  const [imageUrl, setImageUrl] = useState('');
  const [allowComments, setAllowComments] = useState(true);

  const [uploadingImage, setUploadingImage] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const postTypes = [
    { value: 'Thought', label: t('Thought', 'Thought') },
    { value: 'Question', label: t('Question', 'Question') },
    { value: 'Experience', label: t('Experience', 'Experience') },
    { value: 'Need Advice', label: t('Need Advice', 'Need Advice') },
    { value: 'Confession', label: t('Confession', 'Confession') },
    { value: 'Something I Learned', label: t('Something I Learned', 'Something I Learned') },
    { value: 'Positive Note', label: t('Positive Note', 'Positive Note') },
    { value: 'Personal Challenge', label: t('Personal Challenge', 'Personal Challenge') },
  ];

  const topics = SYSTEM_TOPICS.map((tKey) => ({
    value: tKey,
    label: t(tKey, tKey),
  }));

  const fullText = `${title} ${content}`;
  const modResult = moderationCheck(fullText);
  const isBlocked = modResult.status === 'BLOCKED';

  // Real Image File Upload & OpenAI Moderation
  const handleImageFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      addToast(t('imageUploadError') || 'Only valid image files (JPEG, PNG, WEBP) are allowed.', 'error');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      addToast(t('imageSizeError') || 'Image size must be less than 10MB.', 'error');
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
        addToast(t('imageUploadSuccess'), 'success');
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

  const handlePublish = async (e) => {
    e.preventDefault();
    if (!content.trim()) {
      addToast(t('contentRequired') || 'Post content cannot be empty.', 'error');
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
        imageUrl: imageUrl.trim() || null,
        allowComments,
      });

      if (newPost.status === 'PENDING_REVIEW') {
        onNavigate('/my-posts');
      } else {
        onNavigate('/home');
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
  };

  return (
    <UserLayout activeRoute="/create-post" onNavigate={onNavigate}>
      <div className="flex-col gap-md">
        <div className="flex-row items-center gap-sm">
          <Button variant="secondary" size="sm" onClick={() => onNavigate('/home')} icon={ArrowLeft}>
            {t('backToFeed')}
          </Button>
          <h1 className="page-heading">{t('createAnonymousPost')}</h1>
        </div>

        <form onSubmit={handlePublish} className="mka-card flex-col gap-md">
          {/* Post Type & Topic selector */}
          <div className="grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            <Select
              label={t('postExpressionType')}
              options={postTypes}
              value={postType}
              onChange={(e) => setPostType(e.target.value)}
            />
            <Select
              label={t('contentTopic')}
              options={topics}
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
          </div>

          {/* Title */}
          <Input
            label={t('titleOptional')}
            placeholder={t('titlePlaceholderDesc')}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={120}
          />

          {/* Main Text Content */}
          <div className="flex-col gap-xs">
            <Textarea
              label={t('postContentLabel')}
              placeholder={t('postContentPlaceholder')}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
              maxLength={2500}
              showCounter
              required
            />
            <ModerationIndicator text={fullText} />
          </div>

          {/* File Upload Field for Image */}
          <div className="flex-col gap-xs">
            <label className="input-label" style={{ fontSize: '13px', fontWeight: 600, color: 'var(--eclipse)' }}>
              {t('uploadImage')}
            </label>

            {imageUrl ? (
              <div style={{ position: 'relative', display: 'inline-block', maxWidth: '360px' }}>
                <img
                  src={getMediaUrl(imageUrl)}
                  alt="Uploaded attachment"
                  style={{ width: '100%', maxHeight: '220px', objectFit: 'cover', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}
                />
                <button
                  type="button"
                  onClick={() => setImageUrl('')}
                  style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    background: 'rgba(0,0,0,0.65)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '50%',
                    width: '26px',
                    height: '26px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <div
                style={{
                  border: '2px dashed var(--border-medium)',
                  borderRadius: 'var(--radius-md)',
                  padding: '20px',
                  textAlign: 'center',
                  background: 'var(--soft-white)',
                  cursor: 'pointer',
                  position: 'relative',
                }}
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageFileChange}
                  disabled={uploadingImage}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    opacity: 0,
                    cursor: uploadingImage ? 'wait' : 'pointer',
                  }}
                />
                {uploadingImage ? (
                  <div className="flex-row items-center justify-center gap-xs" style={{ color: 'var(--deep-plum)' }}>
                    <Loader2 size={20} className="spin-animation" />
                    <span style={{ fontSize: '13px', fontWeight: 600 }}>{t('uploadingImage')}</span>
                  </div>
                ) : (
                  <div className="flex-col items-center justify-center gap-xs">
                    <Upload size={24} style={{ color: 'var(--hurricane)', marginBottom: '4px' }} />
                    <span style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--deep-plum)' }}>
                      {t('chooseImage')}
                    </span>
                    <span style={{ fontSize: '11.5px', color: 'var(--hurricane)' }}>
                      PNG, JPG, WEBP, GIF, SVG, BMP (Max 10MB) • Verified by AI Safety
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Options */}
          <div className="mka-panel flex-row justify-between items-center flex-wrap gap-sm">
            <Checkbox
              id="allowCommentsToggle"
              label={t('allowCommentsToggle')}
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
                {t('clear')}
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={() => setIsPreviewOpen(true)} icon={Eye}>
                {t('preview')}
              </Button>
            </div>

            <Button
              type="submit"
              variant="primary"
              disabled={!content.trim() || isBlocked || submitting || uploadingImage}
              icon={Sparkles}
            >
              {submitting ? t('publishing') : t('publishPost')}
            </Button>
          </div>
        </form>
      </div>

      {/* Post Preview Modal */}
      <Modal isOpen={isPreviewOpen} onClose={() => setIsPreviewOpen(false)} title={t('postPreview')} maxWidth="640px">
        <div className="flex-col gap-md">
          <div className="mka-card">
            <div className="flex-row items-center gap-sm" style={{ marginBottom: '12px' }}>
              <span className="badge badge-plum">{postType}</span>
              <span className="badge badge-neutral">{topic}</span>
            </div>
            {title && <h2 className="card-heading" style={{ marginBottom: '8px' }}>{title}</h2>}
            <p className="body-text" style={{ whiteSpace: 'pre-line' }}>
              {content || '[Your content will appear here]'}
            </p>
            {imageUrl && (
              <div style={{ marginTop: '12px', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                <img src={getMediaUrl(imageUrl)} alt="Preview attachment" style={{ width: '100%', maxHeight: '300px', objectFit: 'cover' }} />
              </div>
            )}
          </div>
          <div className="flex-row justify-end">
            <Button variant="secondary" onClick={() => setIsPreviewOpen(false)}>
              {t('closePreview')}
            </Button>
          </div>
        </div>
      </Modal>
    </UserLayout>
  );
}
