# Quick Start: Deploying Planted to Afrihost

## 🚀 TL;DR - Quick Deployment

### 1. Build Your Application
```bash
cd /Applications/XAMPP/xamppfiles/htdocs/Planted/v1
./build-for-afrihost.sh
```

### 2. Configure Afrihost Node.js App

**In Afrihost Control Panel:**
- **Node.js version:** `22.18.0`
- **Application mode:** `Production`
- **Application root:** `https://github.com/Koulz-Live/planted`
- **Application URL:** `planted.africa` (your domain)
- **Application startup file:** `app.js`

### 3. Add Environment Variables

Click "ADD VARIABLE" for each:

| Variable | Value |
|----------|-------|
| `NODE_ENV` | `production` |
| `ALLOWED_ORIGINS` | `https://planted.africa,https://www.planted.africa` |
| `FIREBASE_PROJECT_ID` | Your Firebase project ID |
| `FIREBASE_CLIENT_EMAIL` | Your service account email |
| `FIREBASE_PRIVATE_KEY` | Your private key (with `\n`) |
| `OPENAI_API_KEY` | Your OpenAI API key |

### 4. Deploy

**Option A - Git (Recommended):**
- Push to GitHub: `git push origin main`
- Afrihost auto-deploys from your repo

**Option B - FTP Upload:**
- Upload: `app.js`, `package.json`, `.htaccess`, `dist/`, `server/`
- Don't upload: `node_modules/`, `src/`, `.git/`

### 5. Test

Visit:
- `https://planted.africa/api/health` - Should return `{"ok":true}`
- `https://planted.africa` - Your app should load

---

## 📚 Full Documentation

For detailed instructions, see:
- **[AFRIHOST_DEPLOYMENT_GUIDE.md](AFRIHOST_DEPLOYMENT_GUIDE.md)** - Complete deployment guide
- **[ENVIRONMENT_VARIABLES.md](ENVIRONMENT_VARIABLES.md)** - Environment configuration reference

---

## ✅ Deployment Checklist

- [ ] Run `./build-for-afrihost.sh` successfully
- [ ] Set all environment variables in Afrihost
- [ ] Upload files via Git or FTP
- [ ] Start application in Afrihost panel
- [ ] Test `/api/health` endpoint
- [ ] Test main application
- [ ] Verify SSL/HTTPS working

---

## 🆘 Need Help?

### Common Issues

**Build fails?**
```bash
npm install
cd server && npm install && cd ..
npm run build
```

**Application won't start?**
- Check logs in Afrihost panel
- Verify all environment variables are set
- Ensure `app.js` exists in root

**404 errors on refresh?**
- Check `.htaccess` file is uploaded
- Verify Apache mod_rewrite is enabled

**CORS errors?**
- Update `ALLOWED_ORIGINS` with your domain
- Include both `https://domain.com` and `https://www.domain.com`

---

## 📞 Support

- **Afrihost:** support@afrihost.com
- **Documentation:** See AFRIHOST_DEPLOYMENT_GUIDE.md
- **GitHub Issues:** https://github.com/Koulz-Live/planted/issues

---

**Ready to deploy? Run `./build-for-afrihost.sh` to get started!** 🌱
