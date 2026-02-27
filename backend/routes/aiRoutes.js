const express = require('express');
const aiController = require('../controllers/aiController');

const router = express.Router();


router.post('/workout', aiController.generateWorkoutPlan);
router.post('/meal', aiController.generateMealPlan);
router.post('/nutrition', aiController.nutritionLookup);
router.get('/insights', aiController.getInsights);

router.get('/status', aiController.checkAIStatus);

module.exports = router;
