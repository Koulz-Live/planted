/**
 * Vercel Serverless Function - Fetch Recipe Images using Unsplash
 * URL: /api/ai/recipe-images
 * Fetches 4 high-quality images for a given recipe
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

    // Use Unsplash for reliable, high-quality food images
    // Unsplash provides free, random images based on search terms
    const baseUrl = 'https://source.unsplash.com/800x600/?';
    const searchTerms = encodeURIComponent(recipeTitle);
    
    // Generate 4 unique image URLs with different additional keywords
    const imageUrls = [
      `${baseUrl}${searchTerms},food,plated`,
      `${baseUrl}${searchTerms},recipe,cooking`,
      `${baseUrl}${searchTerms},dish,meal`,
      `${baseUrl}${searchTerms},cuisine,delicious`
    ];

    console.log(`✅ Generated ${imageUrls.length} Unsplash image URLs`);

    return res.status(200).json({
      ok: true,
      images: imageUrls,
      recipe: recipeTitle,
      message: 'Images fetched successfully'
    });

  } catch (error) {
    console.error('❌ Recipe images error:', error);
    
    return res.status(500).json({
      ok: false,
      message: 'Failed to fetch recipe images',
      error: error.message,
      images: []
    });
  }
}
