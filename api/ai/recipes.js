/**
 * Vercel Serverless Function - Enhanced AI Recipe Generation
 * URL: /api/ai/recipes
 * Matches the enhanced recipe format with spotlight and alternates
 */

export default async function handler(req, res) {
  console.log('🔄 Recipe API called:', req.method, new Date().toISOString());
  
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
      dietaryNeeds = [],
      availableIngredients = [],
      culturalPreferences = [],
      pantryPhotoUrls = [],
      season = 'Any'
    } = req.body;

    console.log('📝 Request body received:', JSON.stringify(req.body, null, 2));
    console.log('📝 Parsed data:', {
      ingredients: availableIngredients,
      ingredientsType: typeof availableIngredients,
      ingredientsIsArray: Array.isArray(availableIngredients),
      ingredientsLength: availableIngredients.length,
      pantryPhotos: pantryPhotoUrls?.length || 0,
      dietary: dietaryNeeds,
      cultural: culturalPreferences,
      season
    });

    // Validate that either ingredients OR photos are provided
    const hasIngredients = availableIngredients && availableIngredients.length > 0;
    const hasPhotos = pantryPhotoUrls && pantryPhotoUrls.length > 0;

    if (!hasIngredients && !hasPhotos) {
      console.warn('⚠️ No ingredients or photos provided - returning 400');
      return res.status(400).json({
        ok: false,
        message: 'Please enter ingredients OR upload pantry photos to generate recipes.'
      });
    }

    // If only photos provided (no text ingredients), analyze them first
    let ingredientsToUse = availableIngredients;
    
    const openaiKey = process.env.OPENAI_API_KEY;
    
    // Track vision analysis metadata
    let visionAnalysisMetadata = null;
    
    if (!hasIngredients && hasPhotos) {
      console.log('📸 Analyzing pantry photos to extract ingredients...');
      
      if (!openaiKey) {
        console.warn('⚠️ No OpenAI key - using generic ingredients');
        ingredientsToUse = [
          'seasonal vegetables',
          'pantry staples',
          'fresh herbs',
          'olive oil',
          'garlic',
          'onions'
        ];
        visionAnalysisMetadata = {
          fallbackUsed: true,
          error: 'OpenAI API key not configured',
          parsed: ingredientsToUse
        };
      } else {
        // Use OpenAI Vision to analyze pantry photos
        const visionStartTime = Date.now();
        try {
          const analyzedIngredients = await analyzePantryPhotos(pantryPhotoUrls, openaiKey);
          const visionDuration = Date.now() - visionStartTime;
          
          if (analyzedIngredients && analyzedIngredients.length > 0) {
            ingredientsToUse = analyzedIngredients;
            console.log('✅ Extracted ingredients from photos:', ingredientsToUse);
            
            visionAnalysisMetadata = {
              model: 'gpt-4o',
              raw: analyzedIngredients.join(', '),
              parsed: analyzedIngredients,
              confidence: analyzedIngredients.length > 3 ? 'high' : 'medium',
              durationMs: visionDuration,
              fallbackUsed: false
            };
          } else {
            console.warn('⚠️ No ingredients detected - using generic fallback');
            ingredientsToUse = ['seasonal vegetables', 'pantry staples', 'fresh herbs'];
            
            visionAnalysisMetadata = {
              model: 'gpt-4o',
              raw: 'no ingredients visible',
              parsed: ingredientsToUse,
              confidence: 'low',
              durationMs: visionDuration,
              fallbackUsed: true,
              error: 'No ingredients detected in photos'
            };
          }
        } catch (error) {
          const visionDuration = Date.now() - visionStartTime;
          console.error('❌ Photo analysis failed:', error.message);
          ingredientsToUse = ['seasonal vegetables', 'pantry staples', 'fresh herbs'];
          
          visionAnalysisMetadata = {
            model: 'gpt-4o',
            raw: error.message,
            parsed: ingredientsToUse,
            confidence: 'low',
            durationMs: visionDuration,
            fallbackUsed: true,
            error: error.message
          };
        }
      }
    }

    if (!openaiKey) {
      console.warn('⚠️ OpenAI API key not configured, returning fallback recipes');
      return res.status(200).json({
        ok: true,
        data: getFallbackRecipes(ingredientsToUse, dietaryNeeds, culturalPreferences)
      });
    }

    // Build comprehensive prompt
    const prompt = buildRecipePrompt(
      ingredientsToUse,
      dietaryNeeds,
      culturalPreferences,
      season,
      hasPhotos ? pantryPhotoUrls.length : 0
    );

    // Call OpenAI
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
            content: `You are a world-class culinary anthropologist, professional chef, and nutrition educator specializing in plant-based, culturally-diverse cuisine.

Your expertise includes:
- Global cooking techniques and flavor profiles
- Food history and cultural traditions
- Nutritional science and health benefits
- Sustainable cooking and zero-waste practices
- Dietary accommodations and allergies
- Recipe development and food writing

You create comprehensive, detailed recipes that are:
- Professionally written with exact measurements and techniques
- Culturally respectful and educational
- Nutritionally balanced and health-conscious
- Practical for home cooks of varying skill levels
- Delicious, creative, and inspiring

Your recipes honor food traditions, minimize waste, celebrate biodiversity, and empower people to cook confidently.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
        max_tokens: 3000
      })
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('❌ OpenAI API error:', response.status, error);
      console.log('⚡ Returning fallback recipes instead');
      return res.status(200).json({
        ok: true,
        data: getFallbackRecipes(availableIngredients, dietaryNeeds, culturalPreferences)
      });
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    console.log('✅ OpenAI response received, parsing...');
    
    // Parse JSON response
    let recipes;
    try {
      recipes = JSON.parse(content);
      console.log('✅ Recipes parsed successfully');
    } catch (parseError) {
      console.error('❌ Failed to parse OpenAI response:', parseError);
      console.log('⚡ Returning fallback recipes instead');
      return res.status(200).json({
        ok: true,
        data: getFallbackRecipes(availableIngredients, dietaryNeeds, culturalPreferences)
      });
    }

    console.log('✅ Returning AI-generated recipes');
    res.status(200).json({
      ok: true,
      data: recipes,
      metadata: {
        visionAnalysis: visionAnalysisMetadata,
        ingredientsUsed: ingredientsToUse,
        photosProvided: hasPhotos ? pantryPhotoUrls.length : 0,
        textIngredientsProvided: hasIngredients
      }
    });

  } catch (error) {
    console.error('❌ Recipe generation error:', error.message || error);
    console.log('⚡ Returning fallback recipes');
    return res.status(200).json({
      ok: true,
      data: getFallbackRecipes(
        req.body.availableIngredients || [],
        req.body.dietaryNeeds || [],
        req.body.culturalPreferences || []
      )
    });
  }
}

function buildRecipePrompt(ingredients, dietary, cultural, season) {
  return `Create COMPREHENSIVE, DETAILED recipes using these ingredients: ${ingredients.join(', ')}

Dietary Needs: ${dietary.join(', ') || 'None specified'}
Cultural Preferences: ${cultural.join(', ') || 'Open to all cuisines'}
Season: ${season}

Return a JSON object with this EXACT structure:
{
  "spotlight": {
    "title": "Recipe name",
    "description": "Detailed description",
    "ingredients": ["2 cups ingredient, prep method", "1 tbsp ingredient"],
    "steps": ["Detailed step with temp and time", "Next step"],
    "prepTime": "15 minutes",
    "cookTime": "30 minutes",
    "servings": "4 servings",
    "difficulty": "Easy",
    "nutritionHighlights": ["Benefit 1", "Benefit 2", "Benefit 3"],
    "culturalNotes": "Cultural context and history",
    "tips": ["Tip 1", "Tip 2"]
  },
  "alternates": [
    {
      "title": "Alternative recipe name",
      "description": "Description",
      "ingredients": ["Measured ingredients"],
      "steps": ["Detailed steps"],
      "prepTime": "10 minutes",
      "cookTime": "20 minutes",
      "servings": "6 servings",
      "difficulty": "Easy",
      "nutritionHighlights": ["Benefits"],
      "tips": ["Tips"]
    }
  ]
}

Requirements:
- EXACT measurements for ALL ingredients
- DETAILED step-by-step instructions with temperatures and times
- Specific prep/cook times and servings
- 3-5 nutrition highlights with specific benefits
- Rich cultural context
- 2-3 practical cooking tips
- spotlight + 1-2 alternates
- Use available ingredients creatively`;
}

function getFallbackRecipes(ingredients, dietary, cultural) {
  const culturalContext = cultural[0] || 'regional';
  return {
    spotlight: {
      title: 'Heritage Garden Bowl',
      description: 'A vibrant, zero-waste meal built from seasonal produce, featuring roasted vegetables, whole grains, and a zesty herb dressing.',
      ingredients: [
        '2 cups mixed seasonal vegetables, chopped',
        '1 cup cooked quinoa or brown rice',
        '2 tablespoons olive oil',
        '1 teaspoon mixed dried herbs',
        '2 tablespoons lemon juice',
        '1/4 cup toasted seeds',
        'Salt and pepper to taste'
      ],
      steps: [
        'Preheat oven to 400°F (200°C) and line a baking sheet',
        'Toss vegetables with 1 tbsp olive oil, herbs, salt, and pepper',
        'Roast for 20-25 minutes, stirring halfway, until golden',
        'While vegetables roast, whisk remaining olive oil with lemon juice',
        'Cook grains according to package directions if needed',
        'Layer grains, roasted vegetables, and any fresh greens',
        'Drizzle with citrus-herb dressing and top with toasted seeds',
        'Season with additional salt and pepper to taste'
      ],
      prepTime: '15 minutes',
      cookTime: '25 minutes',
      servings: '4 servings',
      difficulty: 'Easy',
      nutritionHighlights: [
        'High in fiber from whole grains and vegetables',
        'Rich in vitamins and minerals from seasonal produce',
        'Healthy fats from olive oil and seeds',
        'Plant-based protein from quinoa'
      ],
      culturalNotes: `Celebrates ${culturalContext} flavors while promoting zero-waste cooking by using whatever vegetables you have on hand. Bowl-based meals have roots in many cultures, from Mediterranean mezze to Asian rice bowls.`,
      tips: [
        'Use any vegetables you have - root vegetables, squash, or cruciferous all work great',
        'Meal prep by roasting vegetables in advance and storing for up to 4 days',
        'Customize with toppings like avocado, tahini, hot sauce, or pickled vegetables'
      ]
    },
    alternates: [
      {
        title: 'Comforting Lentil Stew',
        description: 'Slow-simmered red lentils with warming aromatics and vegetables in a rich, flavorful broth.',
        ingredients: [
          '1 cup red lentils, rinsed',
          '1 large onion, diced',
          '3 cloves garlic, minced',
          '2 carrots, diced',
          '4 cups vegetable broth',
          '1 can (14 oz) diced tomatoes',
          '2 teaspoons cumin',
          '1 teaspoon turmeric',
          '2 tablespoons olive oil',
          'Salt and pepper to taste'
        ],
        steps: [
          'Heat olive oil in a large pot over medium heat',
          'Sauté diced onion for 5-7 minutes until softened',
          'Add garlic, cumin, and turmeric; cook 1-2 minutes until fragrant',
          'Stir in carrots and cook for 3-4 minutes',
          'Add lentils, broth, and tomatoes with juices',
          'Bring to boil, reduce heat, simmer 20-25 minutes until lentils tender',
          'Season with salt and pepper, serve hot'
        ],
        prepTime: '10 minutes',
        cookTime: '30 minutes',
        servings: '6 servings',
        difficulty: 'Easy',
        nutritionHighlights: [
          'Excellent source of plant-based protein from lentils',
          'High in iron and folate',
          'Anti-inflammatory spices like turmeric and cumin',
          'Rich in fiber for digestive health'
        ],
        tips: [
          'Red lentils break down into creamy texture; use green/brown for more texture',
          'This stew thickens as it sits - add more broth when reheating',
          'Top with yogurt, cilantro, or olive oil for extra flavor'
        ]
      }
    ]
  };
}

/**
 * Analyze pantry photos using OpenAI Vision API (GPT-4o)
 * @param {string[]} photoUrls - Array of base64 image data URLs
 * @param {string} apiKey - OpenAI API key
 * @returns {Promise<string[]>} - Array of detected ingredients
 */
async function analyzePantryPhotos(photoUrls, apiKey) {
  if (!photoUrls || photoUrls.length === 0) {
    return [];
  }

  console.log(`🔍 Analyzing ${photoUrls.length} pantry photo(s) with OpenAI Vision...`);

  try {
    // Prepare content array with text prompt and images
    const content = [
      {
        type: 'text',
        text: `Analyze these pantry/fridge photos and list ALL visible food ingredients you can identify. 
Be specific and include:
- Fresh vegetables and fruits (with variety/type if visible)
- Proteins (tofu, tempeh, legumes, etc.)
- Grains and pasta
- Canned/jarred goods
- Condiments and sauces
- Herbs and spices
- Dairy alternatives
- Any other edible ingredients

Format: Return a simple comma-separated list of ingredients. Be thorough but practical.
Example: "tomatoes, basil, garlic, olive oil, pasta, canned chickpeas, bell peppers"

Only list ingredients you can clearly see. If the image is unclear or shows no food, say "no ingredients visible".`
      }
    ];

    // Add each photo as an image input
    for (const photoUrl of photoUrls) {
      content.push({
        type: 'image_url',
        image_url: {
          url: photoUrl,
          detail: 'high' // Use high detail for better ingredient recognition
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
        max_tokens: 500,
        temperature: 0.3 // Lower temperature for more consistent/accurate detection
      })
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('❌ OpenAI Vision API error:', response.status, error);
      throw new Error(`Vision API failed: ${response.status}`);
    }

    const data = await response.json();
    const analysisText = data.choices[0]?.message?.content || '';
    
    console.log('📸 Vision API response:', analysisText);

    // Parse the response - should be comma-separated list
    if (analysisText.toLowerCase().includes('no ingredients visible')) {
      console.warn('⚠️ No ingredients detected in photos');
      return [];
    }

    // Extract ingredients from the response
    const ingredients = analysisText
      .split(',')
      .map(item => item.trim())
      .filter(item => item.length > 0 && !item.toLowerCase().includes('no ingredients'));

    console.log(`✅ Detected ${ingredients.length} ingredients:`, ingredients);
    return ingredients;

  } catch (error) {
    console.error('❌ Failed to analyze pantry photos:', error);
    throw error;
  }
}

