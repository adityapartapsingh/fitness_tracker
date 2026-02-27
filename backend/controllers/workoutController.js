const Workout = require('../models/Workout');
const Meal = require('../models/Meal');
const User = require('../models/User');
const { sendSuccess, sendError } = require('../utils/responseHandler');
const asyncHandler = require('../middleware/asyncHandler');


exports.getAllWorkouts = asyncHandler(async (req, res) => {
  const workouts = await Workout.find({ user: req.user.id }).sort({ date: -1 });
  sendSuccess(res, workouts, 'Workouts retrieved successfully');
});


exports.getWorkoutById = asyncHandler(async (req, res) => {
  const workout = await Workout.findById(req.params.id);

  if (!workout) {
    return sendError(res, 'Workout not found', 404);
  }

  if (workout.user.toString() !== req.user.id) {
    return sendError(res, 'Unauthorized', 403);
  }

  sendSuccess(res, workout, 'Workout retrieved successfully');
});


exports.createWorkout = asyncHandler(async (req, res) => {
  const { exerciseName, duration, calories, reps, weight, notes } = req.body;

  if (!exerciseName || !duration || !calories) {
    return sendError(res, 'exerciseName, duration, and calories are required', 400);
  }

  const workout = new Workout({
    user: req.user.id,
    exerciseName,
    duration,
    calories,
    reps: reps || null,
    weight: weight || null,
    notes: notes || '',
  });

  const savedWorkout = await workout.save();
  sendSuccess(res, savedWorkout, 'Workout created successfully', 201);
});


exports.updateWorkout = asyncHandler(async (req, res) => {
  const workout = await Workout.findById(req.params.id);

  if (!workout) {
    return sendError(res, 'Workout not found', 404);
  }

  if (workout.user.toString() !== req.user.id) {
    return sendError(res, 'Unauthorized', 403);
  }

  const { exerciseName, duration, calories, reps, weight, notes } = req.body;

  if (exerciseName) workout.exerciseName = exerciseName;
  if (duration) workout.duration = duration;
  if (calories) workout.calories = calories;
  if (reps !== undefined) workout.reps = reps;
  if (weight !== undefined) workout.weight = weight;
  if (notes) workout.notes = notes;

  const updatedWorkout = await workout.save();
  sendSuccess(res, updatedWorkout, 'Workout updated successfully');
});


exports.deleteWorkout = asyncHandler(async (req, res) => {
  const workout = await Workout.findById(req.params.id);

  if (!workout) {
    return sendError(res, 'Workout not found', 404);
  }

  if (workout.user.toString() !== req.user.id) {
    return sendError(res, 'Unauthorized', 403);
  }

  await Workout.findByIdAndDelete(req.params.id);
  sendSuccess(res, null, 'Workout deleted successfully');
});


exports.getStatistics = asyncHandler(async (req, res) => {
  const workouts = await Workout.find({ user: req.user.id });

  if (workouts.length === 0) {
    return sendSuccess(res, {
      totalWorkouts: 0,
      totalDuration: 0,
      totalCalories: 0,
      averageCalories: 0,
      averageDuration: 0,
    }, 'No workouts found');
  }

  const stats = {
    totalWorkouts: workouts.length,
    totalDuration: workouts.reduce((sum, w) => sum + w.duration, 0),
    totalCalories: workouts.reduce((sum, w) => sum + w.calories, 0),
    averageCalories: Math.round(workouts.reduce((sum, w) => sum + w.calories, 0) / workouts.length),
    averageDuration: Math.round(workouts.reduce((sum, w) => sum + w.duration, 0) / workouts.length),
  };

  sendSuccess(res, stats, 'Statistics retrieved successfully');
});


// Weekly / Monthly report
exports.getReport = asyncHandler(async (req, res) => {
  const period = req.query.period === 'monthly' ? 30 : 7;
  const since = new Date();
  since.setDate(since.getDate() - period);

  const [workouts, meals, user] = await Promise.all([
    Workout.find({ user: req.user.id, date: { $gte: since } }).sort({ date: -1 }),
    Meal.find({ user: req.user.id, date: { $gte: since } }),
    User.findById(req.user.id),
  ]);

  const prevSince = new Date(since);
  prevSince.setDate(prevSince.getDate() - period);
  const prevWorkouts = await Workout.find({ user: req.user.id, date: { $gte: prevSince, $lt: since } });

  const totalCalories = workouts.reduce((s, w) => s + w.calories, 0);
  const totalDuration = workouts.reduce((s, w) => s + w.duration, 0);
  const prevCalories = prevWorkouts.reduce((s, w) => s + w.calories, 0);
  const prevDuration = prevWorkouts.reduce((s, w) => s + w.duration, 0);

  const mealCalories = meals.reduce((s, m) => s + m.calories, 0);
  const mealProtein = meals.reduce((s, m) => s + m.protein, 0);
  const mealCarbs = meals.reduce((s, m) => s + m.carbs, 0);
  const mealFat = meals.reduce((s, m) => s + m.fat, 0);

  // Water stats
  let waterDays = 0;
  if (user && user.waterIntake) {
    const sinceTime = since.getTime();
    waterDays = user.waterIntake.filter(w => new Date(w.date).getTime() >= sinceTime && w.amount >= (user.waterGoal || 2000)).length;
  }

  // Daily breakdown
  const dailyBreakdown = [];
  for (let i = 0; i < period; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0);
    const dayStr = d.toISOString().split('T')[0];
    const dayWorkouts = workouts.filter(w => new Date(w.date).toISOString().split('T')[0] === dayStr);
    const dayMeals = meals.filter(m => new Date(m.date).toISOString().split('T')[0] === dayStr);
    dailyBreakdown.push({
      date: dayStr,
      workouts: dayWorkouts.length,
      calories: dayWorkouts.reduce((s, w) => s + w.calories, 0),
      duration: dayWorkouts.reduce((s, w) => s + w.duration, 0),
      mealsLogged: dayMeals.length,
      mealCalories: dayMeals.reduce((s, m) => s + m.calories, 0),
    });
  }

  sendSuccess(res, {
    period: req.query.period === 'monthly' ? 'monthly' : 'weekly',
    totalWorkouts: workouts.length,
    totalCalories,
    totalDuration,
    prevTotalWorkouts: prevWorkouts.length,
    prevTotalCalories: prevCalories,
    prevTotalDuration: prevDuration,
    nutrition: { calories: mealCalories, protein: mealProtein, carbs: mealCarbs, fat: mealFat },
    waterGoalDays: waterDays,
    dailyBreakdown: dailyBreakdown.reverse(),
  }, 'Report generated');
});


// Export all user data
exports.exportData = asyncHandler(async (req, res) => {
  const format = req.query.format || 'json';

  const [workouts, meals] = await Promise.all([
    Workout.find({ user: req.user.id }).sort({ date: -1 }).lean(),
    Meal.find({ user: req.user.id }).sort({ date: -1 }).lean(),
  ]);

  if (format === 'csv') {
    let csv = 'Type,Name,Date,Duration,Calories,Reps,Weight,Protein,Carbs,Fat,Notes\n';
    for (const w of workouts) {
      csv += `workout,"${w.exerciseName}",${new Date(w.date).toISOString().split('T')[0]},${w.duration},${w.calories},${w.reps || ''},${w.weight || ''},,,,${(w.notes || '').replace(/"/g, '""')}\n`;
    }
    for (const m of meals) {
      csv += `meal,"${m.name}",${new Date(m.date).toISOString().split('T')[0]},,${m.calories},,,${m.protein},${m.carbs},${m.fat},\n`;
    }
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=fitness-data.csv');
    return res.send(csv);
  }

  sendSuccess(res, { workouts, meals }, 'Data exported');
});

