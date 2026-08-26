import apiClient from './client';

export const authApi = {
  login: (email, password) => apiClient.post('/api/auth/login', { email, password }),
  register: (email, username, password) => apiClient.post('/api/auth/register', { email, username, password }),
  logout: () => apiClient.post('/api/auth/logout'),
  getMe: () => apiClient.get('/api/auth/me'),
  updateProfile: (data) => apiClient.patch('/api/auth/profile', data),
};
