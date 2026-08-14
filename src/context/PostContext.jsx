import React, { createContext, useContext, useState } from 'react';
import { useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { apiPostService } from '../services/apiPostService.js';
import { mapPost } from '../services/apiMappers.js';
import { useAuth } from './AuthContext.jsx';
import { useLanguage } from './LanguageContext.jsx';
import { useToast } from './ToastContext.jsx';

const PostContext = createContext(null);

export function PostProvider({ children }) {
  const { currentUser } = useAuth();
  const { currentLanguage } = useLanguage();
  const { addToast } = useToast();
  const queryClient = useQueryClient();
  const [savedPostIds, setSavedPostIds] = useState([]);

  // React TanStack Query: Realtime Posts Feed with currentLanguage dependency key
  const {
    data: posts = [],
    isLoading: loading,
    isFetching,
    refetch: refreshPosts,
  } = useQuery({
    queryKey: ['posts', currentLanguage],
    queryFn: async () => {
      try {
        const response = await apiPostService.getPosts();
        const rawContent = response.data?.content || response.content || response.data || [];
        if (Array.isArray(rawContent)) {
          return rawContent.map(mapPost);
        }
      } catch (err) {
        console.warn('[PostContext] DB fetch error:', err);
      }
      return [];
    },
    placeholderData: keepPreviousData,
    refetchInterval: 5000, // 5 seconds automatic polling & background refresh
    staleTime: 1000,
  });

  const createPost = async (postData) => {
    if (!currentUser) throw new Error('You must be logged in to create a post.');
    if (currentUser.status === 'POST_RESTRICTED' || currentUser.status === 'TEMPORARILY_SUSPENDED' || currentUser.status === 'BANNED') {
      throw new Error(`Posting restricted: ${currentUser.restrictionReason || 'Account restricted.'}`);
    }

    try {
      const response = await apiPostService.createPost(postData);
      const rawPostData = response.data || response;
      const newPost = mapPost(rawPostData);

      // Invalidate query cache to trigger immediate update across all pages
      await queryClient.invalidateQueries({ queryKey: ['posts'] });
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
      await queryClient.invalidateQueries({ queryKey: ['posts'] });
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

    // Optimistically update TanStack Query cache instantly across all language query keys
    queryClient.setQueriesData({ queryKey: ['posts'] }, (oldPosts = []) =>
      oldPosts.filter((p) => p.id !== postId)
    );

    // Invalidate query to refetch latest feed from DB
    await queryClient.invalidateQueries({ queryKey: ['posts'] });
    addToast('Thought permanently deleted from database.', 'info');
  };

  const reactToPost = async (postId) => {
    if (!currentUser) {
      addToast('Please login to react to posts.', 'error');
      return;
    }
    const post = posts.find((item) => item.id === postId);
    try {
      if (post?.isLikedByCurrentUser) {
        await apiPostService.unlikePost(postId);
      } else {
        await apiPostService.likePost(postId);
      }
    } catch (e) {
      console.warn('[PostContext] Reaction error:', e);
    }
    await queryClient.invalidateQueries({ queryKey: ['posts'] });
  };

  const toggleSavePost = (postId) => {
    setSavedPostIds((prev) =>
      prev.includes(postId) ? prev.filter((id) => id !== postId) : [...prev, postId]
    );
    queryClient.invalidateQueries({ queryKey: ['posts'] });
    addToast('Post saved state updated.', 'info');
  };

  return (
    <PostContext.Provider
      value={{
        posts,
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
