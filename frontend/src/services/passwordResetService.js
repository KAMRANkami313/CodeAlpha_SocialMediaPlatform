import API from './api';

export const passwordResetService = {
  requestReset: (email) =>
    API.post('/password-reset/request', { email }),

  resetPassword: (token, newPassword) =>
    API.post('/password-reset/reset', { token, newPassword })
};