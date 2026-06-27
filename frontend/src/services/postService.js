import API from './api';

export const postService = {
  createPost: (caption, image) =>
    API.post('/posts', { caption, image }),

  getAllPosts: (tag, page = 1, limit = 10) =>
    API.get('/posts', { params: { ...(tag ? { tag } : {}), page, limit } }),

  getPostById: (postId) =>
    API.get(`/posts/${postId}`),

  getUserPosts: (userId) =>
    API.get(`/posts/user/${userId}`),

  getArchivedPosts: () =>
    API.get('/posts/archived'),

  archivePost: (postId) =>
    API.post(`/posts/${postId}/archive`),

  unarchivePost: (postId) =>
    API.post(`/posts/${postId}/unarchive`),

  deletePost: (postId) =>
    API.delete(`/posts/${postId}`),

  updatePost: (postId, caption) =>
    API.put(`/posts/${postId}`, { caption }),

  likeUnlikePost: (postId) =>
    API.post(`/posts/${postId}/like`),

  trackImpression: (postId) =>
    API.post(`/posts/${postId}/view`),

  addComment: (postId, content, parentCommentId) =>
    API.post(`/posts/${postId}/comment`, { content, parentCommentId }),

  getReplies: (postId, commentId) =>
    API.get(`/posts/${postId}/comment/${commentId}/replies`),

  deleteComment: (postId, commentId) =>
    API.delete(`/posts/${postId}/comment/${commentId}`),

  likeUnlikeComment: (postId, commentId) =>
    API.post(`/posts/${postId}/comment/${commentId}/like`),

  updateComment: (postId, commentId, content) =>
    API.put(`/posts/${postId}/comment/${commentId}`, { content })
};