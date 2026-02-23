const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  isVerified: { type: Boolean, default: false },
  otpHash: { type: String },
  otpExpires: { type: Date },
  otpRequests: { type: [Number], default: [] },
  passwordResetToken: { type: String },
  passwordResetExpires: { type: Date },
  passwordResetOtpHash: { type: String },
  passwordResetOtpExpires: { type: Date },
  currentStreak: { type: Number, default: 0 },
  longestStreak: { type: Number, default: 0 },
  streakPoints: { type: Number, default: 0 },
  lastWorkoutDate: { type: Date, default: null },
  height: { type: Number, default: null }, // in cm
  weight: { type: Number, default: null }, // in kg
  age: { type: Number, default: null },
  gender: { type: String, enum: ['male', 'female', 'other'], default: null },
  
  waterGoal: { type: Number, default: 2000 }, // in ml
  waterIntake: [
    {
      date: { type: Date, default: Date.now },
      amount: { type: Number, required: true }, // in ml
    }
  ],
  pushSubscriptions: { type: [Object], default: [] },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', userSchema);
