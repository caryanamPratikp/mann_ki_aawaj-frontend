import { moderationCheck } from '../utils/moderationCheck.js';
import { STORAGE_KEYS } from '../utils/storageKeys.js';
import { mockPostService } from './mockPostService.js';
import { mockCommentService } from './mockCommentService.js';

export const mockModerationService = {
  checkText(text) {
    return moderationCheck(text);
  },

  getHeldContentQueue() {
    const posts = mockPostService.getPosts().filter(p => p.status === 'PENDING_REVIEW');
    const comments = mockCommentService.getComments().filter(c => c.status === 'PENDING_REVIEW');
    const replies = mockCommentService.getReplies().filter(r => r.status === 'PENDING_REVIEW');

    return [
      ...posts.map(p => ({ ...p, contentType: 'POST' })),
      ...comments.map(c => ({ ...c, contentType: 'COMMENT' })),
      ...replies.map(r => ({ ...r, contentType: 'REPLY' })),
    ];
  },

  approveContent(contentType, contentId) {
    if (contentType === 'POST') {
      mockPostService.updatePost(contentId, { status: 'PUBLISHED' });
    } else if (contentType === 'COMMENT') {
      const comments = mockCommentService.getComments();
      const idx = comments.findIndex(c => c.id === contentId);
      if (idx !== -1) {
        comments[idx].status = 'PUBLISHED';
        localStorage.setItem(STORAGE_KEYS.COMMENTS, JSON.stringify(comments));
      }
    } else if (contentType === 'REPLY') {
      const replies = mockCommentService.getReplies();
      const idx = replies.findIndex(r => r.id === contentId);
      if (idx !== -1) {
        replies[idx].status = 'PUBLISHED';
        localStorage.setItem(STORAGE_KEYS.REPLIES, JSON.stringify(replies));
      }
    }
    return true;
  },

  rejectContent(contentType, contentId, reason) {
    if (contentType === 'POST') {
      mockPostService.updatePost(contentId, { status: 'REMOVED', removeReason: reason });
    } else if (contentType === 'COMMENT') {
      const comments = mockCommentService.getComments();
      const idx = comments.findIndex(c => c.id === contentId);
      if (idx !== -1) {
        comments[idx].status = 'REMOVED';
        comments[idx].removeReason = reason;
        localStorage.setItem(STORAGE_KEYS.COMMENTS, JSON.stringify(comments));
      }
    } else if (contentType === 'REPLY') {
      const replies = mockCommentService.getReplies();
      const idx = replies.findIndex(r => r.id === contentId);
      if (idx !== -1) {
        replies[idx].status = 'REMOVED';
        replies[idx].removeReason = reason;
        localStorage.setItem(STORAGE_KEYS.REPLIES, JSON.stringify(replies));
      }
    }
    return true;
  }
};
