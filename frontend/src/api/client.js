import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request Interceptor: Attach JWT Bearer Token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('docintel_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Normalized error extraction & auto-logout on 401
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const customMessage = error.response?.data?.message;
    const errorCode = error.response?.data?.error_code || 'UNKNOWN_ERROR';
    const status = error.response?.status;

    if (status === 401) {
      // Clear token if invalid or expired
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register' && window.location.pathname !== '/') {
        localStorage.removeItem('docintel_token');
        localStorage.removeItem('docintel_user');
        window.location.href = '/login?expired=true';
      }
    }

    const formattedError = new Error(customMessage || error.message || 'Network error occurred');
    formattedError.status = status;
    formattedError.errorCode = errorCode;
    formattedError.data = error.response?.data;

    return Promise.reject(formattedError);
  }
);

export default apiClient;
