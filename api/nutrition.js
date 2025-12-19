/**
 * Vercel Serverless Function - AI Nutrition Coaching
 * URL: /api/nutrition
 */

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { goal, currentDiet, restrictions, activityLevel } = req.body;

    if (!goal) {
      return res.status(400).json({ error: 'goal is required' });
    }

    const openaiKey = process.env.OPENAI_API_KEY;
    if (!openaiKey) {
      return res.status(503).json({
        error: 'OpenAI API key not configured',
        message: 'Add OPENAI_API_KEY in Vercel environment variables'
      });
    }

    const dietInfo = currentDiet ? ` Current diet: ${currentDiet}.` : '';
    const restrictionInfo = restrictions ? ` Dietary restrictions: ${restrictions}.` : '';
    const activityInfo = activityLevel ? ` Activity level: ${activityLevel}.` : '';

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a professional nutritionist and health coach specializing in plant-based nutrition. Provide evidence-based, personalized nutrition advice.'
          },
          {
            role: 'user',
            content: `Create a personalized plant-based nutrition plan for this goal: ${goal}.${dietInfo}${restrictionInfo}${activityInfo} Include: daily calorie target, macronutrient breakdown, meal timing recommendations, key nutrients to focus on, supplement suggestions if needed, and practical tips for success.`
          }
        ],
        temperature: 0.7,
        max_tokens: 1500
      })
    });

    if (!response.ok) {
      const error = await response.json();
      return res.status(response.status).json({ error: 'OpenAI API error', details: error });
    }

    const data = await response.json();
    const nutritionPlan = data.choices[0].message.content;

    res.status(200).json({
      success: true,
      goal,
      nutritionPlan,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Nutrition coaching error:', error);
    res.status(500).json({
      error: 'Failed to generate nutrition plan',
      message: error.message
    });
  }
}
