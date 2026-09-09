import api from './api';

const profileService = {
  getMe: async () => {
    const response = await api.get('/profile/me');
    return response.data;
  },

  updateMe: async (profileData) => {
    const response = await api.put('/profile/me', profileData);
    return response.data;
  },

  getProfileById: async (userId) => {
    const response = await api.get(`/profile/${userId}`);
    return response.data;
  },

  // New: request contact info
  requestContactInfo: async (targetUserId, reason) => {
    const response = await api.post('/contact-requests', {
      targetUserId,
      reason,
    });
    return response.data;
  },

  // New: send connect request
  connectRequest: async (targetUserId, message) => {
    const response = await api.post('/connect-requests', {
      targetUserId,
      message,
    });
    return response.data;
  }
};

export default profileService;
