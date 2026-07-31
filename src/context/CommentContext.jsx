import React, { createContext, useContext, useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { apiCommentService } from '../services/apiCommentService.js';
import { mapComment } from '../services/apiMappers.js';
import { useAuth } from './AuthContext.jsx';
import { useToast } from './ToastContext.jsx';

const CommentContext = createContext(null);

export function CommentProvider({ children }) {
  const [commentsByPost, setCommentsByPost] = useState({});
  const { currentUser } = useAuth();
  const { addToast } = useToast();
  const queryClient = useQueryClient();

  const fetchComments = useCallback(async (postId) => {
    if (!postId) return [];
    try {
      const response = await apiCommentService.getCommentsByPostId(postId);
      const raw = response.data?.content || response.data || [];
      const data = Array.isArray(raw) ? raw.map(mapComment) : [];
      setCommentsByPost(prev => ({ ...prev, [postId]: data }));
      return data;
    } catch (e) {
      setCommentsByPost(prev => ({ ...prev, [postId]: [] }));
      return [];
    }
  }, []);

  const createComment = async (postId, content, postAuthorUsername) => {
    if (!currentUser) throw new Error('You must be logged in to comment.');
    if (currentUser.status === 'COMMENT_RESTRICTED') {
      throw new Error(`Commenting restricted: ${currentUser.restrictionReason || 'Account restricted.'}`);
    }

    try {
      const response = await apiCommentService.createComment(postId, content);
      const comment = mapComment(response.data || response);
      await fetchComments(postId);
      queryClient.invalidateQueries(['posts']);

      // Notify post author if commenting on someone else's post
      if (postAuthorUsername && currentUser.username) {
        const actorHandle = currentUser.username.trim().replace(/\s+/g, '');
        const cleanActor = actorHandle.startsWith('@') ? actorHandle : `@${actorHandle}`;
        const cleanAuthor = postAuthorUsername.trim().replace(/\s+/g, '').replace('@', '');
        
        if (cleanAuthor.toLowerCase() !== cleanActor.replace('@', '').toLowerCase()) {
          try {
            const { mockNotificationService } = await import('../services/mockNotificationService.js');
            mockNotificationService.addNotification({
              userId: cleanAuthor,
              type: 'COMMENT',
              actorUsername: cleanActor,
              actorInitials: cleanActor.replace('@', '').slice(0, 2).toUpperCase(),
              message: `${cleanActor} commented on your post`,
              targetPostId: postId,
            });
          } catch (e) {}
        }
      }

      addToast('Comment published!', 'success');
      return { comment };
    } catch (err) {
      addToast(err.message || 'Failed to post comment', 'error');
      throw err;
    }
  };

  const createReply = async (commentId, postId, content, commentAuthorUsername) => {
    if (!currentUser) throw new Error('You must be logged in to reply.');

    try {
      const response = await apiCommentService.replyToComment ? await apiCommentService.replyToComment(commentId, content) : await apiCommentService.createComment(postId, content);
      const reply = mapComment(response.data || response);
      await fetchComments(postId);

      if (commentAuthorUsername && currentUser.username) {
        const actorHandle = currentUser.username.trim().replace(/\s+/g, '');
        const cleanActor = actorHandle.startsWith('@') ? actorHandle : `@${actorHandle}`;
        const cleanAuthor = commentAuthorUsername.trim().replace(/\s+/g, '').replace('@', '');

        if (cleanAuthor.toLowerCase() !== cleanActor.replace('@', '').toLowerCase()) {
          try {
            const { mockNotificationService } = await import('../services/mockNotificationService.js');
            mockNotificationService.addNotification({
              userId: cleanAuthor,
              type: 'REPLY',
              actorUsername: cleanActor,
              actorInitials: cleanActor.replace('@', '').slice(0, 2).toUpperCase(),
              message: `${cleanActor} replied to your comment`,
              targetPostId: postId,
            });
          } catch (e) {}
        }
      }

      addToast('Reply published!', 'success');
      return { reply };
    } catch (err) {
      addToast(err.message || 'Failed to post reply', 'error');
      throw err;
    }
  };

  const updateComment = async (commentId, postId, newContent) => {
    try {
      const response = await apiCommentService.updateComment(commentId, newContent);
      const comment = mapComment(response.data || response);
      await fetchComments(postId);
      addToast('Comment updated in database.', 'info');
      return { comment };
    } catch (err) {
      addToast(err.message || 'Failed to update comment.', 'error');
      throw err;
    }
  };

  const deleteComment = async (commentId, postId) => {
    try {
      await apiCommentService.deleteComment(commentId);
    } catch (e) {
      console.warn('[CommentContext] Delete comment notice:', e);
    }
    await fetchComments(postId);
    queryClient.invalidateQueries(['posts']);
    addToast('Comment deleted from database.', 'info');
  };

  const reactToComment = async (commentId, emoji) => {
    try {
      await apiCommentService.likeComment(commentId);
    } catch (e) {
      console.warn('[CommentContext] Reaction notice:', e);
    }
  };

  return (
    <CommentContext.Provider value={{
      commentsByPost,
      fetchComments,
      createComment,
      createReply,
      updateComment,
      deleteComment,
      reactToComment,
    }}>
      {children}
    </CommentContext.Provider>
  );
}

export function useComments() {
  const context = useContext(CommentContext);
  if (!context) throw new Error('useComments must be used within CommentProvider');
  return context;
}
