# Testing the Gallery Recipe AI Generation Feature

## Quick Test Guide

### Prerequisites
✅ Development server running on http://localhost:5174 (or your port)  
✅ OpenAI API key configured in `.env`  
✅ Internet connection for API calls

## Test Steps

### 1. Navigate to Recipe Gallery
```
1. Open browser to http://localhost:5174
2. Click on "Recipes" in navigation
3. Click on "Recipe Gallery" tab
```

### 2. Test AI Recipe Generation

#### Test Case 1: Shakshuka (Middle Eastern)
```
1. Find "Shakshuka" card in the gallery
2. Click "View Recipe" button
3. Expected: Modal opens with loading spinner
4. Wait 3-7 seconds
5. Expected: Detailed recipe appears with:
   - 4 recipe images in carousel
   - Complete ingredient list with measurements
   - Step-by-step cooking instructions
   - Cultural notes about the dish
   - Nutrition highlights
   - Save to Favorites button
```

#### Test Case 2: Pap and Chakalaka (South African)
```
1. Find "Pap and Chakalaka" card
2. Click "View Recipe" button
3. Verify AI understands South African cuisine
4. Check for authentic cultural context
5. Verify cooking instructions are detailed
```

#### Test Case 3: Full English Breakfast (British)
```
1. Find "Full English Breakfast" card
2. Click "View Recipe" button
3. Verify Kosher dietary compliance
4. Check for traditional British cooking methods
5. Verify ingredient measurements are precise
```

### 3. Test Error Handling

#### Test Case 4: API Error Simulation
```
1. Temporarily rename .env file to disable OpenAI key
2. Click "View Recipe" on any recipe
3. Expected: Error message appears in modal
4. Restore .env file
5. Retry - should work normally
```

### 4. Test Modal Functionality

#### Test Case 5: Modal Navigation
```
1. Open a recipe detail modal
2. Test keyboard navigation (Tab, Esc)
3. Click "Close" button → Modal should close
4. Click outside modal (backdrop) → Modal stays open
5. Open another recipe → First modal closes, new one opens
```

#### Test Case 6: Save to Favorites
```
1. Generate a recipe (e.g., "Falafel Bowl")
2. Wait for full recipe to load
3. Click "Save to Favorites" button
4. Expected: Success message appears
5. Check Firebase Firestore for saved recipe
```

### 5. Test All Gallery Recipes

Verify each recipe generates properly:

| # | Recipe | Category | Expected Details |
|---|--------|----------|------------------|
| 1 | Shakshuka | Middle Eastern | Tomato-based, egg poaching technique |
| 2 | Falafel Bowl | Kosher & Halal | Chickpea fritters, tahini sauce |
| 3 | Moroccan Tagine | Moroccan | Slow cooking, preserved lemons |
| 4 | Acai Bowl | Kosher & Halal | Superfood, breakfast bowl |
| 5 | Pap and Chakalaka | South African | Maize porridge, spicy relish |
| 6 | Full English | British/Kosher | Traditional breakfast items |
| 7 | Sabich | Israeli/Kosher | Eggplant pita, Israeli street food |
| 8 | Lentil Soup | Turkish/Kosher & Halal | Mercimek, creamy soup |
| 9 | Grain Bowl | Mediterranean/Kosher | Farro, roasted vegetables |
| 10 | Fattoush | Levantine/Kosher & Halal | Bread salad, sumac |
| 11 | Biryani | South Asian/Halal | Layered rice, aromatic spices |
| 12 | Couscous Salad | Israeli/Kosher | Pearl couscous, herbs |

### 6. Performance Testing

#### Test Case 7: Load Time
```
1. Open browser DevTools → Network tab
2. Click "View Recipe" on any recipe
3. Measure time to completion
4. Expected: 3-7 seconds total
   - Recipe generation: 2-5 seconds
   - Image fetching: 1-2 seconds
```

#### Test Case 8: Multiple Rapid Clicks
```
1. Click "View Recipe" on Recipe A
2. Immediately click "View Recipe" on Recipe B
3. Expected: First request cancels, second completes
4. No duplicate modals
5. Proper state cleanup
```

### 7. Mobile Responsiveness

#### Test Case 9: Mobile View
```
1. Open DevTools → Toggle device toolbar
2. Select iPhone/Android device
3. Navigate to Recipe Gallery
4. Click "View Recipe"
5. Verify:
   - Modal fits screen
   - Scrolling works
   - Images display properly
   - Buttons are tappable
```

## Expected Console Logs

### Successful Generation:
```
🤖 Generating detailed recipe for: Shakshuka
🤖 Recipe Detail API called: POST 2025-12-28T...
📝 AI Response: {"recipe":{"title":"Shakshuka"...
✅ Recipe detail generated in 2453ms
🖼️  Fetching images for detailed recipe...
✅ Fetched 4 images for "Shakshuka"
✅ Generated detailed recipe: {...}
```

### Error (No API Key):
```
🤖 Generating detailed recipe for: Shakshuka
🤖 Recipe Detail API called: POST 2025-12-28T...
⚠️ OpenAI API key not configured
❌ Error generating gallery recipe: Failed to generate recipe details
```

## API Endpoint Testing

### Direct API Test (Optional)
```bash
curl -X POST http://localhost:5174/api/ai/recipe-detail \
  -H "Content-Type: application/json" \
  -d '{
    "recipeTitle": "Shakshuka",
    "recipeDescription": "Traditional Middle Eastern dish with poached eggs",
    "existingIngredients": ["Tomatoes", "Eggs", "Cumin"],
    "category": "Middle Eastern",
    "prepTime": "10 min",
    "cookTime": "20 min",
    "servings": "4"
  }'
```

Expected Response:
```json
{
  "ok": true,
  "recipe": {
    "title": "Shakshuka",
    "description": "...",
    "ingredients": [...],
    "instructions": [...],
    ...
  },
  "metadata": {
    "generationTime": 2453,
    "model": "gpt-4o",
    "timestamp": "2025-12-28T..."
  }
}
```

## Known Issues to Watch For

❌ **If recipe doesn't load**: Check OpenAI API key in .env  
❌ **If images don't appear**: Check /api/ai/recipe-images endpoint  
❌ **If modal doesn't close**: Check state management in React  
❌ **If save fails**: Check Firebase configuration  

## Success Criteria

✅ All 12 gallery recipes generate detailed recipes  
✅ Generation completes in < 10 seconds  
✅ Modal displays properly on desktop and mobile  
✅ Error states show user-friendly messages  
✅ Cultural notes are accurate and relevant  
✅ Ingredients have precise measurements  
✅ Instructions are detailed and clear  
✅ Images are relevant to the recipe  
✅ Save to Favorites works correctly  
✅ No console errors during normal operation  

## Debugging Tips

### Recipe Not Generating
```
1. Check browser console for errors
2. Verify OpenAI API key: echo $OPENAI_API_KEY
3. Test API directly with curl command above
4. Check API logs in terminal running dev server
```

### Modal Not Appearing
```
1. Check React state: selectedGalleryRecipe should not be null
2. Verify modal CSS classes are loaded
3. Check for z-index conflicts
4. Inspect element to see if modal is in DOM
```

### Images Not Loading
```
1. Verify /api/ai/recipe-images is deployed
2. Check network tab for failed requests
3. Verify Pexels API integration
4. Check CORS headers
```

## Next Steps After Testing

1. ✅ Verify all 12 recipes generate correctly
2. ✅ Test on multiple browsers (Chrome, Firefox, Safari)
3. ✅ Test on mobile devices
4. ✅ Collect user feedback
5. 🚀 Deploy to production (Vercel)
6. 📊 Monitor API usage and costs
7. 🔄 Iterate based on user feedback

---

**Ready to test?** Start with Test Case 1 (Shakshuka) and work through the list!

**Need help?** Check console logs and API responses for debugging information.
