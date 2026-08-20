import React from 'react';
import { UserLayout } from '../../components/layout/UserLayout.jsx';
import { PostCard } from '../../components/posts/PostCard.jsx';
import { usePosts } from '../../context/PostContext.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { Bookmark } from 'lucide-react';
import { EmptyState } from '../../components/common/EmptyState.jsx';

export function SavedPostsPage({ onNavigate }) {
  const { posts, savedPostIds } = usePosts();
  const { t } = useLanguage();

  const savedPosts = posts.filter((p) => savedPostIds.includes(p.id));

  return (
    <UserLayout activeRoute="/saved" onNavigate={onNavigate}>
      <div className="flex-col gap-md">
        <div>
          <h1 className="page-heading">{t('savedPosts', 'Saved Posts')} ({savedPosts.length})</h1>
          <p className="secondary-text">{t('savedPostsDesc', 'Your private collection of bookmarked thoughts and discussions.')}</p>
        </div>

        {savedPosts.length === 0 ? (
          <EmptyState
            title={t('noSavedPosts', 'No Saved Posts')}
            description={t('noSavedPostsDesc', 'Bookmark posts you want to revisit later by clicking the save icon on any post card.')}
            icon={Bookmark}
            actionText={t('explore', 'Explore')}
            onAction={() => onNavigate('/explore')}
          />
        ) : (
          <div className="flex-col gap-md">
            {savedPosts.map((post) => (
              <PostCard key={post.id} post={post} onNavigate={onNavigate} />
            ))}
          </div>
        )}
      </div>
    </UserLayout>
  );
}
