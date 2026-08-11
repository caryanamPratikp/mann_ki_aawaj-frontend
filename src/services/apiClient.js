import axios from 'axios';

// ==============================================================
// API BASE URL CONFIGURATION
// ==============================================================
// [OPTION 1: PRODUCTION SERVER DOMAIN (api.awaazmanki.com)]
// const API_BASE_URL = 'https://api.awaazmanki.com';

// [OPTION 2: LOCAL DEVELOPMENT SERVER (port 8089 / env variable)]
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8089';

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
