# Firebase Cloud Messaging (FCM) — Real-time Push Notifications

## ✅ Implementation Complete

This project uses **Firebase Cloud Messaging (FCM)** for real-time push notifications without WebSockets/SignalR.

### Architecture

- **Foreground Notifications**: `onMessage()` listener + React Toastify
- **Background Notifications**: Service Worker (`firebase-messaging-sw.js`)
- **Token Management**: Automatic token retrieval and server sync
- **Strict Payload Parsing**: Handles both `notification` and `data` message formats

---

## 🔧 Setup Instructions

### 1. Firebase Console Setup

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable **Cloud Messaging** in your project
3. Navigate to **Project Settings → Cloud Messaging**
4. Generate a **Web Push certificate (VAPID key pair)**
5. Copy the **public VAPID key**

### 2. Environment Configuration

Copy `.env.firebase.example` to `.env` and fill in your Firebase credentials:

```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
VITE_FIREBASE_VAPID_KEY=BN7x... (public VAPID key)
```

### 3. Service Worker Configuration

Edit `public/firebase-messaging-sw.js` and replace the placeholder:

```javascript
firebase.initializeApp({
  messagingSenderId: '123456789' // ← Your actual sender ID
});
```

### 4. Backend API Endpoint

Implement the FCM token storage endpoint on your backend:

**POST** `/api/admin/users/fcm-token`

**Request Body:**
```json
{
  "token": "dXJZk3... (FCM registration token)"
}
```

**Response:** `200 OK`

Store this token in your database per user. Use Firebase Admin SDK to send messages:

```javascript
// Server-side (Node.js example)
const admin = require('firebase-admin');
admin.initializeApp({
  credential: admin.credential.cert(require('./serviceAccountKey.json'))
});

const message = {
  notification: {
    title: 'New Support Request',
    body: 'You have a new chat request'
  },
  token: userFcmToken
};

admin.messaging().send(message)
  .then(response => console.log('Sent:', response))
  .catch(error => console.error('Error:', error));
```

---

## 📱 Usage

### User Flow

1. When authenticated, user sees **"🔔 Enable notifications"** button (top-right)
2. Click → Browser prompts for notification permission
3. On **Allow**: FCM token is generated and sent to backend
4. Server can now send push notifications to this user

### Foreground Notifications

When the user has the dashboard **open and active**:
- Messages are intercepted by `onMessage()` listener
- Displayed as React Toastify alerts (custom styled)
- Payload parsed with strict title/body extraction

### Background Notifications

When the dashboard **tab is closed or inactive**:
- Service worker handles messages via `onBackgroundMessage()`
- Browser shows native notification (OS-level)
- Clicking notification focuses the tab

---

## 🧪 Testing

### Test from Firebase Console

1. Go to **Cloud Messaging → Send test message**
2. Enter your FCM token (check browser console logs)
3. Add notification title and body
4. Send

### Test from Server (Node.js)

```javascript
const admin = require('firebase-admin');
admin.initializeApp({
  credential: admin.credential.cert('./serviceAccountKey.json')
});

const payload = {
  notification: {
    title: 'Test Notification',
    body: 'This is a test from the server'
  },
  token: 'user_fcm_token_here'
};

admin.messaging().send(payload)
  .then(res => console.log('Success:', res))
  .catch(err => console.error('Failed:', err));
```

---

## 📦 Message Payload Formats

### Standard Notification Message

```json
{
  "notification": {
    "title": "New Message",
    "body": "You have a new support request"
  },
  "token": "..."
}
```

### Data-Only Message

```json
{
  "data": {
    "title": "System Alert",
    "body": "Backend maintenance in 10 minutes",
    "customField": "value"
  },
  "token": "..."
}
```

Both formats are supported. The implementation strictly parses `notification` first, then falls back to `data`.

---

## 🔐 Security Notes

- **Never** embed server keys or service account credentials in client code
- VAPID key (public) is safe to include in frontend
- Use Firebase Admin SDK **only on the server** to send messages
- Token storage should be per-user and protected by authentication
- Implement token refresh/deletion on logout

---

## 🚨 Troubleshooting

### "Notifications not working"
1. Check browser console for errors
2. Verify `.env` variables are loaded (restart dev server after changes)
3. Ensure service worker is registered (check DevTools → Application → Service Workers)
4. Test notification permission: `Notification.permission` should be `"granted"`

### "Token not sent to server"
- Check network tab for `/api/admin/users/fcm-token` request
- Verify backend endpoint is implemented and returns 200 OK
- Check browser console for FCM service logs

### "Background messages not showing"
- Verify `firebase-messaging-sw.js` has correct `messagingSenderId`
- Clear service worker cache (DevTools → Application → Service Workers → Unregister)
- Hard reload page (Ctrl+Shift+R)
- Check browser notification settings (OS level)

---

## 📚 Files Added

| File | Purpose |
|------|---------|
| `src/firebase.ts` | Firebase app initialization |
| `src/services/fcmService.ts` | FCM token management + listeners |
| `src/components/common/Notifications.tsx` | UI component for enabling notifications |
| `public/firebase-messaging-sw.js` | Service worker for background messages |
| `.env.firebase.example` | Environment variable template |

---

## 🔄 Migration from SignalR

SignalR has been **completely removed**:
- ❌ Removed `@microsoft/signalr` package
- ❌ Removed `SignalRProvider` and `SupportProvider`
- ✅ Replaced with Firebase Cloud Messaging
- ✅ No WebSocket connections (uses FCM push protocol)

---

## 🚀 Next Steps

1. Deploy backend endpoint for token storage
2. Integrate Firebase Admin SDK on server
3. Test with real push notifications from backend
4. (Optional) Add notification click handlers to navigate to specific pages
5. (Optional) Implement topic subscriptions for broadcast messages

---

**Questions?** Check Firebase docs: https://firebase.google.com/docs/cloud-messaging/js/client
