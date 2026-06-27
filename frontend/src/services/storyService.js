import API from './api';

export const storyService = {
  createStory: (image, text) =>
    API.post('/stories', { image, text }),

  getActiveStories: () =>
    API.get('/stories'),

  createHighlight: (title, image, storyIds = []) =>
    API.post('/stories/highlights', { title, image, storyIds }),

  getHighlights: (userId) =>
    API.get(`/stories/highlights/${userId}`),

  deleteHighlight: (highlightId) =>
    API.delete(`/stories/highlights/${highlightId}`)
};