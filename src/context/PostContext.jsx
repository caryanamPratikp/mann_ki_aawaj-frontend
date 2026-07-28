import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { mockPostService } from '../services/mockPostService.js';
import { useAuth } from './AuthContext.jsx';
import { useToast } from './ToastContext.jsx';

const PostContext = createContext(null);

export function PostProvider({ children }) {
  const [posts, setPosts] = useState([]);
  const [savedPostIds, setSavedPostIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();
  const { addToast } = useToast();

  const refreshPosts = useCallback(() => {
    try {
      const data = mockPostService.getPosts();
      setPosts(data);
      const saved = mockPostService.getSavedPostIds();
      setSavedPostIds(saved);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshPosts();
  }, [refreshPosts]);

  const createPost = (postData) => {
    if (!currentUser) throw new Error('You must be logged in to create a post.');
    if (currentUser.status === 'POST_RESTRICTED' || currentUser.status === 'TEMPORARILY_SUSPENDED' || currentUser.status === 'BANNED') {
      throw new Error(`Posting restricted: ${currentUser.restrictionReason || 'Account restricted.'}`);
    }

    try {
      const newPost = mockPostService.createPost(postData, currentUser);
      refreshPosts();

      if (newPost.status === 'PENDING_REVIEW') {
        addToast('Your post has been submitted for moderator review.', 'warning');
      } else {
        addToast('Post published successfully!', 'success');
      }
      return newPost;
    } catch (err) {
      addToast(err.message, 'error');
      throw err;
    }
  };

  const updatePost = (postId, updates) => {
    const updated = mockPostService.updatePost(postId, updates);
    refreshPosts();
    addToast('Post updated.', 'info');
    return updated;
  };

  const deletePost = (postId) => {
    mockPostService.deletePost(postId);
    refreshPosts();
    addToast('Post deleted.', 'info');
  };

  const reactToPost = (postId, reactionType) => {
    if (!currentUser) {
      addToast('Please login to react to posts.', 'error');
      return;
    }
    const updated = mockPostService.toggleReaction(postId, reactionType, currentUser.id);
    refreshPosts();
    return updated;
  };

  const toggleSavePost = (postId) => {
    const isSaved = mockPostService.toggleSavePost(postId);
    refreshPosts();
    addToast(isSaved ? 'Post saved to your list.' : 'Post removed from saved.', 'info');
    return isSaved;
  };

  return (
    <PostContext.Provider value={{
      posts,
      savedPostIds,
      loading,
      refreshPosts,
      createPost,
      updatePost,
      deletePost,
      reactToPost,
      toggleSavePost
    }}>
      {children}
    </PostContext.Provider>
  );
}

export function usePosts() {
  const context = useContext(PostContext);
  if (!context) throw new Error('usePosts must be used within PostProvider');
  return context;
}
