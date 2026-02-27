const mongoose = require('mongoose');

const mealSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    name: { type: String, required: true },
    mealType: {
        type: String,
        enum: ['breakfast', 'lunch', 'dinner', 'snack'],
        required: true,
    },
    calories: { type: Number, required: true, default: 0 },
    protein: { type: Number, default: 0 },   // grams
    carbs: { type: Number, default: 0 },     // grams
    fat: { type: Number, default: 0 },       // grams
    date: { type: Date, default: Date.now },
    createdAt: { type: Date, default: Date.now },
});

mealSchema.index({ user: 1, date: -1 });

module.exports = mongoose.model('Meal', mealSchema);
