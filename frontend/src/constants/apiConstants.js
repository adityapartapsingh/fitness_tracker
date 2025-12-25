/**
 * Centralized API configuration and utilities
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/auth/login',
  SIGNUP: '/auth/signup',
  RESET_PASSWORD: '/auth/reset-password',

  // Workouts
  WORKOUTS: '/workouts',
  WORKOUT_BY_ID: (id) => `/workouts/${id}`,
  WORKOUT_STATS: '/workouts/stats',

  // User
  USER_PROFILE: '/user/profile',
  USER_UPDATE: '/user/update',

  // AI
  AI_WORKOUT: '/ai/workout',
};

export default API_BASE_URL;
