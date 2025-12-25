const express = require('express');
const aiController = require('../controllers/aiController');

const router = express.Router();


router.post('/workout', aiController.generateWorkoutPlan);

router.get('/status', aiController.checkAIStatus);

module.exports = router;
