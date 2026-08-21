import axios from 'axios';
import { API_BASE_URL } from '../config/env.js';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Add Authorization header with Bearer token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle 401 Unauthorized safely without breaking active login flow on public pages
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const publicPaths = ['/', '', '/index.html', '/about', '/privacy-policy', '/community-guidelines', '/contact', '/login', '/register', '/forgot-password'];
      const currentPath = window.location.pathname.split('?')[0].replace(/\/+$/, '') || '/';
      
      // Do not clear tokens or force redirect if user is actively on public pages like /login
      if (!publicPaths.includes(currentPath)) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
