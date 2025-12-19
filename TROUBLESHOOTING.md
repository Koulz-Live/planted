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
- **Firebase error**: Missing env vars

## 🚀 Deployed!

Wait ~2 minutes for rebuild, then check console for errors.

If error boundary shows, you'll see:
```
🌱 Oops! Something went wrong
[Error Details]
[Reload Page button]
```
