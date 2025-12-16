import axios from './workoutAPI';

const createErrorHandler = (action) => {
  return async (promise) => {
    try {
      return await promise;
    } catch (error) {
      console.error(`${action} error:`, error.response?.data || error.message);
      throw error;
    }
  };
};

export const authAPI = {
  register: (payload) => {
    console.log('Registering with:', { name: payload.name, email: payload.email });
    return axios.post('/auth/signup', payload);
  },
  login: (payload) => {
    console.log('Logging in with:', payload.email);
    return axios.post('/auth/login', payload);
  },
  loginWithOtp: (payload) => {
    console.log('Logging in with OTP for:', payload.email);
    return axios.post('/auth/login-otp', payload);
  },
  verifyOtp: (payload) => {
    console.log('Verifying OTP for:', payload.email);
    return axios.post('/auth/verify-otp', payload);
  },
  resendOtp: (payload) => {
    console.log('Resending OTP to:', payload.email);
    return axios.post('/auth/resend-otp', payload);
  },
};

export default authAPI;
