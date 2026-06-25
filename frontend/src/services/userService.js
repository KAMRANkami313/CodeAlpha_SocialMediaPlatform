import API from './api';

export const userService = {
  search: (query) =>
    API.get('/users/search', { params: { q: query } }),

  getSuggested: () =>
    API.get('/users/suggested'),

  getProfile: (userId) =>
    API.get(`/users/profile/${userId}`),

  updateProfile: (profileData) =>
    API.put('/users/profile', profileData),

  follow: (userId) =>
    API.post(`/users/follow/${userId}`),

  unfollow: (userId) =>
    API.post(`/users/unfollow/${userId}`),

  savePost: (postId) =>
    API.post(`/users/save/${postId}`),

  ping: () =>
    API.put('/users/ping')
};