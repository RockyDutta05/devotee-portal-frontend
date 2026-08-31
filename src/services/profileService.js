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
  }
};

export default profileService;
