import apiClient from './client';

export const searchApi = {
  keywordSearch: (params = {}) => apiClient.get('/api/search', { params }),
  semanticSearch: (data) => apiClient.post('/api/search/semantic', data),
  getHistory: () => apiClient.get('/api/search/history'),
};
