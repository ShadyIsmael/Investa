# Server-Side Testing for Firebase Cloud Messaging

This folder contains server-side scripts for testing push notifications using Firebase Admin SDK.

## Setup

### 1. Install Dependencies

```bash
cd server-test
npm init -y
npm install firebase-admin
```

### 2. Get Service Account Key

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Go to **Project Settings → Service Accounts**
4. Click **Generate new private key**
5. Save the JSON file as `serviceAccountKey.json` in this folder

⚠️ **Never commit this file to version control!** Add to `.gitignore`:
```
server-test/serviceAccountKey.json
```

### 3. Get User FCM Token

1. Start the dev server: `npm run dev`
2. Login to the dashboard
3. Click **"🔔 Enable notifications"** and allow permission
4. Open browser console
5. Look for log: `[FCM] Token obtained: dXJZk3...`
6. Copy the full token

### 4. Update Test Script

Edit `sendTestNotification.js`:

```javascript
const USER_FCM_TOKEN = 'paste_your_fcm_token_here';
```

## Run Test

```bash
node sendTestNotification.js
```

Expected output:
```
📤 Sending test notification...

✅ Notification message sent successfully!
Response ID: projects/your-project/messages/0:1234567890

✅ Data message sent successfully!
Response ID: projects/your-project/messages/0:1234567891

🎉 All test messages sent!
```

## What Gets Tested

1. **Notification Message** - Standard FCM notification with title/body
2. **Data Message** - Data-only payload (no automatic notification)

Both message types are parsed correctly by the client implementation.

## Troubleshooting

### "Error: Could not load default credentials"
- Ensure `serviceAccountKey.json` exists in this folder
- Verify the file is valid JSON

### "Error: Registration token is not a valid FCM token"
- Token format is incorrect
- Token might be expired (re-enable notifications in browser)
- Copy the full token including all characters

### "Error: Requested entity was not found"
- Project ID in service account doesn't match Firebase project
- Re-download service account key from correct project

## Security Notes

- Service account keys have **full admin access** to your Firebase project
- Never commit `serviceAccountKey.json` to git
- Never expose service account keys in client-side code
- Rotate keys periodically for production environments
- Use environment variables in production, not JSON files

## Production Usage

For production backends, use environment variables:

```javascript
admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
  })
});
```
