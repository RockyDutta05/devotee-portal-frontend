import api from './api';

const notificationService = {
  getMyNotifications: async () => {
    const response = await api.get('/notifications/inbox');
    return response.data;
  },

  markAsRead: async (id) => {
    const response = await api.put(`/notifications/inbox/${id}/read`);
    return response.data;
  }
};

export default notificationService;
