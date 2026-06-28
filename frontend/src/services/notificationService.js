import API from './api';

export const notificationService = {
  getNotifications: (params = {}) =>
    API.get('/notifications', { params }),

  markAsRead: () =>
    API.put('/notifications/read'),

  markSingleAsRead: (notificationId) =>
    API.put(`/notifications/${notificationId}/read`)
};