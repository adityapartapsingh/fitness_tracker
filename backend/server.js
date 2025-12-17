const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
// Try MongoDB Atlas first, fall back to local MongoDB if needed
const MONGODB_ATLAS_URI = `mongodb+srv://adityapartapsingh92_db_user:rJpnM19withuV4wp@cluster0.izjhalr.mongodb.net/?appName=Cluster0`;
const MONGODB_LOCAL_URI = 'mongodb://localhost:27017/fitness_tracker';
const MONGODB_URI = process.env.MONGODB_URI || MONGODB_ATLAS_URI;

// Connect to MongoDB with automatic reconnection
let mongoConnected = false;

const connectMongoDB = () => {
  mongoose.connect(MONGODB_URI, {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    retryWrites: true,
    w: 'majority',
  })
    .then(() => {
      mongoConnected = true;
      console.log('✅ MongoDB connected successfully');
    })
    .catch((err) => {
      mongoConnected = false;
      console.log('⚠️  MongoDB connection error (will retry):', err.message);
      // Retry connection every 5 seconds
      setTimeout(connectMongoDB, 5000);
    });
};

connectMongoDB();

// Models
const Workout = require('./models/Workout');
const User = require('./models/User');

// Auth
const jwt = require('jsonwebtoken');
const authRoutes = require('./routes/authRoutes');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

// Auth middleware
const authMiddleware = (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ message: 'Unauthorized' });
  const token = auth.split(' ')[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Use Auth Routes
app.use('/api/auth', authRoutes);

// Routes

// GET all workouts
app.get('/api/workouts', authMiddleware, async (req, res) => {
  try {
    const workouts = await Workout.find({ user: req.user.id }).sort({ date: -1 });
    res.json(workouts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET workout by ID
app.get('/api/workouts/:id', authMiddleware, async (req, res) => {
  try {
    const workout = await Workout.findById(req.params.id);
    if (!workout) return res.status(404).json({ message: 'Workout not found' });
    if (workout.user && workout.user.toString() !== req.user.id) return res.status(404).json({ message: 'Workout not found' });
    res.json(workout);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// CREATE new workout
app.post('/api/workouts', authMiddleware, async (req, res) => {
  const { exerciseName, duration, calories, reps, weight, date, notes } = req.body;

  const workout = new Workout({
    user: req.user.id,
    exerciseName,
    duration,
    calories,
    reps,
    weight,
    date: date || new Date(),
    notes,
  });

  try {
    const newWorkout = await workout.save();
    res.status(201).json(newWorkout);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// UPDATE workout
app.put('/api/workouts/:id', authMiddleware, async (req, res) => {
  try {
    const workout = await Workout.findById(req.params.id);
    if (!workout) return res.status(404).json({ message: 'Workout not found' });
    if (workout.user && workout.user.toString() !== req.user.id) return res.status(403).json({ message: 'Forbidden' });

    if (req.body.exerciseName) workout.exerciseName = req.body.exerciseName;
    if (req.body.duration) workout.duration = req.body.duration;
    if (req.body.calories) workout.calories = req.body.calories;
    if (req.body.reps) workout.reps = req.body.reps;
    if (req.body.weight) workout.weight = req.body.weight;
    if (req.body.date) workout.date = req.body.date;
    if (req.body.notes) workout.notes = req.body.notes;

    const updatedWorkout = await workout.save();
    res.json(updatedWorkout);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE workout
app.delete('/api/workouts/:id', authMiddleware, async (req, res) => {
  try {
    const workout = await Workout.findById(req.params.id);
    if (!workout) return res.status(404).json({ message: 'Workout not found' });
    if (workout.user && workout.user.toString() !== req.user.id) return res.status(403).json({ message: 'Forbidden' });

    await Workout.findByIdAndDelete(req.params.id);
    res.json({ message: 'Workout deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET workout statistics
app.get('/api/stats/summary', authMiddleware, async (req, res) => {
  try {
    const workouts = await Workout.find({ user: req.user.id });
    const totalWorkouts = workouts.length;
    const totalCalories = workouts.reduce((sum, w) => sum + (w.calories || 0), 0);
    const totalDuration = workouts.reduce((sum, w) => sum + (w.duration || 0), 0);
    const avgCalories = totalWorkouts > 0 ? totalCalories / totalWorkouts : 0;

    res.json({
      totalWorkouts,
      totalCalories,
      totalDuration,
      avgCalories,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'Server running',
    mongodb: mongoConnected ? 'Connected' : 'Disconnected - retrying...',
    timestamp: new Date(),
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
