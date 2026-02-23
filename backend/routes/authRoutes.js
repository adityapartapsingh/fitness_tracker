const express = require('express');
const router = express.Router();
const { signup, verifyOTP, resendOTP, login, loginWithOtp } = require('../controllers/authController');


router.post('/signup', signup);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);
router.post('/forgot-password', require('../controllers/authController').forgotPassword);
router.post('/reset-password', require('../controllers/authController').resetPassword);
router.post('/login', login);
router.post('/login-otp', loginWithOtp);

module.exports = router;
