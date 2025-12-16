# 🔧 Firebase Private Key Error - SOLVED

## ❌ The Problem

You're seeing this error:
```
/home/plantzia/nodevenv/webapp/10/bin/npm: line 14: export: `KEY-----nMIIEvQIBADANBg...
```

**Root Cause:** The `FIREBASE_PRIVATE_KEY` environment variable contains `\n` characters (newlines) that are breaking the npm startup script when exported as a shell variable.

---

## ✅ Solution: Afrihost Environment Variables Panel

### Method 1: Base64 Encoding (RECOMMENDED for Afrihost)

Instead of storing the private key with `\n` characters, encode it in Base64.

#### Step 1: Encode Your Private Key

On your local machine:

```bash
# Option A: From Firebase JSON file
cat firebase-service-account.json | jq -r '.private_key' | base64

# Option B: If you already have the key copied
echo "-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAA...
-----END PRIVATE KEY-----" | base64
```

This will output a single-line Base64 string like:
```
LS0tLS1CRUdJTiBQUklWQVRFIEtFWS0tLS0tCk1JSUVW...
```

#### Step 2: Update Afrihost Environment Variable

In Afrihost control panel:

**Variable Name:** `FIREBASE_PRIVATE_KEY_BASE64`

**Variable Value:** Paste the Base64 string (single line, no spaces)

#### Step 3: Update app.js to Decode

We need to modify `app.js` to decode the Base64 key:

```javascript
// Add this at the top of app.js, after require('dotenv').config()

// Decode Firebase private key if it's Base64 encoded
if (process.env.FIREBASE_PRIVATE_KEY_BASE64) {
  process.env.FIREBASE_PRIVATE_KEY = Buffer.from(
    process.env.FIREBASE_PRIVATE_KEY_BASE64,
    'base64'
  ).toString('utf-8');
}
```

---

### Method 2: Proper Escaping (Alternative)

If Afrihost's panel supports it, format the key like this:

**Variable Name:** `FIREBASE_PRIVATE_KEY`

**Variable Value:** (Use SINGLE line with literal `\n`)
```
"-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhk...\n-----END PRIVATE KEY-----\n"
```

**Important:**
- Keep as ONE line
- Include the quotes
- Don't press Enter to create actual newlines
- The `\n` should be typed literally (backslash + n)

---

### Method 3: Use .env File (Not Recommended for Production)

If the panel methods don't work, create a `.env` file on the server:

```bash
# SSH into your Afrihost server
ssh user@yourhost.afrihost.com

# Navigate to your app directory
cd /home/plantzia/webapp

# Create .env file
nano .env
```

Add:
```env
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCyH6aelJUo...
-----END PRIVATE KEY-----"
```

**Security Warning:** This is less secure. File permissions MUST be set:
```bash
chmod 600 .env
```

---

## 🔧 Implementation: Update app.js

Here's the updated code to handle both Base64 and regular private keys:

```javascript
require('dotenv').config();

// Handle Firebase Private Key encoding
function getFirebasePrivateKey() {
  // Method 1: Base64 encoded (recommended for Afrihost)
  if (process.env.FIREBASE_PRIVATE_KEY_BASE64) {
    return Buffer.from(
      process.env.FIREBASE_PRIVATE_KEY_BASE64,
      'base64'
    ).toString('utf-8');
  }
  
  // Method 2: Direct key with \n literals
  if (process.env.FIREBASE_PRIVATE_KEY) {
    // Replace literal \n with actual newlines
    return process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');
  }
  
  throw new Error('FIREBASE_PRIVATE_KEY or FIREBASE_PRIVATE_KEY_BASE64 must be set');
}

// Store processed key back
process.env.FIREBASE_PRIVATE_KEY = getFirebasePrivateKey();

const express = require('express');
// ... rest of app.js
```

---

## 📋 Quick Fix Checklist

### Option A: Base64 Method (Recommended)

- [ ] **Step 1:** Encode your private key to Base64
  ```bash
  cat firebase.json | jq -r '.private_key' | base64
  ```

- [ ] **Step 2:** In Afrihost panel, add variable:
  - Name: `FIREBASE_PRIVATE_KEY_BASE64`
  - Value: [Paste Base64 string]

- [ ] **Step 3:** Remove old `FIREBASE_PRIVATE_KEY` variable

- [ ] **Step 4:** Update `app.js` with Base64 decoding code (see below)

- [ ] **Step 5:** Restart your Node.js application

- [ ] **Step 6:** Test: `curl https://your-domain.com/api/health`

---

## 🔄 Updated app.js (Top Section)

Replace the top section of your `app.js` with this:

```javascript
/**
 * Production Server for Planted Application
 * Afrihost Node.js hosting environment
 */

require('dotenv').config();

// ===== FIREBASE PRIVATE KEY HANDLER =====
// Handles Base64 encoded keys (recommended for Afrihost)
function initializeFirebaseCredentials() {
  // Method 1: Base64 encoded (recommended)
  if (process.env.FIREBASE_PRIVATE_KEY_BASE64) {
    console.log('[Planted] Using Base64 encoded Firebase private key');
    process.env.FIREBASE_PRIVATE_KEY = Buffer.from(
      process.env.FIREBASE_PRIVATE_KEY_BASE64,
      'base64'
    ).toString('utf-8');
    return;
  }
  
  // Method 2: Direct key with \n literals
  if (process.env.FIREBASE_PRIVATE_KEY) {
    console.log('[Planted] Using direct Firebase private key');
    // Replace literal \n with actual newlines if needed
    if (process.env.FIREBASE_PRIVATE_KEY.includes('\\n')) {
      process.env.FIREBASE_PRIVATE_KEY = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');
    }
    return;
  }
  
  console.error('[Planted] ERROR: No Firebase private key found!');
  console.error('[Planted] Set either FIREBASE_PRIVATE_KEY_BASE64 or FIREBASE_PRIVATE_KEY');
  throw new Error('Firebase credentials not configured');
}

// Initialize Firebase credentials
try {
  initializeFirebaseCredentials();
  console.log('[Planted] ✓ Firebase credentials initialized');
} catch (error) {
  console.error('[Planted] ✗ Firebase initialization failed:', error.message);
  process.exit(1);
}

const express = require('express');
const cors = require('cors');
const path = require('path');

// ... rest of your app.js code
```

---

## 🧪 Testing After Fix

### 1. Check Application Logs

In Afrihost panel, check logs for:
```
[Planted] Using Base64 encoded Firebase private key
[Planted] ✓ Firebase credentials initialized
```

### 2. Test Health Endpoint

```bash
curl https://your-domain.com/api/health
```

Should return:
```json
{"ok":true,"timestamp":1734307200000,"environment":"production","version":"1.0.0"}
```

### 3. Test Firebase Connection

Try using a feature that requires Firebase (e.g., recipe generation, saving data).

---

## 🎯 Why This Happens

### The Technical Explanation

When Afrihost sets environment variables via their panel, they're added to shell startup scripts. The problem occurs here:

```bash
# What Afrihost tries to do:
export FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBg..."  # ← This breaks across lines!

# The shell sees:
export FIREBASE_PRIVATE_KEY="-----BEGIN  # ← Line 1 (incomplete)
MIIEvQIBADANBg..."                      # ← Line 2 (syntax error!)
```

Multi-line values break the `export` command syntax.

### Why Base64 Solves It

Base64 encoding converts the multi-line key into a single line:

```bash
# This works perfectly:
export FIREBASE_PRIVATE_KEY_BASE64="LS0tLS1CRUdJTiBQUklWQVRFIEtFWS0tLS0t..."
```

Then your Node.js app decodes it back to the original format.

---

## 🚨 Alternative: Use Afrihost File Manager

If environment variables continue to cause issues:

### 1. Upload Firebase JSON Directly

- Use Afrihost file manager
- Upload your `firebase-service-account.json` to a secure location
- Set file permissions: `chmod 600 firebase-service-account.json`

### 2. Update app.js to Load from File

```javascript
const admin = require('firebase-admin');
const serviceAccount = require('./firebase-service-account.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
```

### 3. Update Environment Variables

Remove these from Afrihost panel:
- ❌ `FIREBASE_PRIVATE_KEY`
- ❌ `FIREBASE_CLIENT_EMAIL`
- ❌ `FIREBASE_PROJECT_ID`

Keep only:
- ✅ `NODE_ENV=production`
- ✅ `ALLOWED_ORIGINS=https://...`
- ✅ `OPENAI_API_KEY=sk-...`

---

## 📞 Still Having Issues?

### Check These:

1. **Verify Base64 encoding:**
   ```bash
   echo "YOUR_BASE64_STRING" | base64 -d
   # Should output your original private key
   ```

2. **Check character encoding:**
   - No extra spaces at beginning/end
   - No line breaks in Base64 string
   - Copy/paste carefully to avoid corruption

3. **Restart application:**
   - After changing environment variables
   - Always restart via Afrihost panel

4. **Check logs for errors:**
   - Look for "Firebase initialization failed"
   - Check for import/require errors

### Contact Support:

- **Afrihost:** support@afrihost.com
- **GitHub Issues:** https://github.com/Koulz-Live/planted/issues

---

## ✅ Summary

**Problem:** Multi-line Firebase private key breaks shell export

**Solution:** Use Base64 encoding

**Steps:**
1. Encode key: `cat firebase.json | jq -r '.private_key' | base64`
2. Add to Afrihost: `FIREBASE_PRIVATE_KEY_BASE64=[encoded value]`
3. Update app.js to decode Base64
4. Restart application
5. Test health endpoint

**Status:** Should resolve the npm export error ✨

---

**Document Version:** 1.0.0  
**Created:** December 16, 2025  
**Issue:** npm export error with Firebase private key  
**Solution:** Base64 encoding + app.js decoder
