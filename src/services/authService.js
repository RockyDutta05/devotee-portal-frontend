import api from './api';
import axios from 'axios';

const authService = {
  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      return response.data;
    } catch (error) {
      console.error("Login error", error);
      throw error;
    }
  },
  
  signup: async (userData) => {
    try {
      const response = await api.post('/auth/signup', userData);
      return response.data;
    } catch (error) {
      console.error("Signup error", error);
      throw error;
    }
  },

  sendOtp: async (email) => {
    const response = await api.post('/auth/send-otp', { email });
    return response.data;
  },

  verifyOtp: async (email, code) => {
    const response = await api.post('/auth/verify-otp', { email, code });
    return response.data;
  },

  getPresignedProfileUrl: async (fileName, fileType, contentLength) => {
    const response = await api.post('/auth/presign-profile', {
      fileName,
      fileType,
      contentLength
    });
    return response.data;
  },

  uploadProfileToCloudflare: async (presignedUrl, file) => {
    await axios.put(presignedUrl, file, {
      headers: {
        'Content-Type': file.type
      }
    });
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser: () => {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) return JSON.parse(userStr);
      return null;
    } catch (e) {
      return null;
    }
  },
  
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  }
};

export default authService;
