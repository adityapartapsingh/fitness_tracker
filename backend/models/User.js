const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  isVerified: { type: Boolean, default: false },
  otpHash: { type: String },
  otpExpires: { type: Date },
  // timestamps (ms) of recent OTP requests for rate-limiting (kept in UTC ms)
  otpRequests: { type: [Number], default: [] },
  // Password reset token (stored hashed) and expiry
  passwordResetToken: { type: String },
  passwordResetExpires: { type: Date },
  // OTP flow for password reset
  passwordResetOtpHash: { type: String },
  passwordResetOtpExpires: { type: Date },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', userSchema);
