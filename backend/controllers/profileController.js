const User = require('../models/User');
const { sendSuccess, sendError } = require('../utils/responseHandler');
const asyncHandler = require('../middleware/asyncHandler');

/**
 * GET USER PROFILE
 */
exports.getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select('-password -otpHash -passwordResetToken -passwordResetOtpHash');

  if (!user) {
    return sendError(res, 'User not found', 404);
  }

  sendSuccess(res, user, 'Profile retrieved successfully');
});

/**
 * UPDATE USER PROFILE (height, weight, age, gender, waterGoal)
 */
exports.updateProfile = asyncHandler(async (req, res) => {
  const { height, weight, age, gender, waterGoal } = req.body;

  const user = await User.findByIdAndUpdate(
    req.user.id,
    {
      ...(height !== undefined && { height }),
      ...(weight !== undefined && { weight }),
      ...(age !== undefined && { age }),
      ...(gender !== undefined && { gender }),
      ...(waterGoal !== undefined && { waterGoal }),
    },
    { new: true }
  ).select('-password -otpHash -passwordResetToken -passwordResetOtpHash');

  if (!user) {
    return sendError(res, 'User not found', 404);
  }

  sendSuccess(res, user, 'Profile updated successfully');
});

/**
 * ADD WATER INTAKE
 */
exports.addWaterIntake = asyncHandler(async (req, res) => {
  const { amount } = req.body;

  if (!amount || amount <= 0) {
    return sendError(res, 'Please provide a valid amount', 400);
  }

  const user = await User.findById(req.user.id);
  if (!user) {
    return sendError(res, 'User not found', 404);
  }

  // Get today's date
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Check if water intake already exists for today
  const existingIntake = user.waterIntake.find(intake => {
    const intakeDate = new Date(intake.date);
    intakeDate.setHours(0, 0, 0, 0);
    return intakeDate.getTime() === today.getTime();
  });

  if (existingIntake) {
    existingIntake.amount += amount;
  } else {
    user.waterIntake.push({ date: new Date(), amount });
  }

  await user.save();

  // Get today's total
  const todayTotal = user.waterIntake.find(intake => {
    const intakeDate = new Date(intake.date);
    intakeDate.setHours(0, 0, 0, 0);
    return intakeDate.getTime() === today.getTime();
  });

  sendSuccess(res, {
    todayIntake: todayTotal.amount,
    goal: user.waterGoal
  }, 'Water intake recorded successfully', 201);
});

/**
 * GET TODAY'S WATER INTAKE
 */
exports.getTodayWaterIntake = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    return sendError(res, 'User not found', 404);
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayIntake = user.waterIntake.find(intake => {
    const intakeDate = new Date(intake.date);
    intakeDate.setHours(0, 0, 0, 0);
    return intakeDate.getTime() === today.getTime();
  });

  sendSuccess(res, {
    todayIntake: todayIntake ? todayIntake.amount : 0,
    goal: user.waterGoal,
    percentage: todayIntake ? (todayIntake.amount / user.waterGoal) * 100 : 0
  }, 'Water intake retrieved successfully');
});

/**
 * CALCULATE BMI
 */
exports.calculateBMI = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    return sendError(res, 'User not found', 404);
  }

  if (!user.height || !user.weight) {
    return sendError(res, 'Please update your height and weight first', 400);
  }

  // BMI = weight (kg) / height (m)^2
  const heightInMeters = user.height / 100;
  const bmi = user.weight / (heightInMeters * heightInMeters);

  let category = '';
  if (bmi < 18.5) {
    category = 'Underweight';
  } else if (bmi < 25) {
    category = 'Normal weight';
  } else if (bmi < 30) {
    category = 'Overweight';
  } else {
    category = 'Obese';
  }

  sendSuccess(res, {
    bmi: parseFloat(bmi.toFixed(1)),
    category,
    height: user.height,
    weight: user.weight
  }, 'BMI calculated successfully');
});

/**
 * GET WATER HISTORY (last 7 days)
 */
exports.getWaterHistory = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    return sendError(res, 'User not found', 404);
  }

  const last7Days = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);

    const intake = user.waterIntake.find(w => {
      const wDate = new Date(w.date);
      wDate.setHours(0, 0, 0, 0);
      return wDate.getTime() === date.getTime();
    });

    last7Days.push({
      date: date.toISOString().split('T')[0],
      amount: intake ? intake.amount : 0,
      goal: user.waterGoal,
      percentage: intake ? (intake.amount / user.waterGoal) * 100 : 0
    });
  }

  sendSuccess(res, last7Days, 'Water history retrieved successfully');
});
