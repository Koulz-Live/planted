# Your Firebase Configuration for Vercel

## ✅ Firebase Config Retrieved!

You have your Firebase configuration. Now add these **exact values** to Vercel:

---

## 🔑 Add These Environment Variables in Vercel

Go to: **https://vercel.com/[your-account]/planted/settings/environment-variables**

Click **"Add"** and enter each of these:

### Variable 1
- **Key**: `VITE_FIREBASE_API_KEY`
- **Value**: `AIzaSyA8946encVrDm5iDdbuaBkyAGypdMlWLFY`
- **Environments**: ✅ Production ✅ Preview ✅ Development

### Variable 2
- **Key**: `VITE_FIREBASE_AUTH_DOMAIN`
- **Value**: `planted-dea3b.firebaseapp.com`
- **Environments**: ✅ Production ✅ Preview ✅ Development

### Variable 3
- **Key**: `VITE_FIREBASE_PROJECT_ID`
- **Value**: `planted-dea3b`
- **Environments**: ✅ Production ✅ Preview ✅ Development

### Variable 4
- **Key**: `VITE_FIREBASE_STORAGE_BUCKET`
- **Value**: `planted-dea3b.firebasestorage.app`
- **Environments**: ✅ Production ✅ Preview ✅ Development

### Variable 5
- **Key**: `VITE_FIREBASE_MESSAGING_SENDER_ID`
- **Value**: `427558637972`
- **Environments**: ✅ Production ✅ Preview ✅ Development

### Variable 6
- **Key**: `VITE_FIREBASE_APP_ID`
- **Value**: `1:427558637972:web:e4bee00300194c0d45bf81`
- **Environments**: ✅ Production ✅ Preview ✅ Development

### Variable 7
- **Key**: `VITE_FIREBASE_MEASUREMENT_ID`
- **Value**: `G-C7QX1BXLR2`
- **Environments**: ✅ Production ✅ Preview ✅ Development

---

## 🔄 After Adding All Variables

1. **Save** all 7 variables
2. Go to **Deployments** tab
3. Click **⋯** (three dots) on the latest deployment
4. Click **"Redeploy"**
5. Wait ~2 minutes

---

## ✅ Verify It Works

After redeployment:

1. Open: **https://planted-ashy.vercel.app/**
2. Press **F12** → **Console** tab
3. Look for:
   ```
   ✅ Firebase initialized successfully
   ```

Instead of:
   ```
   ⚠️ Firebase not configured
   ```

---

## 🎯 What This Enables

- ✅ Save favorite recipes
- ✅ Save plant care plans
- ✅ User profiles
- ✅ Community posts
- ✅ Learning progress tracking
- ✅ Personalized content

---

## 📝 Quick Copy-Paste Format

If Vercel allows bulk import, use this format:

```bash
VITE_FIREBASE_API_KEY=AIzaSyA8946encVrDm5iDdbuaBkyAGypdMlWLFY
VITE_FIREBASE_AUTH_DOMAIN=planted-dea3b.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=planted-dea3b
VITE_FIREBASE_STORAGE_BUCKET=planted-dea3b.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=427558637972
VITE_FIREBASE_APP_ID=1:427558637972:web:e4bee00300194c0d45bf81
VITE_FIREBASE_MEASUREMENT_ID=G-C7QX1BXLR2
```

---

## ⚠️ Important Notes

- ✅ **All keys MUST start with `VITE_`** (Vite requirement for client-side vars)
- ✅ **Select all 3 environments** for each variable
- ✅ **Copy values exactly** as shown above
- ✅ **Redeploy required** after adding variables

---

## 🐛 Troubleshooting

**"Variables not working after redeploy"**
- Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
- Check console for specific error
- Verify all 7 variables added
- Verify all have `VITE_` prefix

**"Still see Firebase not configured"**
- Wait 2-3 minutes for full deployment
- Clear browser cache
- Check Vercel deployment logs for errors

---

**Ready to add!** Follow the steps above to enable Firebase! 🚀
