/**
 * Refactored API service with centralized request handling
 */

import axios from 'axios';
import API_BASE_URL, { API_ENDPOINTS } from '../constants/apiConstants';
import { handleAPIError } from '../utils/errorHandler';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to add token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor to handle common errors
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    throw handleAPIError(error);
  }
);

export const workoutAPI = {
  getAll: () => apiClient.get(API_ENDPOINTS.WORKOUTS),
  getById: (id) => apiClient.get(API_ENDPOINTS.WORKOUT_BY_ID(id)),
  create: (data) => apiClient.post(API_ENDPOINTS.WORKOUTS, data),
  update: (id, data) => apiClient.put(API_ENDPOINTS.WORKOUT_BY_ID(id), data),
  delete: (id) => apiClient.delete(API_ENDPOINTS.WORKOUT_BY_ID(id)),
  getStats: () => apiClient.get(API_ENDPOINTS.WORKOUT_STATS),
};

export const authAPI = {
  login: (email, password) => apiClient.post(API_ENDPOINTS.LOGIN, { email, password }),
  signup: (data) => apiClient.post(API_ENDPOINTS.SIGNUP, data),
  resetPassword: (email) => apiClient.post(API_ENDPOINTS.RESET_PASSWORD, { email }),
};

export const profileAPI = {
  getProfile: () => apiClient.get(API_ENDPOINTS.USER_PROFILE),
  updateProfile: (data) => apiClient.put(API_ENDPOINTS.USER_UPDATE, data),
};

export const aiAPI = {
  generateWorkout: (prompt, provider, model) =>
    apiClient.post(API_ENDPOINTS.AI_WORKOUT, { prompt, provider, model }),
};

export default apiClient;
