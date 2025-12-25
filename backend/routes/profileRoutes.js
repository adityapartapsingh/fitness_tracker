const express = require('express');
const profileController = require('../controllers/profileController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Profile routes
router.get('/profile', profileController.getProfile);
router.put('/profile', profileController.updateProfile);

// Water intake routes
router.post('/water', profileController.addWaterIntake);
router.get('/water/today', profileController.getTodayWaterIntake);
router.get('/water/history', profileController.getWaterHistory);

// BMI calculation
router.get('/bmi', profileController.calculateBMI);

module.exports = router;
