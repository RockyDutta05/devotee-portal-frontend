import axios from 'axios';

const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const defaultBaseUrl = isLocalhost 
  ? 'http://localhost:8080/api' 
  : `${window.location.protocol}//${window.location.hostname}:8080/api`;

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || defaultBaseUrl;
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add the JWT token to headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle global errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      const { status, data } = error.response;
      
      if (status === 401) {
        // Unauthorized
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      } else if (status === 403) {
        // Forbidden - Check specific error codes
        if (data && (data.errorCode === '403_PENDING_APPROVAL' || data.error === '403_PENDING_APPROVAL')) {
           window.location.href = '/pending-approval';
        } else if (data && (data.errorCode === '403_REJECTED' || data.error === '403_REJECTED')) {
           // We can let the component handle it or redirect to a generic rejected page
           // Let's not force redirect for rejected unless we have a page for it. The login page handles it if logging in.
           // If they are already in the app and get rejected (e.g. admin revoked), log them out and redirect to login
           localStorage.removeItem('token');
           localStorage.removeItem('user');
           window.location.href = '/login?error=rejected';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
