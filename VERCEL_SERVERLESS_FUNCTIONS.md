# Vercel Serverless Functions Setup ✅

## Overview
Created Vercel serverless functions to handle AI-powered recipe generation on the production site.

## Functions Created

### 1. `/api/ai/recipes.js`
**Purpose**: Enhanced recipe generation with comprehensive details  
**URL**: `https://planted-ashy.vercel.app/api/ai/recipes`  
**Method**: POST

**Request Body**:
```json
{
  "dietaryNeeds": ["Vegan", "Gluten-Free"],
  "availableIngredients": ["chickpeas", "tomatoes", "spinach"],
  "culturalPreferences": ["Mediterranean"],
  "season": "Spring"
}
```

**Response**:
```json
{
  "ok": true,
  "data": {
    "spotlight": {
      "title": "Recipe Name",
      "description": "Description",
      "ingredients": ["2 cups ingredient", "1 tbsp ingredient"],
      "steps": ["Step 1 with temps and times", "Step 2"],
      "prepTime": "15 minutes",
      "cookTime": "30 minutes",
      "servings": "4 servings",
      "difficulty": "Easy",
      "nutritionHighlights": ["Benefit 1", "Benefit 2"],
      "culturalNotes": "Cultural context",
      "tips": ["Tip 1", "Tip 2"]
    },
    "alternates": [
      { /* same structure */ }
    ]
  }
}
```

## Environment Variables Required

### On Vercel:
```bash
OPENAI_API_KEY=sk-proj-...  # Optional: For AI-powered generation
```

**Note**: If `OPENAI_API_KEY` is not set, the function returns comprehensive fallback recipes automatically.

## How It Works

### With OpenAI API Key:
1. Receives recipe request from frontend
2. Builds comprehensive prompt with dietary needs, ingredients, cultural preferences
3. Calls OpenAI GPT-4 with structured output
4. Parses JSON response
5. Returns enhanced recipes with spotlight and alternates

### Without OpenAI API Key (Fallback):
1. Returns pre-configured fallback recipes
2. Includes all enhanced fields (measurements, times, nutrition, tips)
3. Adapts to cultural preferences from request
4. Works immediately without configuration

## Vercel Deployment

### Automatic Deployment:
- Pushes to `main` branch trigger automatic deployment
- Vercel detects `/api/` folder and creates serverless functions
- Each `.js` file in `/api/` becomes an endpoint

### Manual Deployment:
```bash
git add api/ai/recipes.js
git commit -m "Add recipe serverless function"
git push origin main
```

Vercel will:
1. Build the frontend (React + Vite)
2. Create serverless functions from `/api/` folder
3. Deploy to: `https://planted-ashy.vercel.app`

## Testing

### Test the API Endpoint Directly:
```bash
curl -X POST https://planted-ashy.vercel.app/api/ai/recipes \
  -H "Content-Type: application/json" \
  -d '{
    "dietaryNeeds": ["Vegan"],
    "availableIngredients": ["chickpeas", "tomatoes"],
    "culturalPreferences": ["Mediterranean"]
  }'
```

### Test in Browser:
1. Go to: https://planted-ashy.vercel.app/recipes
2. Fill out the recipe form
3. Click "Generate Recipes"
4. Should see recipes in sidebar

### Check Console:
- Open browser DevTools (F12)
- Should NOT see: "Network error"
- Should see: Recipe data returned successfully

## URL Structure

### Local Development:
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3000`
- API calls: `/api/ai/recipes` → proxied to `http://localhost:3000/api/ai/recipes`

### Production (Vercel):
- Frontend: `https://planted-ashy.vercel.app`
- API: `https://planted-ashy.vercel.app/api/ai/recipes`
- No proxy needed - serverless functions are at same domain

## Vercel Function Configuration

### File Location:
```
/api/ai/recipes.js  → https://yoursite.vercel.app/api/ai/recipes
```

### CORS Headers:
```javascript
res.setHeader('Access-Control-Allow-Origin', '*');
res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-user-id');
```

### Timeout:
- Default: 10 seconds (Hobby plan)
- Can be increased with Pro plan

### Memory:
- Default: 1024 MB
- Sufficient for OpenAI API calls

## Frontend Integration

The frontend (`RecipesPage.tsx`) calls:
```typescript
const response = await fetch('/api/ai/recipes', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-user-id': 'demo-user'
  },
  body: JSON.stringify({
    dietaryNeeds: ['Vegan'],
    availableIngredients: ['chickpeas', 'tomatoes'],
    culturalPreferences: ['Mediterranean'],
    season: 'Spring'
  })
});
```

## Error Handling

### OpenAI API Not Available:
- Function returns fallback recipes automatically
- No error shown to user
- Full recipe functionality maintained

### Network Errors:
- CORS configured for cross-origin requests
- Proper error responses with status codes
- Frontend shows user-friendly error messages

### Validation Errors:
- Returns 400 Bad Request for missing required fields
- Clear error messages in response

## Deployment Status

| Component | Status | URL |
|-----------|--------|-----|
| Frontend | ✅ Deployed | https://planted-ashy.vercel.app |
| Serverless Function | ✅ Deployed | https://planted-ashy.vercel.app/api/ai/recipes |
| Firebase | ✅ Configured | Connected |
| OpenAI (Optional) | ⏳ Needs API key | - |

## Next Steps

### 1. Add OpenAI API Key (Optional)
To enable AI-powered recipe generation:
1. Go to Vercel Dashboard
2. Select "planted" project
3. Settings → Environment Variables
4. Add: `OPENAI_API_KEY=sk-proj-...`
5. Redeploy

### 2. Create More Serverless Functions
Following the same pattern, create:
- `/api/ai/plant-plan.js` - Plant care recommendations
- `/api/ai/nutrition.js` - Nutrition coaching
- `/api/ai/storytelling.js` - Food storytelling

### 3. Monitor Performance
- Check Vercel Analytics for function performance
- Monitor OpenAI API usage
- Track error rates

## Troubleshooting

### "Network error" on production:
- ✅ Fixed by creating serverless function
- Vercel automatically serves functions at `/api/*`

### Function not found:
- Check file is in `/api/` folder
- Verify filename matches URL structure
- Redeploy: `git push origin main`

### CORS errors:
- Verify CORS headers in function
- Check browser console for specific error
- Test with curl to isolate issue

### Timeout errors:
- Reduce OpenAI max_tokens
- Optimize prompt length
- Consider upgrading Vercel plan

---

## Summary

✅ **Created** `/api/ai/recipes.js` serverless function  
✅ **Deployed** to Vercel automatically  
✅ **Configured** fallback recipes for reliability  
✅ **Fixed** "Network error" on production  
✅ **Tested** endpoint structure and responses  

**Your app now works online at https://planted-ashy.vercel.app!** 🎉
