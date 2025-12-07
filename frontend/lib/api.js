/**
 * API Client for Real Estate Direct Platform
 * Handles all API requests to the backend
 */

import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Authentication API
export const authAPI = {
  register: (data) => api.post('/api/auth/register', data),
  login: (data) => api.post('/api/auth/login', data),
  getMe: () => api.get('/api/auth/me'),
};

// Properties API
export const propertiesAPI = {
  getAll: (params) => api.get('/api/properties', { params }),
  getMine: (params) => api.get('/api/properties/mine', { params }),
  getById: (id) => api.get(`/api/properties/${id}`),
  create: (data) => api.post('/api/properties', data),
  update: (id, data) => api.put(`/api/properties/${id}`, data),
  delete: (id) => api.delete(`/api/properties/${id}`),
  uploadImages: (id, formData) => api.post(`/api/properties/${id}/images`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
};

// Transactions API
export const transactionsAPI = {
  makeOffer: (data) => api.post('/api/transactions/offer', data),
  getMyOffers: () => api.get('/api/transactions/my-offers'),
  getMyListings: () => api.get('/api/transactions/my-listings'),
  getById: (id) => api.get(`/api/transactions/${id}`),
  acceptOffer: (id) => api.put(`/api/transactions/${id}/accept`),
  rejectOffer: (id, reason) => api.put(`/api/transactions/${id}/reject`, { reason }),
};

// Mortgages API
export const mortgagesAPI = {
  getAll: () => api.get('/api/mortgages'),
  getByProvince: (province) => api.get(`/api/mortgages/province/${province}`),
  getBest: (province, filters = {}) => {
    const params = { ...(filters || {}) };
    if (province) {
      params.province = province;
    }
    return api.get('/api/mortgages/best', { params });
  },
};

// Lawyers API
export const lawyersAPI = {
  getAll: () => api.get('/api/lawyers'),
  getByProvince: (province) => api.get(`/api/lawyers/province/${province}`),
  getNearby: (params) => api.get('/api/lawyers/nearby', { params }),
};

// Favorites API
export const favoritesAPI = {
  getAll: () => api.get('/api/favorites'),
  add: (propertyId, data) => api.post('/api/favorites', { propertyId, ...data }),
  remove: (id) => api.delete(`/api/favorites/${id}`),
  check: (propertyId) => api.get(`/api/favorites/${propertyId}`),
};

// Saved Searches API
export const savedSearchesAPI = {
  getAll: () => api.get('/api/saved-searches'),
  create: (data) => api.post('/api/saved-searches', data),
  getMatches: (id, params) => api.get(`/api/saved-searches/${id}/matches`, { params }),
  delete: (id) => api.delete(`/api/saved-searches/${id}`),
};

// Notifications API
export const notificationsAPI = {
  getAll: (params) => api.get('/api/notifications', { params }),
  getUnreadCount: () => api.get('/api/notifications/unread-count'),
  markAsRead: (id) => api.put(`/api/notifications/${id}/read`),
  markAllAsRead: () => api.put('/api/notifications/read-all'),
};

// Mortgage Calculator API
export const mortgageCalculatorAPI = {
  calculatePayment: (data) => api.post('/api/mortgage-calculator/payment', data),
  calculateAffordability: (data) => api.post('/api/mortgage-calculator/affordability', data),
  getSchedule: (data, params) => api.post('/api/mortgage-calculator/schedule', data, { params }),
};

// Comparison API
export const comparisonAPI = {
  compare: (propertyIds) => api.post('/api/comparison/compare', { propertyIds }),
};

export default api;

