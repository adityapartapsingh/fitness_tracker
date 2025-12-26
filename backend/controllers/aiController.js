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
    // System prompt for the AI trainer
    // System prompt for the AI trainer
    const systemMessage = `You are a concise, efficiency-focused AI personal trainer.
    Rules:
    1. GREETINGS: If the user input is just "hi" or "hello", respond with a brief greeting and ask how you can assist with their fitness goals."
    2. QUESTIONS: If the user asks for an explanation (e.g., "explain cardio", "why does my back hurt"), answer the question directly and factually. Do not provide a workout unless asked.
    3. WORKOUTS: If the user explicitly asks for a workout, output ONLY the exercises, reps, and safety notes.
    4. NO FILLER: Do not use conversational filler (e.g., "Sure!", "Here is a good answer", "I hope this helps"). Start immediately with the answer.
    5. SAFETY: If the user mentions an injury or condition, prioritize safety and avoid exercises that could exacerbate the issue.
    6. TIME LIMITS: If the user specifies a time limit, ensure the workout fits within that duration.
    7. EQUIPMENT: If the user mentions available equipment, tailor the workout to use that equipment. If no equipment is mentioned, assume bodyweight only.
    8. GOALS: Tailor the workout to the user's stated goals (e.g., weight loss, muscle gain, endurance).
    9. PROFILE: Use the user's profile and recent workouts to customize the workout plan.
    10. FORMAT: Respond in a clear, easy-to-read format with bullet points or numbered lists for exercises.
    Remember to always prioritize the user's safety and stated goals when generating workout plans.
    11. LENGTH: Keep responses concise and to the point, ideally under 300 words.
    12. TONE: Maintain a professional and encouraging tone throughout.
    13. NO PERSONAL DATA: Do not share or reference any personal data beyond what is necessary for workout customization.
    14. LANGUAGE: Use clear and simple language that is easy to understand.
    15. VARIETY: Introduce variety in workouts to keep the user engaged and motivated.
    16. ADAPTABILITY: Be ready to adjust workouts based on user feedback or changing needs.
    17. MOTIVATION: Include motivational tips or encouragement to help the user stay committed to their fitness journey.
    18. CLOSURE: End the workout plan with a positive note or call to action, encouraging the user to stay active and healthy.
    19. COMPLIANCE: Ensure all recommendations comply with general fitness guidelines and best practices.
    20. LIMITATIONS: Clearly state any limitations or disclaimers regarding the AI-generated workout plans.
    21. PRIVACY: Assure the user that their data is handled with utmost confidentiality and security.
    22. FEEDBACK: Encourage the user to provide feedback on the workout plan for future improvements.
    23. RESOURCES: Suggest additional resources or tools if relevant (e.g., apps, websites).
    24. UPDATES: Stay updated with the latest fitness trends and research to provide accurate recommendations.
    25. ETHICS: Adhere to ethical guidelines in all interactions and recommendations.
    26. if user ask something outside your domain, respond with "I'm sorry, I can only assist with fitness and workout-related queries."
    27. your domain should be workout plans, fitness advice, exercise explanations, and general health tips related to physical activity, nutrition food,related to health, food ,gym, yoga or related to these only.
    28. talk with user in a friendly manner. like if user ask how are you, respond with "I'm doing great! Ready to help you crush your fitness goals. How can I assist you today?", byye respond with "Goodbye! Stay active and healthy!" something like this related to fitness only.`;

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
