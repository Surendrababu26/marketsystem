import axios from 'axios';

// Create base Axios instance using environment variable
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT Access Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle 401 Unauthorized errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refresh_token');

      if (refreshToken) {
        try {
          const response = await axios.post(`${API_BASE_URL}/accounts/token/refresh/`, {
            refresh: refreshToken,
          });

          const newAccessToken = response.data.access;
          localStorage.setItem('access_token', newAccessToken);

          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        } catch (refreshError) {
          // Refresh token failed or expired -> Clear session
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user');
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      } else {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
      }
    }

    return Promise.reject(error);
  }
);

// Centralized API Endpoint Modules
export const authAPI = {
  register: (userData) => api.post('/accounts/register/', userData),
  login: (credentials) => api.post('/accounts/login/', credentials),
  refreshToken: (refresh) => api.post('/accounts/token/refresh/', { refresh }),
  getMe: () => api.get('/accounts/me/'),
};

export const rfqAPI = {
  getAll: () => api.get('/rfqs/'),
  getMy: () => api.get('/rfqs/my/'),
  getOpen: () => api.get('/rfqs/open/'),
  getById: (id) => api.get(`/rfqs/${id}/`),
  create: (rfqData) => api.post('/rfqs/', rfqData),
  update: (id, rfqData) => api.patch(`/rfqs/${id}/`, rfqData),
  delete: (id) => api.delete(`/rfqs/${id}/`),
};

export const quotationAPI = {
  getAll: () => api.get('/quotations/'),
  getMy: () => api.get('/quotations/my/'),
  getByRFQ: (rfqId) => api.get(`/quotations/rfq/${rfqId}/`),
  getById: (id) => api.get(`/quotations/${id}/`),
  create: (quotationData) => api.post('/quotations/', quotationData),
  update: (id, quotationData) => api.patch(`/quotations/${id}/`, quotationData),
};

export default api;
