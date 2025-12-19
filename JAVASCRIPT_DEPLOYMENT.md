# Node.js Deployment Script - Plain JavaScript

## ✅ Yes, You Can Use JavaScript!

I've created **`deploy.mjs`** - a pure Node.js deployment script (JavaScript with ES modules).

---

## 📁 Files Created

### **`deploy.mjs`** - Main deployment script (Node.js/JavaScript)
Pure JavaScript that:
- ✅ Installs npm dependencies
- ✅ Builds frontend with Vite
- ✅ Copies files from repo to web root
- ✅ Cleans up source files
- ✅ Sets permissions
- ✅ Beautiful colored console output

### **`post-deploy.sh`** - Simple wrapper (Bash)
Tiny 4-line script that just calls `deploy.mjs`:
```bash
#!/bin/bash
cd /home/plantzia/repositories/planted
node deploy.mjs
exit $?
```

---

## 🎯 How It Works

### In cPanel Git Version Control:

**Post-Deployment Script** (paste this):
```bash
#!/bin/bash
cd /home/plantzia/repositories/planted
node deploy.mjs
exit $?
```

That's it! Just 3 lines that call your JavaScript deployment script.

---

## 🚀 Using the JavaScript Deployment Script

### Option 1: Via cPanel Git (Recommended)

1. **Push files to GitHub**:
   ```bash
   git add deploy.mjs post-deploy.sh
   git commit -m "Add Node.js deployment script"
   git push origin main
   ```

2. **In cPanel Git Version Control** → Manage → Post-Deployment Script:
   ```bash
   #!/bin/bash
   cd /home/plantzia/repositories/planted
   node deploy.mjs
   exit $?
   ```

3. **Pull → Script runs automatically!**

### Option 2: Run Manually via SSH

If you have SSH access:
```bash
cd /home/plantzia/repositories/planted
node deploy.mjs
```

### Option 3: Run Locally (Testing)

Test the script locally before deploying:
```bash
# Edit paths in deploy.mjs first (change to your local paths)
node deploy.mjs
```

---

## 📋 What the JavaScript Script Does

```javascript
// 1. Configuration
const REPO_PATH = '/home/plantzia/repositories/planted';
const WEB_ROOT = '/home/plantzia/public_html';

// 2. Install dependencies in repo
execSync('npm install --production', { cwd: REPO_PATH });

// 3. Build frontend
execSync('npm run build', { cwd: REPO_PATH });

// 4. Copy files
cpSync('dist/', '/home/plantzia/public_html/dist/');
cpSync('app-no-firebase.js', '/home/plantzia/public_html/app.js');
cpSync('.htaccess-cloudlinux', '/home/plantzia/public_html/.htaccess');

// 5. Install deps in web root
execSync('npm install --production', { cwd: WEB_ROOT });

// 6. Clean up source files
rmSync('/home/plantzia/public_html/src/', { recursive: true });

// 7. Set permissions
chmodSync(files, 0o644);  // Files: 644
chmodSync(folders, 0o755); // Folders: 755
```

---

## 🎨 Script Features

### Colored Console Output
```
🚀 Starting deployment from repository to web root...
📂 Repo: /home/plantzia/repositories/planted
🌐 Web: /home/plantzia/public_html
📦 Installing dependencies in repository...
⚙️ Running: npm install --production
✓ Copied: dist/ → /home/plantzia/public_html/dist/
🧹 Cleaning up source files from web root...
✅ Deployment complete!
🔄 NEXT: Restart Node.js app in NodeJS Selector
🌐 Test: https://planted.africa
```

### Error Handling
```javascript
try {
  cpSync(src, dest);
  log('✓', `Copied: ${src}`, colors.green);
} catch (error) {
  log('❌', `Copy failed: ${error.message}`, colors.red);
  process.exit(1); // Exit with error code
}
```

### Automatic Cleanup
- Deletes `src/` from web root (security)
- Deletes `public/` from web root
- Removes old `dist/` before copying new one

---

## 🔧 Customizing the Script

### Change Paths
Edit top of `deploy.mjs`:
```javascript
const REPO_PATH = '/home/plantzia/repositories/planted';
const WEB_ROOT = '/home/plantzia/public_html';
```

### Use Full `app.js` (with Firebase)
Change this line:
```javascript
// From:
const appSrc = join(REPO_PATH, 'app-no-firebase.js');

// To:
const appSrc = join(REPO_PATH, 'app.js');
```

### Skip Build Step (if already built)
Comment out:
```javascript
// log('🔨', 'Building frontend...', colors.blue);
// if (!exec('npm run build', REPO_PATH)) {
//   process.exit(1);
// }
```

### Add More Files to Copy
Add after existing copies:
```javascript
// Copy additional file
log('→', 'Copying README...', colors.blue);
const readmeSrc = join(REPO_PATH, 'README.md');
const readmeDest = join(WEB_ROOT, 'README.md');
if (!copyFile(readmeSrc, readmeDest)) {
  process.exit(1);
}
```

---

## 📊 Bash vs Node.js Comparison

### Bash Script (Traditional)
```bash
#!/bin/bash
cd /home/plantzia/repositories/planted
npm install --production
npm run build
cp -r dist/ /home/plantzia/public_html/
cp app-no-firebase.js /home/plantzia/public_html/app.js
# ... etc
```

**Pros**: Simple, no extra dependencies  
**Cons**: Less readable, harder to maintain, limited error handling

### Node.js Script (JavaScript)
```javascript
import { cpSync, execSync } from 'fs';

log('🚀', 'Starting deployment...');
exec('npm install --production');
exec('npm run build');
copyFile('dist/', '/home/plantzia/public_html/dist/');
// ... etc
```

**Pros**: Readable, great error handling, familiar syntax, colored output  
**Cons**: Needs Node.js (already installed for your app!)

---

## ✅ Recommendation

**Use the Node.js script!** Since your server already has Node.js 22 installed, there's no reason not to use JavaScript for deployment.

Benefits:
- ✅ You write in JavaScript (same as your app)
- ✅ Better error messages
- ✅ Easier to debug
- ✅ More maintainable
- ✅ Beautiful colored output
- ✅ Can add complex logic easily

---

## 🚀 Quick Start

1. **Commit and push**:
   ```bash
   git add deploy.mjs post-deploy.sh
   git commit -m "Add Node.js deployment script"
   git push origin main
   ```

2. **In cPanel Git Version Control** → Post-Deployment Script:
   ```bash
   #!/bin/bash
   cd /home/plantzia/repositories/planted
   node deploy.mjs
   exit $?
   ```

3. **Pull → Deploy → Restart → Done!** ✅

---

## 🐛 Troubleshooting

### "node: command not found"
The wrapper script needs the full path to Node:
```bash
#!/bin/bash
cd /home/plantzia/repositories/planted
/home/plantzia/nodevenv/public_html/22/bin/node deploy.mjs
exit $?
```

### "Cannot find module" error
Make sure `deploy.mjs` has `.mjs` extension (ES modules):
```bash
# Check extension
ls -la deploy.mjs

# Should show: deploy.mjs (not deploy.js)
```

### Script doesn't run
Make executable:
```bash
chmod +x deploy.mjs
chmod +x post-deploy.sh
```

### Want to see output in Git log
The colored output should appear in cPanel Git Version Control deployment log automatically!

---

## 📝 Summary

**Yes, you can use plain JavaScript!**

- ✅ Created `deploy.mjs` - full JavaScript deployment script
- ✅ Created `post-deploy.sh` - tiny Bash wrapper (3 lines)
- ✅ Same functionality as Bash, better syntax
- ✅ Easier to maintain and customize
- ✅ Beautiful colored console output

**Use JavaScript for deployment - you're a JS developer!** 🎉
