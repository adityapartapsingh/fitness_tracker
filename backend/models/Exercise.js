const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    category: {
        type: String,
        enum: ['strength', 'cardio', 'flexibility', 'balance'],
        required: true,
    },
    muscleGroups: [{ type: String }],
    difficulty: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced'],
        default: 'beginner',
    },
    equipment: { type: String, default: 'bodyweight' },
    instructions: { type: String, default: '' },
    caloriesPerMinute: { type: Number, default: 5 },
    imageUrl: { type: String, default: '' },
});

exerciseSchema.index({ category: 1 });
exerciseSchema.index({ difficulty: 1 });
exerciseSchema.index({ muscleGroups: 1 });

module.exports = mongoose.model('Exercise', exerciseSchema);
