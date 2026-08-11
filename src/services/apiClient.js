import axios from 'axios';

// Environment-based API Base URL resolution from .env:
// Reads VITE_ENVIRONMENT ('production' | 'testing' | 'local')
const getBaseUrl = () => {
  const env = (import.meta.env.VITE_ENVIRONMENT || import.meta.env.VITE_ENV || 'local').toLowerCase();

  if (env === 'production' || env === 'prod') {
    return import.meta.env.VITE_PRODUCTION_URL || 'https://api.awaazmanki.com';
  }
  if (env === 'testing' || env === 'test') {
    return import.meta.env.VITE_TESTING_URL || 'https://testapi.awaazmanki.com';
  }
  return import.meta.env.VITE_LOCAL_URL || 'http://localhost:8089';
};

const API_BASE_URL = getBaseUrl();

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
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

// Response Interceptor: Handle 401 Unauthorized by clearing token & redirecting protected routes only
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      const publicPaths = ['/', '', '/index.html', '/about', '/privacy-policy', '/community-guidelines', '/contact', '/login', '/register', '/forgot-password'];
      const currentPath = window.location.pathname.split('?')[0].replace(/\/+$/, '') || '/';
      if (!publicPaths.includes(currentPath)) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
