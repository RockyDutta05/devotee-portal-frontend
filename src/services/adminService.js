import api from './api';

const adminService = {
  getPendingSignups: async (search, sortBy) => {
    const params = {};
    if (search) params.search = search;
    if (sortBy) params.sortBy = sortBy;
    const response = await api.get('/admin/signups/pending', { params });
    return response.data;
  },

  getDashboardStats: async () => {
    const response = await api.get('/admin/signups/stats');
    return response.data;
  },

  approveSignup: async (id) => {
    const response = await api.put(`/admin/signups/${id}/approve`);
    return response.data;
  },

  rejectSignup: async (id) => {
    const response = await api.put(`/admin/signups/${id}/reject`);
    return response.data;
  },

  bulkApproveSignups: async (userIds) => {
    const response = await api.put('/admin/signups/bulk-approve', { userIds });
    return response.data;
  },

  bulkRejectSignups: async (userIds, reason) => {
    const response = await api.put('/admin/signups/bulk-reject', { userIds, reason });
    return response.data;
  },

  getSettings: async () => {
    const response = await api.get('/admin/settings');
    return response.data;
  },

  updateReferralCap: async (cap) => {
    const response = await api.put('/admin/settings/referral-cap', { cap });
    return response.data;
  },

  getReports: async (status, search) => {
    const params = {};
    if (status) params.status = status;
    if (search) params.search = search;
    const response = await api.get('/reports', { params }); 
    return response.data;
  },
  
  reviewReport: async (id) => {
    const response = await api.put(`/reports/${id}/review`);
    return response.data;
  },

  getAuditLogs: async (actionType, startDate, endDate, page = 0, size = 10) => {
    const params = { page, size };
    if (actionType) params.actionType = actionType;
    if (startDate) params.startDate = `${startDate}T00:00:00`;
    if (endDate) params.endDate = `${endDate}T23:59:59`;
    const response = await api.get('/admin/audit-log', { params });
    return response.data;
  },

  // ----- Job Status management -----
  getJobStatuses: (search = '', sort = 'name asc') => api.get('/admin/job-statuses', { params: { search, sort } }),
  createJobStatus: (payload) => api.post('/admin/job-statuses', payload),
  updateJobStatus: (id, payload) => api.patch(`/admin/job-statuses/${id}`, payload),
  deactivateJobStatus: (id) => api.delete(`/admin/job-statuses/${id}`),

  updateCompany: (id, payload) => api.patch(`/admin/companies/${id}`, payload),
  deactivateCompany: (id) => api.delete(`/admin/companies/${id}`),

};

export default adminService;
