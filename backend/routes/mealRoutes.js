const express = require('express');
const router = express.Router();
const mealController = require('../controllers/mealController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);
router.post('/', mealController.create);
router.get('/', mealController.getAll);
router.get('/today', mealController.getTodaySummary);
router.delete('/:id', mealController.delete);

module.exports = router;
