import apiClient from './client';

export const analyticsApi = {
  getDashboard: () => apiClient.get('/api/analytics/dashboard'),
};
