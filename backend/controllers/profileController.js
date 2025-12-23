const User = require('../models/User');

/**
 * GET USER PROFILE
 */
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password -otpHash -passwordResetToken -passwordResetOtpHash');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * UPDATE USER PROFILE (height, weight, age, gender, waterGoal)
 */
exports.updateProfile = async (req, res) => {
  try {
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
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'Profile updated successfully', user });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * ADD WATER INTAKE
 */
exports.addWaterIntake = async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Please provide a valid amount' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
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

    res.json({ 
      message: 'Water intake recorded', 
      todayIntake: todayTotal.amount,
      goal: user.waterGoal
    });
  } catch (error) {
    console.error('Error adding water intake:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * GET TODAY'S WATER INTAKE
 */
exports.getTodayWaterIntake = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayIntake = user.waterIntake.find(intake => {
      const intakeDate = new Date(intake.date);
      intakeDate.setHours(0, 0, 0, 0);
      return intakeDate.getTime() === today.getTime();
    });

    res.json({
      todayIntake: todayIntake ? todayIntake.amount : 0,
      goal: user.waterGoal,
      percentage: todayIntake ? (todayIntake.amount / user.waterGoal) * 100 : 0
    });
  } catch (error) {
    console.error('Error fetching water intake:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * CALCULATE BMI
 */
exports.calculateBMI = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.height || !user.weight) {
      return res.status(400).json({ message: 'Please update your height and weight first' });
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

    res.json({
      bmi: parseFloat(bmi.toFixed(1)),
      category,
      height: user.height,
      weight: user.weight
    });
  } catch (error) {
    console.error('Error calculating BMI:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * GET WATER HISTORY (last 7 days)
 */
exports.getWaterHistory = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
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

    res.json(last7Days);
  } catch (error) {
    console.error('Error fetching water history:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
