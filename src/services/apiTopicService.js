import { apiClient } from './apiClient.js';

export const apiTopicService = {
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
      };
      const response = await apiClient.post('/api/topics', payload, { timeout: 10000 });
      return response.data?.data || response.data;
    } catch (err) {
      console.warn('[apiTopicService] createTopic DB persist notice:', err?.message || err);
      return null;
    }
  },
};
