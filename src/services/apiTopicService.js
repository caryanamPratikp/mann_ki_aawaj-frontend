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
      return Array.isArray(data) ? data : [];
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
