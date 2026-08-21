import { STORAGE_KEYS } from '../utils/storageKeys.js';
import { MOCK_POSTS } from '../data/posts.js';
import { moderationCheck } from '../utils/moderationCheck.js';

export const mockPostService = {
  getPosts() {
    if (!localStorage.getItem('mka_purge_v4')) {
      localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify([]));
      localStorage.setItem('mka_purge_v4', 'true');
      return [];
    }
    const data = localStorage.getItem(STORAGE_KEYS.POSTS);
    let posts = data ? JSON.parse(data) : [];
    let modified = false;
    posts = posts.map(p => {
      if (p.username && p.username.includes(' ')) {
        const cleanHandle = p.username.trim().replace(/\s+/g, '');
        p.username = cleanHandle.startsWith('@') ? cleanHandle : `@${cleanHandle}`;
        p.avatarInitials = p.username.replace('@', '').slice(0, 2).toUpperCase();
        modified = true;
      }
      return p;
    });
    if (modified) {
      localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(posts));
    }
    return posts;
  },

  getPostById(postId) {
    const posts = this.getPosts();
    return posts.find(p => p.id === postId) || null;
  },

  createPost(postData, currentUser) {
    const fullText = `${postData.title || ''} ${postData.content || ''}`;
    const modResult = moderationCheck(fullText);

    if (modResult.status === 'BLOCKED') {
      throw new Error(`Post blocked: ${modResult.explanation}`);
    }

    let resolvedUsername = currentUser?.username || postData.username;
    if (!resolvedUsername && currentUser?.id) {
      const storedProfile = localStorage.getItem(`user_profile_${currentUser.id}`) || localStorage.getItem('user_profile');
      if (storedProfile) {
        try {
          const p = JSON.parse(storedProfile);
          if (p.username) resolvedUsername = p.username;
        } catch (e) {}
      }
    }
    if (!resolvedUsername || resolvedUsername.startsWith('user_')) resolvedUsername = '@anonymous';
    const formattedUsername = resolvedUsername.startsWith('@') ? resolvedUsername : `@${resolvedUsername}`;

    const userToUse = (currentUser && (currentUser.id || currentUser.username))
      ? { ...currentUser, username: formattedUsername }
      : { id: `user_${Date.now()}`, username: formattedUsername, avatarInitials: 'AN' };

    const posts = this.getPosts();
    const newPost = {
      id: `post_${Date.now()}`,
      userId: userToUse.id || `user_${Date.now()}`,
      username: formattedUsername,
      avatarInitials: userToUse.avatarInitials || formattedUsername.replace('@', '').slice(0, 2).toUpperCase(),
      postType: postData.postType || 'Thought',
      topic: postData.topic || 'General',
      subtopic: postData.subtopic || postData.topic || 'General',
      language: postData.language || 'English',

      title: postData.title || '',
      content: postData.content,
      imageUrl: postData.imageUrl || null,
      movieName: postData.movieName || null,
      movieRating: postData.movieRating || null,
      isSpoiler: Boolean(postData.isSpoiler),
      mood: postData.mood || null,
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
        reactions[reactionType] = Math.max(0, (reactions[reactionType] || 1) - 1);
        post.userReaction = null;
      } else {
        if (current) {
          reactions[current] = Math.max(0, (reactions[current] || 1) - 1);
        }
        reactions[reactionType] = (reactions[reactionType] || 0) + 1;
        post.userReaction = reactionType;
      }

      post.reactions = reactions;
      localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(posts));
      return post;
    }
    return null;
  },

  toggleSavePost(postId) {
    const posts = this.getPosts();
    const index = posts.findIndex(p => p.id === postId);
    if (index !== -1) {
      posts[index].isSaved = !posts[index].isSaved;
      localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(posts));
      return posts[index].isSaved;
    }
    return false;
  }
};
