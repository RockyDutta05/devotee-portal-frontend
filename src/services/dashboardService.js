import axios from 'axios';

const API_URL = import.meta.env.VITE_BACKEND_URL || '/api';

class DashboardService {
  async getStats() {
    const token = localStorage.getItem('accessToken');
    if (!token) return null;
    
    const response = await axios.get(`${API_URL}/dashboard/stats`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  }
}

export default new DashboardService();
