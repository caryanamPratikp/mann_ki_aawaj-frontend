import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiPostService } from '../services/apiPostService.js';
import { mapPost } from '../services/apiMappers.js';
import { EXPLORE_PAGE_SIZE, hasVisiblePostStatus } from '../utils/exploreFeed.js';
import { useAuth } from './AuthContext.jsx';
import { useLanguage, normalizeLanguage } from './LanguageContext.jsx';
import { useToast } from './ToastContext.jsx';

const PostContext = createContext(null);
export const POSTS_QUERY_KEY = ['posts'];

const getPostsQueryKey = (language) => [...POSTS_QUERY_KEY, language];

const normalizeFeed = (feed) => {
  if (Array.isArray(feed)) {
    return { posts: feed, totalElements: feed.length, page: 0, size: EXPLORE_PAGE_SIZE };
  }
  return feed || { posts: [], totalElements: 0, page: 0, size: EXPLORE_PAGE_SIZE };
};

export function PostProvider({ children }) {
  const { currentUser } = useAuth();
  const { currentLanguage } = useLanguage();
  const { addToast } = useToast();
  const queryClient = useQueryClient();
  const [savedPostIds, setSavedPostIds] = useState([]);
  const refreshPromiseRef = useRef(null);

  const normLang = normalizeLanguage(currentLanguage);

  // TanStack Query: Bounded Realtime Posts Feed (holds current backend Page 0 result)
  const {
    data: feedData,
    isLoading: loading,
    isFetching,
    dataUpdatedAt: feedUpdatedAt,
    refetch,
  } = useQuery({
    queryKey: getPostsQueryKey(normLang),
    queryFn: async ({ signal }) => {
      const response = await apiPostService.getPosts(
        { page: 0, size: EXPLORE_PAGE_SIZE, sortBy: 'createdAt', direction: 'desc' },
        { signal },
      );
      const rawContent = response?.data?.content || response?.content || response?.data || [];
      const posts = Array.isArray(rawContent) ? rawContent.map(mapPost).filter(Boolean) : [];

      return {
        posts,
        totalElements: response?.data?.totalElements ?? response?.totalElements ?? posts.length,
        page: response?.data?.number ?? response?.number ?? 0,
        size: response?.data?.size ?? response?.size ?? EXPLORE_PAGE_SIZE,
      };
    },
    staleTime: 10000,
    refetchOnWindowFocus: false,
    retry: 2,
  });

  const feed = normalizeFeed(feedData);
  const posts = feed.posts;

  const refreshPosts = useCallback(() => {
    if (refreshPromiseRef.current) return refreshPromiseRef.current;

    const pendingRefresh = refetch({ cancelRefetch: false }).finally(() => {
      if (refreshPromiseRef.current === pendingRefresh) refreshPromiseRef.current = null;
    });
    refreshPromiseRef.current = pendingRefresh;
    return pendingRefresh;
  }, [refetch]);

  const invalidatePostFeeds = useCallback(() => (
    queryClient.invalidateQueries({ queryKey: POSTS_QUERY_KEY, refetchType: 'active' })
  ), [queryClient]);

  const updateCachedPosts = useCallback((updater) => {
    queryClient.setQueriesData({ queryKey: POSTS_QUERY_KEY }, (oldFeed) => {
      if (!oldFeed) return oldFeed;
      const normalized = normalizeFeed(oldFeed);
      return { ...normalized, posts: updater(normalized.posts) };
    });
  }, [queryClient]);

  const createPost = async (postData) => {
    if (!currentUser) throw new Error('You must be logged in to create a post.');
    if (currentUser.status === 'POST_RESTRICTED' || currentUser.status === 'TEMPORARILY_SUSPENDED' || currentUser.status === 'BANNED') {
      throw new Error(`Posting restricted: ${currentUser.restrictionReason || 'Account restricted.'}`);
    }

    try {
      const response = await apiPostService.createPost(postData);
      const rawPostData = response.data || response;
      const newPost = mapPost(rawPostData);

      if (hasVisiblePostStatus(newPost)) {
        queryClient.setQueryData(getPostsQueryKey(normLang), (oldFeed) => {
          const normalized = normalizeFeed(oldFeed);
          const alreadyPresent = normalized.posts.some((post) => String(post.id) === String(newPost.id));
          return {
            ...normalized,
            posts: [newPost, ...normalized.posts.filter((post) => String(post.id) !== String(newPost.id))]
              .slice(0, normalized.size || EXPLORE_PAGE_SIZE),
            totalElements: normalized.totalElements + (alreadyPresent ? 0 : 1),
          };
        });
      }

      await invalidatePostFeeds();
      addToast('Thought published successfully!', 'success');
      return newPost;
    } catch (err) {
      const errorMsg = err?.response?.data?.message || err?.response?.data?.error || err?.message || 'Failed to publish post to database';
      addToast(errorMsg, 'error');
      throw err;
    }
  };

  const updatePost = async (postId, updates) => {
    try {
      const response = await apiPostService.updatePost(postId, updates.content || updates);
      const updated = mapPost(response.data || response);
      await invalidatePostFeeds();
      addToast('Post updated in database.', 'info');
      return updated;
    } catch (err) {
      const errorMsg = err?.response?.data?.message || err?.response?.data?.error || err?.message || 'Failed to update post';
      addToast(errorMsg, 'error');
    }
  };

  const deletePost = async (postId) => {
    try {
      await apiPostService.deletePost(postId);
    } catch (e) {
      console.warn('[PostContext] Backend delete notice:', e);
    }

    updateCachedPosts((oldPosts) => oldPosts.filter((p) => String(p.id) !== String(postId)));

    await invalidatePostFeeds();
    addToast('Thought permanently deleted from database.', 'info');
  };

  const reactToPost = async (postId, reactionType = 'RELATE') => {
    if (!currentUser) {
      addToast('Please login to react to posts.', 'error');
      return;
    }

    const typeKey = (reactionType || 'RELATE').toUpperCase();

    // 1. Optimistically update TanStack Query cache instantly for immediate UI feedback
    updateCachedPosts((oldPosts) => {
      return oldPosts.map((p) => {
        if (String(p.id) !== String(postId)) return p;

        const prevReaction = p.userReaction ? p.userReaction.toUpperCase() : null;
        const currentReactions = { ...(p.reactions || {}) };

        let newUserReaction = typeKey;
        let newIsLiked = true;

        if (prevReaction === typeKey) {
          // Toggling off same reaction
          newUserReaction = null;
          newIsLiked = false;
          currentReactions[typeKey] = Math.max(0, (currentReactions[typeKey] || 1) - 1);
        } else {
          // If switching from another reaction, decrement old
          if (prevReaction && currentReactions[prevReaction]) {
            currentReactions[prevReaction] = Math.max(0, currentReactions[prevReaction] - 1);
          }
          currentReactions[typeKey] = (currentReactions[typeKey] || 0) + 1;
        }

        const newLikesCount = Object.values(currentReactions).reduce((a, b) => a + b, 0);

        return {
          ...p,
          userReaction: newUserReaction,
          isLikedByCurrentUser: newIsLiked,
          likesCount: newLikesCount,
          reactions: currentReactions,
        };
      });
    });

    // 2. Call backend API to persist reaction in database
    try {
      await apiPostService.reactToPost(postId, typeKey);
    } catch (e) {
      console.warn('[PostContext] Reaction API notice:', e);
    }
  };

  const toggleSavePost = (postId) => {
    setSavedPostIds((prev) =>
      prev.includes(postId) ? prev.filter((id) => id !== postId) : [...prev, postId]
    );
    invalidatePostFeeds();
    addToast('Post saved state updated.', 'info');
  };

  return (
    <PostContext.Provider
      value={{
        posts,
        totalPosts: feed.totalElements,
        feedUpdatedAt,
        loading,
        isFetching,
        savedPostIds,
        refreshPosts,
        createPost,
        updatePost,
        deletePost,
        reactToPost,
        toggleSavePost,
      }}
    >
      {children}
    </PostContext.Provider>
  );
}

export function usePosts() {
  const context = useContext(PostContext);
  if (!context) throw new Error('usePosts must be used within PostProvider');
  return context;
}
