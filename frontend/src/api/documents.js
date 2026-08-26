import apiClient from './client';

export const documentApi = {
  upload: (formData, onProgress) =>
    apiClient.post('/api/documents', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: onProgress,
    }),
  list: (params = {}) => apiClient.get('/api/documents', { params }),
  get: (id) => apiClient.get(`/api/documents/${id}`),
  getPages: (id) => apiClient.get(`/api/documents/${id}/pages`),
  getStatus: (id) => apiClient.get(`/api/documents/${id}/status`),
  rename: (id, title) => apiClient.patch(`/api/documents/${id}`, { title }),
  delete: (id) => apiClient.delete(`/api/documents/${id}`),
  reprocess: (id) => apiClient.post(`/api/documents/${id}/process`),
  compare: (docIdA, docIdB) => apiClient.post('/api/documents/compare', { document_id_a: docIdA, document_id_b: docIdB }),
  getDownloadUrl: (id) => `/api/documents/${id}/download`,
};
