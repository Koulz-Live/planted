# Vercel Deployment Guide - Planted 🌱

## 🎯 Overview

Deploy Planted to **Vercel** with:
- ✅ **Frontend**: React app served via Vite build
- ✅ **Backend**: Serverless functions for AI endpoints
- ✅ **Auto-deploy**: On every push to `main` branch
- ✅ **Free tier**: Perfect for testing and MVP
- ✅ **Global CDN**: Fast worldwide
- ✅ **HTTPS**: Automatic SSL certificates

---

## 📋 Prerequisites

1. **Vercel account** (free): https://vercel.com/signup
2. **GitHub repo**: Already connected (`Koulz-Live/planted`)
3. **OpenAI API key** (for AI features)
4. **Firebase credentials** (optional, for user features)

---

## 🚀 Quick Deploy (3 Steps)

### Step 1: Import Project

1. Go to **https://vercel.com/new**
2. Click **"Import Git Repository"**
3. Select **`Koulz-Live/planted`**
4. Click **"Import"**

### Step 2: Configure Build

Vercel should auto-detect these settings (verify):

- **Framework Preset**: `Vite`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`
- **Node.js Version**: `22.x`

Click **"Deploy"**!

### Step 3: Add Environment Variables

After first deployment:

1. Go to **Project Settings** → **Environment Variables**
2. Add these:

```bash
# Required for AI features
OPENAI_API_KEY=sk-proj-...

# Optional - Firebase (for user profiles)
FIREBASE_PROJECT_ID=planted-dea3b
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@planted-dea3b.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY_BASE64=[your-base64-encoded-key]

# Node environment
NODE_ENV=production
```

3. Click **"Save"**
4. **Redeploy** (Deployments tab → ⋯ → Redeploy)

---

## 📁 Project Structure for Vercel

```
planted/
├── vercel.json              ← Vercel configuration
├── package.json             ← Root dependencies
├── vite.config.ts           ← Vite build config
├── index.html               ← Entry point
│
├── src/                     ← React frontend
│   ├── App.tsx
│   ├── main.tsx
│   ├── pages/
│   └── components/
│
├── api/                     ← Serverless functions ⭐
│   ├── health.js            ← /api/health
│   ├── plant-plan.js        ← /api/plant-plan
│   └── ...more endpoints
│
└── dist/                    ← Built frontend (auto-generated)
```

---

## ⚡ Serverless Functions

### How They Work

Vercel automatically converts files in `/api/` to serverless endpoints:

```
/api/health.js       → https://your-app.vercel.app/api/health
/api/plant-plan.js   → https://your-app.vercel.app/api/plant-plan
/api/recipes.js      → https://your-app.vercel.app/api/recipes
```

### Example Function

**`/api/health.js`**:
```javascript
export default function handler(req, res) {
  res.status(200).json({
    ok: true,
    message: 'API healthy! 🌱'
  });
}
```

**Access**: `https://your-app.vercel.app/api/health`

---

## 🔧 Configuration Files

### `vercel.json` (Created)

Main Vercel configuration:

```json
{
  "version": 2,
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    { "source": "/api/:path*", "destination": "/api/:path*" },
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "SAMEORIGIN" },
        { "key": "X-XSS-Protection", "value": "1; mode=block" }
      ]
    }
  ]
}
```

**Features**:
- ✅ Rewrites all routes to `index.html` (React Router)
- ✅ Preserves `/api/*` routes for serverless functions
- ✅ Security headers
- ✅ Cache control for assets

---

## 🌐 API Endpoints

### Created Endpoints

**`/api/health`** ✅
- Method: GET
- Returns: Health status
- Test: `curl https://your-app.vercel.app/api/health`

**`/api/plant-plan`** ✅
- Method: POST
- Body: `{ plantName, location, sunlight, wateringFrequency }`
- Returns: AI-generated plant care plan
- Requires: `OPENAI_API_KEY` environment variable

### Add More Endpoints

Create files in `/api/` folder:

**`/api/recipes.js`**:
```javascript
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { ingredients } = req.body;
  
  // Call OpenAI API
  const openaiKey = process.env.OPENAI_API_KEY;
  // ... AI logic ...
  
  res.status(200).json({ recipes });
}
```

Vercel auto-deploys new endpoints! 🎉

---

## 🔄 Development Workflow

### Local Development

```bash
# Install Vercel CLI
npm i -g vercel

# Run locally (simulates Vercel environment)
vercel dev

# Or use Vite dev server
npm run dev
```

**`vercel dev`** runs:
- Frontend at `http://localhost:3000`
- Serverless functions at `http://localhost:3000/api/*`
- Uses local `.env` file

### Deploy to Production

**Option 1: Git Push (Automatic)**
```bash
git add .
git commit -m "Update feature"
git push origin main
```
→ Vercel auto-deploys! ✅

**Option 2: Manual Deploy**
```bash
vercel --prod
```

---

## 🌍 Custom Domain

### Add Your Domain

1. **In Vercel Dashboard** → **Project Settings** → **Domains**
2. Add **`planted.africa`**
3. **Update DNS records** (Vercel provides instructions):
   ```
   Type: A
   Name: @
   Value: 76.76.21.21

   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```
4. Wait 24-48 hours for DNS propagation
5. Vercel auto-provisions SSL certificate! 🔒

### Keep Afrihost or Switch?

You can run **both**:
- **planted.africa** → Afrihost (current)
- **app.planted.africa** → Vercel (new)

Or migrate fully to Vercel for simpler deployment!

---

## 📊 Vercel vs Afrihost

| Feature | Vercel | Afrihost |
|---------|--------|----------|
| **Deployment** | Git push → Auto-deploy | Manual/Git pull |
| **Backend** | Serverless functions | Node.js server |
| **Scaling** | Automatic | Manual |
| **SSL** | Automatic | Manual |
| **CDN** | Global, built-in | Not included |
| **Price** | Free (hobby), $20/mo (pro) | ~$10/mo |
| **Best For** | Modern apps, JAMstack | Traditional hosting |

---

## 🔒 Environment Variables

### Required for Full Features

```bash
# OpenAI (AI features)
OPENAI_API_KEY=sk-proj-...

# Firebase (user profiles, saved content)
FIREBASE_PROJECT_ID=planted-dea3b
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@planted-dea3b.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY_BASE64=[base64-encoded-private-key]

# Optional
NODE_ENV=production
VITE_API_BASE_URL=https://your-app.vercel.app
```

### How to Add

**In Vercel Dashboard**:
1. Project Settings → Environment Variables
2. Add key-value pairs
3. Select environments: Production, Preview, Development
4. Save
5. Redeploy for changes to take effect

**OR via CLI**:
```bash
vercel env add OPENAI_API_KEY
# Paste value when prompted
```

---

## 🐛 Troubleshooting

### Build fails
**Check**:
- `package.json` has correct `build` script
- All dependencies in `dependencies` (not just `devDependencies`)
- No build errors locally: `npm run build`

**Fix**:
```bash
# Make sure build works locally
npm install
npm run build

# Check build output
ls -la dist/
```

### API returns 500
**Check**:
- Environment variables set correctly
- Function logs: Vercel Dashboard → Functions → [function name] → Logs
- OpenAI API key valid

### Routes return 404
**Check**:
- `vercel.json` has rewrite rules
- Frontend uses React Router properly
- `index.html` in correct location

### CORS errors
**Add to serverless function**:
```javascript
res.setHeader('Access-Control-Allow-Origin', '*');
res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
```

---

## 📈 Monitoring & Analytics

### Vercel Dashboard Shows

- **Deployments**: All builds, logs, preview URLs
- **Functions**: Execution logs, errors, invocations
- **Analytics**: Page views, Web Vitals (Pro plan)
- **Domains**: SSL status, DNS configuration
- **Logs**: Real-time function logs

### Access Logs

1. **Deployments tab** → Click deployment
2. **Build logs**: See build output
3. **Function logs**: Runtime errors

---

## 🚀 Next Steps

### Immediate

1. ✅ **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Configure for Vercel deployment"
   git push origin main
   ```

2. ✅ **Import to Vercel**: https://vercel.com/new

3. ✅ **Add environment variables**

4. ✅ **Test**: https://your-app.vercel.app

### After First Deploy

- [ ] Add custom domain (`planted.africa`)
- [ ] Create remaining API endpoints (`/api/recipes.js`, etc.)
- [ ] Setup Firebase for user features
- [ ] Add Vercel Analytics (optional)
- [ ] Configure webhooks for notifications

---

## 💡 Pro Tips

### Preview Deployments

Every branch/PR gets a unique preview URL:
- Push to branch → Automatic preview deployment
- Test before merging to main
- Share preview links with team

### Environment Variables per Environment

Set different values for:
- **Production**: Real API keys
- **Preview**: Test API keys
- **Development**: Local testing

### Serverless Function Limits (Free Tier)

- **Execution time**: 10 seconds max
- **Memory**: 1024 MB
- **Invocations**: 100,000/month
- Upgrade to Pro for higher limits

---

## 📚 Resources

- **Vercel Docs**: https://vercel.com/docs
- **Serverless Functions**: https://vercel.com/docs/functions
- **Vite on Vercel**: https://vercel.com/docs/frameworks/vite
- **Environment Variables**: https://vercel.com/docs/environment-variables
- **Custom Domains**: https://vercel.com/docs/custom-domains

---

## ✅ Deployment Checklist

Before deploying:

- [x] `vercel.json` created ✅
- [x] `/api/health.js` created ✅
- [x] `/api/plant-plan.js` created ✅
- [ ] All code pushed to GitHub
- [ ] Vercel account created
- [ ] Project imported to Vercel
- [ ] Environment variables added
- [ ] First deployment successful
- [ ] API endpoints tested
- [ ] Frontend loads correctly
- [ ] React Router works (all routes accessible)

---

## 🎉 You're Ready!

**Vercel deployment is configured!** 

Just push to GitHub and Vercel handles the rest:
- ✅ Builds frontend
- ✅ Deploys serverless functions
- ✅ Global CDN distribution
- ✅ Automatic HTTPS
- ✅ Preview deployments for branches

**Much simpler than Afrihost!** 🚀
