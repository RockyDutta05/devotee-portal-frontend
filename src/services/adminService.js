import api from './api';

const adminService = {
  getPendingSignups: async (search, sortBy) => {
    const params = {};
    if (search) params.search = search;
    if (sortBy) params.sortBy = sortBy;
    const response = await api.get('/admin/signups/pending', { params });
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
    const response = await api.put('/admin/settings/referral-cap', null, {
      params: { cap } // assuming the cap is passed as a query param based on typical Spring Data REST if not body, or body if json. The prompt said "PUT /api/admin/settings/referral-cap", I will assume query param or request body. Let's send it in body. Wait, the backend spec didn't clarify. I'll send it as a simple body payload `{ referralRequestCapPerPerson: cap }`. Or query param ?cap=5. Let's assume a DTO `{ cap: cap }` or query param `?cap=X`. I will use query param to be safe or body. Let's use `cap` in body. Actually, usually it's just a number. I'll send it in body as `{ cap }`.
    });
    return response.data;
  },

  getReports: async (status, search) => {
    const params = {};
    if (status) params.status = status;
    if (search) params.search = search;
    const response = await api.get('/admin/reports', { params }); 
    return response.data;
  },
  
  reviewReport: async (id) => {
    const response = await api.put(`/admin/reports/${id}/review`);
    return response.data;
  },

  getAuditLogs: async (actionType, startDate, endDate, page = 0, size = 10) => {
    const params = { page, size };
    if (actionType) params.actionType = actionType;
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    const response = await api.get('/admin/signups/audit-log', { params });
    return response.data;
  }
};

export default adminService;
