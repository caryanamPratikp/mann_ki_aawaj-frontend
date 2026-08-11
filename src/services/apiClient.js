import axios from 'axios';

// ==============================================================
// API BASE URL CONFIGURATION
// Fetches values directly from .env variables (No hardcoded URL strings)
// ==============================================================

// OPTION 1: PRODUCTION SERVER URL (Fetched from VITE_PRODUCTION_URL in .env)
const PRODUCTION_URL = import.meta.env.VITE_PRODUCTION_URL;

// OPTION 2: LOCAL DEVELOPMENT SERVER URL (Fetched from VITE_LOCAL_URL in .env)
const LOCAL_URL = import.meta.env.VITE_LOCAL_URL;

// Active API Base URL selection (Driven by VITE_ENVIRONMENT variable in .env)
const isProduction = import.meta.env.VITE_ENVIRONMENT === 'production';
const API_BASE_URL = isProduction ? PRODUCTION_URL : LOCAL_URL;

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
