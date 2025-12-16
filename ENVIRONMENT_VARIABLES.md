# Environment Configuration Guide for Planted Application

## 📋 Overview
This document lists all environment variables required for the Planted application to run in production on Afrihost.

---

## 🔐 Required Environment Variables

### Core Configuration

#### NODE_ENV
- **Description:** Application environment mode
- **Required:** Yes
- **Default:** `development`
- **Production Value:** `production`
- **Purpose:** Optimizes Node.js for production, disables verbose logging

```env
NODE_ENV=production
```

---

#### PORT
- **Description:** Port number for Node.js server
- **Required:** No (Afrihost usually auto-assigns)
- **Default:** `3000`
- **Production Value:** Usually set automatically by Afrihost
- **Purpose:** Defines which port the server listens on

```env
PORT=3000
```

**Note:** Afrihost may override this value. Check your hosting configuration.

---

#### ALLOWED_ORIGINS
- **Description:** Comma-separated list of allowed CORS origins
- **Required:** Yes
- **Default:** `http://localhost:5173`
- **Production Value:** Your production domains
- **Purpose:** Prevents unauthorized cross-origin requests

```env
ALLOWED_ORIGINS=https://planted.africa,https://www.planted.africa
```

**Important:**
- Include both with and without `www` if applicable
- No trailing slashes
- Use HTTPS in production
- Separate multiple origins with commas (no spaces)

---

### Firebase Configuration

#### FIREBASE_PROJECT_ID
- **Description:** Your Firebase project identifier
- **Required:** Yes
- **Source:** Firebase Console → Project Settings → General
- **Format:** `your-project-name-xxxxx`
- **Purpose:** Identifies your Firebase project

```env
FIREBASE_PROJECT_ID=planted-app-abc123
```

**How to get:**
1. Go to https://console.firebase.google.com
2. Select your project
3. Click gear icon → Project Settings
4. Copy "Project ID"

---

#### FIREBASE_CLIENT_EMAIL
- **Description:** Service account email for Firebase Admin SDK
- **Required:** Yes
- **Source:** Firebase Console → Project Settings → Service Accounts
- **Format:** `firebase-adminsdk-xxxxx@project-id.iam.gserviceaccount.com`
- **Purpose:** Authenticates backend server with Firebase

```env
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-a1b2c@planted-app-abc123.iam.gserviceaccount.com
```

**How to get:**
1. Firebase Console → Project Settings
2. Click "Service accounts" tab
3. Click "Generate new private key"
4. Download JSON file
5. Copy `client_email` value from JSON

---

#### FIREBASE_PRIVATE_KEY
- **Description:** Private key for Firebase service account
- **Required:** Yes
- **Source:** Firebase service account JSON file
- **Format:** Multi-line RSA private key
- **Purpose:** Authenticates server with Firebase services

```env
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhk...\n-----END PRIVATE KEY-----\n"
```

**How to get:**
1. Same JSON file from "Generate new private key"
2. Copy `private_key` value
3. Keep the `\n` characters (they represent newlines)
4. Wrap the entire key in quotes

**Important Security Notes:**
- ⚠️ NEVER commit this to Git
- ⚠️ Keep the JSON file secure
- ⚠️ Regenerate if compromised
- ✅ Only set via environment variables

**Afrihost Setup:**
When adding to Afrihost environment variables panel:
- Paste the entire key including `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`
- Include the `\n` characters
- Wrap in quotes if the panel allows

---

### OpenAI Configuration

#### OPENAI_API_KEY
- **Description:** API key for OpenAI GPT models
- **Required:** Yes (for AI features)
- **Source:** OpenAI Platform
- **Format:** `sk-...` (starts with "sk-")
- **Purpose:** Enables recipe generation and AI features

```env
OPENAI_API_KEY=sk-proj-abcdefghijklmnopqrstuvwxyz1234567890
```

**How to get:**
1. Go to https://platform.openai.com
2. Sign in or create account
3. Navigate to API Keys section
4. Click "Create new secret key"
5. Copy and save immediately (shown only once)

**Cost Management:**
- Set usage limits in OpenAI dashboard
- Monitor usage at https://platform.openai.com/usage
- Consider implementing rate limiting in your app

---

## 📝 Optional Environment Variables

### OPENAI_MODEL
- **Description:** GPT model to use for AI features
- **Required:** No
- **Default:** `gpt-4` (or set in code)
- **Purpose:** Allows changing AI model without code changes

```env
OPENAI_MODEL=gpt-4-turbo-preview
```

**Available Models:**
- `gpt-4-turbo-preview` - Latest GPT-4 Turbo
- `gpt-4` - Standard GPT-4
- `gpt-3.5-turbo` - Faster, cheaper alternative

---

### LOG_LEVEL
- **Description:** Logging verbosity
- **Required:** No
- **Default:** `info`
- **Purpose:** Controls console output detail

```env
LOG_LEVEL=info
```

**Options:**
- `error` - Only errors
- `warn` - Errors and warnings
- `info` - General information (recommended)
- `debug` - Detailed debugging
- `verbose` - Everything

---

## 🛠️ Setting Environment Variables in Afrihost

### Method 1: Via Control Panel (Recommended)

1. **Access Node.js Application Settings**
   - Log in to Afrihost cPanel
   - Navigate to Tools → Node.js
   - Select your Planted application
   - Find "Environment variables" section

2. **Add Each Variable**
   - Click "ADD VARIABLE" button
   - Enter variable name (e.g., `NODE_ENV`)
   - Enter variable value (e.g., `production`)
   - Click "Save" or confirm

3. **Verify All Variables**
   - Ensure all required variables are listed
   - Check for typos in names
   - Verify values are correct

4. **Restart Application**
   - After adding all variables
   - Restart the Node.js application
   - Check logs for any errors

---

### Method 2: Via .env File (Not Recommended for Production)

If Afrihost doesn't support environment variables panel:

1. **Create .env file** in application root:
```env
NODE_ENV=production
PORT=3000
ALLOWED_ORIGINS=https://planted.africa,https://www.planted.africa

FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

OPENAI_API_KEY=sk-your-api-key-here
```

2. **Secure the file:**
```bash
chmod 600 .env  # Only owner can read/write
```

3. **Add to .gitignore:**
```
.env
.env.production
.env.local
```

**⚠️ Security Warning:**
- This method is less secure
- File could be exposed if misconfigured
- Prefer control panel method

---

## ✅ Environment Variables Checklist

Before deploying, verify you have:

### Required Variables
- [ ] `NODE_ENV=production`
- [ ] `ALLOWED_ORIGINS` (with your domain)
- [ ] `FIREBASE_PROJECT_ID`
- [ ] `FIREBASE_CLIENT_EMAIL`
- [ ] `FIREBASE_PRIVATE_KEY`
- [ ] `OPENAI_API_KEY`

### Optional Variables
- [ ] `PORT` (if needed)
- [ ] `OPENAI_MODEL` (if customizing)
- [ ] `LOG_LEVEL` (if customizing)

### Verification
- [ ] All values copied correctly (no truncation)
- [ ] No extra spaces or newlines
- [ ] Firebase private key includes `\n` characters
- [ ] Domain in ALLOWED_ORIGINS matches your actual domain
- [ ] HTTPS used in production URLs

---

## 🧪 Testing Environment Configuration

### Local Testing

Before deploying, test with production-like settings:

1. **Create .env.production file:**
```env
NODE_ENV=production
PORT=3000
ALLOWED_ORIGINS=http://localhost:3000
# ... other variables
```

2. **Load and test:**
```bash
# Install dependencies
npm install
cd server && npm install && cd ..

# Build
npm run build:production

# Start with production env
node -r dotenv/config app.js dotenv_config_path=.env.production
```

3. **Verify:**
- Visit http://localhost:3000
- Check http://localhost:3000/api/health
- Test AI features
- Check console for errors

---

### Production Testing

After deploying to Afrihost:

1. **Health Check:**
```bash
curl https://planted.africa/api/health
```

Expected response:
```json
{
  "ok": true,
  "timestamp": 1734307200000,
  "environment": "production",
  "version": "1.0.0"
}
```

2. **Check Logs:**
- Access Afrihost application logs
- Look for startup message
- Verify no Firebase connection errors
- Check for OpenAI API initialization

3. **Feature Testing:**
- Test recipe generation (verifies OpenAI)
- Upload an image (verifies Firebase Storage)
- Check saved recipes (verifies Firestore)

---

## 🔒 Security Best Practices

### Do's ✅
- ✅ Use environment variables for all secrets
- ✅ Use the hosting control panel for variables
- ✅ Regenerate keys if compromised
- ✅ Use HTTPS for all production URLs
- ✅ Set spending limits on OpenAI
- ✅ Monitor Firebase usage
- ✅ Rotate keys periodically (every 3-6 months)
- ✅ Use strong, unique values

### Don'ts ❌
- ❌ Never commit .env files to Git
- ❌ Don't share keys in public channels
- ❌ Don't use example/default values
- ❌ Don't hardcode secrets in code
- ❌ Don't expose keys in frontend code
- ❌ Don't use same keys for dev and prod
- ❌ Don't share Firebase admin credentials

---

## 🚨 Troubleshooting

### Issue: "Firebase app initialization failed"

**Possible Causes:**
- Missing or incorrect `FIREBASE_PROJECT_ID`
- Invalid `FIREBASE_CLIENT_EMAIL`
- Malformed `FIREBASE_PRIVATE_KEY`

**Solutions:**
1. Verify all three Firebase variables are set
2. Check for typos in project ID
3. Ensure private key includes `\n` characters
4. Verify service account is active in Firebase Console

---

### Issue: "CORS policy blocked"

**Possible Causes:**
- Missing or incorrect `ALLOWED_ORIGINS`
- Domain doesn't match
- Missing HTTPS

**Solutions:**
1. Check `ALLOWED_ORIGINS` includes your domain
2. Ensure using HTTPS (not HTTP)
3. Include both www and non-www versions
4. Remove any trailing slashes

---

### Issue: "OpenAI API call failed"

**Possible Causes:**
- Missing or invalid `OPENAI_API_KEY`
- Exceeded quota/rate limit
- Insufficient credits

**Solutions:**
1. Verify API key is correct (starts with `sk-`)
2. Check OpenAI dashboard for usage/limits
3. Add credits if balance is low
4. Verify API key is active

---

### Issue: Environment variables not loading

**Possible Causes:**
- Variables not set in Afrihost panel
- Application not restarted after adding
- Typo in variable name

**Solutions:**
1. Double-check all variables in panel
2. Restart Node.js application
3. Check application logs for "undefined" errors
4. Verify variable names match exactly (case-sensitive)

---

## 📚 Reference: Complete .env Template

```env
# ==================================
# PLANTED APPLICATION CONFIGURATION
# ==================================

# --- Core Settings ---
NODE_ENV=production
PORT=3000

# --- CORS Configuration ---
# Add all domains where your app will be accessed
ALLOWED_ORIGINS=https://planted.africa,https://www.planted.africa

# --- Firebase Configuration ---
# Get these from Firebase Console → Project Settings → Service Accounts
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_FULL_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"

# --- OpenAI Configuration ---
# Get from https://platform.openai.com/api-keys
OPENAI_API_KEY=sk-your-openai-api-key-here

# --- Optional Settings ---
OPENAI_MODEL=gpt-4-turbo-preview
LOG_LEVEL=info

# ==================================
# NOTES:
# - Never commit this file to Git
# - Keep backups in a secure location
# - Regenerate keys if compromised
# - Use Afrihost control panel instead of .env file when possible
# ==================================
```

---

## 📞 Getting Help

### Firebase Issues
- **Documentation:** https://firebase.google.com/docs
- **Support:** https://firebase.google.com/support

### OpenAI Issues
- **Documentation:** https://platform.openai.com/docs
- **Dashboard:** https://platform.openai.com
- **Support:** help@openai.com

### Afrihost Issues
- **Support:** https://www.afrihost.com/support
- **Email:** support@afrihost.com
- **Community:** Afrihost user forums

---

**Document Version:** 1.0.0  
**Last Updated:** December 16, 2025  
**Application:** Planted v1.0.0  
**Platform:** Afrihost Node.js Hosting
