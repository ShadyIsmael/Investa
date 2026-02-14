# Investa Admin Portal - Configuration & Fixes

## Fixed Issues

### 1. ✅ Tailwind CSS CDN → PostCSS Setup
**Problem:** Tailwind was loading from CDN (`cdn.tailwindcss.com`), which is not recommended for production.

**Solution:** Installed Tailwind CSS as a dev dependency with PostCSS integration.

**Files Created/Modified:**
- ✅ `tailwind.config.js` - Tailwind configuration with theme extensions
- ✅ `postcss.config.js` - PostCSS configuration for Tailwind processing
- ✅ `src/globals.css` - Global CSS with Tailwind directives
- ✅ `src/main.tsx` - Added import for globals.css
- ✅ `package.json` - Added tailwindcss, postcss, autoprefixer dependencies
- ✅ `index.html` - Removed CDN loading script

**What Changed:**
```
Before: <script src="https://cdn.tailwindcss.com"></script>
After:  tailwindcss and postcss plugins process CSS at build time
```

**Next Step:** Install dependencies:
```bash
npm install
```

---

### 2. ✅ Firebase Configuration Missing
**Problem:** Firebase initialization failed with "Incomplete configuration - projectId/appId missing"

**Solution:** Added Firebase environment variables to `.env.development`

**Files Modified:**
- ✅ `.env.development` - Added placeholder Firebase credentials

**Variables Added:**
```env
VITE_FIREBASE_API_KEY=AIzaSyDummyKeyForDevelopment
VITE_FIREBASE_AUTH_DOMAIN=investa-dev.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=investa-dev
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456
VITE_FIREBASE_VAPID_KEY=BNDummyVapidKeyForDevelopment
```

**Next Steps:**
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your Investa project
3. Copy the credentials to `.env.development`:
   - **API Key** → `VITE_FIREBASE_API_KEY`
   - **Auth Domain** → `VITE_FIREBASE_AUTH_DOMAIN`
   - **Project ID** → `VITE_FIREBASE_PROJECT_ID`
   - **Messaging Sender ID** → `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - **App ID** → `VITE_FIREBASE_APP_ID`
4. Generate a Web Push certificate and add the **public VAPID key** → `VITE_FIREBASE_VAPID_KEY`
5. Update `public/firebase-messaging-sw.js` with the correct `messagingSenderId`

---

### 3. ⚠️ API Endpoint Issues (404/401 Errors)
**Problems:**
- `/api/admin/users/myprofile` → 404 Not Found
- `/api/v1/admin/clients/top` → 401 Unauthorized
- `/api/analytics/stats` → 404 Not Found
- `/api/support/tickets` → 404 Not Found
- `/api/moderation/reported` → 404 Not Found

**Root Causes:**
1. **Backend API server not running** - Verify the .NET backend is running on `localhost:5000`
2. **Missing/incorrect API paths** - Backend endpoints may have changed
3. **Missing authentication** - Some endpoints require valid auth token
4. **Vite proxy configuration** - May need adjustment if backend port changed

**Current Configuration:**
```typescript
// vite.config.ts proxies requests to:
const proxyTarget = env.VITE_API_BASE_URL?.replace(/\/api\/?$/, '') || 'http://desktop-dih7cqh:5235';
```

**What to Check:**
1. ✅ Backend API is running (`dotnet run` in Core-BackEnd folder)
2. ✅ Backend is listening on port 5000 or 5235 (check `appsettings.Development.json`)
3. ✅ Verify endpoint paths match between frontend and backend:
   - Expected: `/api/admin/users/myprofile`
   - Check backend has this endpoint
4. ✅ For 401 errors, ensure authentication token is being sent

**Debugging Steps:**
```bash
# 1. Verify backend is running
curl http://localhost:5000/api/health

# 2. Check if API responds without auth
curl http://localhost:5000/api/admin/users/myprofile

# 3. Check browser Network tab for actual request URL
# 4. Check browser Console for detailed error messages
```

---

## Configuration Summary

### Tailwind CSS Setup
✅ **PostCSS Pipeline**: `src/globals.css` → `postcss.config.js` → `tailwind.config.js`

### Firebase Setup (Pending Real Credentials)
⚠️ **Status**: Using placeholder values, requires Firebase project credentials

### Backend Integration
⚠️ **Status**: Ensure .NET backend is running and endpoints are accessible

---

## Running the Application

```bash
# Install dependencies (required for Tailwind)
npm install

# Start dev server (watches for CSS/JS changes)
npm run dev

# Build for production (Tailwind will be properly minified)
npm run build
```

---

## Console Warnings Reference

### Before Fix ❌
```
cdn.tailwindcss.com should not be used in production
[firebase] Incomplete configuration - Firebase services disabled
Failed to load resource: 404/401
```

### After Fix ✅
```
[Info] Hot module replacement enabled
[Info] API proxy configured: /api → http://localhost:5000
```

---

## Next Actions

### High Priority
1. **Install npm packages**: `npm install`
2. **Configure Firebase**: Add real credentials to `.env.development`
3. **Start backend**: Run .NET API server on port 5000
4. **Test endpoints**: Verify API responses in browser Network tab

### Medium Priority
1. Review backend endpoint implementations
2. Ensure authentication flow is working
3. Configure service worker for FCM notifications

### Low Priority
1. Remove other CDN dependencies if any
2. Optimize CSS bundle size for production
3. Set up environment-specific builds

---

## References
- [Tailwind CSS Installation Guide](https://tailwindcss.com/docs/installation)
- [Firebase Console](https://console.firebase.google.com)
- [Firebase Web Setup](https://firebase.google.com/docs/web/setup)
- [Vite Proxy Configuration](https://vitejs.dev/config/server-options.html#server-proxy)
