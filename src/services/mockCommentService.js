import { STORAGE_KEYS } from '../utils/storageKeys.js';
import { MOCK_COMMENTS } from '../data/comments.js';
import { MOCK_REPLIES } from '../data/replies.js';
import { moderationCheck } from '../utils/moderationCheck.js';

export const mockCommentService = {
  getComments() {
    const data = localStorage.getItem(STORAGE_KEYS.COMMENTS);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.COMMENTS, JSON.stringify(MOCK_COMMENTS));
      return MOCK_COMMENTS;
    }
    return JSON.parse(data);
  },

  getReplies() {
    const data = localStorage.getItem(STORAGE_KEYS.REPLIES);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.REPLIES, JSON.stringify(MOCK_REPLIES));
      return MOCK_REPLIES;
    }
    return JSON.parse(data);
  },

  getCommentsByPostId(postId, sortBy = 'Most Helpful') {
    let allComments = this.getComments().filter(c => c.postId === postId && c.status !== 'REMOVED');

    const allReplies = this.getReplies().filter(r => r.status !== 'REMOVED');

    // Attach replies to comments
    const commentsWithReplies = allComments.map(c => ({
      ...c,
      replies: allReplies.filter(r => r.commentId === c.id)
    }));

    // Sort logic
    return this.sortComments(commentsWithReplies, sortBy);
  },

  sortComments(comments, sortBy) {
    const sorted = [...comments];
    switch (sortBy) {
      case 'Latest':
        return sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      case 'Oldest':
        return sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      case 'Most Replied':
        return sorted.sort((a, b) => (b.replies?.length || 0) - (a.replies?.length || 0));
      case 'Most Helpful':
      default:
        return sorted.sort((a, b) => {
          const scoreA = (a.reactions?.helpful || 0) + (a.reactions?.wellSaid || 0) + (a.reactions?.relate || 0);
          const scoreB = (b.reactions?.helpful || 0) + (b.reactions?.wellSaid || 0) + (b.reactions?.relate || 0);
          return scoreB - scoreA;
        });
    }
  },

  createComment(postId, content, currentUser) {
    if (!content || content.trim().length < 2) {
      throw new Error('Comment must be at least 2 characters long.');
    }
    if (content.length > 1000) {
      throw new Error('Comment cannot exceed 1,000 characters.');
    }

    // Run unified moderation check
    const modResult = moderationCheck(content);

    if (modResult.status === 'BLOCKED') {
      throw new Error(`Comment blocked: ${modResult.explanation || modResult.message}`);
    }

    const comments = this.getComments();
    const newComment = {
      id: `comment_${Date.now()}`,
      postId,
      userId: currentUser.id,
      username: currentUser.username,
      avatarInitials: currentUser.avatarInitials,
      content: content.trim(),
      createdAt: new Date().toISOString(),
      updatedAt: null,
      isEdited: false,
      status: modResult.status === 'PENDING_REVIEW' ? 'PENDING_REVIEW' : 'PUBLISHED',
      moderationCategory: modResult.category || null,
      moderationRisk: modResult.risk || 'LOW',
      reactions: { relate: 0, helpful: 0, wellSaid: 0, stayStrong: 0, madeMeThink: 0 },
      userReaction: null,
      replies: []
    };

    comments.unshift(newComment);
    localStorage.setItem(STORAGE_KEYS.COMMENTS, JSON.stringify(comments));

    return { comment: newComment, modResult };
  },

  updateComment(commentId, newContent) {
    const comments = this.getComments();
    const index = comments.findIndex(c => c.id === commentId);
    if (index === -1) throw new Error('Comment not found');

    const modResult = moderationCheck(newContent);
    if (modResult.status === 'BLOCKED') {
      throw new Error(`Edited comment blocked: ${modResult.explanation}`);
    }

    comments[index].content = newContent.trim();
    comments[index].isEdited = true;
    comments[index].updatedAt = new Date().toISOString();
    comments[index].status = modResult.status === 'PENDING_REVIEW' ? 'PENDING_REVIEW' : 'PUBLISHED';
    comments[index].moderationCategory = modResult.category || null;

    localStorage.setItem(STORAGE_KEYS.COMMENTS, JSON.stringify(comments));
    return { comment: comments[index], modResult };
  },

  deleteComment(commentId) {
    const comments = this.getComments().filter(c => c.id !== commentId);
    localStorage.setItem(STORAGE_KEYS.COMMENTS, JSON.stringify(comments));
    
    // Delete replies for this comment as well
    const replies = this.getReplies().filter(r => r.commentId !== commentId);
    localStorage.setItem(STORAGE_KEYS.REPLIES, JSON.stringify(replies));
    return true;
  },

  createReply(commentId, content, currentUser) {
    if (!content || content.trim().length < 2) {
      throw new Error('Reply must be at least 2 characters long.');
    }
    if (content.length > 1000) {
      throw new Error('Reply cannot exceed 1,000 characters.');
    }

    const modResult = moderationCheck(content);
    if (modResult.status === 'BLOCKED') {
      throw new Error(`Reply blocked: ${modResult.explanation || modResult.message}`);
    }

    const replies = this.getReplies();
    const newReply = {
      id: `reply_${Date.now()}`,
      commentId,
      userId: currentUser.id,
      username: currentUser.username,
      avatarInitials: currentUser.avatarInitials,
      content: content.trim(),
      createdAt: new Date().toISOString(),
      updatedAt: null,
      isEdited: false,
      status: modResult.status === 'PENDING_REVIEW' ? 'PENDING_REVIEW' : 'PUBLISHED',
      reactions: { relate: 0, helpful: 0, wellSaid: 0, stayStrong: 0, madeMeThink: 0 },
      userReaction: null,
    };

    replies.push(newReply);
    localStorage.setItem(STORAGE_KEYS.REPLIES, JSON.stringify(replies));
    return { reply: newReply, modResult };
  },

  updateReply(replyId, newContent) {
    const replies = this.getReplies();
    const index = replies.findIndex(r => r.id === replyId);
    if (index === -1) throw new Error('Reply not found');

    const modResult = moderationCheck(newContent);
    if (modResult.status === 'BLOCKED') {
      throw new Error(`Reply edit blocked: ${modResult.explanation}`);
    }

    replies[index].content = newContent.trim();
    replies[index].isEdited = true;
    replies[index].updatedAt = new Date().toISOString();
    replies[index].status = modResult.status === 'PENDING_REVIEW' ? 'PENDING_REVIEW' : 'PUBLISHED';

    localStorage.setItem(STORAGE_KEYS.REPLIES, JSON.stringify(replies));
    return { reply: replies[index], modResult };
  },

  deleteReply(replyId) {
    const replies = this.getReplies().filter(r => r.id !== replyId);
    localStorage.setItem(STORAGE_KEYS.REPLIES, JSON.stringify(replies));
    return true;
  },

  toggleCommentReaction(commentId, reactionType) {
    const comments = this.getComments();
    const index = comments.findIndex(c => c.id === commentId);
    if (index !== -1) {
      const c = comments[index];
      const reactions = { ...c.reactions };
      const current = c.userReaction;

      if (current === reactionType) {
        reactions[reactionType] = Math.max(0, (reactions[reactionType] || 1) - 1);
        c.userReaction = null;
      } else {
        if (current && reactions[current]) {
          reactions[current] = Math.max(0, reactions[current] - 1);
        }
        reactions[reactionType] = (reactions[reactionType] || 0) + 1;
        c.userReaction = reactionType;
      }

      c.reactions = reactions;
      comments[index] = c;
      localStorage.setItem(STORAGE_KEYS.COMMENTS, JSON.stringify(comments));
      return c;
    }
    return null;
  },

  toggleReplyReaction(replyId, reactionType) {
    const replies = this.getReplies();
    const index = replies.findIndex(r => r.id === replyId);
    if (index !== -1) {
      const r = replies[index];
      const reactions = { ...r.reactions };
      const current = r.userReaction;

      if (current === reactionType) {
        reactions[reactionType] = Math.max(0, (reactions[reactionType] || 1) - 1);
        r.userReaction = null;
      } else {
        if (current && reactions[current]) {
          reactions[current] = Math.max(0, reactions[current] - 1);
        }
        reactions[reactionType] = (reactions[reactionType] || 0) + 1;
        r.userReaction = reactionType;
      }

      r.reactions = reactions;
      replies[index] = r;
      localStorage.setItem(STORAGE_KEYS.REPLIES, JSON.stringify(replies));
      return r;
    }
    return null;
  }
};
