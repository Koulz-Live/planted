/**
 * Vercel Serverless Function - Recipe Detail Generation using OpenAI
 * URL: /api/ai/recipe-detail
 * Generates comprehensive recipe details from basic recipe information
 */

export default async function handler(req, res) {
  console.log('🤖 Recipe Detail API called:', req.method, new Date().toISOString());
  
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
      recipeTitle, 
      recipeDescription, 
      existingIngredients = [],
      category,
      prepTime,
      cookTime,
      servings
    } = req.body;

    if (!recipeTitle) {
      console.warn('⚠️ Recipe title missing');
      return res.status(400).json({ 
        ok: false, 
        message: 'Recipe title is required' 
      });
    }

    console.log('🤖 Generating detailed recipe for:', recipeTitle);

    const openaiKey = process.env.OPENAI_API_KEY;
    
    if (!openaiKey) {
      console.warn('⚠️ OpenAI API key not configured');
      return res.status(200).json({
        ok: false,
        message: 'Recipe generation not configured'
      });
    }

    const startTime = Date.now();

    // Build context for the AI
    let context = `Recipe: ${recipeTitle}`;
    if (recipeDescription) context += `\nDescription: ${recipeDescription}`;
    if (category) context += `\nCategory: ${category}`;
    if (existingIngredients && existingIngredients.length > 0) {
      context += `\nBasic ingredients: ${existingIngredients.join(', ')}`;
    }
    if (prepTime) context += `\nPrep Time: ${prepTime}`;
    if (cookTime) context += `\nCook Time: ${cookTime}`;
    if (servings) context += `\nServings: ${servings}`;

    // Use OpenAI to generate comprehensive recipe details
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
            content: `You are an expert chef and culinary instructor with deep knowledge of global cuisines, cooking techniques, and recipe development.

Your task is to generate a comprehensive, detailed recipe based on the provided recipe information and return it as valid JSON.

Return a JSON object with this exact structure:
{
  "recipe": {
    "title": "Recipe Name",
    "description": "Detailed, appetizing description (2-3 sentences explaining the dish, its origins, and appeal)",
    "ingredients": [
      "precise ingredient with exact measurement (e.g., '2 large tomatoes, diced')",
      "include brand recommendations or quality tips where helpful"
    ],
    "instructions": [
      "Clear, detailed step-by-step instruction with timing and technique",
      "Include tips for success, what to look for, and common mistakes to avoid",
      "Each step should be comprehensive but easy to follow"
    ],
    "prepTime": "X min",
    "cookTime": "X min",
    "servings": "X",
    "category": "Category name",
    "culturalNotes": "Interesting cultural context, history, or traditional serving suggestions (2-3 sentences)",
    "nutritionHighlights": [
      "Key nutritional benefit or health highlight",
      "Dietary information or allergen notes"
    ],
    "source": "Traditional/Modern/Fusion/Regional cuisine info"
  }
}

Requirements:
- Expand on existing information with authentic culinary expertise
- Provide precise measurements and specific ingredient details
- Include professional cooking techniques and tips
- Add cultural context that enriches the cooking experience
- Ensure ingredients list is complete and realistic
- Make instructions detailed enough for beginners to follow
- Include timing, temperature, and visual cues in instructions
- Add nutrition highlights focusing on plant-based benefits
- Maintain authenticity to the dish's cultural origins
- If dietary category (Kosher, Halal, Vegan) is mentioned, ensure compliance`
          },
          {
            role: 'user',
            content: `Generate a comprehensive, detailed recipe with professional cooking instructions for:\n\n${context}`
          }
        ],
        temperature: 0.7,
        max_tokens: 3000,
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

    console.log(`✅ Recipe detail generated in ${duration}ms`);

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
        message: 'Failed to parse recipe data'
      });
    }

    if (!parsedData.recipe) {
      console.error('❌ Invalid recipe structure in response');
      return res.status(200).json({
        ok: false,
        message: 'Invalid recipe data structure'
      });
    }

    // Ensure all required fields are present
    const recipe = {
      title: parsedData.recipe.title || recipeTitle,
      description: parsedData.recipe.description || recipeDescription || '',
      ingredients: parsedData.recipe.ingredients || existingIngredients || [],
      instructions: parsedData.recipe.instructions || [],
      prepTime: parsedData.recipe.prepTime || prepTime || '',
      cookTime: parsedData.recipe.cookTime || cookTime || '',
      servings: parsedData.recipe.servings || servings || '',
      category: parsedData.recipe.category || category || '',
      culturalNotes: parsedData.recipe.culturalNotes || '',
      nutritionHighlights: parsedData.recipe.nutritionHighlights || [],
      source: parsedData.recipe.source || ''
    };

    console.log('✅ Recipe detail generation successful:', recipe.title);
    console.log(`📊 Details: ${recipe.ingredients.length} ingredients, ${recipe.instructions.length} steps`);

    return res.status(200).json({
      ok: true,
      recipe: recipe,
      metadata: {
        generationTime: duration,
        model: 'gpt-4o',
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Recipe detail generation error:', error);
    return res.status(500).json({
      ok: false,
      message: 'Failed to generate recipe details',
      error: error.message
    });
  }
}
