# 🚨 BLANK PAGE FIX - Missing dist/ Folder

**Issue**: https://planted.africa/ shows blank page  
**Root Cause**: `dist/` folder not in correct location on server  
**Fix Time**: 2 minutes in File Manager

---

## The Problem

Your `app.js` serves static files from:
```javascript
app.use(express.static(path.join(__dirname, 'dist')));
```

This means it expects:
```
/home/plantzia/public_html/
├── app.js          ✅ exists
├── dist/           ❌ MISSING (or in wrong location)
│   ├── index.html
│   └── assets/
```

From your File Manager screenshot, I can see `dist` is nested inside `/home/plantzia/public_html/dist/` but there's confusion with multiple copies.

---

## SOLUTION: Upload Fresh dist/ Folder

### Step 1: Delete Wrong Folders (30 sec)

In **File Manager** at `/home/plantzia/public_html/`, **DELETE** these:
- ❌ `src/` folder (source code, not needed)
- ❌ `public/` folder (development files)
- ❌ `server/src/` if it exists (TypeScript source)
- ❌ `__MACOSX` folder (Mac metadata)
- ❌ Any nested `dist/dist/` structure
- ❌ ZIP files: `afrihost-deploy-v2.zip`, `public.zip`, `src.zip`

**KEEP** only these at root level:
- ✅ `app.js`
- ✅ `package.json`
- ✅ `.htaccess`
- ✅ `server/dist/` folder (compiled backend)
- ✅ `dist/` folder (if properly structured)

### Step 2: Verify/Upload dist/ (1 min)

**Option A: If dist/ exists but looks wrong**
1. Click into `dist/` folder
2. Verify it contains:
   - `index.html` (1.1 KB)
   - `vite.svg` (1.5 KB)
   - `assets/` folder with 2 files inside
3. If missing files → delete and re-upload

**Option B: Upload fresh dist/ folder**
1. Stay in `/home/plantzia/public_html/`
2. Click **"Upload"**
3. On your computer, go to: `/Applications/XAMPP/xamppfiles/htdocs/Planted/v1/`
4. I have `dist-only.zip` ready for you - upload it
5. After upload, right-click → **"Extract"**
6. Delete the ZIP after extraction

### Step 3: Verify Final Structure (30 sec)

Your `/home/plantzia/public_html/` should look EXACTLY like this:

```
/home/plantzia/public_html/
├── .htaccess              ✅
├── app.js                 ✅
├── package.json           ✅
├── dist/                  ✅ (frontend build)
│   ├── index.html         
│   ├── vite.svg
│   └── assets/
│       ├── index-D0X9sM9I.js
│       └── index-Dk9jpoJy.css
└── server/                ✅
    ├── package.json
    └── dist/              (compiled backend)
        ├── routes/
        ├── services/
        └── config/
```

**NO** `src/`, `public/`, or source code folders!

### Step 4: Restart Node App (30 sec)

1. Go to **cPanel → Select Node.js Version**
2. Find your `planted.africa` application
3. Click **"RESTART"**
4. Wait 30 seconds

### Step 5: Test (1 min)

1. Open **new incognito window**
2. Go to: `https://planted.africa/`
3. Press **Cmd+Shift+R** (hard refresh)

**✅ SHOULD SEE**: React app with navigation, logo, content

**❌ If still blank**:
- Open browser console (F12)
- Check for 404 errors on assets
- Screenshot the errors and the file structure

---

## Why You Have Source Files on Server

Looking at your File Manager, you uploaded:
- `src.zip` - React source code ❌
- `public.zip` - Development files ❌
- `server/` with `src/` inside ❌

These should NEVER be on production! Only upload:
- ✅ `dist/` (built frontend)
- ✅ `server/dist/` (compiled backend)
- ✅ `app.js`, `package.json`, `.htaccess`

---

## Quick Commands for You

If you want to re-create `dist-only.zip` locally:

```bash
cd /Applications/XAMPP/xamppfiles/htdocs/Planted/v1/
zip -r dist-only.zip dist/
```

Then upload to File Manager and extract.

---

## What Happens After Fix

1. ✅ `https://planted.africa/` loads React homepage
2. ✅ Navigation works (Home, Recipes, Plant Care, etc.)
3. ✅ Static assets load from `/assets/`
4. ❌ AI features still won't work (separate issue - routes not loading)

The AI issue is because your current `app.js` doesn't import the backend routes. But let's fix the blank page first!

---

**ACTION**: Delete source folders (`src/`, `public/`), verify `dist/` structure, restart Node app.
