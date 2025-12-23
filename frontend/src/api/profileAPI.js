const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const getAuthToken = () => {
  try {
    return localStorage.getItem('token');
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

const headers = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${getAuthToken()}`,
});

export const profileAPI = {
  // Profile endpoints
  getProfile: async () => {
    const response = await fetch(`${API_BASE_URL}/user/profile`, {
      method: 'GET',
      headers: headers(),
    });
    if (!response.ok) throw new Error('Failed to fetch profile');
    return response.json();
  },

  updateProfile: async (profileData) => {
    const response = await fetch(`${API_BASE_URL}/user/profile`, {
      method: 'PUT',
      headers: headers(),
      body: JSON.stringify(profileData),
    });
    if (!response.ok) throw new Error('Failed to update profile');
    return response.json();
  },

  // Water intake endpoints
  addWaterIntake: async (amount) => {
    const response = await fetch(`${API_BASE_URL}/user/water`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ amount }),
    });
    if (!response.ok) throw new Error('Failed to add water intake');
    return response.json();
  },

  getTodayWaterIntake: async () => {
    const response = await fetch(`${API_BASE_URL}/user/water/today`, {
      method: 'GET',
      headers: headers(),
    });
    if (!response.ok) throw new Error('Failed to fetch water intake');
    return response.json();
  },

  getWaterHistory: async () => {
    const response = await fetch(`${API_BASE_URL}/user/water/history`, {
      method: 'GET',
      headers: headers(),
    });
    if (!response.ok) throw new Error('Failed to fetch water history');
    return response.json();
  },

  // BMI calculation
  calculateBMI: async () => {
    const response = await fetch(`${API_BASE_URL}/user/bmi`, {
      method: 'GET',
      headers: headers(),
    });
    if (!response.ok) throw new Error('Failed to calculate BMI');
    return response.json();
  },
};
