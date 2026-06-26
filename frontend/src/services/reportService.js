import API from './api';

export const reportService = {
  createReport: (postId, reason, description) =>
    API.post('/reports', { postId, reason, description }),

  getReports: (status) =>
    API.get('/reports', { params: status ? { status } : {} }),

  updateReportStatus: (reportId, status) =>
    API.put(`/reports/${reportId}/status`, { status })
};