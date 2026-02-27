const express = require('express');
const router = express.Router();
const exerciseController = require('../controllers/exerciseController');

router.get('/', exerciseController.getAll);
router.get('/categories', exerciseController.getCategories);
router.get('/:id', exerciseController.getById);

module.exports = router;
