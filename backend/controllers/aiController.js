const User = require('../models/User');
const Workout = require('../models/Workout');

/**
 * POST /api/ai/workout
 * AI Personal Trainer endpoint
 * Sends user profile + prompt to OpenAI API and returns personalized workout recommendation
 * 
 * Body: { prompt: string }
 * Example: { "prompt": "I have back pain and only 20 minutes. Give me a safe workout plan." }
 */
exports.generateWorkoutPlan = async (req, res) => {
  // Only Gemini provider is supported
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  const GEMINI_API_URL = process.env.GEMINI_API_URL;
  const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash';

  // Validate Gemini key and URL
  if (!GEMINI_API_KEY || !GEMINI_API_URL) {
    return res.status(500).json({ 
      message: 'Gemini provider requires GEMINI_API_KEY and GEMINI_API_URL in .env.'
    });
  }

  const userPrompt = req.body.prompt || req.body.request || '';
  if (!userPrompt || typeof userPrompt !== 'string') {
    return res.status(400).json({ 
      message: 'Please provide a prompt in the request body, e.g. { "prompt": "I have back pain and 20 minutes, give me a workout" }' 
    });
  }

  try {
    // Load user's profile and recent workouts
    const user = await User.findById(req.user.id)
      .select('-password -otpHash -passwordResetToken -passwordResetOtpHash')
      .lean();

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const recentWorkouts = await Workout.find({ user: req.user.id })
      .sort({ date: -1 })
      .limit(7)
      .lean();

    // Build profile context for the AI
    const profileContext = {
      id: user._id,
      name: user.name,
      age: user.age || null,
      gender: user.gender || null,
      height_cm: user.height || null,
      weight_kg: user.weight || null,
      currentStreak: user.currentStreak || 0,
      longestStreak: user.longestStreak || 0,
      streakPoints: user.streakPoints || 0,
      lastWorkoutDate: user.lastWorkoutDate || null,
      waterGoal: user.waterGoal || null
    };

    const recent = recentWorkouts.map(w => ({
      date: w.date ? new Date(w.date).toISOString().split('T')[0] : null,
      exerciseName: w.exerciseName,
      duration: w.duration,
      calories: w.calories,
      notes: w.notes || ''
    }));

    // System prompt for the AI trainer
    const systemMessage = `You are an experienced, safety-conscious AI personal trainer. Use the user's profile and recent workout history to craft a short, safe, and effective workout plan. If the user reports pain or limitations (e.g., back pain), prioritize gentle corrective movements, mobility, and caution. Provide clear steps, durations, and brief safety notes. Keep the plan appropriate for the user's stated time availability.`;

    const userMessage = `User profile: ${JSON.stringify(profileContext)}\nRecent workouts (up to 7): ${JSON.stringify(recent)}\nUser request: ${userPrompt}`;

    // Delegate to provider adapter
    const aiProviders = require('../lib/aiProviders');
    // Only use Gemini provider
    const provider = 'gemini';
    const model = GEMINI_MODEL;
    const apiKey = GEMINI_API_KEY;
    const apiUrl = GEMINI_API_URL;

    const aiResult = await aiProviders.requestAI({ provider, model, systemMessage, userMessage, apiKey, apiUrl });
    if (aiResult.error) {
      console.error('Gemini AI provider error:', aiResult.error || aiResult.message);
      return res.status(aiResult.status || 502).json({ message: aiResult.message || 'AI provider error', detail: aiResult.errorBody || aiResult.error });
    }

    return res.json({ assistant: aiResult.assistantText, raw: aiResult.raw });
  } catch (err) {
    console.error('AI workout generation error:', err);
    return res.status(500).json({ 
      message: 'AI generation failed', 
      error: err.message 
    });
  }
};

/**
 * GET /api/ai/status
 * Check if AI trainer is available (OpenAI API key configured)
 */
exports.checkAIStatus = async (req, res) => {
  // Only Gemini provider is supported
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  const GEMINI_API_URL = process.env.GEMINI_API_URL;
  const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash';

  const providerConfigured = !!GEMINI_API_KEY && !!GEMINI_API_URL;

  return res.json({
    provider: 'gemini',
    configured: providerConfigured,
    gemini: { available: providerConfigured, model: GEMINI_MODEL, apiUrl: GEMINI_API_URL || null },
    message: providerConfigured ? `Gemini provider appears configured.` : `Gemini provider is not configured. Set GEMINI_API_KEY and GEMINI_API_URL in .env.`
  });
};
