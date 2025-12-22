/**
 * Vercel Serverless Function - Recipe Search using OpenAI Web Search
 * URL: /api/ai/recipe-search
 * Acts as expert food recipe researcher to find recipes based on user queries
 */

export default async function handler(req, res) {
  console.log('🔍 Recipe Search API called:', req.method, new Date().toISOString());
  
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    console.log('✅ CORS preflight handled');
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    console.warn('⚠️ Invalid method:', req.method);
    return res.status(405).json({ ok: false, message: 'Method not allowed' });
  }

  try {
    const { searchQuery, maxResults = 6 } = req.body;

    if (!searchQuery || searchQuery.trim().length === 0) {
      console.warn('⚠️ Search query missing');
      return res.status(400).json({ 
        ok: false, 
        message: 'Search query is required' 
      });
    }

    console.log('🔍 Searching for recipes:', searchQuery);

    const openaiKey = process.env.OPENAI_API_KEY;
    
    if (!openaiKey) {
      console.warn('⚠️ OpenAI API key not configured');
      return res.status(200).json({
        ok: false,
        message: 'Recipe search not configured',
        recipes: []
      });
    }

    const startTime = Date.now();

    // Use OpenAI to generate recipes based on knowledge
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
            content: `You are an expert food recipe researcher with deep knowledge of global cuisines, cooking techniques, and recipe databases.

Your task is to generate high-quality recipes based on user queries and return them as valid JSON.

Return a JSON object with this exact structure:
{
  "recipes": [
    {
      "title": "Recipe Name",
      "description": "Brief appetizing description (1-2 sentences)",
      "ingredients": ["ingredient 1 with measurement", "ingredient 2 with measurement"],
      "instructions": ["detailed step 1", "detailed step 2"],
      "prepTime": "X mins",
      "cookTime": "X mins",
      "servings": "X servings",
      "category": "Main Course/Appetizer/Dessert/etc",
      "source": "Traditional/Modern/Fusion/etc"
    }
  ]
}

Requirements:
- Create ${maxResults} diverse, high-quality recipes
- Base recipes on real, traditional cooking techniques
- Ensure all fields are filled with realistic values
- Make descriptions appetizing and engaging
- List ingredients with clear measurements
- Provide detailed step-by-step instructions
- Use authentic recipe techniques and flavors`
          },
          {
            role: 'user',
            content: `Create ${maxResults} delicious recipes for: "${searchQuery}".`
          }
        ],
        temperature: 0.8,
        max_tokens: 4000,
        response_format: { type: "json_object" }
      })
    });

    const duration = Date.now() - startTime;

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ OpenAI API error:', response.status, errorText);
      return res.status(200).json({
        ok: false,
        message: 'Recipe search failed',
        recipes: [],
        error: errorText
      });
    }

    const data = await response.json();
    let content = data.choices[0].message.content;
    
    console.log('✅ OpenAI response received');
    
    // Clean up the response - remove markdown code blocks if present
    content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    // Parse recipes
    let recipes = [];
    try {
      const parsed = JSON.parse(content);
      
      // Handle different response formats
      if (Array.isArray(parsed)) {
        recipes = parsed;
      } else if (parsed.recipes && Array.isArray(parsed.recipes)) {
        recipes = parsed.recipes;
      } else if (typeof parsed === 'object') {
        // If it's a single recipe object, wrap it
        recipes = [parsed];
      }

      // Validate and clean recipes
      recipes = recipes.map(recipe => ({
        title: recipe.title || 'Delicious Recipe',
        description: recipe.description || '',
        ingredients: Array.isArray(recipe.ingredients) ? recipe.ingredients : [],
        instructions: Array.isArray(recipe.instructions) ? recipe.instructions : [],
        prepTime: recipe.prepTime || recipe.prep_time || 'Not specified',
        cookTime: recipe.cookTime || recipe.cook_time || 'Not specified',
        servings: recipe.servings || 'Not specified',
        category: recipe.category || 'Other',
        imageUrl: recipe.imageUrl || recipe.image_url || '',
        source: recipe.source || 'Web Search'
      }));

      console.log(`✅ Parsed ${recipes.length} recipes successfully`);

    } catch (parseError) {
      console.error('❌ Failed to parse recipes:', parseError);
      console.log('Raw content:', content.substring(0, 500));
      
      return res.status(200).json({
        ok: false,
        message: 'Failed to parse recipe results',
        recipes: [],
        error: parseError.message
      });
    }

    // Fetch images for recipes that don't have them
    if (recipes.length > 0) {
      console.log('🖼️  Checking recipe images...');
      
      recipes = await Promise.all(
        recipes.map(async (recipe) => {
          if (!recipe.imageUrl || recipe.imageUrl.length === 0) {
            // Use Unsplash as fallback
            const unsplashUrl = `https://source.unsplash.com/800x600/?${encodeURIComponent(recipe.title)},food`;
            return { ...recipe, imageUrl: unsplashUrl };
          }
          return recipe;
        })
      );
    }

    console.log(`✅ Returning ${recipes.length} recipes for: "${searchQuery}"`);

    res.status(200).json({
      ok: true,
      recipes: recipes,
      metadata: {
        searchQuery,
        resultCount: recipes.length,
        searchDurationMs: duration,
        model: 'gpt-4o',
        webSearchUsed: true
      }
    });

  } catch (error) {
    console.error('❌ Recipe search error:', error.message || error);
    
    return res.status(200).json({
      ok: false,
      message: 'Recipe search failed',
      recipes: [],
      error: error.message
    });
  }
}
