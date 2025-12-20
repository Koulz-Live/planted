# Recipes Page - Troubleshooting & Fix Guide

## Issues Identified & Fixed

### Issue 1: Error Handling in Recipe Generation
**Problem:** When API calls fail, users may see cryptic errors or blank pages.

**Fix Applied:**
- Enhanced error messages
- Added fallback recipes
- Improved loading states
- Better user feedback

### Issue 2: Firebase Integration
**Problem:** Firebase operations might fail silently if not configured.

**Status:** 
- ✅ Firebase is properly configured with error handling
- ✅ Graceful degradation when Firebase unavailable
- ✅ Clear console warnings for debugging

### Issue 3: API Endpoint
**Problem:** `/api/ai/recipes` endpoint might not be responding correctly.

**Status:**
- ✅ API file exists at `api/ai/recipes.js`
- ✅ Proper fallback responses implemented
- ✅ CORS headers configured
- ⚠️ **ACTION REQUIRED:** Ensure `OPENAI_API_KEY` is set in Vercel environment variables

## How to Test

### 1. Local Testing
```bash
cd /Applications/XAMPP/xamppfiles/htdocs/Planted/v1
npm run dev
```

Visit: http://localhost:5173/recipes

### 2. Production Testing
Visit: https://planted-ashy.vercel.app/recipes

## Expected Behavior

### Generate Recipes Tab
1. Fill in "Available Ingredients" (required)
2. Select dietary needs (optional)
3. Select cultural preferences (optional)
4. Choose season (optional)
5. Click "Generate Recipes"
6. See loading spinner
7. Recipes appear in sidebar
8. Can save recipes to favorites (❤️ button)

### Recipe Gallery Tab  
1. Click "Recipe Gallery" tab
2. See masonry grid of recipe cards
3. Hover for recipe details
4. View recipe times, servings, categories

### Community Requests Tab
1. Click "Community Requests" tab
2. Fill out request form
3. Submit request
4. See request appear in list
5. Vote on requests

## Common Issues & Solutions

### "Failed to generate recipes"
**Cause:** API endpoint error or OpenAI key missing

**Solution:**
1. Check Vercel logs for errors
2. Verify `OPENAI_API_KEY` is set
3. Fallback recipes should still appear

### "Firebase is not configured"
**Cause:** Missing Firebase environment variables

**Solution:**
1. Check `.env` file has all `VITE_FIREBASE_*` variables
2. Console will show warning but app still works
3. History and favorites features disabled until configured

### Recipes not showing
**Cause:** JavaScript error or API timeout

**Solution:**
1. Open browser DevTools (F12)
2. Check Console for errors
3. Check Network tab for failed requests
4. Verify ingredients field is not empty

### Images not loading
**Cause:** External image URLs blocked or slow

**Solution:**
1. Check network connection
2. Images use Pexels CDN (should be reliable)
3. Images are lazy-loaded

## Environment Variables Required

### Development (.env)
```bash
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

### Production (Vercel)
```bash
OPENAI_API_KEY=sk-proj-your_key_here
# Plus all VITE_FIREBASE_* variables above
```

## Manual Testing Checklist

- [ ] Generate Recipes tab loads
- [ ] Recipe Gallery tab loads
- [ ] Community Requests tab loads
- [ ] Can type in ingredients field
- [ ] Can select dietary options (click cards)
- [ ] Can select cultural preferences (click cards)
- [ ] Can select season dropdown
- [ ] Generate button clickable
- [ ] Loading spinner appears when generating
- [ ] Recipes appear after generation
- [ ] Can expand recipe details
- [ ] Can save recipe to favorites
- [ ] Gallery images load
- [ ] Can submit community request
- [ ] Can vote on requests

## API Testing

Test the recipes API endpoint directly:

```bash
curl -X POST https://planted-ashy.vercel.app/api/ai/recipes \
  -H "Content-Type: application/json" \
  -H "x-user-id: demo-user" \
  -d '{
    "dietaryNeeds": ["Vegan"],
    "availableIngredients": ["tomatoes", "pasta", "basil", "garlic"],
    "culturalPreferences": ["Mediterranean"],
    "season": "Summer"
  }'
```

Expected response:
```json
{
  "ok": true,
  "data": {
    "spotlight": { ... },
    "alternates": [ ... ]
  }
}
```

## Deployment Status

**Frontend:** ✅ Deployed
**API Endpoint:** ✅ Deployed
**Firebase:** ✅ Configured
**OpenAI:** ⚠️ Verify key is set

## Next Steps

1. **Verify API Key:**
   - Go to Vercel Dashboard
   - Settings → Environment Variables
   - Check `OPENAI_API_KEY` exists
   - Redeploy if just added

2. **Test Production:**
   - Visit https://planted-ashy.vercel.app/recipes
   - Open DevTools Console
   - Try generating recipes
   - Check for errors

3. **Monitor Logs:**
   - Vercel Dashboard → Logs
   - Filter for `/api/ai/recipes`
   - Look for errors

## Support

If issues persist:
1. Check browser console for errors
2. Check Vercel function logs
3. Verify all environment variables set
4. Test API endpoint directly
5. Check Firebase connection

---

**Last Updated:** December 20, 2025
**Status:** Ready for testing
