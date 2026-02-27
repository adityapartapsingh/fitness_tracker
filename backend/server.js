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
const exerciseRoutes = require('./routes/exerciseRoutes');
const mealRoutes = require('./routes/mealRoutes');
const bodyMeasurementRoutes = require('./routes/bodyMeasurementRoutes');
const achievementRoutes = require('./routes/achievementRoutes');
const authMiddleware = require('./middleware/authMiddleware');
const cron = require('node-cron');
const User = require('./models/User');
const sendEmail = require('./utils/sendEmail');
const { sendPush } = require('./utils/pushService');

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
app.use('/api/exercises', exerciseRoutes);
app.use('/api/meals', mealRoutes);
app.use('/api/measurements', bodyMeasurementRoutes);
app.use('/api/achievements', achievementRoutes);

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
  // Schedule daily reminders (default: 08:00 server time)
  try {
    const cronExpression = process.env.DAILY_REMINDER_CRON || '0 8 * * *';
    cron.schedule(cronExpression, async () => {
      console.log('⏰ Running daily reminders job...');
      try {
        const users = await User.find({ isVerified: true });
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (const user of users) {
          try {
            // Calculate today's water intake
            const todayIntakeEntry = (user.waterIntake || []).find(w => {
              const d = new Date(w.date);
              d.setHours(0, 0, 0, 0);
              return d.getTime() === today.getTime();
            });

            const todayAmount = todayIntakeEntry ? todayIntakeEntry.amount : 0;
            const waterGoal = user.waterGoal || 2000;

            // Determine whether to send water reminder
            const shouldRemindWater = todayAmount < waterGoal;

            // Determine whether to send streak reminder
            let lastWorkoutDate = user.lastWorkoutDate ? new Date(user.lastWorkoutDate) : null;
            if (lastWorkoutDate) { lastWorkoutDate.setHours(0, 0, 0, 0); }
            const missedTodayWorkout = !lastWorkoutDate || lastWorkoutDate.getTime() !== today.getTime();

            if (!shouldRemindWater && !missedTodayWorkout) continue; // nothing to do

            // Compose email text/html
            let subject = 'Fitness Tracker: Daily Reminder';
            let html = `<p>Hi ${user.name || 'there'},</p>`;

            if (shouldRemindWater) {
              html += `<p>We noticed you've logged <strong>${todayAmount} ml</strong> of water today. Your daily goal is <strong>${waterGoal} ml</strong>. Keep hydrated — try to reach your goal!</p>`;
            }

            if (missedTodayWorkout) {
              html += `<p>It looks like you haven't logged a workout today. Keep your streak going — add a quick workout to maintain your progress.</p>`;
            }

            html += `<p>— Fitness Tracker</p>`;

            // Send email
            try {
              await sendEmail(user.email, { subject, html, text: html });
            } catch (err) {
              console.error('Failed to send daily reminder email to', user.email, err.message || err);
            }

            // Send push notifications if subscriptions exist
            if (Array.isArray(user.pushSubscriptions) && user.pushSubscriptions.length) {
              const payload = {
                title: 'Daily Reminder',
                body: shouldRemindWater ? `Water: ${todayAmount}/${waterGoal} ml` : 'Don\'t forget your workout today!',
                url: process.env.FRONTEND_URL || 'http://localhost:3000',
              };

              const subsToKeep = [];
              for (const sub of user.pushSubscriptions) {
                try {
                  await sendPush(sub, payload);
                  subsToKeep.push(sub);
                } catch (err) {
                  // If subscription is gone/invalid, drop it
                  const statusCode = err && err.statusCode;
                  if (statusCode && (statusCode === 404 || statusCode === 410)) {
                    console.log('Removing invalid push subscription for user', user.email);
                  } else {
                    console.error('Push send error for', user.email, err && err.message ? err.message : err);
                    subsToKeep.push(sub); // keep if transient error
                  }
                }
              }

              // Save pruned subscriptions if changed
              if (subsToKeep.length !== user.pushSubscriptions.length) {
                user.pushSubscriptions = subsToKeep;
                await user.save();
              }
            }

          } catch (err) {
            console.error('Error processing reminders for user', user.email, err && err.message ? err.message : err);
          }
        }

        console.log('✅ Daily reminders job completed');
      } catch (jobErr) {
        console.error('Daily reminders job failed:', jobErr && jobErr.message ? jobErr.message : jobErr);
      }
    });
    console.log('Scheduled daily reminders with cron:', cronExpression);
  } catch (e) {
    console.error('Failed to schedule daily reminders:', e && e.message ? e.message : e);
  }
});
