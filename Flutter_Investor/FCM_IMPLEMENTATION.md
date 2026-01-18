# Firebase Cloud Messaging (FCM) Implementation

## Overview
This app now uses **Firebase Cloud Messaging (FCM)** for push notifications instead of SignalR for real-time communication. This provides a more reliable, scalable, and battery-efficient solution.

## Architecture

### Components
1. **FCM Service** (`lib/core/services/fcm_service.dart`)
   - Handles FCM token management
   - Processes foreground messages
   - Displays local notifications
   - Syncs token with backend

2. **Background Message Handler** (in `main.dart`)
   - Global top-level function for background message processing
   - Handles data payloads when app is terminated or in background

3. **Platform Configuration**
   - **Android**: `google-services.json` + AndroidManifest.xml
   - **iOS**: `GoogleService-Info.plist` + AppDelegate.swift

## Implementation Details

### 1. Token Management
On app launch, the FCM service:
- Requests notification permissions (iOS/Android)
- Retrieves the FCM device token
- Syncs token with backend via HTTP POST to `/api/users/fcm-token`
- Listens for token refresh events

```dart
// Token is automatically synced on app launch
await fcmService.initialize();

// Access current token
String? token = fcmService.currentToken;
```

### 2. Foreground Messages
When the app is in the foreground:
- `FirebaseMessaging.onMessage` receives the notification
- FCM service displays a local notification using `flutter_local_notifications`
- Message data is broadcast via `fcmService.onMessage` stream

```dart
// Listen to foreground messages
fcmService.onMessage.listen((message) {
  print('Message: ${message.notification?.title}');
  print('Data: ${message.data}');
});
```

### 3. Background Messages
When the app is in background or terminated:
- `_firebaseMessagingBackgroundHandler` is invoked
- Processes data payload (e.g., save to local DB)
- System automatically shows notification if payload includes notification field

```dart
@pragma('vm:entry-point')
Future<void> _firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  await Firebase.initializeApp();
  // Process data here
  print('Background message: ${message.messageId}');
}
```

### 4. Notification Taps
When user taps on a notification:
- `FirebaseMessaging.onMessageOpenedApp` handles app opened from background
- `getInitialMessage()` handles app opened from terminated state
- Both provide the RemoteMessage with data for navigation

## Platform Configuration

### Android
**File**: `android/app/google-services.json`
- ✅ Already present and configured for package `com.investa58438.flutterdarkapp`

**File**: `android/app/src/main/AndroidManifest.xml`
- ✅ POST_NOTIFICATIONS permission added
- ✅ Default notification channel configured
- ✅ Intent filter for notification taps

**Build**: `android/app/build.gradle.kts`
- ✅ `com.google.gms.google-services` plugin applied
- ✅ minSdk 26 (required for notification channels)

### iOS
**File**: `ios/Runner/GoogleService-Info.plist`
- ✅ Created with Firebase project credentials

**File**: `ios/Runner/AppDelegate.swift`
- ✅ Firebase initialized in `didFinishLaunchingWithOptions`
- ✅ Remote notifications registered
- ✅ Messaging delegate configured
- ✅ APNs token forwarded to FCM

**Capabilities**: (Manual setup required)
1. Open Xcode project: `ios/Runner.xcworkspace`
2. Select Runner target → Signing & Capabilities
3. Add "Push Notifications" capability
4. Add "Background Modes" → Enable "Remote notifications"

## Backend Integration

### 1. Token Registration Endpoint
Your backend should implement:

**POST** `/api/users/fcm-token`
```json
{
  "fcmToken": "device-fcm-token-here"
}
```
Headers: `Authorization: Bearer <jwt-token>`

Response: 200 OK or 204 No Content

### 2. Sending Notifications
Backend should send FCM notifications via Firebase Admin SDK:

```javascript
const admin = require('firebase-admin');

await admin.messaging().send({
  token: userFcmToken,
  notification: {
    title: 'New Message',
    body: 'Admin has replied to your request'
  },
  data: {
    conversationId: 'conv-123',
    messageId: 'msg-456',
    isFromAdmin: 'true',
    senderName: 'Admin John',
    message: 'How can I help you?'
  }
});
```

### 3. Message Data Structure
For support chat messages, include:
```json
{
  "conversationId": "string",
  "messageId": "string",
  "message": "string",
  "isFromAdmin": "true|false",
  "senderName": "string",
  "adminId": "string (optional)",
  "adminName": "string (optional)"
}
```

## Migration from SignalR

### What Changed
❌ **Removed**:
- `signalr_core` dependency
- `lib/services/signalr_service.dart`
- `lib/core/services/signalr_service.dart`
- Real-time WebSocket connection
- SignalR hub methods (RequestSupport, JoinConversation, etc.)

✅ **Added**:
- `firebase_messaging` dependency
- `lib/core/services/fcm_service.dart`
- Background message handler in `main.dart`
- Local notifications via `flutter_local_notifications`

### Updated Files
- `lib/main.dart` - FCM initialization
- `lib/controllers/chat_controller.dart` - Uses FCM instead of SignalR
- `pubspec.yaml` - Removed SignalR, kept Firebase
- `android/app/src/main/AndroidManifest.xml` - FCM configuration
- `ios/Runner/AppDelegate.swift` - FCM initialization
- `ios/Runner/GoogleService-Info.plist` - Created

### How It Works Now
1. **User opens app** → FCM token generated and synced with backend
2. **User sends message** → HTTP POST to backend API (not WebSocket)
3. **Admin replies** → Backend sends FCM notification with data payload
4. **App receives notification**:
   - **Foreground**: Local notification displayed + UI updated
   - **Background**: System notification shown + data processed
   - **Terminated**: System notification shown → tap opens app with data

## Testing

### Test FCM Token Retrieval
```dart
final token = await FirebaseMessaging.instance.getToken();
print('FCM Token: $token');
```

### Test Foreground Notification
Send a test message from Firebase Console:
1. Go to Firebase Console → Cloud Messaging
2. Select "Send test message"
3. Enter FCM token
4. Add notification title/body and data payload
5. Send

### Test Background Notification
1. Put app in background (press home button)
2. Send notification from Firebase Console
3. Check device notification tray

## Debugging

### Android Logs
```bash
flutter logs
# or
adb logcat | grep -E "FCM|firebase"
```

### iOS Logs
```bash
flutter logs
# or view Xcode console
```

### Common Issues

**No FCM token received**:
- Check `google-services.json` / `GoogleService-Info.plist` are present
- Verify package name matches Firebase project
- Check internet connection

**Notifications not showing in foreground**:
- Check notification channel is created (Android)
- Verify local notifications initialized

**Background notifications not working**:
- Ensure background handler is top-level function
- Check @pragma annotation is present
- Verify notification permissions granted

## Environment Variables
No environment variables needed for FCM (configuration is in google-services files).

Remove from `.env`:
```
# No longer needed
SIGNALR_HUB_URL=...
```

## Next Steps
1. ✅ Remove SignalR demo widget (`lib/widgets/signalr_demo.dart`)
2. ✅ Update backend to send FCM notifications instead of SignalR events
3. ✅ Implement HTTP API for sending chat messages
4. ✅ Add token management to user profile/auth flow
5. ✅ Test on physical devices (iOS + Android)

## References
- [Firebase Cloud Messaging Docs](https://firebase.google.com/docs/cloud-messaging)
- [FlutterFire Messaging](https://firebase.flutter.dev/docs/messaging/overview)
- [Flutter Local Notifications](https://pub.dev/packages/flutter_local_notifications)
