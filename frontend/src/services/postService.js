import API from './api';

export const postService = {
  createPost: (caption, image) =>
    API.post('/posts', { caption, image }),

  getAllPosts: (tag) =>
    API.get('/posts', { params: tag ? { tag } : {} }),

  getPostById: (postId) =>
    API.get(`/posts/${postId}`),

  getUserPosts: (userId) =>
    API.get(`/posts/user/${userId}`),

  deletePost: (postId) =>
    API.delete(`/posts/${postId}`),

  updatePost: (postId, caption) =>
    API.put(`/posts/${postId}`, { caption }),

  likeUnlikePost: (postId) =>
    API.post(`/posts/${postId}/like`),

  trackImpression: (postId) =>
    API.post(`/posts/${postId}/view`),

  addComment: (postId, content) =>
    API.post(`/posts/${postId}/comment`, { content }),

  deleteComment: (postId, commentId) =>
    API.delete(`/posts/${postId}/comment/${commentId}`),

  likeUnlikeComment: (postId, commentId) =>
    API.post(`/posts/${postId}/comment/${commentId}/like`),

  updateComment: (postId, commentId, content) =>
    API.put(`/posts/${postId}/comment/${commentId}`, { content })
};