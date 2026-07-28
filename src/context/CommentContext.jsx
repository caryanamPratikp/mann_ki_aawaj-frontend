import React, { createContext, useContext, useState, useCallback } from 'react';
import { mockCommentService } from '../services/mockCommentService.js';
import { useAuth } from './AuthContext.jsx';
import { useToast } from './ToastContext.jsx';
import { mockNotificationService } from '../services/mockNotificationService.js';

const CommentContext = createContext(null);

export function CommentProvider({ children }) {
  const [commentsByPost, setCommentsByPost] = useState({});
  const { currentUser } = useAuth();
  const { addToast } = useToast();

  const fetchComments = useCallback((postId, sortBy = 'Most Helpful') => {
    try {
      const data = mockCommentService.getCommentsByPostId(postId, sortBy);
      setCommentsByPost(prev => ({ ...prev, [postId]: data }));
      return data;
    } catch (e) {
      console.error(e);
      return [];
    }
  }, []);

  const createComment = (postId, content, postAuthorUsername) => {
    if (!currentUser) throw new Error('You must be logged in to comment.');
    if (currentUser.status === 'COMMENT_RESTRICTED') {
      throw new Error(`Commenting restricted: ${currentUser.restrictionReason || 'Account restricted.'}`);
    }
    if (currentUser.status === 'TEMPORARILY_SUSPENDED' || currentUser.status === 'BANNED') {
      throw new Error('Account suspended from publishing content.');
    }

    try {
      const { comment, modResult } = mockCommentService.createComment(postId, content, currentUser);

      if (modResult.status === 'PENDING_REVIEW') {
        addToast('Your comment has been submitted for moderator review.', 'warning');
      } else if (modResult.status === 'SAFE') {
        addToast('Comment published!', 'success');
        // Add notification for post author if different user
        if (postAuthorUsername && postAuthorUsername !== currentUser.username) {
          mockNotificationService.addNotification({
            userId: null, // Broadcast or target
            type: 'COMMENT',
            actorUsername: currentUser.username,
            actorInitials: currentUser.avatarInitials,
            message: `${currentUser.username} commented on your post`,
            targetPostId: postId
          });
        }
      }

      fetchComments(postId);
      return { comment, modResult };
    } catch (err) {
      addToast(err.message, 'error');
      throw err;
    }
  };

  const updateComment = (commentId, postId, newContent) => {
    try {
      const { comment, modResult } = mockCommentService.updateComment(commentId, newContent);
      fetchComments(postId);
      addToast('Comment updated.', 'info');
      return { comment, modResult };
    } catch (err) {
      addToast(err.message, 'error');
      throw err;
    }
  };

  const deleteComment = (commentId, postId) => {
    mockCommentService.deleteComment(commentId);
    fetchComments(postId);
    addToast('Comment deleted.', 'info');
  };

  const createReply = (commentId, postId, content, commentAuthorUsername) => {
    if (!currentUser) throw new Error('You must be logged in to reply.');
    if (currentUser.status === 'COMMENT_RESTRICTED' || currentUser.status === 'TEMPORARILY_SUSPENDED' || currentUser.status === 'BANNED') {
      throw new Error('Replying restricted on your account.');
    }

    try {
      const { reply, modResult } = mockCommentService.createReply(commentId, content, currentUser);
      
      if (modResult.status === 'PENDING_REVIEW') {
        addToast('Your reply has been submitted for moderator review.', 'warning');
      } else {
        addToast('Reply added.', 'success');
        if (commentAuthorUsername && commentAuthorUsername !== currentUser.username) {
          mockNotificationService.addNotification({
            userId: null,
            type: 'REPLY',
            actorUsername: currentUser.username,
            actorInitials: currentUser.avatarInitials,
            message: `${currentUser.username} replied to your comment`,
            targetPostId: postId
          });
        }
      }

      fetchComments(postId);
      return { reply, modResult };
    } catch (err) {
      addToast(err.message, 'error');
      throw err;
    }
  };

  const updateReply = (replyId, postId, newContent) => {
    try {
      const { reply, modResult } = mockCommentService.updateReply(replyId, newContent);
      fetchComments(postId);
      addToast('Reply updated.', 'info');
      return { reply, modResult };
    } catch (err) {
      addToast(err.message, 'error');
      throw err;
    }
  };

  const deleteReply = (replyId, postId) => {
    mockCommentService.deleteReply(replyId);
    fetchComments(postId);
    addToast('Reply deleted.', 'info');
  };

  const reactToComment = (commentId, postId, reactionType) => {
    if (!currentUser) {
      addToast('Please login to react to comments.', 'error');
      return;
    }
    const updated = mockCommentService.toggleCommentReaction(commentId, reactionType);
    fetchComments(postId);
    return updated;
  };

  const reactToReply = (replyId, postId, reactionType) => {
    if (!currentUser) {
      addToast('Please login to react to replies.', 'error');
      return;
    }
    const updated = mockCommentService.toggleReplyReaction(replyId, reactionType);
    fetchComments(postId);
    return updated;
  };

  return (
    <CommentContext.Provider value={{
      commentsByPost,
      fetchComments,
      createComment,
      updateComment,
      deleteComment,
      createReply,
      updateReply,
      deleteReply,
      reactToComment,
      reactToReply
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
