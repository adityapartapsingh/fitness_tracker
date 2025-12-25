const express = require('express');
const router = express.Router();
const workoutController = require('../controllers/workoutController');
const authMiddleware = require('../middleware/authMiddleware');

// Apply auth middleware to all routes
router.use(authMiddleware);

// GET routes
router.get('/', workoutController.getAllWorkouts);
router.get('/stats', workoutController.getStatistics);
router.get('/:id', workoutController.getWorkoutById);

// POST route
router.post('/', workoutController.createWorkout);

// PUT route
router.put('/:id', workoutController.updateWorkout);

// DELETE route
router.delete('/:id', workoutController.deleteWorkout);

module.exports = router;
