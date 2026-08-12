import { API_BASE_URL } from '../config/env.js';

export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('auth_token');

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      let errorMessage = '';

      if (data?.errors && typeof data.errors === 'object') {
        errorMessage = Object.entries(data.errors)
          .map(([field, msg]) => `${field}: ${msg}`)
          .join('; ');
      }
      if (!errorMessage && data?.message) {
        errorMessage = data.message;
      }
      if (!errorMessage) {
        errorMessage = `HTTP Error ${response.status}`;
      }

      const error = new Error(errorMessage);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (err) {
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      err.isNetworkError = true;
    }
    throw err;
  }
}
