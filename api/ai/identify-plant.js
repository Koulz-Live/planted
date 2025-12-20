/**
 * Vercel Serverless Function: Plant Identification API
 * 
 * Identifies plants from photos using OpenAI GPT-4o vision capabilities.
 * Returns plant name (common and scientific), confidence level, and alternative suggestions.
 * 
 * Endpoint: /api/ai/identify-plant
 * Method: POST
 * 
 * Request Body:
 * {
 *   photoUrl: string  // Base64 data URL or public image URL
 * }
 * 
 * Response:
 * {
 *   ok: boolean,
 *   data: {
 *     commonName: string,
 *     scientificName: string,
 *     confidence: number (0-100),
 *     suggestions: string[],  // Alternative plant names if uncertain
 *     warnings: string[]      // Warnings (multiple plants, poor image quality, etc.)
 *   }
 * }
 */

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, message: 'Method not allowed' });
  }

  const { photoUrl } = req.body;

  if (!photoUrl) {
    return res.status(400).json({ 
      ok: false, 
      message: 'Missing required field: photoUrl' 
    });
  }

  try {
    // Check if OpenAI API key is available
    const openaiApiKey = process.env.OPENAI_API_KEY;

    if (!openaiApiKey) {
      console.warn('⚠️ OPENAI_API_KEY not set, using fallback identification');
      return res.json({
        ok: true,
        data: getFallbackIdentification()
      });
    }

    // Call OpenAI GPT-4o Vision API
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-2024-08-06',
        messages: [
          {
            role: 'system',
            content: buildIdentificationPrompt()
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Please identify this plant and provide details in the specified JSON format.'
              },
              {
                type: 'image_url',
                image_url: {
                  url: photoUrl
                }
              }
            ]
          }
        ],
        response_format: { type: 'json_object' },
        max_tokens: 1000,
        temperature: 0.3
      })
    });

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.json();
      console.error('OpenAI API error:', errorData);
      
      return res.json({
        ok: true,
        data: getFallbackIdentification()
      });
    }

    const openaiData = await openaiResponse.json();
    const content = openaiData.choices[0]?.message?.content;

    if (!content) {
      return res.json({
        ok: true,
        data: getFallbackIdentification()
      });
    }

    const identification = JSON.parse(content);

    return res.json({
      ok: true,
      data: {
        commonName: identification.commonName || '',
        scientificName: identification.scientificName || '',
        confidence: identification.confidence || 50,
        suggestions: identification.suggestions || [],
        warnings: identification.warnings || []
      }
    });

  } catch (error) {
    console.error('Error in plant identification:', error);
    
    // Return fallback instead of error
    return res.json({
      ok: true,
      data: getFallbackIdentification()
    });
  }
}

/**
 * Build the system prompt for plant identification
 */
function buildIdentificationPrompt() {
  return `You are an expert botanist and plant identification specialist. Analyze the provided plant photo and identify the plant species.

Your response must be a valid JSON object with this structure:
{
  "commonName": "string",        // Most common name (e.g., "Monstera")
  "scientificName": "string",    // Scientific name (e.g., "Monstera deliciosa")
  "confidence": number,          // 0-100, how confident are you
  "suggestions": ["string"],     // Alternative names if uncertain
  "warnings": ["string"]         // Issues with the photo
}

Confidence levels:
- 90-100%: Very clear, distinctive features visible
- 70-89%: Good match, some features visible
- 50-69%: Moderate match, limited features
- 0-49%: Low confidence, need better photo

Common warnings to include:
- "Multiple plants detected in photo - focus on one plant"
- "Image quality too low - try better lighting"
- "Only partial plant visible - show more of the plant"
- "Needs close-up of leaves or flowers for accurate identification"
- "Plant too far away - move closer"

If you detect multiple plants, focus on the most prominent one and add a warning.

If confidence is below 70%, provide 2-3 alternative suggestions in the suggestions array.

Examples:

High confidence (90%):
{
  "commonName": "Monstera",
  "scientificName": "Monstera deliciosa",
  "confidence": 92,
  "suggestions": [],
  "warnings": []
}

Moderate confidence (65%):
{
  "commonName": "Pothos",
  "scientificName": "Epipremnum aureum",
  "confidence": 65,
  "suggestions": ["Philodendron", "Heartleaf Philodendron"],
  "warnings": ["Only leaves visible - full plant view would help confirm"]
}

Low confidence (40%):
{
  "commonName": "Unknown Succulent",
  "scientificName": "Crassulaceae family",
  "confidence": 40,
  "suggestions": ["Echeveria", "Sedum", "Sempervivum"],
  "warnings": ["Image quality too low - try better lighting", "Needs close-up of leaves for accurate identification"]
}

Multiple plants detected:
{
  "commonName": "Snake Plant",
  "scientificName": "Sansevieria trifasciata",
  "confidence": 75,
  "suggestions": [],
  "warnings": ["Multiple plants detected in photo - focusing on the snake plant in the foreground"]
}

Now analyze the provided photo and respond with valid JSON.`;
}

/**
 * Fallback identification when OpenAI is unavailable
 */
function getFallbackIdentification() {
  return {
    commonName: 'Unknown Plant',
    scientificName: 'Please enter manually',
    confidence: 0,
    suggestions: [
      'Monstera',
      'Pothos',
      'Snake Plant',
      'Spider Plant',
      'Peace Lily'
    ],
    warnings: [
      'AI identification unavailable - please enter plant name manually',
      'Check common houseplants in suggestions'
    ]
  };
}
