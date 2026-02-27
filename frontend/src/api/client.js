
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

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

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
  getReport: (period) => apiClient.get(API_ENDPOINTS.WORKOUT_REPORT, { params: { period } }),
  exportData: (format) => apiClient.get(API_ENDPOINTS.WORKOUT_EXPORT, { params: { format } }),
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
  generateWorkout: (prompt) => apiClient.post(API_ENDPOINTS.AI_WORKOUT, { prompt }),
  generateMeal: (prompt) => apiClient.post(API_ENDPOINTS.AI_MEAL, { prompt }),
  nutritionLookup: (food, servingSize) => apiClient.post(API_ENDPOINTS.AI_NUTRITION, { food, servingSize }),
  getInsights: () => apiClient.get(API_ENDPOINTS.AI_INSIGHTS),
};

export const exerciseAPI = {
  getAll: (params) => apiClient.get(API_ENDPOINTS.EXERCISES, { params }),
  getById: (id) => apiClient.get(API_ENDPOINTS.EXERCISE_BY_ID(id)),
  getCategories: () => apiClient.get(API_ENDPOINTS.EXERCISE_CATEGORIES),
};

export const mealAPI = {
  create: (data) => apiClient.post(API_ENDPOINTS.MEALS, data),
  getAll: (params) => apiClient.get(API_ENDPOINTS.MEALS, { params }),
  getToday: () => apiClient.get(API_ENDPOINTS.MEALS_TODAY),
  delete: (id) => apiClient.delete(API_ENDPOINTS.MEAL_BY_ID(id)),
};

export const bodyMeasurementAPI = {
  create: (data) => apiClient.post(API_ENDPOINTS.MEASUREMENTS, data),
  getAll: () => apiClient.get(API_ENDPOINTS.MEASUREMENTS),
  getLatest: () => apiClient.get(API_ENDPOINTS.MEASUREMENTS_LATEST),
};

export const achievementAPI = {
  getAll: () => apiClient.get(API_ENDPOINTS.ACHIEVEMENTS),
  getLeaderboard: () => apiClient.get(API_ENDPOINTS.LEADERBOARD),
};

export default apiClient;
