import { apiClient } from './apiClient.js';

export const apiTopicService = {
  async getParentTopics() {
    const fallback = ['FEELINGS', 'EXPRESSION', 'LIFE_WORK', 'SOCIETY_POLITICS', 'ENTERTAINMENT', 'SPORTS', 'GENERAL'];
    try {
      const response = await apiClient.get('/api/topics/parents', { timeout: 10000 });
      const topics = response.data?.data;
      if (!Array.isArray(topics) || topics.length === 0) return fallback;
      return [...topics.filter((topic) => topic !== 'GENERAL'), 'GENERAL'];
    } catch (err) {
      console.warn('[apiTopicService] parent topic fallback:', err?.message || err);
      return fallback;
    }
  },

  async getTopics() {
    try {
      const response = await apiClient.get('/api/topics', { timeout: 10000 });
      const data = response.data?.data || response.data || [];
      if (!Array.isArray(data)) return [];
      return Promise.all(data.map(async (topic) => {
        if (topic.commentCount !== undefined && topic.commentCount !== null) return topic;
        try {
          const comments = await apiClient.get(`/api/topics/${topic.id}/comments`, {
            params: { page: 0, size: 1 }, timeout: 10000,
          });
          return { ...topic, commentCount: Number(comments.data?.data?.totalElements || 0) };
        } catch {
          return { ...topic, commentCount: 0 };
        }
      }));
    } catch (err) {
      console.warn('[apiTopicService] getTopics network/DB fallback notice:', err?.message || err);
      return [];
    }
  },

  async createTopic(topicData) {
    try {
      const payload = {
        name: topicData.name || topicData.topicName,
        icon: topicData.icon || '💡',
        createdByUsername: topicData.createdByUsername || '@anonymous',
        parentTopic: topicData.parentTopic || 'GENERAL',
      };
      const response = await apiClient.post('/api/topics', payload, { timeout: 10000 });
      return response.data?.data || response.data;
    } catch (err) {
      console.warn('[apiTopicService] createTopic DB persist notice:', err?.message || err);
      return null;
    }
  },
};
