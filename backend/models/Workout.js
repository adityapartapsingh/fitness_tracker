const mongoose = require('mongoose');

const workoutSchema = new mongoose.Schema({
  exerciseName: {
    type: String,
    required: true,
  },
  duration: {
    type: Number,
    required: true,
    default: 0,
  },
  calories: {
    type: Number,
    required: true,
    default: 0,
  },
  reps: {
    type: Number,
    default: null,
  },
  weight: {
    type: Number,
    default: null,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  notes: {
    type: String,
    default: '',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Workout', workoutSchema);
