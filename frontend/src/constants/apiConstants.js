/**
 * Centralized API configuration and utilities
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/auth/login',
  SIGNUP: '/auth/signup',
  VERIFY_OTP: '/auth/verify-otp',
  RESEND_OTP: '/auth/resend-otp',
  RESET_PASSWORD: '/auth/reset-password',

  // Workouts
  WORKOUTS: '/workouts',
  WORKOUT_BY_ID: (id) => `/workouts/${id}`,
  WORKOUT_STATS: '/workouts/stats',
  WORKOUT_REPORT: '/workouts/report',
  WORKOUT_EXPORT: '/workouts/export',

  // User
  USER_PROFILE: '/user/profile',
  USER_UPDATE: '/user/update',

  // AI
  AI_WORKOUT: '/ai/workout',
  AI_MEAL: '/ai/meal',
  AI_NUTRITION: '/ai/nutrition',
  AI_INSIGHTS: '/ai/insights',

  // Exercises
  EXERCISES: '/exercises',
  EXERCISE_BY_ID: (id) => `/exercises/${id}`,
  EXERCISE_CATEGORIES: '/exercises/categories',

  // Meals
  MEALS: '/meals',
  MEALS_TODAY: '/meals/today',
  MEAL_BY_ID: (id) => `/meals/${id}`,

  // Body Measurements
  MEASUREMENTS: '/measurements',
  MEASUREMENTS_LATEST: '/measurements/latest',

  // Achievements
  ACHIEVEMENTS: '/achievements',
  LEADERBOARD: '/achievements/leaderboard',
};

export default API_BASE_URL;
