/**
 * Vercel Serverless Function - Fetch Recipe Images using OpenAI Web Search
 * URL: /api/ai/recipe-images
 * Fetches 4 high-quality images for a given recipe using web search
 */

export default async function handler(req, res) {
  console.log('🖼️  Recipe Images API called:', req.method, new Date().toISOString());
  
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
    const { recipeTitle, recipeDescription } = req.body;

    if (!recipeTitle) {
      console.warn('⚠️ Recipe title missing');
      return res.status(400).json({ ok: false, message: 'Recipe title is required' });
    }

    console.log('📝 Fetching images for recipe:', recipeTitle);

    const openaiKey = process.env.OPENAI_API_KEY;
    
    if (!openaiKey) {
      console.warn('⚠️ OpenAI API key not configured');
      return res.status(200).json({
        ok: true,
        images: [],
        message: 'Web search not configured'
      });
    }

    // Use OpenAI with web search to find recipe images
    const searchQuery = `Find 4 high-quality images of "${recipeTitle}" ${recipeDescription ? `(${recipeDescription})` : ''} food dish recipe`;
    
    console.log('🔍 Search query:', searchQuery);

    const startTime = Date.now();

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
            content: 'You are a helpful assistant that finds high-quality food images. Return ONLY a JSON array of image URLs, nothing else. Format: ["url1", "url2", "url3", "url4"]'
          },
          {
            role: 'user',
            content: `Find exactly 4 high-quality, appetizing images of the dish "${recipeTitle}". ${recipeDescription ? `Description: ${recipeDescription}. ` : ''}Return only a JSON array of image URLs.`
          }
        ],
        tools: [
          { type: 'web_search' }
        ],
        temperature: 0.3,
        max_tokens: 500
      })
    });

    const duration = Date.now() - startTime;

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ OpenAI API error:', response.status, errorText);
      return res.status(200).json({
        ok: true,
        images: [],
        message: 'Web search failed',
        error: errorText
      });
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    console.log('✅ OpenAI response received:', content);
    
    // Parse image URLs
    let imageUrls = [];
    try {
      // Try to parse as JSON array
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) {
        imageUrls = parsed.filter(url => typeof url === 'string' && url.startsWith('http'));
      }
    } catch (parseError) {
      // If not JSON, try to extract URLs from text
      console.log('⚠️ Response not JSON, extracting URLs from text');
      const urlRegex = /https?:\/\/[^\s"'<>]+\.(?:jpg|jpeg|png|webp|gif)/gi;
      imageUrls = (content.match(urlRegex) || []).slice(0, 4);
    }

    // Fallback: If web search didn't work, provide placeholder or stock food images
    if (imageUrls.length === 0) {
      console.warn('⚠️ No images found via web search, using fallback');
      imageUrls = [
        `https://source.unsplash.com/800x600/?${encodeURIComponent(recipeTitle)},food,1`,
        `https://source.unsplash.com/800x600/?${encodeURIComponent(recipeTitle)},recipe,2`,
        `https://source.unsplash.com/800x600/?${encodeURIComponent(recipeTitle)},dish,3`,
        `https://source.unsplash.com/800x600/?${encodeURIComponent(recipeTitle)},meal,4`
      ];
    }

    // Ensure we have exactly 4 images
    while (imageUrls.length < 4 && imageUrls.length > 0) {
      imageUrls.push(imageUrls[0]); // Duplicate first image
    }
    imageUrls = imageUrls.slice(0, 4); // Take only first 4

    console.log('✅ Returning image URLs:', imageUrls.length);

    res.status(200).json({
      ok: true,
      images: imageUrls,
      metadata: {
        recipeTitle,
        searchDurationMs: duration,
        imageCount: imageUrls.length,
        model: 'gpt-4o',
        webSearchUsed: true
      }
    });

  } catch (error) {
    console.error('❌ Recipe images error:', error.message || error);
    
    // Return fallback Unsplash images on error
    const { recipeTitle = 'food' } = req.body || {};
    const fallbackImages = [
      `https://source.unsplash.com/800x600/?${encodeURIComponent(recipeTitle)},food,1`,
      `https://source.unsplash.com/800x600/?${encodeURIComponent(recipeTitle)},recipe,2`,
      `https://source.unsplash.com/800x600/?${encodeURIComponent(recipeTitle)},dish,3`,
      `https://source.unsplash.com/800x600/?${encodeURIComponent(recipeTitle)},meal,4`
    ];

    return res.status(200).json({
      ok: true,
      images: fallbackImages,
      message: 'Using fallback images',
      error: error.message
    });
  }
}
