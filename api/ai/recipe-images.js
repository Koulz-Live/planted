/**
 * Vercel Serverless Function - Recipe Images
 * URL: /api/ai/recipe-images
 * Returns 4 image URLs for a given recipe.
 *
 * Strategy:
 * 1) Try Unsplash Source (redirects) and validate that URLs look like images.
 * 2) If Unsplash yields no usable URLs, fallback to Pexels (if PEXELS_API_KEY set).
 * 3) If still empty, fallback to Pixabay (if PIXABAY_API_KEY set).
 */

function uniq(arr) {
  return Array.from(new Set(arr.filter(Boolean)));
}

function looksLikeImageUrl(url) {
  if (!url || typeof url !== 'string') return false;
  if (!/^https?:\/\//i.test(url)) return false;
  // Accept common image extensions OR known CDNs that commonly serve images without extensions.
  if (/\.(jpe?g|png|webp|gif)(\?|#|$)/i.test(url)) return true;
  if (/images\.unsplash\.com/i.test(url)) return true;
  if (/images\.pexels\.com/i.test(url)) return true;
  if (/pixabay\.com/i.test(url)) return true;
  return false;
}

async function resolveRedirect(url) {
  // Unsplash Source endpoints 302 to the actual image. We only want the final URL.
  const resp = await fetch(url, { method: 'GET', redirect: 'manual' });
  // Node fetch: 302/301 will have a Location header when redirect: 'manual'
  const loc = resp.headers.get('location');
  if (loc) return loc;

  // If it didn't redirect, return original (still might be an image)
  return url;
}

async function getUnsplashImages(recipeTitle) {
  const baseUrl = 'https://source.unsplash.com/800x600/?';
  const q = encodeURIComponent(recipeTitle);

  // Use a few variations to reduce duplicates.
  const candidates = [
    `${baseUrl}${q},food,plated`,
    `${baseUrl}${q},recipe,cooking`,
    `${baseUrl}${q},dish,meal`,
    `${baseUrl}${q},cuisine,delicious`
  ];

  const resolved = await Promise.all(
    candidates.map(async (u) => {
      try {
        return await resolveRedirect(u);
      } catch {
        return null;
      }
    })
  );

  return uniq(resolved).filter(looksLikeImageUrl).slice(0, 4);
}

async function getPexelsImages({ recipeTitle, recipeDescription, count = 4 }) {
  const apiKey = process.env.PEXELS_API_KEY;
  if (!apiKey) return [];

  const query = [recipeTitle, recipeDescription, 'food', 'dish']
    .filter(Boolean)
    .join(' ')
    .slice(0, 300);

  const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=${Math.max(
    4,
    Math.min(20, count * 2)
  )}&orientation=landscape`;

  const resp = await fetch(url, {
    headers: {
      Authorization: apiKey
    }
  });

  if (!resp.ok) {
    const txt = await resp.text().catch(() => '');
    console.warn('⚠️ Pexels failed:', resp.status, txt?.slice?.(0, 200));
    return [];
  }

  const data = await resp.json();
  const photos = Array.isArray(data?.photos) ? data.photos : [];
  const urls = photos
    .map((p) => p?.src?.large2x || p?.src?.large || p?.src?.original)
    .filter(looksLikeImageUrl);

  return uniq(urls).slice(0, count);
}

async function getPixabayImages({ recipeTitle, recipeDescription, count = 4 }) {
  const apiKey = process.env.PIXABAY_API_KEY;
  if (!apiKey) return [];

  const query = [recipeTitle, recipeDescription, 'food']
    .filter(Boolean)
    .join(' ')
    .slice(0, 100);

  const url = `https://pixabay.com/api/?key=${encodeURIComponent(
    apiKey
  )}&q=${encodeURIComponent(query)}&image_type=photo&orientation=horizontal&per_page=${Math.max(
    10,
    count * 3
  )}&safesearch=true`;

  const resp = await fetch(url);
  if (!resp.ok) {
    const txt = await resp.text().catch(() => '');
    console.warn('⚠️ Pixabay failed:', resp.status, txt?.slice?.(0, 200));
    return [];
  }

  const data = await resp.json();
  const hits = Array.isArray(data?.hits) ? data.hits : [];
  const urls = hits
    .map((h) => h?.largeImageURL || h?.webformatURL)
    .filter(looksLikeImageUrl);

  return uniq(urls).slice(0, count);
}

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

    // Try Unsplash first (resolves redirects to actual image URLs)
    let images = await getUnsplashImages(recipeTitle);
    let provider = images.length ? 'unsplash' : 'none';
    console.log(`🖼️  Unsplash resolved returned ${images.length} images`);

    // Fallback to Pexels if Unsplash fails
    if (images.length === 0) {
      images = await getPexelsImages({ recipeTitle, recipeDescription, count: 4 });
      if (images.length) provider = 'pexels';
      console.log(`🖼️  Pexels returned ${images.length} images`);
    }

    // Fallback to Pixabay if both fail
    if (images.length === 0) {
      images = await getPixabayImages({ recipeTitle, recipeDescription, count: 4 });
      if (images.length) provider = 'pixabay';
      console.log(`🖼️  Pixabay returned ${images.length} images`);
    }

    // Last resort: return Unsplash source URLs (even if we couldn't resolve/validate)
    if (images.length === 0) {
      const baseUrl = 'https://source.unsplash.com/800x600/?';
      const q = encodeURIComponent(recipeTitle);
      images = [
        `${baseUrl}${q},food,plated`,
        `${baseUrl}${q},recipe,cooking`,
        `${baseUrl}${q},dish,meal`,
        `${baseUrl}${q},cuisine,delicious`
      ];
      provider = 'unsplash-source';
      console.log(`🖼️  Using Unsplash source URLs (fallback)`);
    }

    // Ensure at least 4 images
    while (images.length < 4 && images.length > 0) images.push(images[images.length - 1]);
    images = images.slice(0, 4);

    console.log(`✅ Returning ${images.length} images (provider=${provider})`);

    return res.status(200).json({
      ok: true,
      images,
      recipe: recipeTitle,
      provider,
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
