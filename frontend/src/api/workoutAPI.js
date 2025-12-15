import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const workoutAPI = {
  // Get all workouts
  getAllWorkouts: () => api.get('/workouts'),

  // Get workout by ID
  getWorkoutById: (id) => api.get(`/workouts/${id}`),

  // Create new workout
  createWorkout: (workout) => api.post('/workouts', workout),

  // Update workout
  updateWorkout: (id, workout) => api.put(`/workouts/${id}`, workout),

  // Delete workout
  deleteWorkout: (id) => api.delete(`/workouts/${id}`),

  // Get statistics
  getStats: () => api.get('/stats/summary'),
};

export default api;
