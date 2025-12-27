/**
 * Vercel Serverless Function - AI Plant Care Plan Generation
 * URL: /api/ai/plant-plan
 * 
 * Generates comprehensive, climate-aware plant care plans using OpenAI GPT-4
 * with structured output for watering schedules, soil tips, sunlight needs,
 * warnings, and next steps tailored to the user's location and plant stage.
 */

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, x-user-id'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, message: 'Method not allowed' });
  }

  try {
    const { 
      plantName, 
      growthStage, 
      climate, 
      biodiversityConcerns, 
      observations 
    } = req.body;

    console.log('🌱 Plant care plan request received:', {
      plantName,
      growthStage,
      climate,
      biodiversityConcerns,
      observationsCount: observations?.length || 0
    });

    // Validate required fields
    if (!plantName) {
      return res.status(400).json({ 
        ok: false, 
        message: 'plantName is required' 
      });
    }

    // Check for OpenAI API key
    const openaiKey = process.env.OPENAI_API_KEY;
    
    // If no OpenAI key, return fallback care plan
    if (!openaiKey) {
      console.log('⚠️ No OpenAI API key - returning fallback care plan');
      const fallbackPlan = getFallbackCarePlan(plantName, growthStage, climate);
      return res.status(200).json({
        ok: true,
        data: fallbackPlan
      });
    }

    // Extract photo URLs from observations
    const photoUrls = observations?.map(obs => obs.photoUrl).filter(Boolean) || [];
    console.log(`📸 ${photoUrls.length} plant photo(s) provided`);

    // Analyze plant photos if provided
    let visionAnalysis = null;
    if (photoUrls.length > 0) {
      console.log('🔍 Analyzing plant photos with Vision API...');
      try {
        visionAnalysis = await analyzePlantPhotos(photoUrls, openaiKey, plantName);
        console.log('✅ Vision analysis complete:', visionAnalysis);
      } catch (visionError) {
        console.error('⚠️ Vision analysis failed:', visionError.message);
        // Continue without vision analysis
      }
    }

    // Build comprehensive prompt (now includes vision analysis)
    const prompt = buildPlantCarePrompt(
      plantName, 
      growthStage, 
      climate, 
      biodiversityConcerns, 
      observations,
      visionAnalysis
    );

    // Call OpenAI API with structured output
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-2024-08-06',
        messages: [
          {
            role: 'system',
            content: `You are an expert horticulturist, permaculture designer, and regenerative agriculture specialist. 
You provide comprehensive, science-based plant care advice that is:
- Climate-specific and location-aware
- Tailored to the plant's growth stage
- Focused on soil health and biodiversity
- Practical and actionable
- Aligned with regenerative growing practices

Always provide care plans in valid JSON format with these exact fields:
{
  "title": "Plant Care Plan Title",
  "summary": "Brief overview of care needs",
  "wateringSchedule": "Detailed watering instructions with frequency and amounts",
  "soilTips": "Soil preparation, amendments, and health maintenance",
  "sunlight": "Sunlight requirements and positioning advice",
  "warnings": ["Warning 1", "Warning 2"],
  "nextSteps": ["Step 1", "Step 2", "Step 3"]
}`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1500,
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('OpenAI API error:', error);
      
      // Return fallback on API error
      const fallbackPlan = getFallbackCarePlan(plantName, growthStage, climate);
      return res.status(200).json({
        ok: true,
        data: fallbackPlan
      });
    }

    const data = await response.json();
    const carePlanText = data.choices[0].message.content;
    
    // Parse JSON response
    let carePlan;
    try {
      carePlan = JSON.parse(carePlanText);
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', parseError);
      // Return fallback on parse error
      const fallbackPlan = getFallbackCarePlan(plantName, growthStage, climate);
      return res.status(200).json({
        ok: true,
        data: fallbackPlan
      });
    }

    // Ensure all required fields exist
    const completePlan = {
      title: carePlan.title || `${plantName} Care Plan`,
      summary: carePlan.summary || '',
      wateringSchedule: carePlan.wateringSchedule || 'Water when soil is dry to touch',
      soilTips: carePlan.soilTips || 'Use well-draining, nutrient-rich soil',
      sunlight: carePlan.sunlight || 'Provide adequate sunlight based on plant needs',
      warnings: Array.isArray(carePlan.warnings) ? carePlan.warnings : [],
      nextSteps: Array.isArray(carePlan.nextSteps) ? carePlan.nextSteps : []
    };

    return res.status(200).json({
      ok: true,
      data: completePlan
    });

  } catch (error) {
    console.error('Plant care plan generation error:', error);
    
    // Return fallback on any error
    const { plantName, growthStage, climate } = req.body;
    const fallbackPlan = getFallbackCarePlan(plantName || 'Your Plant', growthStage, climate);
    
    return res.status(200).json({
      ok: true,
      data: fallbackPlan
    });
  }
}

/**
 * Build comprehensive prompt for plant care plan generation
 */
function buildPlantCarePrompt(plantName, growthStage, climate, biodiversityConcerns, observations, visionAnalysis) {
  let prompt = `Create a comprehensive care plan for ${plantName}`;
  
  if (growthStage) {
    const stageDescriptions = {
      seedling: 'currently in seedling stage (young, establishing roots)',
      vegetative: 'in vegetative growth stage (actively growing leaves and stems)',
      fruiting: 'in fruiting/flowering stage (producing fruits or flowers)',
      dormant: 'in dormant stage (resting period, minimal growth)'
    };
    prompt += ` ${stageDescriptions[growthStage] || `in ${growthStage} stage`}`;
  }
  
  prompt += '.\n\n';
  
  // Add climate context
  if (climate) {
    prompt += '**Climate Context:**\n';
    if (climate.country) {
      prompt += `- Location: ${climate.country}\n`;
    }
    if (climate.hardinessZone) {
      prompt += `- Hardiness Zone: ${climate.hardinessZone}\n`;
    }
    if (climate.rainfallPattern) {
      prompt += `- Rainfall Pattern: ${climate.rainfallPattern}\n`;
    }
    if (climate.avgTempC !== undefined) {
      prompt += `- Average Temperature: ${climate.avgTempC}°C (${Math.round(climate.avgTempC * 9/5 + 32)}°F)\n`;
    }
    prompt += '\n';
  }
  
  // Add biodiversity concerns
  if (biodiversityConcerns && biodiversityConcerns.length > 0) {
    prompt += '**Biodiversity & Ecological Concerns:**\n';
    biodiversityConcerns.forEach(concern => {
      prompt += `- ${concern}\n`;
    });
    prompt += '\n';
  }
  
  // Add vision analysis results if available
  if (visionAnalysis) {
    prompt += '**Visual Analysis from Plant Photos:**\n';
    prompt += `${visionAnalysis}\n\n`;
    prompt += 'Please incorporate these visual observations into your care recommendations, addressing any issues noted and providing specific guidance.\n\n';
  } else if (observations && observations.length > 0) {
    prompt += '**Plant Observations:**\n';
    prompt += `User has provided ${observations.length} photo(s) for reference.\n\n`;
  }
  
  prompt += `**Instructions:**
Provide a detailed, actionable care plan that includes:

1. **Title**: A clear, descriptive title for this care plan
2. **Summary**: A brief 2-3 sentence overview of the plant's needs at this stage
3. **Watering Schedule**: Specific guidance on frequency, amount, and best practices (e.g., "Water deeply once per week, providing 1-2 inches. Check soil moisture first - top 2 inches should be dry before watering.")
4. **Soil Tips**: Detailed soil requirements including pH, amendments, composting, mulching, and regenerative practices (e.g., "Use loamy soil with pH 6.0-7.0. Add compost monthly. Mulch with 2-3 inches of organic matter.")
5. **Sunlight**: Exact sunlight requirements with positioning advice (e.g., "6-8 hours direct sunlight daily. Position on south-facing location. Provide afternoon shade in hot climates.")
6. **Warnings**: Array of potential issues, pests, diseases, or precautions specific to this stage and climate (e.g., ["Watch for aphids in warm weather", "Avoid overwatering during dormancy"])
7. **Next Steps**: Array of 3-5 actionable next steps the grower should take this week/month (e.g., ["Prune dead leaves", "Apply compost tea", "Monitor for pests"])

Tailor all advice to:
- The specific growth stage (${growthStage || 'general'})
- The climate conditions provided${climate?.country ? ` (${climate.country})` : ''}
- Regenerative and biodiversity-friendly practices
- Practical, achievable actions for home gardeners

Return ONLY valid JSON with the exact structure specified in the system message.`;
  
  return prompt;
}

/**
 * Generate fallback care plan when OpenAI is unavailable
 */
function getFallbackCarePlan(plantName, growthStage, climate) {
  const stageTips = {
    seedling: {
      watering: 'Keep soil consistently moist but not waterlogged. Water gently 2-3 times per week, providing about 0.5-1 inch of water each time. Check soil moisture daily - top inch should remain slightly damp.',
      soil: 'Use seed-starting mix or light, well-draining soil. pH 6.0-7.0 is ideal. Avoid heavy amendments at this stage. Once seedlings have 2-4 true leaves, begin light fertilizing with diluted organic fertilizer (quarter strength) every 2 weeks.',
      sunlight: 'Provide bright, indirect light for 12-14 hours daily. If growing indoors, use grow lights positioned 2-4 inches above seedlings. Gradually introduce seedlings to direct sunlight over 7-10 days (hardening off).',
      warnings: [
        'Avoid overwatering - damping off disease is common in seedlings',
        'Maintain consistent temperatures (65-75°F / 18-24°C)',
        'Protect from strong winds and heavy rain',
        'Watch for leggy growth (indicates insufficient light)'
      ],
      nextSteps: [
        'Monitor soil moisture daily and adjust watering as needed',
        'Ensure adequate light exposure (12-14 hours)',
        'Prepare for transplanting when seedlings have 4-6 true leaves',
        'Harden off seedlings gradually before outdoor planting'
      ]
    },
    vegetative: {
      watering: 'Water deeply once or twice per week, providing 1-2 inches of water per session. Allow top 2-3 inches of soil to dry between waterings. Adjust frequency based on weather - increase during hot, dry periods.',
      soil: 'Maintain rich, well-draining soil with pH 6.0-7.0. Apply 2-3 inches of organic mulch to retain moisture and regulate temperature. Feed with balanced organic fertilizer (10-10-10 or similar) every 3-4 weeks. Add compost or worm castings monthly.',
      sunlight: '6-8 hours of direct sunlight daily is optimal. Position in a south or west-facing location. In very hot climates (above 90°F/32°C), provide afternoon shade to prevent stress.',
      warnings: [
        'Monitor for common pests: aphids, spider mites, whiteflies',
        'Check for nutrient deficiencies (yellowing leaves, stunted growth)',
        'Avoid nitrogen excess which causes weak, leggy growth',
        'Protect from strong winds that can damage tender growth'
      ],
      nextSteps: [
        'Apply organic mulch around base (keep 2 inches from stem)',
        'Feed with balanced fertilizer this week',
        'Prune any damaged or diseased growth',
        'Stake or support plants if needed',
        'Monitor soil moisture and adjust watering schedule'
      ]
    },
    fruiting: {
      watering: 'Water consistently and deeply 1-2 times per week, providing 1-2 inches. Maintain even soil moisture - avoid drought stress or overwatering during fruit development. Use drip irrigation or soaker hoses if possible.',
      soil: 'Use nutrient-rich soil with pH 6.0-7.0. Switch to lower nitrogen, higher phosphorus and potassium fertilizer (5-10-10 or similar) to support flowering and fruiting. Apply every 2-3 weeks. Add compost or aged manure monthly. Maintain 2-3 inch mulch layer.',
      sunlight: 'Maximize sunlight exposure: 8-10 hours of direct sun daily. Ensure good air circulation around plants. Prune excess foliage that shades developing fruits, but maintain enough leaves for photosynthesis.',
      warnings: [
        'Blossom end rot can occur from calcium deficiency or uneven watering',
        'Watch for fruit-targeting pests: fruit flies, hornworms, birds',
        'Support heavy fruits to prevent branch breakage',
        'Harvest regularly to encourage continued production',
        'Monitor for fungal diseases in humid conditions'
      ],
      nextSteps: [
        'Switch to bloom/fruit fertilizer (higher P and K)',
        'Ensure consistent watering schedule',
        'Add support stakes or cages for heavy fruits',
        'Hand-pollinate if needed (lack of pollinators)',
        'Harvest ripe fruits promptly to encourage more production'
      ]
    },
    dormant: {
      watering: 'Reduce watering significantly. Water only when soil is completely dry, about once every 2-3 weeks. Provide just enough moisture to prevent root desiccation. Overwatering during dormancy can cause root rot.',
      soil: 'Soil should remain barely moist, not wet. Pause fertilization completely - plants don\'t need nutrients during dormancy. Apply 3-4 inch mulch layer to protect roots from temperature fluctuations. Add compost in early spring before growth resumes.',
      sunlight: 'Requirements vary by plant type. Deciduous plants need minimal light. Evergreens still need some light but can tolerate less than growing season. Protect from harsh afternoon sun that can damage dormant tissue.',
      warnings: [
        'Do not fertilize during dormancy',
        'Avoid pruning (except damaged/dead branches)',
        'Protect roots from hard freezes with mulch',
        'Watch for pest eggs or disease on dormant stems',
        'Don\'t force new growth by over-watering or heating'
      ],
      nextSteps: [
        'Apply deep mulch layer (3-4 inches) for root protection',
        'Inspect plants for pest eggs or disease signs',
        'Prune only dead, damaged, or diseased branches',
        'Reduce watering to minimal levels',
        'Plan spring care: fertilizer, amendments, seeds to start'
      ]
    }
  };

  const stage = growthStage || 'vegetative';
  const tips = stageTips[stage] || stageTips.vegetative;
  
  let locationNote = '';
  if (climate?.country) {
    locationNote = ` in ${climate.country}`;
  }
  
  return {
    title: `${plantName} Care Plan - ${stage.charAt(0).toUpperCase() + stage.slice(1)} Stage`,
    summary: `Your ${plantName}${locationNote} is in the ${stage} stage. This plan provides comprehensive care guidance including watering schedules, soil health, sunlight requirements, and proactive warnings to help your plant thrive. Follow the next steps to ensure optimal growth and health.`,
    wateringSchedule: tips.watering,
    soilTips: tips.soil,
    sunlight: tips.sunlight,
    warnings: tips.warnings,
    nextSteps: tips.nextSteps
  };
}

/**
 * Analyze plant photos using OpenAI Vision API
 * @param {string[]} photoUrls - Array of image URLs to analyze
 * @param {string} apiKey - OpenAI API key
 * @param {string} plantName - Name of the plant being analyzed
 * @returns {Promise<string>} - Detailed analysis of plant health and conditions
 */
async function analyzePlantPhotos(photoUrls, apiKey, plantName) {
  if (!photoUrls || photoUrls.length === 0) {
    return null;
  }

  console.log(`🔍 Analyzing ${photoUrls.length} plant photo(s) with OpenAI Vision...`);

  try {
    // Prepare content array with text prompt and images
    const content = [
      {
        type: 'text',
        text: `Analyze these photos of a ${plantName} plant and provide a detailed assessment of:

1. **Overall Health**: Current condition, vigor, color
2. **Growth Stage**: Visual indicators of growth stage (seedling, vegetative, fruiting, dormant)
3. **Visible Issues**: Any signs of stress, disease, pests, nutrient deficiencies, or damage
   - Leaf discoloration (yellowing, browning, spots)
   - Wilting or drooping
   - Pest presence or damage
   - Disease symptoms
   - Physical damage
4. **Positive Observations**: What looks healthy and good
5. **Soil & Environment**: What can be observed about soil moisture, container conditions, surroundings
6. **Specific Recommendations**: Based on what you see, what immediate actions should be taken

Be specific and detailed. If you see concerning issues, explain them clearly. If the plant looks healthy, mention that too.

Format your response as a clear, structured analysis that will be incorporated into care plan recommendations.`
      }
    ];

    // Add each photo as an image input
    for (const photoUrl of photoUrls) {
      content.push({
        type: 'image_url',
        image_url: {
          url: photoUrl,
          detail: 'high' // Use high detail for better plant health assessment
        }
      });
    }

    // Call OpenAI Vision API (using Chat Completions with gpt-4o)
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o', // gpt-4o supports vision
        messages: [
          {
            role: 'user',
            content: content
          }
        ],
        max_tokens: 1000,
        temperature: 0.3 // Lower temperature for more consistent/accurate analysis
      })
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('❌ OpenAI Vision API error:', response.status, error);
      throw new Error(`Vision API failed: ${response.status}`);
    }

    const data = await response.json();
    const analysisText = data.choices[0]?.message?.content || '';
    
    console.log('📸 Vision API plant analysis:', analysisText.substring(0, 200) + '...');

    return analysisText;

  } catch (error) {
    console.error('❌ Failed to analyze plant photos:', error);
    throw error;
  }
}
