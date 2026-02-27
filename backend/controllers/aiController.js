const User = require('../models/User');
const Workout = require('../models/Workout');

exports.generateWorkoutPlan = async (req, res) => {

  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  const GEMINI_API_URL = process.env.GEMINI_API_URL;
  const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash';

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
    const aiProviders = require('../lib/aiProviders');
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

exports.checkAIStatus = async (req, res) => {
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


// AI Meal Plan Suggestions
exports.generateMealPlan = async (req, res) => {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  const GEMINI_API_URL = process.env.GEMINI_API_URL;
  const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash';

  if (!GEMINI_API_KEY || !GEMINI_API_URL) {
    return res.status(500).json({ message: 'AI not configured' });
  }

  const userPrompt = req.body.prompt || 'Suggest a healthy meal plan for today';

  try {
    const user = await User.findById(req.user.id).select('-password -otpHash').lean();
    const Meal = require('../models/Meal');
    const recentMeals = await Meal.find({ user: req.user.id }).sort({ date: -1 }).limit(10).lean();

    const systemMessage = `You are a concise nutrition advisor. Rules:
    1. Suggest meals based on user's profile (age, weight, goals).
    2. Include calories, protein, carbs, fat per meal.
    3. Keep suggestions practical and easy to prepare.
    4. Consider recent meals to add variety.
    5. Format clearly with meal names and macros.
    6. Keep under 300 words.
    7. Only discuss nutrition/food topics.`;

    const userMessage = `User: ${JSON.stringify({ weight: user?.weight, age: user?.age, gender: user?.gender })}
Recent meals: ${JSON.stringify(recentMeals.map(m => ({ name: m.name, type: m.mealType, cal: m.calories })))}
Request: ${userPrompt}`;

    const aiProviders = require('../lib/aiProviders');
    const aiResult = await aiProviders.requestAI({ provider: 'gemini', model: GEMINI_MODEL, systemMessage, userMessage, apiKey: GEMINI_API_KEY, apiUrl: GEMINI_API_URL });

    if (aiResult.error) return res.status(502).json({ message: 'AI error', detail: aiResult.error });
    return res.json({ assistant: aiResult.assistantText });
  } catch (err) {
    console.error('AI meal error:', err);
    return res.status(500).json({ message: 'AI meal generation failed', error: err.message });
  }
};


// AI Insights
exports.getInsights = async (req, res) => {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  const GEMINI_API_URL = process.env.GEMINI_API_URL;
  const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash';

  if (!GEMINI_API_KEY || !GEMINI_API_URL) {
    return res.status(500).json({ message: 'AI not configured' });
  }

  try {
    const user = await User.findById(req.user.id).select('-password -otpHash').lean();
    const workouts = await Workout.find({ user: req.user.id }).sort({ date: -1 }).limit(30).lean();
    const Meal = require('../models/Meal');
    const meals = await Meal.find({ user: req.user.id }).sort({ date: -1 }).limit(30).lean();

    const systemMessage = `You are a fitness insights analyst. Analyze the user's workout and nutrition data and provide:
    1. Key patterns noticed (e.g., muscle groups neglected, workout frequency)
    2. Top 3 actionable recommendations
    3. Positive highlights and encouragement
    Keep under 250 words. Be specific, data-driven, and motivating.`;

    const userMessage = `Profile: ${JSON.stringify({ weight: user?.weight, height: user?.height, age: user?.age, streak: user?.currentStreak })}
Last 30 workouts: ${JSON.stringify(workouts.map(w => ({ name: w.exerciseName, date: new Date(w.date).toISOString().split('T')[0], duration: w.duration, cal: w.calories })))}
Last 30 meals: ${JSON.stringify(meals.map(m => ({ name: m.name, type: m.mealType, cal: m.calories, protein: m.protein })))}`;

    const aiProviders = require('../lib/aiProviders');
    const aiResult = await aiProviders.requestAI({ provider: 'gemini', model: GEMINI_MODEL, systemMessage, userMessage, apiKey: GEMINI_API_KEY, apiUrl: GEMINI_API_URL });

    if (aiResult.error) return res.status(502).json({ message: 'AI error', detail: aiResult.error });
    return res.json({ assistant: aiResult.assistantText });
  } catch (err) {
    console.error('AI insights error:', err);
    return res.status(500).json({ message: 'AI insights failed', error: err.message });
  }
};

// AI-Powered Nutrition Lookup — auto-fills calories, protein, carbs, fat for a food name
exports.nutritionLookup = async (req, res) => {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  const GEMINI_API_URL = process.env.GEMINI_API_URL;
  const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash';

  if (!GEMINI_API_KEY || !GEMINI_API_URL) {
    return res.status(500).json({ message: 'AI not configured' });
  }

  const { food, servingSize } = req.body;
  if (!food || typeof food !== 'string') {
    return res.status(400).json({ message: 'Please provide a food name, e.g. { "food": "grilled chicken breast" }' });
  }

  try {
    const systemMessage = `You are a nutrition database API. Given a food item and optional serving size, return ONLY a valid JSON object (no markdown, no code fences, no explanation) with these exact keys:
{
  "name": "cleaned/proper food name",
  "calories": number,
  "protein": number (grams),
  "carbs": number (grams),
  "fat": number (grams),
  "servingSize": "description of serving (e.g. 1 cup, 100g, 1 medium)"
}
Rules:
- Use standard USDA-like nutritional values
- If serving size is not specified, use a typical single serving
- Round all numbers to nearest integer
- Return ONLY the JSON, nothing else — no text before or after`;

    const userMessage = `Food: "${food}"${servingSize ? `, Serving: ${servingSize}` : ''}`;

    const aiProviders = require('../lib/aiProviders');
    const aiResult = await aiProviders.requestAI({
      provider: 'gemini',
      model: GEMINI_MODEL,
      systemMessage,
      userMessage,
      apiKey: GEMINI_API_KEY,
      apiUrl: GEMINI_API_URL,
    });

    if (aiResult.error) {
      return res.status(502).json({ message: 'AI lookup failed', detail: aiResult.error });
    }

    // Parse JSON from AI response — strip markdown fences if present
    let text = (aiResult.assistantText || '').trim();
    text = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim();

    let nutrition;
    try {
      nutrition = JSON.parse(text);
    } catch (parseErr) {
      console.error('AI nutrition parse error:', text);
      return res.status(502).json({ message: 'AI returned invalid nutrition data', raw: text });
    }

    // Validate expected fields
    const result = {
      name: nutrition.name || food,
      calories: Math.round(Number(nutrition.calories) || 0),
      protein: Math.round(Number(nutrition.protein) || 0),
      carbs: Math.round(Number(nutrition.carbs) || 0),
      fat: Math.round(Number(nutrition.fat) || 0),
      servingSize: nutrition.servingSize || '1 serving',
    };

    return res.json({ success: true, data: result });
  } catch (err) {
    console.error('Nutrition lookup error:', err);
    return res.status(500).json({ message: 'Nutrition lookup failed', error: err.message });
  }
};
