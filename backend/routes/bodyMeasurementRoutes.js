const express = require('express');
const router = express.Router();
const bodyMeasurementController = require('../controllers/bodyMeasurementController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);
router.post('/', bodyMeasurementController.create);
router.get('/', bodyMeasurementController.getAll);
router.get('/latest', bodyMeasurementController.getLatest);

module.exports = router;
