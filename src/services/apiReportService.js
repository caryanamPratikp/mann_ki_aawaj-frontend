import { apiClient } from './apiClient.js';
import { mockReportService } from './mockReportService.js';

export const REPORT_REASONS = [
  'HATE_SPEECH',
  'RELIGIOUS_HATE',
  'CASTE_DISCRIMINATION',
  'GENDER_HARASSMENT',
  'ABUSIVE_LANGUAGE',
  'VIOLENCE',
  'SPAM',
  'FAKE_INFORMATION',
  'SEXUAL_CONTENT',
  'OTHER',
];

export const apiReportService = {
  // GET /api/report-reasons (Public)
  async getReportReasons() {
    try {
      const response = await apiClient.get('/api/report-reasons');
      return response.data;
    } catch (err) {
      if (err.response?.data) throw err.response.data;
      return { success: true, data: REPORT_REASONS };
    }
  },

  // POST /api/reports/post/{postId} { reason, description? }
  async reportPost(postId, reason, description = '') {
    try {
      const response = await apiClient.post(`/api/reports/post/${postId}`, { reason, description });
      return response.data;
    } catch (err) {
      if (err.response?.data) throw err.response.data;
      if (err.isNetworkError || !err.response) {
        console.warn('Backend offline. Submitting mock report.');
        const rep = mockReportService.fileReport('POST', postId, reason, description, '@anonymous');
        return { success: true, data: rep };
      }
      throw err;
    }
  },

  // POST /api/reports/comment/{commentId} { reason, description? }
  async reportComment(commentId, reason, description = '') {
    try {
      const response = await apiClient.post(`/api/reports/comment/${commentId}`, { reason, description });
      return response.data;
    } catch (err) {
      if (err.response?.data) throw err.response.data;
      if (err.isNetworkError || !err.response) {
        console.warn('Backend offline. Submitting mock report.');
        const rep = mockReportService.fileReport('COMMENT', commentId, reason, description, '@anonymous');
        return { success: true, data: rep };
      }
      throw err;
    }
  },

  // GET /api/reports/my-reports?page=0&size=20
  async getMyReports(params = {}) {
    try {
      const response = await apiClient.get('/api/reports/my-reports', {
        params: {
          page: params.page || 0,
          size: params.size || 20,
          ...params,
        },
      });
      return response.data;
    } catch (err) {
      if (err.response?.data) throw err.response.data;
      return { success: true, data: { content: [] } };
    }
  },
};
