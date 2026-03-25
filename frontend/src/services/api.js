/**
 * API Service
 * Axios configuration and API endpoints
 */

import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
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
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// =====================================================
// AUTH ENDPOINTS
// =====================================================

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
};

// =====================================================
// SUBSCRIPTION ENDPOINTS
// =====================================================

export const subscriptionAPI = {
  createCheckout: (planType) => api.post('/subscriptions/create-checkout', { planType }),
  getMySubscription: () => api.get('/subscriptions/my-subscription'),
  cancelSubscription: () => api.post('/subscriptions/cancel'),
};

// =====================================================
// SCORES ENDPOINTS
// =====================================================

export const scoresAPI = {
  getScores: () => api.get('/scores'),
  addScore: (data) => api.post('/scores', data),
  updateScore: (scoreId, data) => api.put(`/scores/${scoreId}`, data),
  deleteScore: (scoreId) => api.delete(`/scores/${scoreId}`),
  getStats: () => api.get('/scores/stats'),
};

// =====================================================
// DRAW ENDPOINTS
// =====================================================

export const drawAPI = {
  getDraws: (params) => api.get('/draws', { params }),
  getDrawById: (drawId) => api.get(`/draws/${drawId}`),
  getMyParticipation: () => api.get('/draws/my/participation'),
  createDraw: (data) => api.post('/draws/create', data),
};

// =====================================================
// CHARITY ENDPOINTS
// =====================================================

export const charityAPI = {
  getCharities: (params) => api.get('/charities', { params }),
  getCharityById: (charityId) => api.get(`/charities/${charityId}`),
  selectCharity: (data) => api.post('/charities/select', data),
  getMyCharity: () => api.get('/charities/my/charity'),
  getMyContributions: () => api.get('/charities/my/contributions'),
  // Admin
  createCharity: (data) => api.post('/charities/admin/create', data),
  updateCharity: (charityId, data) => api.put(`/charities/admin/${charityId}`, data),
  deleteCharity: (charityId) => api.delete(`/charities/admin/${charityId}`),
  getCharityStats: () => api.get('/charities/admin/stats'),
};

// =====================================================
// WINNERS ENDPOINTS
// =====================================================

export const winnersAPI = {
  getMyWinnings: () => api.get('/winners/my/winnings'),
  uploadProof: (winnerId, formData) => {
    return api.post(`/winners/${winnerId}/upload-proof`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  // Admin
  getAllWinners: (params) => api.get('/winners/admin/all', { params }),
  verifyWinner: (winnerId, data) => api.put(`/winners/admin/${winnerId}/verify`, data),
  markAsPaid: (winnerId) => api.put(`/winners/admin/${winnerId}/mark-paid`),
  getWinnerStats: () => api.get('/winners/admin/stats'),
};

export default api;
