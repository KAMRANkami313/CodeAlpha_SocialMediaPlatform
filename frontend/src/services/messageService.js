import API from './api';

export const messageService = {
  getConversations: () =>
    API.get('/messages/conversations'),

  getUnreadCount: () =>
    API.get('/messages/unread-count'),

  getConversation: (otherUserId) =>
    API.get(`/messages/${otherUserId}`),

  sendMessage: (receiverId, content) =>
    API.post(`/messages/${receiverId}`, { content }),

  deleteMessage: (messageId) =>
    API.delete(`/messages/${messageId}`)
};