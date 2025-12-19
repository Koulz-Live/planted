# Vercel Blank Screen - Quick Debug

## 🐛 Issue
Blank screen at https://planted-ashy.vercel.app/

## ✅ Fixes Applied

### 1. Error Boundary Added
Shows errors instead of blank screen:
```tsx
<ErrorBoundary>
  <App />
</ErrorBoundary>
```

### 2. Vite Config Updated
```typescript
export default defineConfig({
  base: '/',
  build: {
    sourcemap: true,  // Debug production
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
        },
      },
    },
  },
});
```

### 3. Better Root Element Handling
```typescript
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Failed to find root element');
}
```

## 🔍 Debug Steps

1. **Open DevTools**: F12 → Console tab
2. **Check for errors**: Red messages
3. **Check Network tab**: Failed requests (404/500)
4. **If error boundary shows**: Copy error message

## 🎯 Common Issues

- **Module not found**: Import path incorrect
- **Failed to fetch**: API endpoint missing
- **Hydration mismatch**: SSR issue (unlikely with Vite)
- **Firebase error**: ✅ FIXED - Firebase now optional

## ✅ Firebase Error Fixed

**Error**: `Missing App configuration value: "projectId"`

**Fix Applied**: Made Firebase optional
- App works without Firebase now
- User features disabled until Firebase env vars added
- Console shows: "⚠️ Firebase not configured" (this is OK!)

**To Enable Firebase** (optional):
Add these in Vercel → Environment Variables:
```
VITE_FIREBASE_PROJECT_ID=planted-dea3b
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_APP_ID=...
```

## 🚀 Deployed!

Wait ~2 minutes for rebuild, then check console for errors.

If error boundary shows, you'll see:
```
🌱 Oops! Something went wrong
[Error Details]
[Reload Page button]
```

## ✅ TypeScript Build Errors Fixed

**Error**: `Type 'Firestore | undefined' is not assignable to parameter`

**Fix Applied**: Created `getDb()` helper function
- Replaces all `collection(db, ...)` with `collection(getDb(), ...)`
- Replaces all `doc(db, ...)` with `doc(getDb(), ...)`
- Throws clear error if Firebase not configured
- Type-safe: TypeScript knows it returns `Firestore` not `undefined`

**Files Updated**: All page components (PlantCarePage, RecipesPage, etc.)

**Result**: ✅ Build passes! Ready for deployment!
