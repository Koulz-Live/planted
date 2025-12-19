/**
 * Vercel Serverless Function - AI Plant Care
 * URL: /api/ai/plant-plan
 */

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { plantName, location, sunlight, wateringFrequency } = req.body;

    if (!plantName) {
      return res.status(400).json({ error: 'plantName is required' });
    }

    // Check for OpenAI API key
    const openaiKey = process.env.OPENAI_API_KEY;
    if (!openaiKey) {
      return res.status(503).json({
        error: 'OpenAI API key not configured',
        message: 'Add OPENAI_API_KEY environment variable in Vercel dashboard'
      });
    }

    // Call OpenAI API
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
            content: 'You are an expert gardener and plant care specialist. Provide detailed, practical advice for growing and caring for plants.'
          },
          {
            role: 'user',
            content: `Create a comprehensive care plan for ${plantName}. Location: ${location || 'indoor'}. Sunlight: ${sunlight || 'medium'}. Watering frequency: ${wateringFrequency || 'weekly'}. Include watering schedule, sunlight needs, soil requirements, fertilizing tips, and common issues.`
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      const error = await response.json();
      return res.status(response.status).json({
        error: 'OpenAI API error',
        details: error
      });
    }

    const data = await response.json();
    const carePlan = data.choices[0].message.content;

    res.status(200).json({
      success: true,
      plantName,
      carePlan,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Plant care error:', error);
    res.status(500).json({
      error: 'Failed to generate plant care plan',
      message: error.message
    });
  }
}
