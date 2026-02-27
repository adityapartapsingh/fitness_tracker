const User = require('../models/User');
const PendingRegistration = require('../models/PendingRegistration');
const sendEmail = require('../utils/sendEmail');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';
const generateToken = (user) => {
  return jwt.sign({ id: user._id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '7d' });
};

const validatePassword = (password) => {
  if (!password || password.length < 8) return false;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  return hasUpper && hasLower && hasNumber && hasSpecial;
};


exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Missing required fields: name, email, password' });
    }
    if (!validatePassword(password)) {
      return res.status(400).json({
        message: 'Password must be at least 8 characters and include uppercase, lowercase, number, and special character',
      });
    }

    // Check if email is already registered as a verified user
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = await bcrypt.hash(otp, 8);
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000);

    // Send email BEFORE saving anything - fail early if email service is down
    try {
      await sendEmail(email, otp);
    } catch (emailError) {
      console.error('Email sending failed during signup:', emailError.message);
      return res.status(503).json({
        message: 'Email service unavailable. Please try again later. Account not created.',
      });
    }

    // Store in PendingRegistration (NOT User) — data only moves to User after OTP verification
    // Upsert so re-signups with same email overwrite the old pending record
    await PendingRegistration.findOneAndUpdate(
      { email: email.toLowerCase() },
      {
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        otpHash,
        otpExpires,
        otpRequests: [Date.now()],
        createdAt: new Date(), // reset TTL on re-signup
      },
      { upsert: true, new: true }
    );

    res.status(201).json({
      message: 'OTP sent to your email. Please verify within 5 minutes to complete registration.',
      email: email.toLowerCase(),
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: error.message || 'Signup failed' });
  }
};


exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: 'Missing required fields: email, otp' });
    }

    // First check PendingRegistration (new flow — user not yet in User collection)
    const pending = await PendingRegistration.findOne({ email: email.toLowerCase() });

    if (pending) {
      if (!pending.otpHash || !pending.otpExpires) {
        return res.status(400).json({ message: 'No OTP found. Please signup again.' });
      }
      if (pending.otpExpires < new Date()) {
        return res.status(400).json({ message: 'OTP expired. Please signup again or request a new OTP.' });
      }

      const isOtpValid = await bcrypt.compare(otp, pending.otpHash);
      if (!isOtpValid) {
        return res.status(400).json({ message: 'Invalid OTP' });
      }

      // OTP valid — create the real User now
      const user = new User({
        name: pending.name,
        email: pending.email,
        password: pending.password,
        isVerified: true,
      });
      await user.save();

      // Clean up the pending record
      await PendingRegistration.deleteOne({ _id: pending._id });

      const token = generateToken(user);

      return res.status(200).json({
        message: 'Email verified successfully! Account created.',
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          isVerified: user.isVerified,
        },
      });
    }

    // Fallback: check if user already exists in User collection (legacy / login-with-OTP cases)
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(400).json({ message: 'No pending registration found. Please signup first.' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'User already verified' });
    }

    if (!user.otpHash || !user.otpExpires) {
      return res.status(400).json({ message: 'No OTP found. Please signup again or request OTP resend.' });
    }

    if (user.otpExpires < new Date()) {
      return res.status(400).json({ message: 'OTP expired. Please request a new one.' });
    }

    const isOtpValid = await bcrypt.compare(otp, user.otpHash);
    if (!isOtpValid) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    user.isVerified = true;
    user.otpHash = undefined;
    user.otpExpires = undefined;
    await user.save();

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

exports.resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Check PendingRegistration first (new flow), then fall back to User
    let record = await PendingRegistration.findOne({ email: email.toLowerCase() });
    let isPending = !!record;
    if (!record) {
      record = await User.findOne({ email: email.toLowerCase() });
    }

    if (!record) {
      // Don't reveal whether email exists
      return res.status(200).json({ message: 'If email exists and is unverified, OTP will be resent.' });
    }

    // Rate limiting
    const now = Date.now();
    const COOLDOWN_MS = 30 * 1000; // 30 seconds
    const HOUR_MS = 60 * 60 * 1000;
    record.otpRequests = record.otpRequests || [];
    record.otpRequests = record.otpRequests.filter((ts) => now - ts < HOUR_MS);
    const lastRequest = record.otpRequests[record.otpRequests.length - 1];
    if (lastRequest && now - lastRequest < COOLDOWN_MS) {
      return res.status(429).json({ message: 'Please wait before requesting another OTP' });
    }
    if (record.otpRequests.length >= 5) {
      return res.status(429).json({ message: 'OTP resend limit reached. Try again later.' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = await bcrypt.hash(otp, 8);
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Send email FIRST — only update DB if email succeeds
    try {
      await sendEmail(email, otp);
    } catch (emailError) {
      console.error('Email resend failed:', emailError.message);
      return res.status(500).json({ message: 'Failed to send OTP email' });
    }

    // Email sent successfully — now update DB
    record.otpHash = otpHash;
    record.otpExpires = otpExpires;
    record.otpRequests.push(now);
    if (!isPending) {
      record.markModified('otpRequests');
    }
    await record.save();

    res.status(200).json({ message: 'OTP resent to email' });
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({ message: error.message || 'Failed to resend OTP' });
  }
};


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
    if (!user.otpHash || !user.otpExpires) {
      return res.status(400).json({ message: 'No OTP found. Please request OTP resend.' });
    }
    if (user.otpExpires < new Date()) {
      return res.status(400).json({ message: 'OTP expired. Please request a new one.' });
    }

    const isOtpValid = await bcrypt.compare(otp, user.otpHash);
    if (!isOtpValid) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }
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

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(200).json({ message: 'If that email exists, an OTP was sent.' });

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


exports.resetPassword = async (req, res) => {
  try {
    const { email, token, otp, password } = req.body;
    if (!email || !password || (!token && !otp)) return res.status(400).json({ message: 'Email, token/otp and password are required' });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(400).json({ message: 'Invalid or expired token/OTP' });

    if (token) {
      if (!user.passwordResetToken || !user.passwordResetExpires) return res.status(400).json({ message: 'Invalid or expired token' });
      if (user.passwordResetExpires < new Date()) return res.status(400).json({ message: 'Reset token expired' });
      const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
      if (tokenHash !== user.passwordResetToken) return res.status(400).json({ message: 'Invalid token' });
    } else {
      if (!user.passwordResetOtpHash || !user.passwordResetOtpExpires) return res.status(400).json({ message: 'Invalid or expired OTP' });
      if (user.passwordResetOtpExpires < new Date()) return res.status(400).json({ message: 'OTP expired' });
      const isOtpValid = await bcrypt.compare(otp, user.passwordResetOtpHash);
      if (!isOtpValid) return res.status(400).json({ message: 'Invalid OTP' });
    }
    if (!validatePassword(password)) return res.status(400).json({ message: 'Password must be at least 8 characters and include uppercase, lowercase, number, and special character' });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
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
