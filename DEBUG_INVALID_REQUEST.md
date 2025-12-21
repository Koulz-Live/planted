# 🔍 Debug Guide: "Invalid request" Error

## Issue
You're seeing: **"Error: Invalid request. Please check your ingredients and try again."**

This means the API received an **empty ingredients array**.

## ✅ Fix Deployed (Commit: ab53a90a)

I've added **detailed debugging** to help identify exactly where the issue is.

## 🧪 How to Debug

### Step 1: Clear Browser Cache
```
Ctrl+Shift+R (Windows/Linux)
Cmd+Shift+R (Mac)
```

### Step 2: Open DevTools Console
Press **F12** → Console tab

### Step 3: Fill Out the Form

**IMPORTANT:** You MUST fill in the ingredients field!

**In the "Available Ingredients" field, type:**
```
tomatoes, pasta, basil, garlic, olive oil
```

### Step 4: Generate Recipes

Click **"Generate Recipes"** button

### Step 5: Check Console Logs

You should see **detailed logs** like this:

#### ✅ If Ingredients Are Entered Correctly:
```javascript
📝 Raw form data: {
  availableIngredients: "tomatoes, pasta, basil, garlic, olive oil",
  length: 45
}
📝 Parsed ingredients: ["tomatoes", "pasta", "basil", "garlic", "olive oil"]
🔄 Generating recipes with: {
  ingredients: ["tomatoes", "pasta", "basil", "garlic", "olive oil"],
  dietary: [],
  cultural: [],
  season: ""
}
📡 API Response status: 200 OK
✅ API Response received: { ok: true, data: {...} }
```

#### ❌ If Ingredients Field Is Empty:
```javascript
📝 Raw form data: {
  availableIngredients: "",
  length: 0
}
📝 Parsed ingredients: []
❌ Please enter at least one ingredient in the "Available Ingredients" field. Example: tomatoes, pasta, basil
```

### Step 6: Check Vercel Function Logs

1. Go to Vercel Dashboard
2. Your Project → **Logs**
3. Look for `/api/ai/recipes` request
4. You should see:

```javascript
📝 Request body received: {
  "dietaryNeeds": [],
  "availableIngredients": ["tomatoes", "pasta", "basil", "garlic", "olive oil"],
  "culturalPreferences": [],
  "pantryPhotoUrls": [],
  "season": "Summer"
}
📝 Parsed data: {
  ingredients: ["tomatoes", "pasta", "basil", "garlic", "olive oil"],
  ingredientsType: "object",
  ingredientsIsArray: true,
  ingredientsLength: 5,
  ...
}
```

## 🎯 Common Causes

### Cause 1: Ingredients Field Was Empty
**Solution:** Make sure you type ingredients in the textarea field

### Cause 2: Only Whitespace Entered
**Solution:** Enter actual ingredient names, not just spaces

### Cause 3: Browser Cache
**Solution:** Hard refresh (Ctrl+Shift+R)

### Cause 4: Form State Not Updating
**Solution:** Check console for "📝 Raw form data" log

## 📋 Debugging Checklist

- [ ] Hard refresh browser (Ctrl+Shift+R or Cmd+Shift+R)
- [ ] Open DevTools Console (F12)
- [ ] See "Available Ingredients" field with **RED "Required" badge**
- [ ] Type ingredients: `tomatoes, pasta, basil, garlic`
- [ ] Click "Generate Recipes"
- [ ] See "📝 Raw form data" in console
- [ ] See parsed ingredients array
- [ ] Check if array is empty or has items
- [ ] Check Vercel logs for request body
- [ ] Share console output if still failing

## 🆘 What to Share If Still Failing

Please copy and paste:

### 1. Browser Console Output
```
📝 Raw form data: { ... }
📝 Parsed ingredients: [...]
```

### 2. Network Tab
- Open DevTools → Network tab
- Find `/api/ai/recipes` request
- Copy Request Payload
- Copy Response

### 3. Vercel Logs
- Copy the API function logs

## 💡 Quick Test

Try this **exact input**:

1. Go to: https://planted-ashy.vercel.app/recipes
2. In "Available Ingredients" field, type EXACTLY:
   ```
   tomato, pasta, basil
   ```
3. Click "Generate Recipes"
4. Take screenshot of console

## ✅ Expected Behavior

After the fix (ab53a90a), you should see:

- **RED "Required" badge** on ingredients field
- **Better helper text**: "📝 List ingredients you have available, separated by commas. At least one ingredient is required."
- **Detailed console logs** showing exactly what's being sent
- **Clear error message** if field is empty: "❌ Please enter at least one ingredient..."

## 🚀 Current Status

**Deployed:** ✅ ab53a90a  
**Console Logging:** ✅ Enhanced  
**API Logging:** ✅ Enhanced  
**UI Improvements:** ✅ "Required" badge added  
**Error Messages:** ✅ More helpful  

---

**Next Step:** Try generating recipes again with the detailed logging. The console will tell us exactly what's happening! Share the console output if it still fails.
