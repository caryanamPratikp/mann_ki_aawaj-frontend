import React, { useEffect, useState } from 'react';
import { ImagePlus, X } from 'lucide-react';
import { Modal } from '../common/Modal.jsx';
import { Button } from '../common/Button.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useLanguage, getLanguageCode } from '../../context/LanguageContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { apiClient } from '../../services/apiClient.js';
import { apiTopicService } from '../../services/apiTopicService.js';
import { apiCommentService } from '../../services/apiCommentService.js';
import { getMediaUrl } from '../../config/env.js';

function ParentOption({ topic, currentLanguage, translateTextAsync }) {
  const english = topic === 'GENERAL' ? 'Others' : topic.replaceAll('_', ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
  const [label, setLabel] = useState(english);
  useEffect(() => {
    let active = true;
    setLabel(english);
    if (currentLanguage && currentLanguage !== 'English') {
      translateTextAsync(english, currentLanguage, 'EN').then((value) => active && setLabel(value || english)).catch(() => {});
    }
    return () => { active = false; };
  }, [english, currentLanguage, translateTextAsync]);
  return <option value={topic}>{label}</option>;
}

export function TopicCreateModal({ isOpen, onClose, onCreated }) {
  const { currentUser } = useAuth();
  const { addToast } = useToast();
  const { t, currentLanguage, translateTextAsync } = useLanguage();
  const [parents, setParents] = useState([]);
  const [parentTopic, setParentTopic] = useState('');
  const [name, setName] = useState('');
  const [opinion, setOpinion] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    apiTopicService.getParentTopics().then((items) => {
      setParents(items);
      setParentTopic((current) => current || items[0] || 'GENERAL');
    });
  }, [isOpen]);

  const uploadImage = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const body = new FormData();
      body.append('file', file);
      const response = await apiClient.post('/api/upload/image', body, { headers: { 'Content-Type': 'multipart/form-data' } });
      setImageUrl(response.data?.data?.imageUrl || '');
    } catch (error) {
      addToast(error?.response?.data?.message || t('imageUploadFailed', 'Failed to upload image.'), 'error');
    } finally { setUploading(false); }
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!parentTopic || !name.trim() || !opinion.trim()) return;
    setSubmitting(true);
    try {
      const topic = await apiTopicService.createTopic({ name: name.trim(), parentTopic, createdByUsername: currentUser?.username || '@anonymous' });
      if (!topic?.id) throw new Error(t('topicCreateFailed', 'Unable to create this topic.'));
      await apiCommentService.createTopicComment(topic.id, opinion.trim(), getLanguageCode(currentLanguage), imageUrl || null);
      addToast(t('topicPublished', 'Topic and opinion published.'), 'success');
      setName(''); setOpinion(''); setImageUrl(''); setParentTopic('');
      onClose();
      onCreated?.(topic);
    } catch (error) {
      addToast(error?.response?.data?.message || error.message || t('topicCreateFailed', 'Unable to create this topic.'), 'error');
    } finally { setSubmitting(false); }
  };

  return <Modal isOpen={isOpen} onClose={onClose} title={t('startTopicDiscussion', 'Start a topic discussion')}>
    <form onSubmit={submit} className="flex-col gap-md">
      <p className="body-text" style={{ margin: 0 }}>{t('topicModalHelp', 'Choose a topic, create a subtopic, and share the first opinion directly.')}</p>
      <label className="flex-col gap-xs">
        <strong>{t('parentTopic', 'Topic')}</strong>
        <select value={parentTopic} onChange={(event) => setParentTopic(event.target.value)} required style={{ padding: 12, borderRadius: 12, border: '1px solid #D4CECC', background: '#fff' }}>
          <option value="" disabled>{t('selectTopic', 'Select a topic...')}</option>
          {parents.map((topic) => <ParentOption key={topic} topic={topic} currentLanguage={currentLanguage} translateTextAsync={translateTextAsync} />)}
        </select>
        <small style={{ color: '#8C8385' }}>{t('othersAtBottom', 'Others is shown at the bottom of the topic list.')}</small>
      </label>
      <label className="flex-col gap-xs"><strong>{t('subtopic', 'Subtopic')} *</strong><input value={name} onChange={(e) => setName(e.target.value)} maxLength={100} required placeholder={t('discussionName', 'Discussion name')} style={{ padding: 12, borderRadius: 12, border: '1px solid #D4CECC' }} /></label>
      <label className="flex-col gap-xs"><strong>{t('yourOpinion', 'Your opinion')} *</strong><textarea value={opinion} onChange={(e) => setOpinion(e.target.value)} maxLength={500} rows={4} required placeholder={t('shareWhatYouThink', 'Share what you think...')} style={{ padding: 12, borderRadius: 12, border: '1px solid #D4CECC', resize: 'vertical' }} /><small style={{ alignSelf: 'end' }}>{opinion.length} / 500</small></label>
      <div className="flex-col gap-xs">
        <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, cursor: uploading ? 'wait' : 'pointer', color: '#6F405F', fontWeight: 700 }}><ImagePlus size={19} />{uploading ? t('uploadingImage', 'Uploading image...') : t('attachImage', 'Attach image')}<input type="file" accept="image/*" hidden disabled={uploading} onChange={(e) => uploadImage(e.target.files?.[0])} /></label>
        {imageUrl && <div style={{ position: 'relative', width: 110 }}><img src={getMediaUrl(imageUrl)} alt={t('imagePreview', 'Image preview')} style={{ width: 110, height: 80, objectFit: 'cover', borderRadius: 10 }} /><button type="button" onClick={() => setImageUrl('')} aria-label={t('removeImage', 'Remove image')} style={{ position: 'absolute', right: -7, top: -7, border: 0, borderRadius: '50%', background: '#2D1D15', color: '#fff', display: 'flex', padding: 4 }}><X size={14} /></button></div>}
      </div>
      <div className="flex-row justify-end gap-sm"><Button type="button" variant="secondary" onClick={onClose}>{t('cancel', 'Cancel')}</Button><Button type="submit" disabled={submitting || uploading || !parentTopic || !name.trim() || !opinion.trim()}>{submitting ? t('publishing', 'Publishing...') : t('startDiscussion', 'Start discussion')}</Button></div>
    </form>
  </Modal>;
}
