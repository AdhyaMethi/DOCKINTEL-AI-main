import apiClient from './client';

export const chatApi = {
  createSession: (data) => apiClient.post('/api/chat/sessions', data),
  listSessions: () => apiClient.get('/api/chat/sessions'),
  getSession: (id) => apiClient.get(`/api/chat/sessions/${id}`),
  sendMessage: (id, content) => apiClient.post(`/api/chat/sessions/${id}/messages`, { content }),
  deleteSession: (id) => apiClient.delete(`/api/chat/sessions/${id}`),
};
