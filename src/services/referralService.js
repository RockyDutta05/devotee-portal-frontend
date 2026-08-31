import api from './api';

const referralService = {
  getWillingReferrers: async (companyId = '') => {
    const url = companyId ? `/referral/willing-referrers?companyId=${companyId}` : '/referral/willing-referrers';
    const response = await api.get(url);
    return response.data;
  },

  createReferralRequest: async (requestData) => {
    const response = await api.post('/referral/requests', requestData);
    return response.data;
  },

  updateWillingness: async (isWilling) => {
    const response = await api.post('/referral/willingness', { isWilling });
    return response.data;
  },

  addCompany: async (company) => {
    const response = await api.post('/referral/companies', { company });
    return response.data;
  },

  removeCompany: async (company) => {
    const response = await api.delete('/referral/companies', { data: { company } });
    return response.data;
  },

  getIncomingRequests: async () => {
    const response = await api.get('/referral/requests/incoming');
    return response.data;
  },

  approveRequest: async (id) => {
    const response = await api.put(`/referral/requests/${id}/approve`);
    return response.data;
  },

  rejectRequest: async (id) => {
    const response = await api.put(`/referral/requests/${id}/reject`);
    return response.data;
  }
};

export default referralService;
