import { apiClient } from './apiClient.js';
import { mockReportService } from './mockReportService.js';

export const WARNING_LEVELS = ['FIRST', 'SECOND', 'FINAL'];

export const apiAdminService = {
  // GET /api/admin/dashboard
  async getDashboard() {
    try {
      const response = await apiClient.get('/api/admin/dashboard');
      return response.data;
    } catch (err) {
      if (err.response?.data) throw err.response.data;
      if (err.isNetworkError || !err.response) {
        const stats = mockReportService.getModerationStats();
        return { success: true, data: stats };
      }
      throw err;
    }
  },

  // GET /api/admin/users?page=0&size=10
  async getUsers(params = {}) {
    try {
      const response = await apiClient.get('/api/admin/users', {
        params: {
          page: params.page || 0,
          size: params.size || 10,
          ...params,
        },
      });
      return response.data;
    } catch (err) {
      if (err.response?.data) throw err.response.data;
      throw err;
    }
  },

  // GET /api/admin/users/{id}
  async getUserDetails(id) {
    try {
      const response = await apiClient.get(`/api/admin/users/${id}`);
      return response.data;
    } catch (err) {
      if (err.response?.data) throw err.response.data;
      throw err;
    }
  },

  // PUT /api/admin/users/{id}/warning { warningLevel, message }
  async sendWarning(userId, warningLevel, message) {
    try {
      const response = await apiClient.put(`/api/admin/users/${userId}/warning`, {
        warningLevel,
        message,
      });
      return response.data;
    } catch (err) {
      if (err.response?.data) throw err.response.data;
      throw err;
    }
  },

  // PUT /api/admin/users/{id}/block
  async blockUser(userId) {
    try {
      const response = await apiClient.put(`/api/admin/users/${userId}/block`);
      return response.data;
    } catch (err) {
      if (err.response?.data) throw err.response.data;
      throw err;
    }
  },

  // PUT /api/admin/users/{id}/unblock
  async unblockUser(userId) {
    try {
      const response = await apiClient.put(`/api/admin/users/${userId}/unblock`);
      return response.data;
    } catch (err) {
      if (err.response?.data) throw err.response.data;
      throw err;
    }
  },

  // GET /api/admin/reports?page=0&size=10
  async getReports(params = {}) {
    try {
      const response = await apiClient.get('/api/admin/reports', {
        params: {
          page: params.page || 0,
          size: params.size || 10,
          ...params,
        },
      });
      return response.data;
    } catch (err) {
      if (err.response?.data) throw err.response.data;
      if (err.isNetworkError || !err.response) {
        const reports = mockReportService.getReports();
        return {
          success: true,
          data: {
            content: reports,
            totalElements: reports.length,
            totalPages: 1,
            number: 0,
            size: reports.length,
          },
        };
      }
      throw err;
    }
  },

  // GET /api/admin/reports/{id}
  async getReportDetails(id) {
    try {
      const response = await apiClient.get(`/api/admin/reports/${id}`);
      return response.data;
    } catch (err) {
      if (err.response?.data) throw err.response.data;
      throw err;
    }
  },

  // PUT /api/admin/reports/{id}/resolve
  async resolveReport(id) {
    try {
      const response = await apiClient.put(`/api/admin/reports/${id}/resolve`);
      return response.data;
    } catch (err) {
      if (err.response?.data) throw err.response.data;
      if (err.isNetworkError || !err.response) {
        mockReportService.resolveReport(id);
        return { success: true, message: 'Report resolved.' };
      }
      throw err;
    }
  },

  // PUT /api/admin/reports/{id}/reject
  async rejectReport(id) {
    try {
      const response = await apiClient.put(`/api/admin/reports/${id}/reject`);
      return response.data;
    } catch (err) {
      if (err.response?.data) throw err.response.data;
      if (err.isNetworkError || !err.response) {
        mockReportService.dismissReport(id);
        return { success: true, message: 'Report rejected.' };
      }
      throw err;
    }
  },

  // GET /api/admin/users/search?query=...&page=0&size=10
  async searchUsers(query, params = {}) {
    try {
      const response = await apiClient.get('/api/admin/users/search', {
        params: { query, page: params.page || 0, size: params.size || 10 },
      });
      return response.data;
    } catch (err) {
      if (err.response?.data) throw err.response.data;
      throw err;
    }
  },

  // DELETE /api/admin/users/{id}
  async deleteUser(userId) {
    try {
      const response = await apiClient.delete(`/api/admin/users/${userId}`);
      return response.data;
    } catch (err) {
      if (err.response?.data) throw err.response.data;
      throw err;
    }
  },

  // PUT /api/admin/users/{id}/role?role=ROLE_ADMIN
  async updateUserRole(userId, role) {
    try {
      const response = await apiClient.put(`/api/admin/users/${userId}/role`, null, { params: { role } });
      return response.data;
    } catch (err) {
      if (err.response?.data) throw err.response.data;
      throw err;
    }
  },

  // GET /api/admin/users/{id}/posts
  async getUserPosts(userId, params = {}) {
    try {
      const response = await apiClient.get(`/api/admin/users/${userId}/posts`, { params });
      return response.data;
    } catch (err) {
      if (err.response?.data) throw err.response.data;
      throw err;
    }
  },

  // GET /api/admin/users/{id}/comments
  async getUserComments(userId, params = {}) {
    try {
      const response = await apiClient.get(`/api/admin/users/${userId}/comments`, { params });
      return response.data;
    } catch (err) {
      if (err.response?.data) throw err.response.data;
      throw err;
    }
  },

  // GET /api/admin/users/{id}/reports
  async getUserReports(userId, params = {}) {
    try {
      const response = await apiClient.get(`/api/admin/users/${userId}/reports`, { params });
      return response.data;
    } catch (err) {
      if (err.response?.data) throw err.response.data;
      throw err;
    }
  },

  // GET /api/admin/posts?status=ACTIVE&page=0&size=10
  async getPosts(status, params = {}) {
    try {
      const response = await apiClient.get('/api/admin/posts', {
        params: { status, page: params.page || 0, size: params.size || 10 },
      });
      return response.data;
    } catch (err) {
      if (err.response?.data) throw err.response.data;
      throw err;
    }
  },

  // PUT /api/admin/posts/{id}/status?status=HIDDEN
  async updatePostStatus(postId, status) {
    try {
      const response = await apiClient.put(`/api/admin/posts/${postId}/status`, null, { params: { status } });
      return response.data;
    } catch (err) {
      if (err.response?.data) throw err.response.data;
      throw err;
    }
  },

  // DELETE /api/admin/posts/{id}
  async deletePost(postId) {
    try {
      const response = await apiClient.delete(`/api/admin/posts/${postId}`);
      return response.data;
    } catch (err) {
      if (err.response?.data) throw err.response.data;
      throw err;
    }
  },

  // GET /api/admin/comments?status=ACTIVE
  async getComments(status, params = {}) {
    try {
      const response = await apiClient.get('/api/admin/comments', {
        params: { status, page: params.page || 0, size: params.size || 10 },
      });
      return response.data;
    } catch (err) {
      if (err.response?.data) throw err.response.data;
      throw err;
    }
  },

  // DELETE /api/admin/comments/{id}
  async deleteComment(commentId) {
    try {
      const response = await apiClient.delete(`/api/admin/comments/${commentId}`);
      return response.data;
    } catch (err) {
      if (err.response?.data) throw err.response.data;
      throw err;
    }
  },

  // GET /api/admin/moderation/queue
  async getModerationQueue(params = {}) {
    try {
      const response = await apiClient.get('/api/admin/moderation/queue', { params });
      return response.data;
    } catch (err) {
      if (err.response?.data) throw err.response.data;
      throw err;
    }
  },

  // PUT /api/admin/moderation/queue/{id}/approve
  async approveModerationItem(id) {
    try {
      const response = await apiClient.put(`/api/admin/moderation/queue/${id}/approve`);
      return response.data;
    } catch (err) {
      if (err.response?.data) throw err.response.data;
      throw err;
    }
  },

  // PUT /api/admin/moderation/queue/{id}/reject
  async rejectModerationItem(id) {
    try {
      const response = await apiClient.put(`/api/admin/moderation/queue/${id}/reject`);
      return response.data;
    } catch (err) {
      if (err.response?.data) throw err.response.data;
      throw err;
    }
  },

  // GET /api/admin/blocked-content?contentType=POST&page=0&size=10
  async getBlockedContent(params = {}) {
    try {
      const response = await apiClient.get('/api/admin/blocked-content', {
        params: {
          contentType: params.contentType || null,
          page: params.page || 0,
          size: params.size || 10,
        },
      });
      return response.data;
    } catch (err) {
      if (err.response?.data) throw err.response.data;
      throw err;
    }
  },

  // PUT /api/admin/moderation/ai-blocked/{id}/warn
  async sendWarningForBlockedContent(id, warningLevel, message) {
    try {
      const response = await apiClient.put(`/api/admin/moderation/ai-blocked/${id}/warn`, {
        warningLevel,
        message,
      });
      return response.data;
    } catch (err) {
      if (err.response?.data) throw err.response.data;
      throw err;
    }
  },
};
