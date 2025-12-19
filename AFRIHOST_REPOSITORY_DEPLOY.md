# Afrihost GitHub Deployment - Repository Structure

## 🎯 Overview
Deploy from `/home/plantzia/repositories/planted` (Git repo) to `/home/plantzia/public_html` (web root).

This keeps your Git repository separate from your web root for better security and organization.

---

## 📁 Directory Structure

```
/home/plantzia/
├── repositories/
│   └── planted/              ← Git repo cloned here
│       ├── .git/
│       ├── src/
│       ├── dist/            ← Built by Vite
│       ├── app.js
│       ├── package.json
│       └── ...
│
└── public_html/             ← Web root (Apache serves from here)
    ├── dist/                ← Copied or symlinked from repo
    ├── app.js               ← Copied from repo
    ├── .htaccess            ← Copied from repo
    ├── package.json         ← Copied from repo
    └── node_modules/        ← npm install runs here
```

---

## 🚀 Setup: Git Version Control in cPanel

### Step 1: Create Repository Directory

**In File Manager**:
1. Navigate to `/home/plantzia/`
2. Create folder: **`repositories`** (if doesn't exist)
3. Set permissions: **0755**

**OR via SSH** (if you have access):
```bash
mkdir -p /home/plantzia/repositories
chmod 755 /home/plantzia/repositories
```

---

### Step 2: Clone Repository

**In cPanel → Git™ Version Control**:

1. Click **"Create"**
2. Configure:
   - **Clone URL**: `https://github.com/Koulz-Live/planted.git`
   - **Repository Path**: `/home/plantzia/repositories/planted`
   - **Repository Name**: `planted`
   - **Branch**: `main`
3. Click **"Create"**

This clones your repo to `/home/plantzia/repositories/planted/`

---

### Step 3: Configure Post-Deployment Script

**In Git Version Control → Manage → Pull or Deploy tab**:

Enable **"Post-Deployment Script"** and add:

```bash
#!/bin/bash
# Afrihost Deployment: Repository → Web Root

set -e  # Exit on error

REPO_PATH="/home/plantzia/repositories/planted"
WEB_ROOT="/home/plantzia/public_html"

echo "🚀 Starting deployment from repository to web root..."
echo "📂 Repo: $REPO_PATH"
echo "🌐 Web: $WEB_ROOT"

# Navigate to repository
cd "$REPO_PATH"

echo "📦 Installing dependencies..."
npm install --production

echo "🔨 Building frontend..."
npm run build

echo "📋 Copying files to web root..."

# Copy built frontend
echo "  → Copying dist/ folder..."
rm -rf "$WEB_ROOT/dist"
cp -r "$REPO_PATH/dist" "$WEB_ROOT/"

# Copy server files
echo "  → Copying app.js..."
cp "$REPO_PATH/app-no-firebase.js" "$WEB_ROOT/app.js"

echo "  → Copying package.json..."
cp "$REPO_PATH/package.json" "$WEB_ROOT/"

# Copy .htaccess
echo "  → Copying .htaccess..."
cp "$REPO_PATH/.htaccess-cloudlinux" "$WEB_ROOT/.htaccess"

# Install production dependencies in web root
echo "📦 Installing dependencies in web root..."
cd "$WEB_ROOT"
npm install --production --no-save

# Clean up source files from web root (security)
echo "🧹 Cleaning up..."
rm -rf "$WEB_ROOT/src" "$WEB_ROOT/public" "$WEB_ROOT/server/src"

# Set permissions
echo "🔒 Setting permissions..."
find "$WEB_ROOT" -type f -exec chmod 644 {} \;
find "$WEB_ROOT" -type d -exec chmod 755 {} \;
chmod 644 "$WEB_ROOT/.htaccess"

echo "✅ Deployment complete!"
echo "🔄 NEXT: Restart Node.js app in NodeJS Selector"
echo "🌐 Test: https://planted.africa"
```

**Save** the script.

---

### Step 4: Configure Node.js Application

**In cPanel → Setup Node.js App**:

1. Click **"Create Application"** (or Edit if exists)
2. Configure:
   - **Node.js version**: 22.x
   - **Application mode**: Production
   - **Application root**: `/home/plantzia/public_html` ← Web root, not repo!
   - **Application URL**: `https://planted.africa`
   - **Application startup file**: `app.js`
   - **Environment variables** (add these):
     ```
     NODE_ENV=production
     PORT=3000
     ```
3. Click **"Create"** / **"Save"**

---

### Step 5: Initial Deployment

1. **In Git Version Control** → Click **"Manage"**
2. Click **"Pull or Deploy"** button
3. Watch the deployment log - should see:
   ```
   🚀 Starting deployment...
   📦 Installing dependencies...
   🔨 Building frontend...
   📋 Copying files...
   ✅ Deployment complete!
   ```
4. Check for errors in the log

---

### Step 6: Restart Node.js App

1. Go to **Setup Node.js App**
2. Find your `planted.africa` application
3. Click **"Restart"** button
4. Wait 30 seconds for restart

---

### Step 7: Verify Deployment

**Check files copied**:
- `/home/plantzia/public_html/dist/` should exist
- `/home/plantzia/public_html/app.js` should exist
- `/home/plantzia/public_html/.htaccess` should exist
- `/home/plantzia/public_html/node_modules/` should exist

**Test endpoints**:
- `https://planted.africa/` → Should load React app ✅
- `https://planted.africa/api/health` → Should return JSON ✅

---

## 🔄 Development Workflow

### Making Changes:

1. **Edit code locally** (in VS Code)
2. **Commit and push**:
   ```bash
   git add .
   git commit -m "Your change description"
   git push origin main
   ```
3. **In cPanel Git Version Control**: Click **"Pull or Deploy"**
   - This runs the post-deployment script automatically
   - Builds frontend, copies to web root
4. **In Node.js Selector**: Click **"Restart"**
5. **Test** changes on live site!

---

## 🤖 Automatic Deployments (Optional)

To auto-deploy on every push:

1. **In Git Version Control** → Manage
2. Enable **"Automatic Deployment"**
3. Set **Pull Interval**: 5 minutes

Now:
- You push to GitHub
- Within 5 minutes, cPanel auto-pulls
- Post-deployment script runs automatically
- You just need to restart Node.js app

---

## 📊 Repository vs Web Root

### `/home/plantzia/repositories/planted/` (Git Repo)
- ✅ Contains `.git/` folder (version control)
- ✅ Contains `src/` source code
- ✅ Contains development files
- ✅ `npm install` runs here first
- ✅ `npm run build` runs here
- ⚠️ **NOT served by Apache** (not in web root)

### `/home/plantzia/public_html/` (Web Root)
- ✅ Files served by Apache/Node.js
- ✅ Only production files (dist/, app.js, etc.)
- ✅ No source code (`src/` deleted for security)
- ✅ No `.git/` folder (security)
- ⚠️ **Files copied from repository**

---

## 🔒 Security Benefits

**Keeping repo separate from web root**:

1. **Git history not exposed** - No `.git/` folder in web root
2. **Source code not exposed** - No `src/` folder served
3. **Clean deployment** - Only production files in web root
4. **Easy rollback** - Can switch branches in repo without affecting live site
5. **Development files isolated** - No dev dependencies in web root

---

## 🐛 Troubleshooting

### "Directory not found" error
- Verify `/home/plantzia/repositories/` exists
- Check permissions: `chmod 755 /home/plantzia/repositories`

### Build fails during deployment
- Check Node.js version in repo: `node -v`
- Verify `package.json` has `build` script
- Check deployment log for specific error

### Files not copying to web root
- Verify paths in post-deployment script
- Check permissions on both folders
- Ensure script has execute permissions

### Node.js app can't find files
- Verify **Application Root** is `/home/plantzia/public_html` (NOT repositories)
- Check `dist/` folder exists in web root
- Restart Node.js app after deployment

### Changes not appearing
1. Verify Git pull succeeded (check version control log)
2. Verify post-deployment script ran (check log)
3. Verify Node.js app restarted
4. Clear browser cache (Cmd+Shift+R)

---

## 📝 Post-Deployment Script Explained

```bash
# 1. Install dependencies in REPO
cd /home/plantzia/repositories/planted
npm install --production

# 2. Build frontend in REPO (creates dist/)
npm run build

# 3. Copy built files to WEB ROOT
cp -r dist/ /home/plantzia/public_html/
cp app-no-firebase.js /home/plantzia/public_html/app.js
cp .htaccess-cloudlinux /home/plantzia/public_html/.htaccess

# 4. Install dependencies in WEB ROOT (for Node.js app)
cd /home/plantzia/public_html
npm install --production

# 5. Clean up source files from web root
rm -rf src/ public/
```

**Why two npm installs?**
- First: In repo for building (needs dev dependencies)
- Second: In web root for Node.js runtime (production only)

---

## 🎯 Environment Variables (When Ready)

**After basic deployment works, add these in Node.js Selector**:

```bash
# Firebase (for full backend features)
FIREBASE_PROJECT_ID=planted-dea3b
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@planted-dea3b.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY_BASE64=[your-base64-key]

# OpenAI (for AI features)
OPENAI_API_KEY=sk-proj-[your-key]

# Node
NODE_ENV=production
PORT=3000
```

Then update deployment script to use full `app.js`:
```bash
# Change this line:
cp "$REPO_PATH/app-no-firebase.js" "$WEB_ROOT/app.js"

# To this:
cp "$REPO_PATH/app.js" "$WEB_ROOT/app.js"
```

---

## ✅ Checklist

Before first deployment:

- [ ] `/home/plantzia/repositories/` folder exists
- [ ] Git repository cloned to `/home/plantzia/repositories/planted/`
- [ ] Post-deployment script configured and saved
- [ ] Node.js app configured with Application Root = `/home/plantzia/public_html`
- [ ] Files pushed to GitHub

First deployment:

- [ ] Click "Pull or Deploy" in Git Version Control
- [ ] Check deployment log for success
- [ ] Verify files copied to `/home/plantzia/public_html/`
- [ ] Restart Node.js app
- [ ] Test https://planted.africa/

---

## 🚀 You're All Set!

**Repository**: `/home/plantzia/repositories/planted/` (Git, source code, build)  
**Web Root**: `/home/plantzia/public_html/` (Production files only)  
**Workflow**: Push → Pull → Script copies files → Restart → Live!

This is **production-grade deployment**! 🎉
