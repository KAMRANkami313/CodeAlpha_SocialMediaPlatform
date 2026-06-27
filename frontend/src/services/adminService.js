import API from './api';

export const adminService = {
  getStats: () =>
    API.get('/admin/stats'),

  getReports: (params = {}) =>
    API.get('/admin/reports', { params }),

  takeReportAction: (reportId, action, note = '') =>
    API.post(`/admin/reports/${reportId}/action`, { action, note }),

  getUsers: (params = {}) =>
    API.get('/admin/users', { params }),

  suspendUser: (userId) =>
    API.post(`/admin/users/${userId}/suspend`),

  unsuspendUser: (userId) =>
    API.post(`/admin/users/${userId}/unsuspend`),

  setUserRole: (userId, role) =>
    API.put(`/admin/users/${userId}/role`, { role }),

  deleteUser: (userId) =>
    API.delete(`/admin/users/${userId}`)
};