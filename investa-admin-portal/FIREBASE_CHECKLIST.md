# Firebase Cloud Messaging — Integration Checklist

## ✅ Completed Tasks

### 1. Dependencies & Cleanup
- [x] Removed `@microsoft/signalr` package
- [x] Added `firebase` package (v10.14.0)
- [x] Removed SignalR providers from `main.tsx`
- [x] Installed dependencies with `npm install --legacy-peer-deps`

### 2. Core Implementation
- [x] Created `src/firebase.ts` - Firebase initialization
- [x] Created `src/services/fcmService.ts` - Token management & listeners
- [x] Created `src/components/common/Notifications.tsx` - UI component
- [x] Created `public/firebase-messaging-sw.js` - Service worker for background messages
- [x] Mounted `<Notifications />` component in `App.tsx`
- [x] Registered service worker in `main.tsx`

### 3. Documentation
- [x] Created `docs/NOTIFICATIONS.md` - Complete setup guide
- [x] Created `.env.firebase.example` - Environment template
- [x] Created `server-test/sendTestNotification.js` - Server-side test script
- [x] Created `server-test/README.md` - Server testing guide
- [x] Updated `.gitignore` - Protect service account keys

### 4. Features
- [x] Strict payload parsing (handles `notification` and `data` formats)
- [x] Foreground notifications via `onMessage()` + React Toastify
- [x] Background notifications via service worker
- [x] Automatic token retrieval and server sync
- [x] User-friendly enable/disable UI
- [x] Browser permission handling
- [x] Console logging for debugging

---

## 🔧 Next Steps (Required)

### Firebase Console Setup
1. [ ] Create Firebase project
2. [ ] Enable Cloud Messaging
3. [ ] Generate Web Push certificate (VAPID key)
4. [ ] Copy all credentials to `.env`:
   - VITE_FIREBASE_API_KEY
   - VITE_FIREBASE_AUTH_DOMAIN
   - VITE_FIREBASE_PROJECT_ID
   - VITE_FIREBASE_MESSAGING_SENDER_ID
   - VITE_FIREBASE_APP_ID
   - VITE_FIREBASE_VAPID_KEY

### Service Worker Configuration
5. [ ] Edit `public/firebase-messaging-sw.js`
6. [ ] Replace `REPLACE_WITH_MESSAGING_SENDER_ID` with actual sender ID

### Backend Integration
7. [ ] Implement `POST /api/admin/users/fcm-token` endpoint
8. [ ] Store FCM tokens in database (per user)
9. [ ] Install Firebase Admin SDK on server (`npm install firebase-admin`)
10. [ ] Download service account key from Firebase Console
11. [ ] Implement push notification sending logic

---

## 🧪 Testing Workflow

### Client-Side Test
```bash
# 1. Start dev server
npm run dev

# 2. Login to dashboard
# 3. Click "🔔 Enable notifications"
# 4. Accept browser permission
# 5. Check console for: "[FCM] Token obtained: ..."
# 6. Copy the token
```

### Server-Side Test
```bash
# 1. Setup test environment
cd server-test
npm install firebase-admin

# 2. Add service account key (from Firebase Console)
# Save as: serviceAccountKey.json

# 3. Update sendTestNotification.js with your FCM token

# 4. Run test
node sendTestNotification.js
```

### Verify
- [ ] Foreground notification appears as toast (dashboard open)
- [ ] Background notification appears as OS notification (dashboard closed/tab inactive)
- [ ] Click notification focuses the tab
- [ ] Token is sent to backend endpoint
- [ ] Console logs show no errors

---

## 📦 File Structure

```
investa-admin-portal/
├── src/
│   ├── firebase.ts                    # Firebase initialization
│   ├── services/
│   │   └── fcmService.ts              # FCM token & listeners
│   └── components/common/
│       └── Notifications.tsx          # UI component
├── public/
│   └── firebase-messaging-sw.js       # Service worker
├── server-test/
│   ├── sendTestNotification.js        # Test script
│   └── README.md                      # Server test guide
├── docs/
│   └── NOTIFICATIONS.md               # Setup documentation
├── .env.firebase.example              # Environment template
└── .gitignore                         # Protect secrets
```

---

## 🔐 Security Checklist

- [ ] `.env` file is in `.gitignore`
- [ ] Service account key is in `.gitignore`
- [ ] VAPID key (public) is used in client, not server keys
- [ ] Firebase Admin SDK only used on server
- [ ] Token storage requires authentication
- [ ] Implement token cleanup on user logout/delete

---

## 🚀 Production Deployment

### Client
- [ ] Build: `npm run build`
- [ ] Ensure `firebase-messaging-sw.js` is in `dist/`
- [ ] Verify environment variables are set on hosting platform

### Server
- [ ] Use environment variables for Firebase credentials
- [ ] Never commit service account keys
- [ ] Implement rate limiting for push notifications
- [ ] Add retry logic for failed sends
- [ ] Log notification delivery status

---

## 📞 Support

- **Firebase Docs**: https://firebase.google.com/docs/cloud-messaging
- **FCM Admin SDK**: https://firebase.google.com/docs/cloud-messaging/admin
- **Troubleshooting**: See `docs/NOTIFICATIONS.md`

---

**Status**: ✅ Implementation complete, ready for Firebase credentials and backend integration
