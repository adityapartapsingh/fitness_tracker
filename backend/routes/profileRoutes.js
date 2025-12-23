const express = require('express');
const profileController = require('../controllers/profileController');
const { verifyToken } = require('../middleware/authMiddleware');

const router = express.Router();

// Profile routes
router.get('/profile', verifyToken, profileController.getProfile);
router.put('/profile', verifyToken, profileController.updateProfile);

// Water intake routes
router.post('/water', verifyToken, profileController.addWaterIntake);
router.get('/water/today', verifyToken, profileController.getTodayWaterIntake);
router.get('/water/history', verifyToken, profileController.getWaterHistory);

// BMI calculation
router.get('/bmi', verifyToken, profileController.calculateBMI);

module.exports = router;
