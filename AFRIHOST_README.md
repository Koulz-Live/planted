# 🌱 Planted - Afrihost Deployment Files

## 📦 What's Inside

This directory contains everything you need to deploy the Planted application to Afrihost's Node.js hosting platform.

---

## 📄 Documentation Files

### 🚀 Quick Start
- **[QUICK_START_AFRIHOST.md](QUICK_START_AFRIHOST.md)** - Start here! TL;DR deployment guide
- **[AFRIHOST_PANEL_GUIDE.txt](AFRIHOST_PANEL_GUIDE.txt)** - Visual guide matching your Afrihost screenshot

### 📚 Complete Guides
- **[AFRIHOST_DEPLOYMENT_GUIDE.md](AFRIHOST_DEPLOYMENT_GUIDE.md)** - Comprehensive 30+ page deployment manual
- **[ENVIRONMENT_VARIABLES.md](ENVIRONMENT_VARIABLES.md)** - Detailed environment configuration reference
- **[AFRIHOST_SETUP_COMPLETE.md](AFRIHOST_SETUP_COMPLETE.md)** - Setup completion summary and checklist

---

## 🔧 Configuration Files

### Server Files
- **`app.js`** - Production server (Express + React frontend serving)
- **`.htaccess`** - Apache configuration for URL rewriting and security

### Build Scripts
- **`build-for-afrihost.sh`** - Automated build script with verification
- **`package.json`** - Updated with production build scripts

---

## 🎯 Quick Deployment (3 Steps)

### 1️⃣ Build
```bash
./build-for-afrihost.sh
```

### 2️⃣ Configure Afrihost
See [AFRIHOST_PANEL_GUIDE.txt](AFRIHOST_PANEL_GUIDE.txt) for exact form values

### 3️⃣ Deploy
Push to GitHub (automatic) or upload via FTP

---

## 📋 What You Need

### Credentials Required
- ✅ Firebase service account JSON
- ✅ OpenAI API key
- ✅ Your domain name

### Afrihost Configuration
- ✅ Node.js version: **22.18.0**
- ✅ Application mode: **Production**
- ✅ Application root: **https://github.com/Koulz-Live/planted**
- ✅ Startup file: **app.js**

### Environment Variables (6 required)
1. `NODE_ENV=production`
2. `ALLOWED_ORIGINS=https://your-domain.com`
3. `FIREBASE_PROJECT_ID=...`
4. `FIREBASE_CLIENT_EMAIL=...`
5. `FIREBASE_PRIVATE_KEY=...`
6. `OPENAI_API_KEY=...`

---

## 📖 Recommended Reading Order

### For First-Time Deployment
1. Read [QUICK_START_AFRIHOST.md](QUICK_START_AFRIHOST.md)
2. Open [AFRIHOST_PANEL_GUIDE.txt](AFRIHOST_PANEL_GUIDE.txt) while configuring
3. Reference [ENVIRONMENT_VARIABLES.md](ENVIRONMENT_VARIABLES.md) for credentials
4. Run `./build-for-afrihost.sh`
5. Follow the on-screen checklist

### For Detailed Information
1. Start with [AFRIHOST_DEPLOYMENT_GUIDE.md](AFRIHOST_DEPLOYMENT_GUIDE.md)
2. Review [ENVIRONMENT_VARIABLES.md](ENVIRONMENT_VARIABLES.md) thoroughly
3. Check [AFRIHOST_SETUP_COMPLETE.md](AFRIHOST_SETUP_COMPLETE.md) for verification

---

## ✅ Pre-Deployment Checklist

- [ ] Build script runs successfully (`./build-for-afrihost.sh`)
- [ ] `dist/` folder contains built React app
- [ ] Firebase credentials obtained
- [ ] OpenAI API key ready
- [ ] Domain configured in Afrihost
- [ ] All 6 environment variables documented

---

## 🧪 Test Your Deployment

After deployment, verify these endpoints:

```bash
# Health check
curl https://your-domain.com/api/health

# Expected: {"ok":true,"timestamp":...,"environment":"production"}
```

Visit these URLs:
- ✅ `https://your-domain.com` - Homepage
- ✅ `https://your-domain.com/recipes` - Recipe AI
- ✅ `https://your-domain.com/soc-management` - SOC Dashboard

---

## 🆘 Common Issues

### Build fails?
```bash
npm install
cd server && npm install && cd ..
npm run build
```

### Application won't start?
- Check all environment variables are set
- Verify `app.js` is in root directory
- Review application logs in Afrihost panel

### 404 errors on refresh?
- Ensure `.htaccess` is uploaded
- Check Apache `mod_rewrite` is enabled

### CORS errors?
- Update `ALLOWED_ORIGINS` with your actual domain
- Use HTTPS (not HTTP)
- No trailing slashes

---

## 📞 Support

### Documentation
- All guides are in this directory
- Start with the Quick Start guide

### Service Support
- **Afrihost:** https://www.afrihost.com/support
- **Firebase:** https://firebase.google.com/docs
- **OpenAI:** https://platform.openai.com/docs

### Application Issues
- **GitHub:** https://github.com/Koulz-Live/planted
- **Issues:** https://github.com/Koulz-Live/planted/issues

---

## 🎉 Ready to Deploy!

Your Planted application is fully configured for Afrihost deployment. All necessary files are in place, documentation is complete, and the build process is automated.

**Next step:** Open [QUICK_START_AFRIHOST.md](QUICK_START_AFRIHOST.md) and start deploying! 🚀

---

## 📊 Project Status

- ✅ Production server created
- ✅ Apache configuration ready
- ✅ Build automation complete
- ✅ Documentation comprehensive
- ✅ Environment variables documented
- ✅ Testing procedures defined
- ✅ Troubleshooting guide provided

**Status: READY FOR DEPLOYMENT** ✨

---

**Last Updated:** December 16, 2025  
**Version:** 1.0.0  
**Target Platform:** Afrihost Node.js Hosting
