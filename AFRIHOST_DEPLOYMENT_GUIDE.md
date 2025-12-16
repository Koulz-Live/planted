# Afrihost Deployment Guide for Planted Application

## 📋 Overview
This guide provides step-by-step instructions for deploying the Planted application to Afrihost's Node.js hosting environment.

---

## 🎯 Prerequisites

### Local Machine Requirements
- ✅ Node.js 18+ installed
- ✅ npm or yarn package manager
- ✅ Git installed
- ✅ Access to your GitHub repository (https://github.com/Koulz-Live/planted)

### Afrihost Account Requirements
- ✅ Afrihost hosting account with Node.js support
- ✅ Access to cPanel or hosting control panel
- ✅ Node.js application management interface
- ✅ Domain or subdomain configured

### Firebase Setup
- ✅ Firebase project created
- ✅ Firestore database enabled
- ✅ Firebase service account credentials
- ✅ OpenAI API key (for AI features)

---

## 🚀 Deployment Steps

### Step 1: Prepare Your Application for Production

#### 1.1 Build the Application Locally
```bash
cd /Applications/XAMPP/xamppfiles/htdocs/Planted/v1

# Install all dependencies
npm install
cd server && npm install && cd ..

# Build the production bundle
npm run build:production
```

This command will:
- Compile TypeScript
- Build React frontend with Vite
- Create optimized production bundles in `dist/` folder
- Install production dependencies in server folder

#### 1.2 Verify Build Success
Check that these directories exist:
- `dist/` - Contains built React application
- `dist/assets/` - CSS, JS, and other assets
- `server/dist/` - Compiled backend server code

---

### Step 2: Configure Afrihost Node.js Application

#### 2.1 Access Afrihost Control Panel
1. Log in to your Afrihost account
2. Navigate to **Tools** → **Node.js** (as shown in your screenshot)
3. Click **"CREATE APPLICATION"** tab

#### 2.2 Fill in Application Details

Based on your screenshot, configure:

**Node.js version:** `22.18.0` (or latest LTS available)
- Select the latest stable version for best performance and security

**Application mode:** `Production`
- This optimizes Node.js for production workloads

**Application root:** `https://github.com/Koulz-Live/planted`
- Your GitHub repository URL
- Make sure the repository is public or you've configured SSH keys

**Application URL:** `planted.africa` (or your domain)
- This is the domain where your app will be accessible
- Can use subdomain like `app.planted.africa`

**Application startup file:** `app.js`
- This is the main server file we created
- Located in the root directory

#### 2.3 Environment Variables

Click **"ADD VARIABLE"** and add the following:

| Variable Name | Description | Example Value |
|---------------|-------------|---------------|
| `NODE_ENV` | Environment mode | `production` |
| `PORT` | Port number (usually set by Afrihost) | `3000` or leave for auto-assign |
| `ALLOWED_ORIGINS` | Allowed CORS origins | `https://planted.africa,https://www.planted.africa` |
| `OPENAI_API_KEY` | OpenAI API key for AI features | `sk-...` |
| `FIREBASE_PROJECT_ID` | Firebase project ID | `planted-app-xxxxx` |
| `FIREBASE_CLIENT_EMAIL` | Service account email | `firebase-adminsdk-...@planted-app.iam.gserviceaccount.com` |
| `FIREBASE_PRIVATE_KEY` | Service account private key | `-----BEGIN PRIVATE KEY-----\n...` |

**Important Notes:**
- Replace `planted.africa` with your actual domain
- Get Firebase credentials from Firebase Console → Project Settings → Service Accounts
- OpenAI API key from https://platform.openai.com/api-keys
- For `FIREBASE_PRIVATE_KEY`, replace `\n` with actual newlines or escape properly

---

### Step 3: Upload Application Files

You have several options for uploading:

#### Option A: Git Integration (Recommended)
1. In Afrihost panel, use the GitHub integration
2. Authenticate with GitHub
3. Select your `planted` repository
4. Choose the `main` branch
5. Afrihost will automatically clone and deploy

#### Option B: FTP Upload
1. Connect to your Afrihost account via FTP
   - Host: Your Afrihost FTP address
   - Username: Your cPanel username
   - Password: Your cPanel password
   - Port: 21 (or 22 for SFTP)

2. Upload these files/folders:
   ```
   ✅ app.js
   ✅ package.json
   ✅ package-lock.json
   ✅ .htaccess
   ✅ dist/ (entire folder - built React app)
   ✅ server/ (entire folder)
   ✅ public/ (if any static assets)
   ```

3. **DO NOT upload:**
   ```
   ❌ node_modules/
   ❌ src/ (source files, already built)
   ❌ .git/
   ❌ .env files (set via environment variables instead)
   ❌ *.log files
   ```

#### Option C: SSH/Terminal Upload
```bash
# From your local machine
scp -r dist/ server/ app.js package.json user@yourhost.afrihost.com:/path/to/app/
```

---

### Step 4: Install Dependencies on Server

#### 4.1 Via Afrihost Panel
After upload, Afrihost should automatically run:
```bash
npm install --production
```

#### 4.2 Via SSH (if available)
If you have SSH access:
```bash
ssh user@yourhost.afrihost.com
cd /path/to/planted
npm install --production
cd server && npm install --production
```

---

### Step 5: Start the Application

#### 5.1 Using Afrihost Panel
1. In the Node.js application interface
2. Click **"CREATE"** or **"START"** button
3. Wait for the application to start (green status indicator)

#### 5.2 Verify Application Status
Check the application logs in Afrihost panel:
```
✅ Expected output:
╔═══════════════════════════════════════════════════════╗
║   🌱 Planted Application Server                      ║
║   Environment: production                            ║
║   Port: 3000                                         ║
╚═══════════════════════════════════════════════════════╝
```

---

### Step 6: Configure Domain and DNS

#### 6.1 Domain Setup
1. In Afrihost cPanel, go to **Domains**
2. Add your domain (e.g., `planted.africa`)
3. Point to your Node.js application

#### 6.2 DNS Configuration
Update DNS records at your domain registrar:

**A Record:**
```
Type: A
Host: @
Value: [Your Afrihost Server IP]
TTL: 3600
```

**CNAME Record (for www):**
```
Type: CNAME
Host: www
Value: planted.africa
TTL: 3600
```

#### 6.3 SSL Certificate
1. In Afrihost cPanel → SSL/TLS
2. Use **Let's Encrypt** for free SSL
3. Enable "Force HTTPS" option

---

### Step 7: Test Your Deployment

#### 7.1 Health Check
Visit: `https://planted.africa/api/health`

Expected response:
```json
{
  "ok": true,
  "timestamp": 1734307200000,
  "environment": "production",
  "version": "1.0.0"
}
```

#### 7.2 Frontend Test
Visit: `https://planted.africa`

You should see:
- ✅ Home page loads
- ✅ Navigation works
- ✅ All pages accessible
- ✅ No console errors

#### 7.3 API Test
Test key features:
- ✅ Recipe generation works
- ✅ Image upload functions
- ✅ SOC Management dashboard loads
- ✅ Community features work

---

## 🔧 Troubleshooting

### Issue: Application Won't Start

**Symptom:** Application status shows "Stopped" or "Error"

**Solutions:**
1. Check logs in Afrihost panel for error messages
2. Verify `app.js` file exists in root directory
3. Ensure all dependencies are installed
4. Check Node.js version compatibility (18+)
5. Verify environment variables are set correctly

**Debug commands (if SSH available):**
```bash
cd /path/to/planted
node app.js  # Run manually to see errors
npm list     # Check installed packages
```

---

### Issue: "Module not found" Errors

**Symptom:** Server crashes with `Cannot find module 'express'` or similar

**Solutions:**
1. Reinstall dependencies:
   ```bash
   npm install --production
   cd server && npm install --production
   ```

2. Check `package.json` includes all required dependencies

3. Ensure `node_modules/` folders exist:
   - `/path/to/planted/node_modules/`
   - `/path/to/planted/server/node_modules/`

---

### Issue: 404 Errors on Page Refresh

**Symptom:** Direct URLs work, but refreshing gives 404

**Solutions:**
1. Verify `.htaccess` file is in root directory
2. Check Apache `mod_rewrite` is enabled
3. Ensure `app.js` has the wildcard route handler:
   ```javascript
   app.get('*', (req, res) => {
     res.sendFile(path.join(__dirname, 'dist', 'index.html'));
   });
   ```

---

### Issue: CORS Errors

**Symptom:** Browser console shows CORS policy errors

**Solutions:**
1. Update `ALLOWED_ORIGINS` environment variable:
   ```
   ALLOWED_ORIGINS=https://planted.africa,https://www.planted.africa
   ```

2. Verify your domain is in the list (no trailing slashes)

3. Check app.js CORS configuration

---

### Issue: Firebase Connection Errors

**Symptom:** API calls fail with Firebase authentication errors

**Solutions:**
1. Verify all Firebase environment variables are set:
   - `FIREBASE_PROJECT_ID`
   - `FIREBASE_CLIENT_EMAIL`
   - `FIREBASE_PRIVATE_KEY`

2. Check private key format (newlines should be preserved)

3. Verify Firebase project is active in Firebase Console

4. Check Firestore security rules allow server access

---

### Issue: Images Not Loading

**Symptom:** Recipe images or uploads don't display

**Solutions:**
1. Check `dist/` folder contains all assets
2. Verify image paths in code use relative URLs
3. Ensure `/uploads` directory exists and is writable
4. Check `.htaccess` isn't blocking image requests

---

### Issue: Slow Performance

**Symptom:** Application loads slowly

**Solutions:**
1. Enable gzip compression in `.htaccess` (already configured)
2. Check Afrihost resource limits (RAM, CPU)
3. Optimize images before upload
4. Enable browser caching (configured in `.htaccess`)
5. Consider CDN for static assets

---

## 📊 Monitoring and Maintenance

### Application Logs
Access logs via Afrihost panel:
- **Access logs:** Track requests and traffic
- **Error logs:** Monitor application errors
- **Application logs:** Console.log output from Node.js

### Performance Monitoring
Monitor these metrics:
- ✅ Response times
- ✅ Memory usage
- ✅ CPU usage
- ✅ Request count
- ✅ Error rate

### Regular Maintenance Tasks

**Weekly:**
- Check application logs for errors
- Monitor resource usage
- Test critical features

**Monthly:**
- Review Firebase usage and costs
- Update dependencies for security patches
- Backup Firestore data

**Quarterly:**
- Update Node.js version if needed
- Review and optimize code
- Performance audit

---

## 🔐 Security Best Practices

### Environment Variables
✅ **DO:**
- Store all secrets in environment variables
- Use strong, unique keys
- Rotate keys regularly

❌ **DON'T:**
- Commit `.env` files to Git
- Share keys in public channels
- Use default/example keys

### SSL/HTTPS
✅ Always use HTTPS in production
✅ Enable HSTS header
✅ Redirect HTTP to HTTPS

### Firestore Security
✅ Configure proper security rules
✅ Use Firebase Admin SDK on server
✅ Never expose service account keys in frontend

### API Keys
✅ Restrict OpenAI API key usage
✅ Set spending limits
✅ Monitor API usage

---

## 📁 File Structure on Server

After deployment, your structure should look like:

```
/home/youruser/planted/  (or similar path)
├── app.js                          # Main server file
├── package.json                    # Dependencies
├── package-lock.json              # Locked versions
├── .htaccess                       # Apache config
├── dist/                           # Built React app
│   ├── index.html
│   ├── assets/
│   │   ├── index-abc123.js        # Hashed bundles
│   │   ├── index-def456.css
│   │   └── ...
│   └── vite.svg
├── server/                         # Backend code
│   ├── dist/                       # Compiled JS
│   │   ├── index.js
│   │   ├── routes/
│   │   ├── services/
│   │   └── config/
│   ├── package.json
│   └── node_modules/
├── uploads/                        # User uploads (create if needed)
└── node_modules/                   # Root dependencies
```

---

## 🔄 Updating Your Application

### For Code Changes

**Method 1: Git Pull (if using Git integration)**
1. Push changes to GitHub
2. In Afrihost panel → Node.js app → Click "Update" or "Redeploy"
3. Afrihost pulls latest code
4. Application automatically restarts

**Method 2: Manual Update**
1. Build locally: `npm run build:production`
2. Upload changed files via FTP
3. Restart application in Afrihost panel

**Method 3: Full Redeploy**
```bash
# Local machine
npm run build:production

# Upload via FTP or SCP
# dist/, app.js, and any changed server files

# Restart via Afrihost panel
```

---

## 💰 Cost Considerations

### Afrihost Hosting
- Node.js hosting plan cost
- Bandwidth usage
- Storage space

### Firebase
- Firestore reads/writes
- Storage (images, files)
- Bandwidth

### OpenAI API
- Token usage (GPT-4 API calls)
- Monitor usage at: https://platform.openai.com/usage

**Cost Optimization Tips:**
- Cache API responses
- Optimize image sizes
- Implement rate limiting
- Use Firebase free tier wisely
- Monitor and set budget alerts

---

## 📞 Support Resources

### Afrihost Support
- **Website:** https://www.afrihost.com/support
- **Email:** support@afrihost.com
- **Helpdesk:** Available via client zone

### Application Issues
- **GitHub:** https://github.com/Koulz-Live/planted/issues
- **Email:** Your development team

### Service Documentation
- **Firebase:** https://firebase.google.com/docs
- **OpenAI:** https://platform.openai.com/docs
- **Node.js:** https://nodejs.org/docs

---

## ✅ Deployment Checklist

Use this checklist before going live:

### Pre-Deployment
- [ ] Code built successfully (`npm run build:production`)
- [ ] All tests passing
- [ ] Environment variables documented
- [ ] Firebase project configured
- [ ] OpenAI API key obtained
- [ ] Domain registered and configured

### Afrihost Setup
- [ ] Node.js application created
- [ ] Application root set to GitHub repo
- [ ] Startup file set to `app.js`
- [ ] All environment variables added
- [ ] Production mode selected
- [ ] Latest Node.js version selected

### File Upload
- [ ] `app.js` uploaded
- [ ] `package.json` uploaded
- [ ] `dist/` folder uploaded (complete)
- [ ] `server/` folder uploaded (complete)
- [ ] `.htaccess` uploaded
- [ ] Dependencies installed

### Configuration
- [ ] DNS records configured
- [ ] SSL certificate installed
- [ ] HTTPS forced
- [ ] CORS origins configured
- [ ] Firebase credentials set

### Testing
- [ ] Health check endpoint responds
- [ ] Homepage loads correctly
- [ ] All routes accessible
- [ ] Recipe generation works
- [ ] Image upload functions
- [ ] SOC dashboard loads
- [ ] Mobile responsive
- [ ] No console errors

### Security
- [ ] HTTPS enabled
- [ ] Environment variables secured
- [ ] Firebase security rules configured
- [ ] API keys restricted
- [ ] CORS properly configured
- [ ] Security headers enabled

### Monitoring
- [ ] Logs accessible
- [ ] Error tracking configured
- [ ] Performance baseline established
- [ ] Uptime monitoring setup (optional)

### Documentation
- [ ] Deployment process documented
- [ ] Team notified
- [ ] Support contacts shared

---

## 🎉 Success!

Once all steps are complete, your Planted application should be:
- ✅ Running at https://planted.africa (or your domain)
- ✅ Serving the React frontend
- ✅ Handling API requests
- ✅ Connected to Firebase
- ✅ Processing AI requests
- ✅ Fully functional and accessible

**Congratulations on your deployment!** 🌱

---

## 📚 Additional Resources

### Quick Reference Commands

**Build for production:**
```bash
npm run build:production
```

**Test locally before deploying:**
```bash
npm start
# Visit http://localhost:3000
```

**Check health:**
```bash
curl https://planted.africa/api/health
```

### Common Issues Reference
See "Troubleshooting" section above for detailed solutions.

---

**Document Version:** 1.0.0  
**Last Updated:** December 16, 2025  
**Application:** Planted v1.0.0  
**Hosting:** Afrihost Node.js Environment
