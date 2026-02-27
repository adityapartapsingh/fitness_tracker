const mongoose = require('mongoose');

const bodyMeasurementSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    date: { type: Date, default: Date.now },
    weight: { type: Number, default: null },     // kg
    waist: { type: Number, default: null },      // cm
    chest: { type: Number, default: null },      // cm
    arms: { type: Number, default: null },       // cm
    thighs: { type: Number, default: null },     // cm
    hips: { type: Number, default: null },       // cm
    bodyFat: { type: Number, default: null },    // percentage
    createdAt: { type: Date, default: Date.now },
});

bodyMeasurementSchema.index({ user: 1, date: -1 });

module.exports = mongoose.model('BodyMeasurement', bodyMeasurementSchema);
