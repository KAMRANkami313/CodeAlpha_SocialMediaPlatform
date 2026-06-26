import API from './api';

export const searchService = {
  searchAll: (query, type) =>
    API.get('/search', { params: { q: query, ...(type ? { type } : {}) } })
};