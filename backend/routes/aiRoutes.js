const express = require('express');
const aiController = require('../controllers/aiController');

const router = express.Router();

/**
 * AI Personal Trainer Routes
 * All routes require authentication (authMiddleware)
 */

/**
 * POST /api/ai/workout
 * Generate a personalized workout plan using AI
 * 
 * Body: {
 *   prompt: string, // required
 *   provider?: string, // optional, e.g. 'openai' or 'gemini'
 *   model?: string    // optional, e.g. 'gpt-4o-mini' or 'gemini-1.0'
 * }
 * Example: { "prompt": "I have back pain and only 20 minutes. Give me a safe workout.", "provider": "openai", "model": "gpt-4o-mini" }
 */
router.post('/workout', aiController.generateWorkoutPlan);

/**
 * GET /api/ai/status
 * Check if AI trainer is available and which model is being used
 */
router.get('/status', aiController.checkAIStatus);

module.exports = router;
