const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

/**
 * Generate JWT token
 * @param {Object} user - User document
 * @returns {string} JWT token
 */
const generateToken = (user) => {
  return jwt.sign({ id: user._id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '7d' });
};

/**
 * Validate password strength
 * Must be >=8 chars, include uppercase, lowercase, number and special character
 * @param {string} password - Password to validate
 * @returns {boolean} Is password valid
 */
const validatePassword = (password) => {
  if (!password || password.length < 8) return false;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  return hasUpper && hasLower && hasNumber && hasSpecial;
};

/**
 * SIGNUP: Register a new user and send OTP
 * - Generate random 6-digit OTP
 * - Set OTP expiry to 10 minutes from now
 * - Create user with isVerified: false
 * - Send OTP via email
 */
exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Missing required fields: name, email, password' });
    }

    // Validate password strength
    if (!validatePassword(password)) {
      return res.status(400).json({
        message: 'Password must be at least 8 characters and include uppercase, lowercase, number, and special character',
      });
    }

    // Check if user already exists
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate OTP (5 minute expiry)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = await bcrypt.hash(otp, 8);
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Create user
    const user = new User({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      isVerified: false,
      otpHash,
      otpExpires,
    });

    await user.save();

    // Send OTP email (non-blocking)
    try {
      await sendEmail(email, otp);
    } catch (emailError) {
      console.error('Email sending failed, but user was created:', emailError.message);
      // Continue - user was created, email will be resent if needed
    }

    res.status(201).json({
      message: 'Registration successful! OTP sent to your email. Please verify within 10 minutes.',
      email: user.email,
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: error.message || 'Signup failed' });
  }
};

/**
 * VERIFY OTP: Verify email with OTP
 * - Check if user exists
 * - Validate OTP matches and hasn't expired
 * - Mark user as verified
 * - Clear OTP fields
 * - Return JWT token
 */
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Validate input
    if (!email || !otp) {
      return res.status(400).json({ message: 'Missing required fields: email, otp' });
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    // Check if already verified
    if (user.isVerified) {
      return res.status(400).json({ message: 'User already verified' });
    }

    // Check if OTP exists
    if (!user.otpHash || !user.otpExpires) {
      return res.status(400).json({ message: 'No OTP found. Please signup again or request OTP resend.' });
    }

    // Check if OTP expired
    if (user.otpExpires < new Date()) {
      return res.status(400).json({ message: 'OTP expired. Please request a new one.' });
    }

    // Verify OTP
    const isOtpValid = await bcrypt.compare(otp, user.otpHash);
    if (!isOtpValid) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    // Mark as verified and clear OTP
    user.isVerified = true;
    user.otpHash = undefined;
    user.otpExpires = undefined;
    await user.save();

    // Generate token
    const token = generateToken(user);

    res.status(200).json({
      message: 'Email verified successfully!',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({ message: error.message || 'OTP verification failed' });
  }
};

/**
 * RESEND OTP: Generate and resend OTP to user email
 */
exports.resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Don't reveal if email exists for security
      return res.status(200).json({ message: 'If email exists and is unverified, OTP will be resent.' });
    }

    // Rate limiting / cooldown: allow one resend per 60 seconds and max 5 per hour
    const now = Date.now();
    const COOLDOWN_MS = 60 * 1000; // 60 seconds
    const HOUR_MS = 60 * 60 * 1000;
    user.otpRequests = user.otpRequests || [];
    // prune requests older than 1 hour
    user.otpRequests = user.otpRequests.filter((ts) => now - ts < HOUR_MS);
    const lastRequest = user.otpRequests[user.otpRequests.length - 1];
    if (lastRequest && now - lastRequest < COOLDOWN_MS) {
      return res.status(429).json({ message: 'Please wait before requesting another OTP' });
    }
    if (user.otpRequests.length >= 5) {
      return res.status(429).json({ message: 'OTP resend limit reached. Try again later.' });
    }

    // Generate new OTP (5 minute expiry)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = await bcrypt.hash(otp, 8);
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    user.otpHash = otpHash;
    user.otpExpires = otpExpires;
    // record this request timestamp
    user.otpRequests.push(now);
    user.markModified('otpRequests');
    await user.save();

    // Send OTP email (non-blocking)
    try {
      await sendEmail(email, otp);
    } catch (emailError) {
      console.error('Email resend failed:', emailError.message);
      return res.status(500).json({ message: 'Failed to send OTP email' });
    }

    res.status(200).json({ message: 'OTP resent to email' });
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({ message: error.message || 'Failed to resend OTP' });
  }
};

/**
 * LOGIN: Authenticate user
 * - Check if user exists
 * - Verify email is verified
 * - Check password
 * - Return JWT token
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    if (!user.isVerified) {
      return res.status(400).json({ message: 'Email not verified. Please verify your email first.' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user);
    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: error.message || 'Login failed' });
  }
};

/**
 * LOGIN WITH OTP: Authenticate user using OTP
 * - Accepts { email, otp }
 * - Validates OTP, marks user verified, clears OTP fields
 * - Returns JWT token on success
 */
exports.loginWithOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and otp are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Ensure OTP exists
    if (!user.otpHash || !user.otpExpires) {
      return res.status(400).json({ message: 'No OTP found. Please request OTP resend.' });
    }

    // Check expiry
    if (user.otpExpires < new Date()) {
      return res.status(400).json({ message: 'OTP expired. Please request a new one.' });
    }

    const isOtpValid = await bcrypt.compare(otp, user.otpHash);
    if (!isOtpValid) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    // Mark verified and clear OTP fields
    user.isVerified = true;
    user.otpHash = undefined;
    user.otpExpires = undefined;
    await user.save();

    const token = generateToken(user);

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Login with OTP error:', error);
    res.status(500).json({ message: error.message || 'OTP login failed' });
  }
};

/**
 * FORGOT PASSWORD: send password reset email with token
 * Body: { email }
 */
exports.forgotPassword = async (req, res) => {
  try {
    // Send a password-reset OTP (useful for password reset without link)
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(200).json({ message: 'If that email exists, an OTP was sent.' });

    // Generate OTP for password reset (5 minute expiry)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = await bcrypt.hash(otp, 8);
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000);

    user.passwordResetOtpHash = otpHash;
    user.passwordResetOtpExpires = otpExpires;
    await user.save();

    try {
      await sendEmail(user.email, otp);
    } catch (err) {
      console.error('Forgot password OTP email failed:', err.message);
      return res.status(500).json({ message: 'Failed to send reset OTP' });
    }

    return res.status(200).json({ message: 'If that email exists, an OTP was sent.' });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ message: 'Failed to process forgot password' });
  }
};

/**
 * RESET PASSWORD: accept { email, token, password }
 */
exports.resetPassword = async (req, res) => {
  try {
    const { email, token, otp, password } = req.body;
    if (!email || !password || (!token && !otp)) return res.status(400).json({ message: 'Email, token/otp and password are required' });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(400).json({ message: 'Invalid or expired token/OTP' });

    // If token provided (legacy link flow)
    if (token) {
      if (!user.passwordResetToken || !user.passwordResetExpires) return res.status(400).json({ message: 'Invalid or expired token' });
      if (user.passwordResetExpires < new Date()) return res.status(400).json({ message: 'Reset token expired' });
      const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
      if (tokenHash !== user.passwordResetToken) return res.status(400).json({ message: 'Invalid token' });
    } else {
      // OTP flow
      if (!user.passwordResetOtpHash || !user.passwordResetOtpExpires) return res.status(400).json({ message: 'Invalid or expired OTP' });
      if (user.passwordResetOtpExpires < new Date()) return res.status(400).json({ message: 'OTP expired' });
      const isOtpValid = await bcrypt.compare(otp, user.passwordResetOtpHash);
      if (!isOtpValid) return res.status(400).json({ message: 'Invalid OTP' });
    }

    // validate password strength
    if (!validatePassword(password)) return res.status(400).json({ message: 'Password must be at least 8 characters and include uppercase, lowercase, number, and special character' });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    // clear both token and otp fields
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.passwordResetOtpHash = undefined;
    user.passwordResetOtpExpires = undefined;
    await user.save();

    res.status(200).json({ message: 'Password reset successful' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ message: 'Failed to reset password' });
  }
};
