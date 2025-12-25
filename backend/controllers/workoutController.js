const Workout = require('../models/Workout');
const { sendSuccess, sendError } = require('../utils/responseHandler');
const asyncHandler = require('../middleware/asyncHandler');

/**
 * Get all workouts for authenticated user
 */
exports.getAllWorkouts = asyncHandler(async (req, res) => {
  const workouts = await Workout.find({ user: req.user.id }).sort({ date: -1 });
  sendSuccess(res, workouts, 'Workouts retrieved successfully');
});

/**
 * Get workout by ID
 */
exports.getWorkoutById = asyncHandler(async (req, res) => {
  const workout = await Workout.findById(req.params.id);

  if (!workout) {
    return sendError(res, 'Workout not found', 404);
  }

  // Verify ownership
  if (workout.user.toString() !== req.user.id) {
    return sendError(res, 'Unauthorized', 403);
  }

  sendSuccess(res, workout, 'Workout retrieved successfully');
});

/**
 * Create new workout
 */
exports.createWorkout = asyncHandler(async (req, res) => {
  const { exerciseName, duration, calories, reps, weight, notes } = req.body;

  // Validation
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

/**
 * Update workout
 */
exports.updateWorkout = asyncHandler(async (req, res) => {
  const workout = await Workout.findById(req.params.id);

  if (!workout) {
    return sendError(res, 'Workout not found', 404);
  }

  // Verify ownership
  if (workout.user.toString() !== req.user.id) {
    return sendError(res, 'Unauthorized', 403);
  }

  const { exerciseName, duration, calories, reps, weight, notes } = req.body;

  // Update fields if provided
  if (exerciseName) workout.exerciseName = exerciseName;
  if (duration) workout.duration = duration;
  if (calories) workout.calories = calories;
  if (reps !== undefined) workout.reps = reps;
  if (weight !== undefined) workout.weight = weight;
  if (notes) workout.notes = notes;

  const updatedWorkout = await workout.save();
  sendSuccess(res, updatedWorkout, 'Workout updated successfully');
});

/**
 * Delete workout
 */
exports.deleteWorkout = asyncHandler(async (req, res) => {
  const workout = await Workout.findById(req.params.id);

  if (!workout) {
    return sendError(res, 'Workout not found', 404);
  }

  // Verify ownership
  if (workout.user.toString() !== req.user.id) {
    return sendError(res, 'Unauthorized', 403);
  }

  await Workout.findByIdAndDelete(req.params.id);
  sendSuccess(res, null, 'Workout deleted successfully');
});

/**
 * Get workout statistics
 */
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
