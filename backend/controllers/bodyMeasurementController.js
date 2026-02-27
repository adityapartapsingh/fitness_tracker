const BodyMeasurement = require('../models/BodyMeasurement');
const { sendSuccess, sendError } = require('../utils/responseHandler');
const asyncHandler = require('../middleware/asyncHandler');

// CREATE measurement
exports.create = asyncHandler(async (req, res) => {
    const { weight, waist, chest, arms, thighs, hips, bodyFat, date } = req.body;

    if (!weight && !waist && !chest && !arms && !thighs && !hips && !bodyFat) {
        return sendError(res, 'At least one measurement is required', 400);
    }

    const measurement = new BodyMeasurement({
        user: req.user.id,
        date: date || new Date(),
        weight, waist, chest, arms, thighs, hips, bodyFat,
    });

    const saved = await measurement.save();
    sendSuccess(res, saved, 'Measurement logged successfully', 201);
});

// GET all measurements
exports.getAll = asyncHandler(async (req, res) => {
    const measurements = await BodyMeasurement.find({ user: req.user.id })
        .sort({ date: -1 })
        .limit(100);
    sendSuccess(res, measurements, 'Measurements retrieved successfully');
});

// GET latest measurement
exports.getLatest = asyncHandler(async (req, res) => {
    const latest = await BodyMeasurement.findOne({ user: req.user.id })
        .sort({ date: -1 });
    sendSuccess(res, latest, 'Latest measurement retrieved');
});
