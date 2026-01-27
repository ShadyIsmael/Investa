# Quick Start - Next Steps

## Immediate Actions (5 minutes)

```bash
# 1. Install dependencies (includes Tailwind CSS)
npm install

# 2. Start development server
npm run dev
```

Visit: http://localhost:5173

---

## Firebase Setup (10 minutes)

1. Go to https://console.firebase.google.com
2. Select your Investa project
3. Copy credentials from **Project Settings**
4. Edit `.env.development`:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_FIREBASE_VAPID_KEY=your_vapid_key
   ```
5. Update `public/firebase-messaging-sw.js` with your sender ID

---

## Backend Setup (depends on backend)

1. Open `Core-BackEnd/` folder
2. Run: `dotnet run` or check the project README
3. Backend should start on http://localhost:5000

---

## Verify Everything Works

**Browser Console** should show:
- ✅ No "Tailwind CDN" warnings
- ✅ No "Incomplete Firebase configuration" warnings
- ✅ Successful API requests (Network tab shows 200 responses)

**If you see errors:**
- Check Network tab for actual request URLs
- Verify backend is running: `curl http://localhost:5000/api/health`
- Check `.env.development` file for API_BASE_URL

---

## What Was Fixed

| Issue | Solution | File(s) |
|-------|----------|---------|
| Tailwind CDN warning | Installed PostCSS pipeline | tailwind.config.js, postcss.config.js, globals.css |
| Firebase missing config | Added env variables | .env.development |
| API 404/401 errors | Verified proxy config (backend issue) | vite.config.ts ✓ |

---

## Important Files

- **Tailwind Config:** `tailwind.config.js`
- **Environment Variables:** `.env.development`
- **Global Styles:** `src/globals.css`
- **Frontend Docs:** [SETUP_FIXES.md](./SETUP_FIXES.md), [CHANGES_SUMMARY.md](./CHANGES_SUMMARY.md)

---

**Ready to go!** 🚀
