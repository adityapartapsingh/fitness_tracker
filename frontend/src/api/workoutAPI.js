import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

await fetch(`${API_URL}/ai/workout`, { 
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}` 
  },
});

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  } catch (e) {
  }
  return config;
});

export const workoutAPI = {
  getAllWorkouts: () => api.get('/workouts'),
  getWorkoutById: (id) => api.get(`/workouts/${id}`),
  createWorkout: (workout) => api.post('/workouts', workout),
  updateWorkout: (id, workout) => api.put(`/workouts/${id}`, workout),
  deleteWorkout: (id) => api.delete(`/workouts/${id}`),
  getStats: () => api.get('/stats/summary'),
};

export default api;
