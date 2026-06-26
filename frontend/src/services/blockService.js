import API from './api';

export const blockService = {
  blockUser: (userId) =>
    API.post(`/blocks/block/${userId}`),

  unblockUser: (userId) =>
    API.post(`/blocks/unblock/${userId}`),

  getBlockedUsers: () =>
    API.get('/blocks/blocked'),

  checkBlockStatus: (userId) =>
    API.get(`/blocks/status/${userId}`)
};