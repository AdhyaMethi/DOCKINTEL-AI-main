import apiClient from './client';

export const adminApi = {
  getStats: () => apiClient.get('/api/admin/stats'),
  listUsers: (params = {}) => apiClient.get('/api/admin/users', { params }),
  toggleUserStatus: (id, isActive) => apiClient.patch(`/api/admin/users/${id}/status`, { is_active: isActive }),
  changeUserRole: (id, role) => apiClient.patch(`/api/admin/users/${id}/role`, { role }),
  getAuditLogs: (params = {}) => apiClient.get('/api/admin/audit-logs', { params }),
};
