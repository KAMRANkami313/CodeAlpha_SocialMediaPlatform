import API from './api';

export const exploreService = {
  getExploreData: () =>
    API.get('/explore')
};