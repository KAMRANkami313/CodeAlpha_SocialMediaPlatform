import API from './api';

export const authService = {
  register: (username, email, password) =>
    API.post('/users/register', { username, email, password }),

  login: (email, password) =>
    API.post('/users/login', { email, password })
};