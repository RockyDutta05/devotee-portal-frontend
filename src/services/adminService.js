import api from './api';

const adminService = {
  // ── Signups ──────────────────────────────────────────────────────────────
  getPendingSignups: async (search, sortBy) => {
    const params = {};
    if (search) params.search = search;
    if (sortBy) params.sortBy = sortBy;
    const response = await api.get('/admin/users/pending', { params });
    return response.data;
  },

  getDashboardStats: async () => {
    const response = await api.get('/admin/dashboard-stats');
    return response.data;
  },

  approveSignup: async (id) => {
    const response = await api.put(`/admin/${id}/approve`);
    return response.data;
  },

  rejectSignup: async (id) => {
    const response = await api.put(`/admin/${id}/reject`);
    return response.data;
  },

  bulkApproveSignups: async (userIds) => {
    const response = await api.put('/admin/bulk-approve', { userIds });
    return response.data;
  },

  bulkRejectSignups: async (userIds, reason) => {
    const response = await api.put('/admin/bulk-reject', { userIds, reason });
    return response.data;
  },

  // ── Settings ─────────────────────────────────────────────────────────────
  getSettings: async () => {
    const response = await api.get('/admin/settings');
    return response.data;
  },

  updateReferralCap: async (cap) => {
    const response = await api.put('/admin/settings/referral-cap', { referralRequestCapPerPerson: cap });
    return response.data;
  },

  // ── Reports ──────────────────────────────────────────────────────────────
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

  // ── Audit Logs ───────────────────────────────────────────────────────────
  getAuditLogs: async (actionType, startDate, endDate, page = 0, size = 10) => {
    const params = { page, size };
    if (actionType) params.actionType = actionType;
    if (startDate) params.startDate = `${startDate}T00:00:00`;
    if (endDate) params.endDate = `${endDate}T23:59:59`;
    const response = await api.get('/admin/audit-log', { params });
    return response.data;
  },

  // ── Job Statuses (stub – endpoint doesn't exist yet on backend) ───────────
  getJobStatuses: async () => [],
  createJobStatus: async () => {},
  updateJobStatus: async () => {},
  deactivateJobStatus: async () => {},

  // ── Companies (edit/deactivate not on backend yet) ────────────────────────
  updateCompany: async () => {},
  deactivateCompany: async () => {},
};

export default adminService;
