import React, { useEffect, useState } from 'react';
import { Hash, Loader2, PlusCircle } from 'lucide-react';
import { UserLayout } from '../../components/layout/UserLayout.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { apiTopicService } from '../../services/apiTopicService.js';

const PARENT_ORDER = ['FEELINGS', 'EXPRESSION', 'LIFE_WORK', 'SOCIETY_POLITICS', 'ENTERTAINMENT', 'SPORTS', 'GENERAL'];

export function MyPostsPage({ onNavigate }) {
  const { currentUser } = useAuth();
  const { t } = useLanguage();
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiTopicService.getTopics().then((items) => {
      const handle = String(currentUser?.username || '').replace(/^@/, '').toLowerCase();
      setTopics(items.filter((topic) => {
        const creator = String(topic.createdByUsername || '').replace(/^@/, '').toLowerCase();
        return handle && creator === handle;
      }));
    }).finally(() => setLoading(false));
  }, [currentUser?.username]);

  const groups = PARENT_ORDER.map((parent) => ({ parent, topics: topics.filter((topic) => (topic.parentTopic || 'GENERAL') === parent) })).filter((group) => group.topics.length);

  return <UserLayout activeRoute="/my-posts" onNavigate={onNavigate}>
    <div className="flex-col gap-md">
      <div className="flex-row justify-between" style={{ alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div><h1 className="page-heading">{t('myTopics', 'My Topics')} ({topics.length})</h1><p className="secondary-text">{t('myTopicsDescription', 'Subtopics and discussions you created.')}</p></div>
        <button type="button" onClick={() => onNavigate('/create-post')} style={{ border: 0, borderRadius: 20, padding: '9px 16px', background: '#6F405F', color: '#fff', fontWeight: 700, display: 'flex', gap: 6, alignItems: 'center', cursor: 'pointer' }}><PlusCircle size={16} />{t('createCustomTopic', 'Create Topic')}</button>
      </div>
      {loading ? <div style={{ textAlign: 'center', padding: 40 }}><Loader2 className="spin-animation" /></div> : groups.length === 0 ? <div className="mka-card" style={{ textAlign: 'center', padding: 40 }}>{t('noCreatedTopics', 'You have not created any topics yet.')}</div> : groups.map((group) => <section key={group.parent} className="mka-card"><h2 className="card-heading">{group.parent === 'GENERAL' ? t('others', 'Others') : group.parent.replaceAll('_', ' ')}</h2><div className="flex-row gap-sm" style={{ flexWrap: 'wrap', marginTop: 12 }}>{group.topics.map((topic) => <button key={topic.id} type="button" onClick={() => onNavigate(`/topic/${topic.id}`)} style={{ border: '1px solid #D7C9D2', background: '#fff', color: '#432E3C', padding: '9px 14px', borderRadius: 18, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}><span>{topic.icon || <Hash size={14} />}</span>{topic.label || topic.name}</button>)}</div></section>)}
    </div>
  </UserLayout>;
}
