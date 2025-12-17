const express = require('express');
const router = express.Router();
const { signup, verifyOTP, resendOTP, login, loginWithOtp } = require('../controllers/authController');

/**
 * @route   POST /api/auth/signup
 * @desc    Register a new user and send OTP
 * @body    { name, email, password }
 * @returns { message, email }
 */
router.post('/signup', signup);

/**
 * @route   POST /api/auth/verify-otp
 * @desc    Verify email with OTP
 * @body    { email, otp }
 * @returns { message, token, user }
 */
router.post('/verify-otp', verifyOTP);

/**
 * @route   POST /api/auth/resend-otp
 * @desc    Resend OTP to email
 * @body    { email }
 * @returns { message }
 */
router.post('/resend-otp', resendOTP);

// Forgot / Reset password
// POST /api/auth/forgot-password { email }
router.post('/forgot-password', require('../controllers/authController').forgotPassword);
// POST /api/auth/reset-password { email, token, password }
router.post('/reset-password', require('../controllers/authController').resetPassword);

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @body    { email, password }
 * @returns { message, token, user }
 */
router.post('/login', login);
router.post('/login-otp', loginWithOtp);

module.exports = router;
