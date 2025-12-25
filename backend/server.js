require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Import configuration and middleware
const { connectMongoDB } = require('./config/database');
const { PORT } = require('./config/constants');
const errorHandler = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes');
const workoutRoutes = require('./routes/workoutRoutes');
const aiRoutes = require('./routes/aiRoutes');
const authMiddleware = require('./middleware/authMiddleware');

// Initialize app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
connectMongoDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', profileRoutes);
app.use('/api/workouts', workoutRoutes);
app.use('/api/ai', authMiddleware, aiRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'Server running',
    timestamp: new Date(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// Global error handling middleware (must be last)
app.use(errorHandler);

// 404 Not Found handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
});
