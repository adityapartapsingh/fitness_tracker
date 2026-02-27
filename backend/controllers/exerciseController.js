const Exercise = require('../models/Exercise');
const { sendSuccess, sendError } = require('../utils/responseHandler');
const asyncHandler = require('../middleware/asyncHandler');

// GET all exercises with optional filters
exports.getAll = asyncHandler(async (req, res) => {
    const { category, difficulty, muscleGroup, search } = req.query;
    const filter = {};

    if (category) filter.category = category;
    if (difficulty) filter.difficulty = difficulty;
    if (muscleGroup) filter.muscleGroups = { $in: [muscleGroup] };
    if (search) filter.name = { $regex: search, $options: 'i' };

    const exercises = await Exercise.find(filter).sort({ name: 1 });
    sendSuccess(res, exercises, 'Exercises retrieved successfully');
});

// GET single exercise
exports.getById = asyncHandler(async (req, res) => {
    const exercise = await Exercise.findById(req.params.id);
    if (!exercise) return sendError(res, 'Exercise not found', 404);
    sendSuccess(res, exercise, 'Exercise retrieved successfully');
});

// GET all unique categories
exports.getCategories = asyncHandler(async (req, res) => {
    const categories = await Exercise.distinct('category');
    const muscleGroups = await Exercise.distinct('muscleGroups');
    sendSuccess(res, { categories, muscleGroups }, 'Categories retrieved');
});
