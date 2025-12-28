/**
 * Vercel Serverless Function - Plant Care Detail Generation using OpenAI
 * URL: /api/ai/plant-detail
 * Generates comprehensive plant care plans from basic plant information
 */

export default async function handler(req, res) {
  console.log('🌱 Plant Detail API called:', req.method, new Date().toISOString());
  
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-user-id');

  if (req.method === 'OPTIONS') {
    console.log('✅ CORS preflight handled');
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    console.warn('⚠️ Invalid method:', req.method);
    return res.status(405).json({ ok: false, message: 'Method not allowed' });
  }

  try {
    const { 
      plantName,
      scientificName,
      type,
      growthStage,
      difficulty,
      currentConditions,
      userLocation,
      climateZone
    } = req.body;

    if (!plantName) {
      console.warn('⚠️ Plant name missing');
      return res.status(400).json({ 
        ok: false, 
        message: 'Plant name is required' 
      });
    }

    console.log('🌱 Generating detailed care plan for:', plantName);

    const openaiKey = process.env.OPENAI_API_KEY;
    
    if (!openaiKey) {
      console.warn('⚠️ OpenAI API key not configured');
      return res.status(200).json({
        ok: false,
        message: 'Plant care generation not configured'
      });
    }

    const startTime = Date.now();

    // Build context for the AI
    let context = `Plant: ${plantName}`;
    if (scientificName) context += `\nScientific Name: ${scientificName}`;
    if (type) context += `\nType: ${type}`;
    if (growthStage) context += `\nGrowth Stage: ${growthStage}`;
    if (difficulty) context += `\nDifficulty Level: ${difficulty}`;
    if (currentConditions) context += `\nCurrent Conditions: ${currentConditions}`;
    if (userLocation) context += `\nUser Location: ${userLocation}`;
    if (climateZone) context += `\nClimate Zone: ${climateZone}`;

    // Use OpenAI to generate comprehensive plant care plan
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are an expert horticulturist and regenerative agriculture specialist with deep knowledge of plant care, soil health, and sustainable growing practices.

Your task is to generate a comprehensive, detailed plant care plan based on the provided plant information and return it as valid JSON.

Return a JSON object with this exact structure:
{
  "carePlan": {
    "title": "Plant Name Care Plan",
    "summary": "2-3 sentence overview of this plant's care needs and growing characteristics",
    "wateringSchedule": "Detailed watering instructions with frequency, amount, and seasonal variations. Include tips for checking soil moisture.",
    "soilTips": "Soil type, pH requirements, drainage needs, and amendment recommendations. Include organic matter suggestions.",
    "sunlight": "Light requirements with specific hours, direction, and seasonal considerations. Include signs of too much/too little light.",
    "temperature": "Ideal temperature range, cold hardiness, heat tolerance, and seasonal protection needs",
    "fertilizing": "Fertilization schedule, type of fertilizer (organic preferred), and application methods. Include natural alternatives.",
    "pruning": "When and how to prune, deadheading needs, and shaping tips. Include tools and techniques.",
    "commonPests": "Common pests and diseases with organic prevention and treatment methods. Include companion planting suggestions.",
    "seasonalCare": "Spring, summer, fall, and winter care adjustments. Include climate-specific tips.",
    "propagation": "Methods for propagating this plant (seeds, cuttings, division, etc.) with timing and success rates",
    "warnings": [
      "Important warnings about toxicity, invasiveness, or special considerations"
    ],
    "biodiversityTips": [
      "Ways this plant supports local ecosystems, pollinators, and wildlife",
      "Companion planting suggestions and ecosystem benefits"
    ],
    "nextSteps": [
      "Immediate action items for optimal plant health",
      "First month care priorities",
      "Long-term maintenance schedule"
    ]
  }
}

Requirements:
- Provide comprehensive, actionable care instructions
- Emphasize organic and regenerative practices
- Include climate adaptation strategies
- Address common beginner mistakes
- Provide seasonal care variations
- Include ecosystem benefits and biodiversity support
- Make instructions clear for beginners while including advanced tips
- Include specific measurements, timings, and visual cues
- Mention natural pest control methods
- Suggest companion plants and ecosystem integration`
          },
          {
            role: 'user',
            content: `Generate a comprehensive, detailed care plan for:\n\n${context}`
          }
        ],
        temperature: 0.7,
        max_tokens: 4000,
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const duration = Date.now() - startTime;

    console.log(`✅ Plant care plan generated in ${duration}ms`);

    // Parse the AI response
    const aiContent = data.choices[0].message.content;
    console.log('📝 AI Response:', aiContent.substring(0, 200) + '...');

    let parsedData;
    try {
      parsedData = JSON.parse(aiContent);
    } catch (parseError) {
      console.error('❌ Failed to parse AI response:', parseError);
      return res.status(200).json({
        ok: false,
        message: 'Failed to parse plant care data'
      });
    }

    if (!parsedData.carePlan) {
      console.error('❌ Invalid care plan structure in response');
      return res.status(200).json({
        ok: false,
        message: 'Invalid plant care data structure'
      });
    }

    // Ensure all required fields are present
    const carePlan = {
      title: parsedData.carePlan.title || `${plantName} Care Plan`,
      summary: parsedData.carePlan.summary || '',
      wateringSchedule: parsedData.carePlan.wateringSchedule || '',
      soilTips: parsedData.carePlan.soilTips || '',
      sunlight: parsedData.carePlan.sunlight || '',
      temperature: parsedData.carePlan.temperature || '',
      fertilizing: parsedData.carePlan.fertilizing || '',
      pruning: parsedData.carePlan.pruning || '',
      commonPests: parsedData.carePlan.commonPests || '',
      seasonalCare: parsedData.carePlan.seasonalCare || '',
      propagation: parsedData.carePlan.propagation || '',
      warnings: parsedData.carePlan.warnings || [],
      biodiversityTips: parsedData.carePlan.biodiversityTips || [],
      nextSteps: parsedData.carePlan.nextSteps || []
    };

    console.log('✅ Plant care plan generation successful:', carePlan.title);
    console.log(`📊 Sections included: watering, soil, sunlight, fertilizing, pruning, pests, seasonal care`);

    return res.status(200).json({
      ok: true,
      carePlan: carePlan,
      metadata: {
        generationTime: duration,
        model: 'gpt-4o',
        timestamp: new Date().toISOString(),
        plantName: plantName
      }
    });

  } catch (error) {
    console.error('❌ Plant care plan generation error:', error);
    return res.status(500).json({
      ok: false,
      message: 'Failed to generate plant care plan',
      error: error.message
    });
  }
}
