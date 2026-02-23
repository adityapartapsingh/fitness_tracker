const express = require('express');
const profileController = require('../controllers/profileController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();
router.use(authMiddleware);
router.get('/profile', profileController.getProfile);
router.put('/profile', profileController.updateProfile);

router.post('/water', profileController.addWaterIntake);
router.get('/water/today', profileController.getTodayWaterIntake);
router.get('/water/history', profileController.getWaterHistory);

router.post('/subscribe', profileController.subscribePush);
router.post('/unsubscribe', profileController.unsubscribePush);

router.get('/bmi', profileController.calculateBMI);

module.exports = router;
