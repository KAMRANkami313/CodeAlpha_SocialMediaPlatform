import API from './api';

export const storyService = {
  createStory: (image, text) =>
    API.post('/stories', { image, text }),

  getActiveStories: () =>
    API.get('/stories')
};