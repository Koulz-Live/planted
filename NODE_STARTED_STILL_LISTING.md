# ✅ Node.js Started But Still Shows Directory Listing

**Status**: Node.js app started successfully  
**Issue**: Still seeing "Index of /" instead of React app  
**Solution**: Verify configuration + wait for proxy

---

## DIAGNOSTIC STEPS

### Step 1: Verify App is Actually Running (15 sec)

Go to **Node.js Selector** and check:

1. Does it show **"STOP APP"** button (not "START APP")?
   - ✅ Yes → App is running
   - ❌ No → App crashed, click START APP again

2. Look for any **error messages** in red
   - If errors visible → Screenshot and send to me

### Step 2: Test API Endpoint Directly (15 sec)

Open this URL in your browser:
```
https://planted.africa/api/health
```

**Expected results:**

✅ **If you see JSON**:
```json
{"ok":true,"version":"1.0.0-minimal","message":"Frontend server running..."}
```
→ **Node.js IS working!** Problem is with root path routing.

❌ **If you see "Index of /" or 404**:
→ Node.js not receiving requests. CloudLinux proxy issue.

### Step 3: Check Application Root Setting (15 sec)

In **Node.js Selector**, verify:

**Application root** field shows:
- ✅ `home/plantzia/public_html` (NO leading slash!)
- ❌ `/home/plantzia/public_html` (has slash - wrong!)

If it has a leading slash:
1. Remove the `/` at the beginning
2. Click "SAVE"
3. Click "RESTART"

### Step 4: Wait for CloudLinux Proxy (1-2 min)

After **first start**, CloudLinux takes 1-2 minutes to:
- Configure Apache proxy rules
- Route traffic to Node.js

**What to do:**
1. Wait 2 minutes
2. **Hard refresh** browser (Cmd+Shift+R)
3. Test `https://planted.africa/` again

---

## If `/api/health` Returns JSON (Node.js Working!)

Then the issue is just root path routing. Try this:

1. Go to `https://planted.africa/index.html` directly
   - Does it load React app?
   - ✅ Yes → Routing issue, root path not proxying
   - ❌ No → Dist folder issue

2. Check `dist/` folder in File Manager:
   - Click into `dist/` folder
   - Verify `index.html` exists (1KB file)
   - If missing → Need to re-upload dist folder

---

## Common Issues After Starting

### Issue 1: App Starts Then Immediately Stops

**Symptoms**: Click START APP → button briefly changes → goes back to START APP

**Causes**:
- Missing dependencies (`npm install` not run)
- App.js has runtime error
- Port 3000 already in use

**Fix**:
1. Click "Run NPM Install" button
2. Wait 3-5 minutes
3. Then click "START APP"

### Issue 2: CloudLinux Proxy Not Working

**Symptoms**: 
- Node.js running (STOP APP button shows)
- `/api/health` returns directory listing (not JSON)
- Root page shows directory listing

**Fixes**:

**A. Check Application URL:**
- In Node.js Selector, "Application URL" = `planted.africa`
- NOT `www.planted.africa`
- NOT `https://planted.africa` (no protocol!)

**B. Restart Apache (if available):**
- Look for "Restart Apache" or similar in cPanel
- Click it
- Wait 30 seconds
- Test site

**C. Contact Afrihost:**
- If proxy still not working after 5 minutes
- Tell them: "Node.js app running but Apache not proxying to port 3000"

### Issue 3: Wrong File Being Executed

**Symptoms**: Strange errors or unexpected behavior

**Fix**: Verify in File Manager:
- File named `app.js` exists (5KB)
- NOT `app-no-firebase.js`
- If wrong name → Rename it

---

## Testing Checklist

Test these URLs in order:

1. **https://planted.africa/api/health**
   - ✅ JSON response → Node.js working
   - ❌ Directory listing → Proxy not working

2. **https://planted.africa/dist/index.html**
   - ✅ Loads React app → Files present
   - ❌ 404 or directory → Dist folder issue

3. **https://planted.africa/**
   - ✅ React app → Everything working! 🎉
   - ❌ Directory listing → Root path not proxying

---

## Quick Commands to Test (in Node.js Selector)

If there's a terminal or command interface:

```bash
# Check if app.js exists
ls -la /home/plantzia/public_html/app.js

# Check if Node process is running
ps aux | grep node

# Check what's listening on port 3000
netstat -tulpn | grep 3000
```

---

## Expected vs Actual

### What Should Happen:
```
Browser → https://planted.africa/
         ↓
Apache (port 80/443)
         ↓
CloudLinux Proxy (auto-configured)
         ↓
Node.js app.js (port 3000)
         ↓
Express serves dist/index.html
         ↓
React app loads! ✅
```

### What's Happening Now:
```
Browser → https://planted.africa/
         ↓
Apache (port 80/443)
         ↓
❌ Proxy not working / not configured
         ↓
Apache shows directory listing
```

---

## IMMEDIATE ACTIONS

**RIGHT NOW**:

1. **Test API endpoint**: `https://planted.africa/api/health`
   - Tell me what you see (JSON or directory?)

2. **Check Node.js Selector**:
   - Button says "STOP APP" or "START APP"?
   - Any error messages visible?
   - What does "Application root" field say?

3. **Wait 2 minutes** then hard refresh (Cmd+Shift+R)

4. **Screenshot Node.js Selector page** and send to me

---

## If `/api/health` Shows JSON

Then Node.js IS working! Just need to fix root path.

**Quick fix**:
1. In Node.js Selector, look for "Application URL" field
2. Verify it's exactly: `planted.africa` (no www, no https://)
3. Click "SAVE"
4. Click "RESTART"
5. Wait 1 minute
6. Test root: `https://planted.africa/`

---

**Tell me what `/api/health` returns and I'll guide you to the final fix!** 🚀
