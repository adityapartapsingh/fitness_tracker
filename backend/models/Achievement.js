const mongoose = require('mongoose');

// All possible achievement definitions
const ACHIEVEMENT_DEFINITIONS = [
    { type: 'first_workout', name: 'First Step', description: 'Log your first workout', icon: '🏃', condition: 'workouts >= 1' },
    { type: 'workouts_10', name: 'Getting Started', description: 'Complete 10 workouts', icon: '💪', condition: 'workouts >= 10' },
    { type: 'workouts_50', name: 'Dedicated', description: 'Complete 50 workouts', icon: '🏋️', condition: 'workouts >= 50' },
    { type: 'workouts_100', name: 'Centurion', description: 'Complete 100 workouts', icon: '🏆', condition: 'workouts >= 100' },
    { type: 'streak_7', name: 'Week Warrior', description: 'Maintain a 7-day streak', icon: '🔥', condition: 'streak >= 7' },
    { type: 'streak_30', name: 'Monthly Master', description: 'Maintain a 30-day streak', icon: '⚡', condition: 'streak >= 30' },
    { type: 'streak_100', name: 'Unstoppable', description: 'Maintain a 100-day streak', icon: '💎', condition: 'streak >= 100' },
    { type: 'calories_1000', name: 'Calorie Crusher', description: 'Burn 1,000 total calories', icon: '🔥', condition: 'calories >= 1000' },
    { type: 'calories_10000', name: 'Inferno', description: 'Burn 10,000 total calories', icon: '🌋', condition: 'calories >= 10000' },
    { type: 'water_goal_7', name: 'Hydration Hero', description: 'Hit your water goal 7 days', icon: '💧', condition: 'waterGoalDays >= 7' },
    { type: 'early_bird', name: 'Early Bird', description: 'Log a workout before 7 AM', icon: '🌅', condition: 'earlyWorkout' },
    { type: 'meal_logger', name: 'Nutrition Tracker', description: 'Log 50 meals', icon: '🥗', condition: 'meals >= 50' },
    { type: 'body_tracker', name: 'Body Aware', description: 'Log 10 body measurements', icon: '📏', condition: 'measurements >= 10' },
];

const achievementSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    type: { type: String, required: true },
    unlockedAt: { type: Date, default: Date.now },
});

achievementSchema.index({ user: 1, type: 1 }, { unique: true });

const Achievement = mongoose.model('Achievement', achievementSchema);

module.exports = { Achievement, ACHIEVEMENT_DEFINITIONS };
