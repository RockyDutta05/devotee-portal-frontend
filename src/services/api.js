import axios from 'axios';

const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const defaultBaseUrl = isLocalhost
  ? 'http://localhost:8080/api'
  : (import.meta.env.VITE_BACKEND_URL || 'https://devotee-portal-backend-lqvo.onrender.com/api');

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || defaultBaseUrl;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor – attach JWT from localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    // Guard: only attach if token is truthy and NOT the literal string "undefined"/"null"
    if (token && token !== 'undefined' && token !== 'null') {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor – handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status, data } = error.response;
      const requestUrl = error.config?.url || '';

      // Never auto-redirect on auth endpoints themselves
      const isAuthEndpoint = requestUrl.includes('/auth/');

      if (status === 401 && !isAuthEndpoint) {
        // Fire a custom event instead of window.location – prevents aborting all in-flight requests
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        window.dispatchEvent(new CustomEvent('auth:unauthorized'));
      } else if (status === 403 && !isAuthEndpoint) {
        if (data && (data.errorCode === '403_PENDING_APPROVAL' || data.error === '403_PENDING_APPROVAL')) {
          window.location.href = '/pending-approval';
        } else if (data && (data.errorCode === '403_REJECTED' || data.error === '403_REJECTED')) {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('user');
          window.location.href = '/login?error=rejected';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
