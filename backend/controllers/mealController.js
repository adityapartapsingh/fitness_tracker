const Meal = require('../models/Meal');
const { sendSuccess, sendError } = require('../utils/responseHandler');
const asyncHandler = require('../middleware/asyncHandler');

// CREATE meal
exports.create = asyncHandler(async (req, res) => {
    const { name, mealType, calories, protein, carbs, fat, date } = req.body;
    if (!name || !mealType || calories === undefined) {
        return sendError(res, 'name, mealType, and calories are required', 400);
    }
    const meal = new Meal({
        user: req.user.id,
        name, mealType, calories,
        protein: protein || 0,
        carbs: carbs || 0,
        fat: fat || 0,
        date: date || new Date(),
    });
    const saved = await meal.save();
    sendSuccess(res, saved, 'Meal logged successfully', 201);
});

// GET all meals (optional date range)
exports.getAll = asyncHandler(async (req, res) => {
    const { startDate, endDate } = req.query;
    const filter = { user: req.user.id };
    if (startDate || endDate) {
        filter.date = {};
        if (startDate) filter.date.$gte = new Date(startDate);
        if (endDate) filter.date.$lte = new Date(endDate);
    }
    const meals = await Meal.find(filter).sort({ date: -1 });
    sendSuccess(res, meals, 'Meals retrieved successfully');
});

// GET today's nutrition summary
exports.getTodaySummary = asyncHandler(async (req, res) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const meals = await Meal.find({
        user: req.user.id,
        date: { $gte: today, $lt: tomorrow },
    }).sort({ date: 1 });

    const summary = {
        meals,
        totals: {
            calories: meals.reduce((s, m) => s + m.calories, 0),
            protein: meals.reduce((s, m) => s + m.protein, 0),
            carbs: meals.reduce((s, m) => s + m.carbs, 0),
            fat: meals.reduce((s, m) => s + m.fat, 0),
            count: meals.length,
        },
    };
    sendSuccess(res, summary, "Today's nutrition summary");
});

// DELETE meal
exports.delete = asyncHandler(async (req, res) => {
    const meal = await Meal.findById(req.params.id);
    if (!meal) return sendError(res, 'Meal not found', 404);
    if (meal.user.toString() !== req.user.id) return sendError(res, 'Unauthorized', 403);
    await Meal.findByIdAndDelete(req.params.id);
    sendSuccess(res, null, 'Meal deleted successfully');
});
