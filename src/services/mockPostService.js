import { STORAGE_KEYS } from '../utils/storageKeys.js';
import { MOCK_POSTS } from '../data/posts.js';
import { moderationCheck } from '../utils/moderationCheck.js';

export const mockPostService = {
  getPosts() {
    const data = localStorage.getItem(STORAGE_KEYS.POSTS);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(MOCK_POSTS));
      return MOCK_POSTS;
    }
    return JSON.parse(data);
  },

  getPostById(postId) {
    const posts = this.getPosts();
    return posts.find(p => p.id === postId) || null;
  },

  createPost(postData, currentUser) {
    // Run moderation check on title & content
    const fullText = `${postData.title || ''} ${postData.content || ''}`;
    const modResult = moderationCheck(fullText);

    if (modResult.status === 'BLOCKED') {
      throw new Error(`Post blocked: ${modResult.explanation}`);
    }

    const posts = this.getPosts();
    const newPost = {
      id: `post_${Date.now()}`,
      userId: currentUser.id,
      username: currentUser.username,
      avatarInitials: currentUser.avatarInitials,
      postType: postData.postType || 'Thought',
      topic: postData.topic || 'Life',
      language: postData.language || 'English',
      title: postData.title || '',
      content: postData.content,
      imageUrl: postData.imageUrl || null,
      createdAt: new Date().toISOString(),
      status: modResult.status === 'PENDING_REVIEW' ? 'PENDING_REVIEW' : 'PUBLISHED',
      reactions: { relate: 0, wellSaid: 0, helpful: 0, stayStrong: 0, madeMeThink: 0 },
      commentCount: 0,
      isSaved: false,
      allowComments: postData.allowComments !== false,
      moderationResult: modResult
    };

    posts.unshift(newPost);
    localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(posts));
    return newPost;
  },

  updatePost(postId, updates) {
    const posts = this.getPosts();
    const index = posts.findIndex(p => p.id === postId);
    if (index !== -1) {
      posts[index] = { ...posts[index], ...updates };
      localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(posts));
      return posts[index];
    }
    return null;
  },

  deletePost(postId) {
    const posts = this.getPosts().filter(p => p.id !== postId);
    localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(posts));
    return true;
  },

  toggleReaction(postId, reactionType, userId) {
    const posts = this.getPosts();
    const index = posts.findIndex(p => p.id === postId);
    if (index !== -1) {
      const post = posts[index];
      const reactions = { ...post.reactions };
      const current = post.userReaction;

      if (current === reactionType) {
        // Remove reaction
        reactions[reactionType] = Math.max(0, (reactions[reactionType] || 1) - 1);
        post.userReaction = null;
      } else {
        // Change or set reaction
        if (current && reactions[current]) {
          reactions[current] = Math.max(0, reactions[current] - 1);
        }
        reactions[reactionType] = (reactions[reactionType] || 0) + 1;
        post.userReaction = reactionType;
      }

      post.reactions = reactions;
      posts[index] = post;
      localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(posts));
      return post;
    }
    return null;
  },

  toggleSavePost(postId) {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEYS.SAVED_POSTS) || '[]');
    const exists = saved.includes(postId);
    const updated = exists ? saved.filter(id => id !== postId) : [...saved, postId];
    localStorage.setItem(STORAGE_KEYS.SAVED_POSTS, JSON.stringify(updated));
    return !exists;
  },

  getSavedPostIds() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.SAVED_POSTS) || '[]');
  }
};
