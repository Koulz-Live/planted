/**
 * Vercel Serverless Function - AI Nutrition Plan Generation
 * URL: /api/ai/nutrition
 * 
 * Generates comprehensive, personalized plant-based nutrition plans using OpenAI GPT-4
 * with structured output for weekly meal prep, shopping lists, and health-focused guidance
 * tailored to household size, focus areas, and available time.
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
      householdSize, 
      focusAreas, 
      timeAvailablePerDay, 
      mealPhotoUrls 
    } = req.body;

    console.log('🥗 Nutrition plan request received:', {
      householdSize,
      focusAreas,
      timeAvailablePerDay,
      mealPhotosCount: mealPhotoUrls?.length || 0
    });

    // Validate required fields
    if (!householdSize || householdSize < 1) {
      return res.status(400).json({ 
        ok: false, 
        message: 'householdSize is required and must be at least 1' 
      });
    }

    if (!focusAreas || focusAreas.length === 0) {
      return res.status(400).json({ 
        ok: false, 
        message: 'At least one focus area is required' 
      });
    }

    // Check for OpenAI API key
    const openaiKey = process.env.OPENAI_API_KEY;
    
    // If no OpenAI key, return fallback nutrition plan
    if (!openaiKey) {
      console.log('⚠️ No OpenAI API key - returning fallback nutrition plan');
      const fallbackPlan = getFallbackNutritionPlan(householdSize, focusAreas, timeAvailablePerDay);
      return res.status(200).json({
        ok: true,
        data: fallbackPlan
      });
    }

    // Analyze meal photos if provided
    let mealAnalysis = null;
    if (mealPhotoUrls && mealPhotoUrls.length > 0) {
      console.log(`📸 Analyzing ${mealPhotoUrls.length} meal photo(s) with Vision API...`);
      try {
        mealAnalysis = await analyzeMealPhotos(mealPhotoUrls, openaiKey, focusAreas);
        console.log('✅ Meal analysis complete:', mealAnalysis);
      } catch (visionError) {
        console.error('⚠️ Vision analysis failed:', visionError.message);
        // Continue without vision analysis
      }
    }

    // Build comprehensive prompt (now includes meal analysis)
    const prompt = buildNutritionPrompt(
      householdSize, 
      focusAreas, 
      timeAvailablePerDay, 
      mealPhotoUrls,
      mealAnalysis
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
            content: `You are an expert registered dietitian nutritionist (RDN) and plant-based nutrition specialist. 
You provide comprehensive, evidence-based nutrition plans that are:
- Scientifically sound and health-focused
- Practical and realistic for busy lifestyles
- Tailored to specific health goals
- Focused on whole food, plant-based nutrition
- Family-friendly and budget-conscious
- Sustainable and accessible

Always provide nutrition plans in valid JSON format with these exact fields:
{
  "overview": "Brief summary of the nutrition approach and key principles",
  "plans": [
    {
      "day": "Day name or description",
      "meals": ["Meal 1", "Meal 2", "Meal 3"],
      "prepTips": ["Tip 1", "Tip 2"]
    }
  ],
  "shoppingList": ["Item 1", "Item 2", "Item 3"]
}`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('OpenAI API error:', error);
      
      // Return fallback on API error
      const fallbackPlan = getFallbackNutritionPlan(householdSize, focusAreas, timeAvailablePerDay);
      return res.status(200).json({
        ok: true,
        data: fallbackPlan
      });
    }

    const data = await response.json();
    const nutritionPlanText = data.choices[0].message.content;
    
    // Parse JSON response
    let nutritionPlan;
    try {
      nutritionPlan = JSON.parse(nutritionPlanText);
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', parseError);
      // Return fallback on parse error
      const fallbackPlan = getFallbackNutritionPlan(householdSize, focusAreas, timeAvailablePerDay);
      return res.status(200).json({
        ok: true,
        data: fallbackPlan
      });
    }

    // Ensure all required fields exist
    const completePlan = {
      overview: nutritionPlan.overview || 'Plant-based nutrition plan tailored to your needs',
      plans: Array.isArray(nutritionPlan.plans) ? nutritionPlan.plans : [],
      shoppingList: Array.isArray(nutritionPlan.shoppingList) ? nutritionPlan.shoppingList : []
    };

    return res.status(200).json({
      ok: true,
      data: completePlan
    });

  } catch (error) {
    console.error('Nutrition plan generation error:', error);
    
    // Return fallback on any error
    const { householdSize, focusAreas, timeAvailablePerDay } = req.body;
    const fallbackPlan = getFallbackNutritionPlan(
      householdSize || 1, 
      focusAreas || ['Energy Boost'], 
      timeAvailablePerDay || 30
    );
    
    return res.status(200).json({
      ok: true,
      data: fallbackPlan
    });
  }
}

/**
 * Build comprehensive prompt for nutrition plan generation
 */
function buildNutritionPrompt(householdSize, focusAreas, timeAvailablePerDay, mealPhotoUrls, mealAnalysis) {
  let prompt = `Create a comprehensive plant-based nutrition and meal prep plan for a household of ${householdSize} ${householdSize === 1 ? 'person' : 'people'}.\n\n`;
  
  // Add focus areas
  prompt += '**Health Focus Areas:**\n';
  focusAreas.forEach(area => {
    prompt += `- ${area}\n`;
  });
  prompt += '\n';
  
  // Add time constraints
  if (timeAvailablePerDay) {
    prompt += `**Time Available for Meal Prep:** ${timeAvailablePerDay} minutes per day\n\n`;
  }
  
  // Add meal analysis results if available
  if (mealAnalysis) {
    prompt += '**Current Meal Analysis from Photos:**\n';
    prompt += `${mealAnalysis}\n\n`;
    prompt += 'Please use this analysis to provide specific recommendations, address nutritional gaps, and build on positive eating habits observed.\n\n';
  } else if (mealPhotoUrls && mealPhotoUrls.length > 0) {
    prompt += `**Current Meals:** User has provided ${mealPhotoUrls.length} photo(s) of their current meals for reference.\n\n`;
  }
  
  prompt += `**Instructions:**
Create a detailed, actionable nutrition and meal prep plan that includes:

1. **Overview**: A 2-3 sentence summary of the nutrition approach, addressing the specific focus areas (${focusAreas.join(', ')}). Explain the key principles and expected benefits.

2. **Weekly Meal Prep Plans**: Provide a 7-day meal prep guide. For each day, include:
   - **day**: The day name (e.g., "Monday - Prep Day", "Tuesday", etc.)
   - **meals**: Array of 3-5 complete meals for that day (breakfast, lunch, dinner, snacks). Each meal should be specific, plant-based, and nutritious (e.g., "Overnight oats with blueberries, chia seeds, and almond butter")
   - **prepTips**: Array of 2-3 actionable prep tips for that day (e.g., "Batch cook quinoa for the week", "Pre-chop vegetables for easy salads")

3. **Shopping List**: Comprehensive grocery list organized by category. Include:
   - Fresh produce (fruits, vegetables)
   - Grains and legumes
   - Nuts and seeds
   - Pantry staples
   - Proteins (tofu, tempeh, etc.)
   - Healthy fats
   
   List should be realistic for ${householdSize} ${householdSize === 1 ? 'person' : 'people'} for one week.

Tailor the plan to:
- Household size: ${householdSize}
- Focus areas: ${focusAreas.join(', ')}
- Time available: ${timeAvailablePerDay || 30} minutes per day
- Plant-based whole food ingredients
- Budget-friendly options
- Make-ahead and batch cooking strategies
- Variety and balanced nutrition
- Practical for busy lifestyles

Return ONLY valid JSON with the exact structure specified in the system message.`;
  
  return prompt;
}

/**
 * Generate fallback nutrition plan when OpenAI is unavailable
 */
function getFallbackNutritionPlan(householdSize, focusAreas, timeAvailablePerDay) {
  // Determine primary focus
  const primaryFocus = focusAreas[0] || 'Energy Boost';
  const isQuickPrep = timeAvailablePerDay < 45;
  
  let overview = `Plant-based nutrition plan for ${householdSize} ${householdSize === 1 ? 'person' : 'people'}, `;
  
  // Customize overview based on focus areas
  if (focusAreas.includes('Weight Management')) {
    overview += 'emphasizing portion control, high-fiber foods, and nutrient-dense meals to support healthy weight management. ';
  } else if (focusAreas.includes('Heart Health')) {
    overview += 'focusing on heart-healthy whole grains, omega-3 rich foods, and low-sodium options to support cardiovascular health. ';
  } else if (focusAreas.includes('Diabetes Management')) {
    overview += 'prioritizing low glycemic index foods, balanced meals, and consistent carbohydrate intake for blood sugar management. ';
  } else if (focusAreas.includes('Muscle Building')) {
    overview += 'providing high-protein plant foods, post-workout nutrition, and adequate calories to support muscle growth and recovery. ';
  } else if (focusAreas.includes('Energy Boost')) {
    overview += 'featuring energy-sustaining complex carbs, B-vitamins, and iron-rich foods to combat fatigue and boost vitality. ';
  } else if (focusAreas.includes('Digestive Health')) {
    overview += 'rich in fiber, fermented foods, and prebiotic ingredients to support gut health and optimal digestion. ';
  } else if (focusAreas.includes('Kids Nutrition')) {
    overview += 'with kid-friendly meals packed with essential nutrients for growth, development, and brain health. ';
  } else if (focusAreas.includes('Senior Nutrition')) {
    overview += 'emphasizing easy-to-digest, nutrient-dense foods with adequate protein, calcium, and vitamin D for healthy aging. ';
  } else {
    overview += 'featuring balanced, whole food plant-based meals to support overall health and wellbeing. ';
  }
  
  overview += `This ${isQuickPrep ? 'quick-prep' : 'comprehensive'} meal plan uses batch cooking and make-ahead strategies to ${isQuickPrep ? 'minimize' : 'optimize'} your ${timeAvailablePerDay}-minute daily prep time.`;

  const plans = [
    {
      day: 'Sunday - Batch Prep Day',
      meals: [
        'Breakfast: Overnight oats with mixed berries, chia seeds, and almond butter',
        'Lunch: Mediterranean quinoa bowl with chickpeas, cucumbers, tomatoes, olives, and tahini dressing',
        'Dinner: Lentil bolognese with whole wheat pasta and side salad',
        'Snacks: Hummus with carrot and celery sticks, apple slices with peanut butter'
      ],
      prepTips: [
        'Cook large batch of quinoa, brown rice, and lentils for the week',
        'Prep overnight oats in mason jars for 5 days',
        'Wash and chop vegetables for easy grab-and-go salads',
        'Make hummus and energy balls for healthy snacks'
      ]
    },
    {
      day: 'Monday',
      meals: [
        'Breakfast: Prepared overnight oats with banana and walnuts',
        'Lunch: Buddha bowl with pre-cooked quinoa, roasted sweet potato, kale, chickpeas, and tahini',
        'Dinner: Stir-fry with tofu, broccoli, bell peppers, snap peas over brown rice',
        'Snacks: Trail mix, orange slices'
      ],
      prepTips: [
        'Use pre-cooked grains from Sunday prep',
        'Quick-sauté pre-chopped vegetables for dinner',
        'Pack lunch the night before'
      ]
    },
    {
      day: 'Tuesday',
      meals: [
        'Breakfast: Smoothie bowl with spinach, frozen berries, banana, hemp seeds, and granola',
        'Lunch: Leftover stir-fry packed in containers',
        'Dinner: Black bean tacos with avocado, salsa, lettuce, and cilantro-lime rice',
        'Snacks: Energy balls, mixed berries'
      ],
      prepTips: [
        'Blend smoothie ingredients the night before (store in fridge)',
        'Warm up pre-cooked black beans quickly',
        'Use leftover brown rice or quinoa'
      ]
    },
    {
      day: 'Wednesday',
      meals: [
        'Breakfast: Prepared overnight oats with sliced strawberries and pumpkin seeds',
        'Lunch: Chickpea salad sandwich on whole grain bread with side of baby carrots',
        'Dinner: Veggie curry with chickpeas, cauliflower, spinach over basmati rice',
        'Snacks: Apple with almond butter, handful of almonds'
      ],
      prepTips: [
        'Make chickpea salad using canned chickpeas for quick lunch prep',
        'Use curry paste or powder for fast flavor',
        'Double the curry recipe for tomorrow\'s lunch'
      ]
    },
    {
      day: 'Thursday',
      meals: [
        'Breakfast: Avocado toast on whole grain bread with tomatoes and hemp seeds',
        'Lunch: Leftover veggie curry in thermos container',
        'Dinner: Baked sweet potato stuffed with black beans, corn, salsa, and cashew cream',
        'Snacks: Celery with peanut butter, grapes'
      ],
      prepTips: [
        'Bake sweet potatoes in advance (microwave works too)',
        'Top with pre-cooked black beans',
        'Make cashew cream in blender (2 minutes)'
      ]
    },
    {
      day: 'Friday',
      meals: [
        'Breakfast: Prepared overnight oats with mango and coconut flakes',
        'Lunch: Mediterranean wrap with hummus, cucumber, tomato, lettuce, olives',
        'Dinner: Lentil shepherd\'s pie with mashed sweet potato topping and green beans',
        'Snacks: Popcorn (air-popped), orange'
      ],
      prepTips: [
        'Use pre-cooked lentils from Sunday',
        'Mash sweet potatoes while hot for easy spreading',
        'Assemble shepherd\'s pie and bake'
      ]
    },
    {
      day: 'Saturday',
      meals: [
        'Breakfast: Tofu scramble with spinach, mushrooms, tomatoes, and whole wheat toast',
        'Lunch: Rainbow salad with mixed greens, shredded carrots, beets, sunflower seeds, and balsamic vinaigrette',
        'Dinner: Homemade veggie pizza on whole wheat crust with marinara, vegetables, and cashew cheese',
        'Snacks: Smoothie, mixed nuts'
      ],
      prepTips: [
        'Use pre-washed salad greens for quick assembly',
        'Buy pre-made whole wheat pizza dough or use pita bread',
        'Prep ingredients for Sunday\'s batch cooking'
      ]
    }
  ];

  const shoppingList = [
    // Fresh Produce
    'Mixed berries (strawberries, blueberries, raspberries)',
    'Bananas (6-8)',
    'Apples (4-5)',
    'Oranges (4-5)',
    'Avocados (3-4)',
    'Lemons (2-3)',
    'Mango (1-2)',
    'Grapes (1 bunch)',
    'Spinach (2 bunches or 1 large container)',
    'Kale (1 bunch)',
    'Mixed salad greens',
    'Tomatoes (1 lb)',
    'Cherry tomatoes (1 pint)',
    'Cucumbers (2-3)',
    'Bell peppers (3-4 assorted colors)',
    'Broccoli (1 head)',
    'Cauliflower (1 head)',
    'Sweet potatoes (4-5 large)',
    'Carrots (2 lbs)',
    'Celery (1 bunch)',
    'Red onions (2-3)',
    'Mushrooms (8 oz)',
    'Snap peas (8 oz)',
    'Fresh ginger root',
    'Fresh garlic (1 bulb)',
    'Fresh cilantro',
    
    // Grains & Legumes
    'Quinoa (1 lb)',
    'Brown rice (2 lbs)',
    'Rolled oats (2 lbs)',
    'Whole wheat pasta (1 lb)',
    'Whole grain bread (1 loaf)',
    'Whole wheat tortillas (1 package)',
    'Basmati rice (1 lb)',
    'Lentils - green or brown (1 lb)',
    'Chickpeas - canned (4-5 cans)',
    'Black beans - canned (3-4 cans)',
    
    // Nuts, Seeds & Nut Butters
    'Almonds (raw, 1 cup)',
    'Walnuts (raw, 1 cup)',
    'Peanuts or peanut butter',
    'Almond butter',
    'Cashews (raw, for cashew cream)',
    'Sunflower seeds (½ cup)',
    'Pumpkin seeds (½ cup)',
    'Chia seeds (4 oz)',
    'Hemp seeds (4 oz)',
    
    // Proteins & Dairy Alternatives
    'Extra firm tofu (2 blocks)',
    'Tempeh (optional, 1 package)',
    'Unsweetened almond milk or oat milk (1 quart)',
    'Coconut milk - canned (1-2 cans)',
    
    // Pantry Staples
    'Tahini',
    'Hummus (or chickpeas to make your own)',
    'Olive oil',
    'Coconut oil',
    'Balsamic vinegar',
    'Apple cider vinegar',
    'Soy sauce or tamari',
    'Nutritional yeast',
    'Curry powder or paste',
    'Cumin',
    'Paprika',
    'Italian seasoning',
    'Sea salt',
    'Black pepper',
    'Marinara sauce (1 jar)',
    'Salsa (1 jar)',
    'Olives (1 jar)',
    'Corn (frozen or canned)',
    'Vegetable broth (2-3 cartons)'
  ];

  // Adjust quantities based on household size
  if (householdSize > 2) {
    shoppingList.unshift(`NOTE: This list is for ${householdSize} people. Multiply quantities by ${Math.ceil(householdSize / 2)} for your household.`);
  }

  return {
    overview,
    plans,
    shoppingList
  };
}

/**
 * Analyze meal photos using OpenAI Vision API
 * @param {string[]} photoUrls - Array of meal image URLs to analyze
 * @param {string} apiKey - OpenAI API key
 * @param {string[]} focusAreas - Health focus areas for targeted analysis
 * @returns {Promise<string>} - Detailed nutritional analysis of the meals
 */
async function analyzeMealPhotos(photoUrls, apiKey, focusAreas) {
  if (!photoUrls || photoUrls.length === 0) {
    return null;
  }

  console.log(`🔍 Analyzing ${photoUrls.length} meal photo(s) with OpenAI Vision...`);

  try {
    // Prepare content array with text prompt and images
    const focusAreasText = focusAreas.join(', ');
    const content = [
      {
        type: 'text',
        text: `Analyze these meal photos from a nutritional perspective. The person is focusing on: ${focusAreasText}.

Provide a comprehensive nutritional analysis including:

1. **Overall Assessment**: What type of meals are shown (breakfast, lunch, dinner, snacks)?
2. **Nutritional Strengths**: What's good about these meals? Positive aspects to maintain.
   - Whole food ingredients
   - Fiber content
   - Protein sources
   - Healthy fats
   - Variety and colors
   - Portion sizes
3. **Nutritional Gaps or Concerns**: What could be improved?
   - Missing food groups
   - Excessive processed foods
   - Sodium/sugar concerns
   - Lack of vegetables or fruits
   - Inadequate protein
   - Imbalanced portions
4. **Specific Recommendations**: Based on the focus areas (${focusAreasText}), what changes would help?
   - Foods to add
   - Foods to reduce
   - Preparation methods to consider
   - Timing and frequency
5. **Meal Pattern Observations**: Any patterns in eating habits visible from these photos?

Be specific, constructive, and evidence-based. Focus on actionable improvements while acknowledging positive choices.

Format your response as a clear, structured analysis that will help create a personalized nutrition plan.`
      }
    ];

    // Add each photo as an image input
    for (const photoUrl of photoUrls) {
      content.push({
        type: 'image_url',
        image_url: {
          url: photoUrl,
          detail: 'high' // Use high detail for better nutritional assessment
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
    
    console.log('📸 Vision API meal analysis:', analysisText.substring(0, 200) + '...');

    return analysisText;

  } catch (error) {
    console.error('❌ Failed to analyze meal photos:', error);
    throw error;
  }
}
