const { Achievement, ACHIEVEMENT_DEFINITIONS } = require('../models/Achievement');
const Workout = require('../models/Workout');
const Meal = require('../models/Meal');
const BodyMeasurement = require('../models/BodyMeasurement');
const User = require('../models/User');
const { sendSuccess } = require('../utils/responseHandler');
const asyncHandler = require('../middleware/asyncHandler');

// Check & unlock achievements for a user
async function checkAndUnlock(userId) {
    const [workouts, meals, measurements, user, existing] = await Promise.all([
        Workout.find({ user: userId }),
        Meal.countDocuments({ user: userId }),
        BodyMeasurement.countDocuments({ user: userId }),
        User.findById(userId),
        Achievement.find({ user: userId }),
    ]);

    const unlockedTypes = new Set(existing.map(a => a.type));
    const totalCalories = workouts.reduce((s, w) => s + (w.calories || 0), 0);

    // Calculate streak
    const dates = [...new Set(workouts.map(w => new Date(w.date).toDateString()))].sort((a, b) => new Date(b) - new Date(a));
    let streak = 0;
    if (dates.length > 0) {
        streak = 1;
        for (let i = 0; i < dates.length - 1; i++) {
            const diff = (new Date(dates[i]) - new Date(dates[i + 1])) / 86400000;
            if (Math.round(diff) === 1) streak++;
            else break;
        }
        const today = new Date().toDateString();
        const yesterday = new Date(Date.now() - 86400000).toDateString();
        if (dates[0] !== today && dates[0] !== yesterday) streak = 0;
    }

    // Water goal days
    let waterGoalDays = 0;
    if (user && user.waterIntake) {
        waterGoalDays = user.waterIntake.filter(w => w.amount >= (user.waterGoal || 2000)).length;
    }

    // Early bird check
    const earlyWorkout = workouts.some(w => {
        const h = new Date(w.date).getHours();
        return h < 7;
    });

    const stats = {
        workouts: workouts.length,
        calories: totalCalories,
        streak,
        waterGoalDays,
        earlyWorkout,
        meals,
        measurements,
    };

    const newlyUnlocked = [];
    for (const def of ACHIEVEMENT_DEFINITIONS) {
        if (unlockedTypes.has(def.type)) continue;
        let earned = false;
        switch (def.type) {
            case 'first_workout': earned = stats.workouts >= 1; break;
            case 'workouts_10': earned = stats.workouts >= 10; break;
            case 'workouts_50': earned = stats.workouts >= 50; break;
            case 'workouts_100': earned = stats.workouts >= 100; break;
            case 'streak_7': earned = stats.streak >= 7; break;
            case 'streak_30': earned = stats.streak >= 30; break;
            case 'streak_100': earned = stats.streak >= 100; break;
            case 'calories_1000': earned = stats.calories >= 1000; break;
            case 'calories_10000': earned = stats.calories >= 10000; break;
            case 'water_goal_7': earned = stats.waterGoalDays >= 7; break;
            case 'early_bird': earned = stats.earlyWorkout; break;
            case 'meal_logger': earned = stats.meals >= 50; break;
            case 'body_tracker': earned = stats.measurements >= 10; break;
        }
        if (earned) {
            try {
                await Achievement.create({ user: userId, type: def.type });
                newlyUnlocked.push(def);
            } catch (e) { /* duplicate, ignore */ }
        }
    }
    return newlyUnlocked;
}

// GET achievements
exports.getAll = asyncHandler(async (req, res) => {
    const unlocked = await Achievement.find({ user: req.user.id });
    const unlockedTypes = new Set(unlocked.map(a => a.type));

    const all = ACHIEVEMENT_DEFINITIONS.map(def => ({
        ...def,
        unlocked: unlockedTypes.has(def.type),
        unlockedAt: unlocked.find(a => a.type === def.type)?.unlockedAt || null,
    }));

    // Also check for any new ones to unlock
    const newlyUnlocked = await checkAndUnlock(req.user.id);

    sendSuccess(res, { achievements: all, newlyUnlocked }, 'Achievements retrieved');
});

// GET leaderboard (top users by streak points)
exports.getLeaderboard = asyncHandler(async (req, res) => {
    const users = await User.find({ isVerified: true })
        .select('name currentStreak longestStreak streakPoints')
        .sort({ streakPoints: -1 })
        .limit(20);

    const leaderboard = users.map((u, i) => ({
        rank: i + 1,
        name: u.name,
        currentStreak: u.currentStreak || 0,
        longestStreak: u.longestStreak || 0,
        points: u.streakPoints || 0,
    }));

    sendSuccess(res, leaderboard, 'Leaderboard retrieved');
});

exports.checkAndUnlock = checkAndUnlock;
