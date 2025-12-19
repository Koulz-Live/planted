/**
 * Vercel Serverless Function - AI Recipe Generation
 * URL: /api/recipes
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
    const { ingredients, dietaryRestrictions, mealType } = req.body;

    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
      return res.status(400).json({ error: 'ingredients array is required' });
    }

    const openaiKey = process.env.OPENAI_API_KEY;
    if (!openaiKey) {
      return res.status(503).json({
        error: 'OpenAI API key not configured',
        message: 'Add OPENAI_API_KEY in Vercel environment variables'
      });
    }

    const ingredientsList = ingredients.join(', ');
    const restrictions = dietaryRestrictions ? ` Dietary restrictions: ${dietaryRestrictions}.` : '';
    const meal = mealType ? ` Meal type: ${mealType}.` : '';

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
            content: 'You are a creative chef and nutritionist. Generate delicious, healthy recipes using plant-based ingredients.'
          },
          {
            role: 'user',
            content: `Create 3 unique plant-based recipes using these ingredients: ${ingredientsList}.${restrictions}${meal} For each recipe, provide: name, description, ingredients with quantities, step-by-step instructions, prep time, cook time, servings, and nutritional highlights.`
          }
        ],
        temperature: 0.8,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      const error = await response.json();
      return res.status(response.status).json({ error: 'OpenAI API error', details: error });
    }

    const data = await response.json();
    const recipes = data.choices[0].message.content;

    res.status(200).json({
      success: true,
      recipes,
      ingredients,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Recipe generation error:', error);
    res.status(500).json({
      error: 'Failed to generate recipes',
      message: error.message
    });
  }
}
