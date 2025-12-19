# Afrihost GitHub Deployment Guide

## 🎯 Overview
Deploy Planted directly from GitHub to Afrihost CloudLinux hosting using Git Version Control.

---

## ✅ Prerequisites

1. **GitHub repository**: `Koulz-Live/planted` (✓ exists)
2. **Afrihost cPanel** access
3. **Node.js app** configured in NodeJS Selector

---

## 🚀 Setup Steps

### Step 1: Generate GitHub Deploy Key (in cPanel)

1. **Login to Afrihost cPanel**
2. Go to **"Git™ Version Control"** (under Files section)
3. Click **"Create"** button
4. Configure:
   - **Repository Path**: `/home/plantzia/public_html`
   - **Clone URL**: `https://github.com/Koulz-Live/planted.git`
   - **Repository Name**: `planted`
   - **Branch**: `main`
5. Click **"Create"**

This will clone your repo to the server!

---

### Step 2: Configure Post-Deployment Script

After cloning, you need to tell Afrihost what to do after each pull:

1. In **Git Version Control**, click **"Manage"** for your repo
2. Click **"Pull or Deploy"** tab
3. Enable **"Post-Deployment Script"**
4. Add this script:

```bash
#!/bin/bash
# Afrihost Post-Deployment Script

echo "🚀 Starting Planted deployment..."

# Navigate to repo
cd /home/plantzia/public_html

# Install dependencies (if package.json changed)
npm install --production

# Build frontend
npm run build

# Copy minimal server file
cp app-no-firebase.js app.js

# Copy CloudLinux .htaccess
cp .htaccess-cloudlinux .htaccess

# Clean up source files (security)
rm -rf src public

echo "✅ Deployment complete!"
echo "🔄 Restart Node.js app in NodeJS Selector to apply changes"
```

5. **Save**

---

### Step 3: Initial Pull

1. In Git Version Control, click **"Manage"**
2. Click **"Pull or Deploy"** button
3. Wait for pull to complete
4. Check deployment log for errors

---

### Step 4: Restart Node.js App

1. Go to **NodeJS Selector**
2. Find your `planted.africa` application
3. Click **"RESTART"**
4. Wait 30 seconds for CloudLinux to inject proxy rules

---

### Step 5: Test Deployment

Open in browser:
- `https://planted.africa/` → Should load React app ✅
- `https://planted.africa/api/health` → Should return JSON ✅

---

## 📝 Development Workflow

### From Now On:

1. **Make changes locally** (in VS Code)
2. **Commit & push** to GitHub:
   ```bash
   git add .
   git commit -m "Your change description"
   git push origin main
   ```
3. **In cPanel Git Version Control**: Click "Pull or Deploy"
4. **In NodeJS Selector**: Click "RESTART"
5. **Test** changes on live site!

---

## 🔄 Automatic Deployments (Optional)

To deploy automatically on every push:

1. In cPanel Git Version Control → Manage
2. Enable **"Automatic Deployment"**
3. Set **"Pull Interval"**: 5 minutes

Now every time you push to GitHub, Afrihost will auto-pull within 5 minutes!

---

## 🎯 What Gets Deployed

**From GitHub**:
- ✅ `app-no-firebase.js` (minimal server)
- ✅ `.htaccess-cloudlinux` (clean config)
- ✅ `package.json` (dependencies)
- ✅ `src/` (will be built then deleted)
- ✅ `public/` (will be built then deleted)
- ✅ Build scripts

**Auto-Generated on Server**:
- ✅ `dist/` (built by Vite during deployment)
- ✅ `app.js` (copied from app-no-firebase.js)
- ✅ `.htaccess` (copied from .htaccess-cloudlinux)
- ✅ `node_modules/` (npm install)

**NOT Deployed** (in `.gitignore`):
- ❌ `node_modules/`
- ❌ `dist/`
- ❌ `.env` files
- ❌ Zip archives

---

## 🔒 Security: Environment Variables

### After First Deployment, Add Env Vars:

In NodeJS Selector, click "Edit" → Add environment variables:

```bash
# Firebase (for full backend)
FIREBASE_PROJECT_ID=planted-dea3b
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@planted-dea3b.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY_BASE64=[your-base64-key]

# OpenAI (for AI features)
OPENAI_API_KEY=sk-proj-[your-key]

# Node environment
NODE_ENV=production
```

Then modify deployment script to use full `app.js`:
```bash
# Instead of: cp app-no-firebase.js app.js
# Just ensure app.js exists (it will use env vars)
```

---

## 🐛 Troubleshooting

### "Permission denied" during deployment
- Check repository path ownership: should be `plantzia` user
- Run in SSH: `chown -R plantzia:plantzia /home/plantzia/public_html`

### Deployment script doesn't run
- Verify script has execute permissions
- Check deployment log in Git Version Control

### Node app won't start after deployment
- Check for syntax errors: `node -c app.js`
- View logs in NodeJS Selector

### Changes not appearing
- Clear browser cache (Cmd+Shift+R)
- Verify deployment script ran: check Git log
- Verify Node.js app restarted: check NodeJS Selector

---

## 📊 Benefits vs Manual Upload

| Manual Upload | GitHub Deploy |
|---------------|---------------|
| Upload .zip | Git push |
| Extract files | Auto-pulled |
| Rename files | Script handles it |
| Delete source | Script handles it |
| Manual .htaccess | Auto-copied |
| Restart app | Still manual* |

*Can be automated with cron job if needed

---

## 🎉 Next Steps

1. **Commit current files** to GitHub
2. **Setup Git Version Control** in cPanel
3. **Configure post-deployment script**
4. **Do first Pull**
5. **Restart Node.js app**
6. **Test site** - should work immediately!
7. **Future changes**: Just `git push` → Pull → Restart

---

## 📚 Reference: Files to Commit

Essential files for GitHub deployment:

```
.
├── .deployment                    # Deployment config
├── .gitignore                     # Ignore node_modules, dist, etc.
├── .htaccess-cloudlinux          # Clean Apache config
├── app-no-firebase.js            # Minimal server (rename to app.js)
├── app.js                        # Full server (for when Firebase configured)
├── package.json                  # Dependencies
├── vite.config.ts                # Vite build config
├── tsconfig.json                 # TypeScript config
├── index.html                    # Vite entry point
├── src/                          # React source (built to dist/)
└── server/                       # Backend source (if using full app.js)
```

**NOT needed on server** (built/generated):
- `dist/` - Built by Vite during deployment
- `node_modules/` - Installed by npm during deployment

---

## 🔗 Helpful Links

- **cPanel Git Docs**: https://docs.cpanel.net/cpanel/files/git-version-control/
- **Your Repo**: https://github.com/Koulz-Live/planted
- **CloudLinux NodeJS**: https://docs.cloudlinux.com/cloudlinux_os_components/#node-js-selector

---

**Ready to go! This is way cleaner than manual uploads!** 🚀
