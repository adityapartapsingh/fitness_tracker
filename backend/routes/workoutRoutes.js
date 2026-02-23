const express = require('express');
const router = express.Router();
const workoutController = require('../controllers/workoutController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);


router.get('/', workoutController.getAllWorkouts);
router.get('/stats', workoutController.getStatistics);
router.get('/:id', workoutController.getWorkoutById);


router.post('/', workoutController.createWorkout);
router.put('/:id', workoutController.updateWorkout);
router.delete('/:id', workoutController.deleteWorkout);

module.exports = router;
