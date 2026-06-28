import API from './api';

export const authService = {
  register: (username, email, password) =>
    API.post('/users/register', { username, email, password }),

  login: (email, password) =>
    API.post('/users/login', { email, password }),

  verifyTwoFactor: (tempToken, code, useBackupCode = false) =>
    API.post('/auth/verify-2fa', { tempToken, code, useBackupCode }),

  changePassword: (currentPassword, newPassword) =>
    API.put('/users/password', { currentPassword, newPassword }),

  deleteAccount: () =>
    API.delete('/users/account'),

  getTwoFactorStatus: () =>
    API.get('/2fa/status'),

  setupTwoFactor: () =>
    API.post('/2fa/setup'),

  verifyTwoFactorSetup: (code) =>
    API.post('/2fa/verify', { code }),

  disableTwoFactor: (password) =>
    API.post('/2fa/disable', { password })
};