import apiClient from './client';

export const authAPI = {
  register: (payload) => {
    console.log('Registering with:', { name: payload.name, email: payload.email });
    return apiClient.post('/auth/signup', payload);
  },
  login: (payload) => {
    console.log('Logging in with:', payload.email);
    return apiClient.post('/auth/login', payload);
  },
  loginWithOtp: (payload) => {
    console.log('Logging in with OTP for:', payload.email);
    return apiClient.post('/auth/login-otp', payload);
  },
  verifyOtp: (payload) => {
    console.log('Verifying OTP for:', payload.email);
    return apiClient.post('/auth/verify-otp', payload);
  },
  resendOtp: (payload) => {
    console.log('Resending OTP to:', payload.email);
    return apiClient.post('/auth/resend-otp', payload);
  },
  forgotPassword: (payload) => {
    console.log('Forgot password for:', payload.email);
    return apiClient.post('/auth/forgot-password', payload);
  },
  resetPassword: (payload) => {
    console.log('Resetting password for:', payload.email);
    return apiClient.post('/auth/reset-password', payload);
  },
};

export default authAPI;
