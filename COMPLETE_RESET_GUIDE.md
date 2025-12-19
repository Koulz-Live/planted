# 🔴 EMERGENCY: Complete Server Reset Required

**Status**: "It works!" persisting despite all fixes  
**Action**: Nuclear reset - clean slate approach  
**Time**: 10-15 minutes  

---

## 🚨 WHAT'S HAPPENING

The "It works!" message persisting means:
- Your `app.js` file is **NOT being executed**
- CloudLinux is serving a **default test response**
- File changes are **not taking effect**

This requires a **complete reset** from scratch.

---

## 🎯 COMPLETE RESET PROCEDURE

### ✅ STEP 1: DESTROY Application (1 min)

1. Go to **cPanel → Select Node.js Version**
2. Find your `planted.africa` application
3. Click **"DESTROY"** button (red)
4. Confirm: "Yes, destroy this application"
5. ⏰ **Wait 60 seconds** for complete cleanup

### ✅ STEP 2: DELETE All Files (2 min)

1. Go to **cPanel → File Manager**
2. Navigate to: `/home/plantzia/public_html/`
3. Click **"Show Hidden Files"** (top right settings icon)
4. **Select ALL** files and folders (Ctrl+A or Cmd+A)
5. Click **"Delete"** button
6. Confirm deletion
7. **Verify folder is EMPTY** (should show "0 items")

### ✅ STEP 3: Upload Minimal Files (3 min)

Upload these 4 files **individually**:

1. **Upload app-test.js**:
   - Click "Upload" button
   - Select: `/Applications/XAMPP/xamppfiles/htdocs/Planted/v1/app-test.js`
   - Wait for 100%

2. **Upload package.json**:
   - Click "Upload" again
   - Select: `/Applications/XAMPP/xamppfiles/htdocs/Planted/v1/package.json`
   - Wait for 100%

3. **Upload .htaccess**:
   - Click "Upload" again  
   - Select: `/Applications/XAMPP/xamppfiles/htdocs/Planted/v1/.htaccess`
   - Wait for 100%

4. **Upload dist-only.zip**:
   - Click "Upload" again
   - Select: `/Applications/XAMPP/xamppfiles/htdocs/Planted/v1/dist-only.zip`
   - Wait for 100%

### ✅ STEP 4: Extract and Rename (1 min)

1. **Extract dist folder**:
   - Right-click `dist-only.zip`
   - Click "Extract"
   - Confirm
   - Delete `dist-only.zip` after extraction

2. **Rename app-test.js**:
   - Find `app-test.js` in file list
   - Right-click it
   - Click "Rename"
   - New name: **`app.js`** (exactly, no extension change)
   - Press Enter

### ✅ STEP 5: Verify Structure (30 sec)

Your `/home/plantzia/public_html/` should now contain:

```
✓ app.js           (3-4 KB)
✓ package.json     (2 KB)
✓ .htaccess        (2 KB)
✓ dist/            (folder)
  ✓ index.html     (1.1 KB)
  ✓ vite.svg       (1.5 KB)
  ✓ assets/        (folder with 2 files)
```

**📸 TAKE SCREENSHOT** and send to me!

### ✅ STEP 6: Create NEW Application (2 min)

1. Go back to **Node.js Selector**
2. Page should be empty (no applications)
3. Look for **"CREATE APPLICATION"** button or form
4. Fill in these exact values:

   | Field | Value |
   |-------|-------|
   | **Node.js version** | `22.18.0` |
   | **Application mode** | `Production` |
   | **Application root** | `home/plantzia/public_html` |
   | **Application URL** | `planted.africa` |
   | **Application startup file** | `app.js` |

5. Click **"CREATE"** or **"SAVE"** button
6. ⏰ Wait for confirmation message

### ✅ STEP 7: Install Dependencies (3-5 min)

1. After application created, find the **"Run NPM Install"** button
2. Click it
3. ⏰ **Wait 3-5 minutes** (don't close page!)
4. Look for: "NPM Install completed successfully"
5. If it fails → Click it again and wait

### ✅ STEP 8: START Application (30 sec)

1. Click **"RESTART"** or **"START"** button
2. ⏰ Wait 30-60 seconds
3. Look for status: "Running" or "Started"

### ✅ STEP 9: TEST! (1 min)

Open these URLs in NEW incognito/private browser window:

1. **https://planted.africa/api/health**
   
   ✅ **SUCCESS** if you see:
   ```json
   {
     "status": "SUCCESS",
     "message": "Custom app.js is running!",
     "timestamp": 1734441600000,
     "nodeVersion": "v22.18.0"
   }
   ```
   
   ❌ **FAILURE** if you still see: "It works! NodeJS 22.18.0"

2. **https://planted.africa/**
   
   ✅ **SUCCESS** if React app loads with navigation, logo, content
   ❌ **FAILURE** if blank page or "It works!"

---

## 🎉 IF IT WORKS

Congratulations! You'll see:
- ✅ /api/health returns custom JSON message
- ✅ Main site loads React application  
- ✅ Navigation works (Home, Recipes, Learning, etc.)
- ✅ No more "It works!" anywhere

**Next steps**:
1. We'll add environment variables for Firebase/OpenAI
2. We'll re-enable backend API routes (carefully)
3. Full app functionality restored!

---

## 🆘 IF STILL "IT WORKS!"

If you followed ALL steps and STILL see "It works!", then **send me**:

### Screenshot 1: File Manager
- Navigate to `/home/plantzia/public_html/`
- Show all files with sizes
- Include .htaccess (enable "Show Hidden Files")

### Screenshot 2: app.js Contents  
- Right-click `app.js` → "View" or "Edit"
- Show first 20 lines
- Should start with "// Ultra-minimal test server"

### Screenshot 3: Node.js Selector
- Full configuration visible
- Application status
- Any error messages

### Screenshot 4: Browser Network Tab
- Open https://planted.africa/api/health
- Press F12 → Network tab
- Show the request to /api/health
- Show response headers and body

With these screenshots, I can determine if:
- Files didn't upload correctly
- CloudLinux has a bug
- Server needs support ticket

---

## 🔧 ALTERNATIVE: Try Different Startup File Name

If nothing works, try this experiment:

1. In File Manager, rename `app.js` → `server.js`
2. In Node.js Selector, change "Application startup file" to `server.js`
3. Click "SAVE"
4. Click "RESTART"
5. Test /api/health

Sometimes CloudLinux has issues with specific filenames.

---

## 📞 CONTACT AFRIHOST SUPPORT

If complete reset doesn't work, open support ticket:

**Subject**: "NodeJS Selector not executing my app.js file"

**Message**:
```
Hello,

I'm trying to deploy a Node.js application to my hosting account but 
CloudLinux NodeJS Selector is not executing my app.js file.

Instead of running my custom application, I'm seeing a default "It works!" 
message with the Node.js version.

Configuration:
- Domain: planted.africa
- Node.js version: 22.18.0
- Application root: /home/plantzia/public_html
- Startup file: app.js
- npm install: completed successfully

I have:
✓ Destroyed and recreated the application multiple times
✓ Deleted and re-uploaded all files
✓ Verified app.js exists and has no syntax errors
✓ Restarted the application many times
✓ Waited several minutes after each restart

The app.js file is valid (tested locally with no errors), but CloudLinux 
is showing "It works!" instead of executing my code.

Could you please check:
1. Why app.js isn't being executed
2. If there are any server-side errors or configuration issues
3. If NodeJS Selector is functioning correctly on my account

Thank you!
```

---

## 📋 COMPLETE CHECKLIST

Before giving up, verify you did:

- [ ] Clicked "DESTROY" and waited 60 seconds
- [ ] Deleted ALL files from public_html (folder completely empty)
- [ ] Uploaded app-test.js, package.json, .htaccess individually
- [ ] Uploaded and extracted dist-only.zip
- [ ] Renamed app-test.js → app.js (exact name)
- [ ] Created NEW application in Node.js Selector
- [ ] Used exact values (22.18.0, production, app.js, etc.)
- [ ] Ran "npm install" and waited for completion
- [ ] Clicked "RESTART" and waited 60 seconds
- [ ] Tested in NEW incognito browser window
- [ ] Hard refreshed with Cmd+Shift+R / Ctrl+Shift+R

If ALL checked and still "It works!" → Server issue, need Afrihost support.

---

## 💪 WE WILL SOLVE THIS

This is frustrating, but we'll figure it out! The complete reset should work.

**Start now**:
1. Destroy application
2. Delete all files
3. Follow steps 3-9 above
4. Report back with results!

You're close! 🚀
