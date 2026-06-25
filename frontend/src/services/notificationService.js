import API from './api';

export const notificationService = {
  getNotifications: () =>
    API.get('/notifications'),

  markAsRead: () =>
    API.put('/notifications/read')
};