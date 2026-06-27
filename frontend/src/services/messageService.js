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

  reactToMessage: (messageId, emoji) =>
    API.post(`/messages/${messageId}/react`, { emoji }),

  deleteMessage: (messageId) =>
    API.delete(`/messages/${messageId}`)
};