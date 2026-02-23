import apiClient from './client';

export const profileAPI = {
  getProfile: async () => {
    return apiClient.get('/user/profile');
  },

  updateProfile: async (profileData) => {
    return apiClient.put('/user/profile', profileData);
  },
  addWaterIntake: async (amount) => {
    return apiClient.post('/user/water', { amount });
  },

  getTodayWaterIntake: async () => {
    return apiClient.get('/user/water/today');
  },

  getWaterHistory: async () => {
    return apiClient.get('/user/water/history');
  },
  calculateBMI: async () => {
    return apiClient.get('/user/bmi');
  },
};
