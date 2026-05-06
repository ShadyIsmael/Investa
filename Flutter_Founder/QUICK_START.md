# 🚀 Investa Clean Architecture - Quick Start Guide

## ⚡ Immediate Actions Required

### 1. Install New Dependencies
```bash
flutter pub get
```

This will install:
- `get_it` - Dependency Injection
- `dartz` - Functional programming (Either, Left, Right)
- `equatable` - Value equality for entities
- `logger` - Advanced logging
- `flutter_local_notifications` - Local notifications
- `flutter_screenutil` - Responsive UI scaling

---

### 2. Run the New Clean Architecture App
```bash
# Option 1: Run with the new clean architecture entry point
flutter run lib/main_clean.dart

# Option 2: Update your launch configuration in VS Code
# .vscode/launch.json:
{
  "configurations": [
    {
      "name": "Clean Architecture",
      "request": "launch",
      "type": "dart",
      "program": "lib/main_clean.dart"
    }
  ]
}
```

---

### 3. Configure Your Environment

Create/update `.env` file in the project root:
```env
# Default hostname for mDNS discovery
BASE_HOST_NAME=DESKTOP-DIH7CQH

# API Base URL (optional - defaults to https://scaling-memory-554v4q9wwg375p9-5000.app.github.dev)
API_BASE_URL=https://scaling-memory-554v4q9wwg375p9-5000.app.github.dev

# SignalR Hub URL (optional - auto-derived from base URL)
SIGNALR_HUB_URL=https://scaling-memory-554v4q9wwg375p9-5000.app.github.dev/hubs/chat
```

**For Physical Devices:**
The `.local` suffix enables mDNS (Multicast DNS) which allows devices on the same network to discover the server by hostname instead of IP address.

**If mDNS doesn't work:**
1. Use your machine name (e.g., `DESKTOP-DIH7CQH`) or its IP address.
2. Update `.env`:
   ```env
   API_BASE_URL=http://DESKTOP-DIH7CQH:5000
   SIGNALR_HUB_URL=http://DESKTOP-DIH7CQH:5000/hubs/chat
   ```

---

### 4. Test SignalR Connection

The app will automatically try to connect to SignalR when you navigate to the Support screen:

```dart
// Navigate to support request screen
Navigator.pushNamed(context, Routes.supportRequest);

// The provider automatically starts listening
// Check logs for connection status:
// [SignalR] Attempting to connect...
// [SignalR] Successfully connected to: http://...
```

---

### 5. Test Firebase Messaging

**Android Setup:**
1. Ensure `google-services.json` is in `android/app/`
2. Firebase is already configured in the app

**iOS Setup:**
1. Add `GoogleService-Info.plist` to `ios/Runner/`
2. Update `Info.plist` with notification permissions

**Test FCM Token:**
```dart
// After login, the app will automatically get FCM token
// Check logs:
// [FCM] Token: ey...
```

---

## 📱 Key Screens to Test

### 1. Support Request Screen (Responsive)
```dart
import 'package:flutter_founder/features/support/presentation/screens/support_request_screen.dart';

Navigator.push(
  context,
  MaterialPageRoute(
    builder: (_) => const SupportRequestScreen(),
  ),
);
```

**Features to verify:**
- ✅ Form scales properly on all screen sizes
- ✅ No overflow on small devices
- ✅ Keyboard doesn't hide input fields (ScrollView)
- ✅ Loading state during submission
- ✅ Error messages displayed in SnackBar
- ✅ Connection status indicator

---

### 2. Authentication Flow
```dart
// Use AuthProvider
final authProvider = Provider.of<AuthProvider>(context);

// Login
final success = await authProvider.login(
  phoneNumber: '0123456789',
  password: 'password123',
);

if (success) {
  // Navigate to home
} else {
  // Show error: authProvider.errorMessage
}
```

---

## 🔍 Debugging Tips

### Check Dependency Injection
```dart
// Anywhere in the app
final logger = sl<LoggerService>();
logger.info('[Test]', 'DI is working!');

final networkConfig = sl<NetworkConfig>();
print('Base URL: ${networkConfig.baseUrl}');
```

### Monitor SignalR Events
```dart
final signalRService = sl<SignalRService>();

// Listen to connection state changes
signalRService.onConnectionStateChanged.listen((state) {
  print('SignalR State: $state');
});

// Listen to support messages
signalRService.onSupportMessage.listen((message) {
  print('New message: ${message.message}');
});
```

### Check Logs
Look for these tags in your console:
- `[DI]` - Dependency injection
- `[SignalR]` - SignalR connection & events
- `[FCM]` - Firebase Messaging
- `[API]` - HTTP requests
- `[Auth]` - Authentication operations
- `[Support]` - Support feature

---

## 🐛 Common Issues & Solutions

### Issue 1: SignalR Connection Failed
**Symptom:** `[SignalR] Failed to connect to any SignalR hub candidate`

**Solutions:**
1. Check if backend server is running on `https://scaling-memory-554v4q9wwg375p9-5000.app.github.dev` (or locally `http://DESKTOP-DIH7CQH:5000`)
2. Test server accessibility:
   ```bash
   # From the device/emulator
   ping DESKTOP-DIH7CQH
   curl https://scaling-memory-554v4q9wwg375p9-5000.app.github.dev/hubs/chat
   ```
3. Use IP address instead of hostname in `.env`
4. Check firewall settings on the PC

---

### Issue 2: UI Overflow on Small Screens
**Symptom:** Yellow/black overflow indicators

**Solution:**
Ensure you're using the new responsive screen from `features/support/presentation/screens/`:
```dart
// ✅ Good - Uses responsive layout
import 'package:flutter_founder/features/support/presentation/screens/support_request_screen.dart';

// ❌ Old - Has hardcoded sizes
import 'package:flutter_founder/screens/support_request_screen.dart';
```

---

### Issue 3: Firebase Messaging Not Receiving Notifications
**Symptom:** No FCM token or notifications not appearing

**Solutions:**
1. Check Firebase initialization:
   ```dart
   // In main_clean.dart
   await Firebase.initializeApp();
   ```
2. Request notification permissions (iOS):
   ```dart
   final settings = await FirebaseMessaging.instance.requestPermission();
   print('Permission status: ${settings.authorizationStatus}');
   ```
3. Verify `google-services.json` is present and correct
4. Check Firebase Console for errors

---

### Issue 4: Dependency Not Found
**Symptom:** `GetIt: Object/factory with type X is not registered`

**Solution:**
Make sure you called `initializeDependencies()` in `main_clean.dart`:
```dart
Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await initializeDependencies(); // ← This must be called
  runApp(const InvestaApp());
}
```

---

## 📊 Verify Clean Architecture Implementation

### Test 1: Domain Layer Independence
The domain layer should have ZERO dependencies on Flutter or external packages:
```dart
// ✅ domain/entities/user.dart should only import:
import 'package:equatable/equatable.dart'; // OK - pure Dart

// ❌ Should NOT import:
import 'package:flutter/material.dart';     // NO!
import 'package:dio/dio.dart';              // NO!
```

### Test 2: Data Flow
```
User taps button
    ↓
Presentation (Provider)
    ↓
Domain (Use Case)
    ↓
Domain (Repository Interface)
    ↓
Data (Repository Implementation)
    ↓
Data (Remote Data Source)
    ↓
Core (Network Client / SignalR Service)
    ↓
Backend API / SignalR Hub
```

### Test 3: Error Handling
All errors should be wrapped in Failure classes:
```dart
try {
  final result = await useCase();
  result.fold(
    (failure) {
      // Always show user-friendly message
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(failure.message)),
      );
    },
    (success) {
      // Handle success
    },
  );
} catch (e) {
  // This should RARELY happen - all errors should be caught in repositories
  print('Unexpected error: $e');
}
```

---

## 🎯 Next Development Steps

1. **Migrate Existing Screens:**
   - Move `lib/screens/auth_screen.dart` → `lib/features/auth/presentation/screens/`
   - Refactor to use AuthProvider and Clean Architecture
   
2. **Add More Features:**
   - Dashboard (with charts)
   - Profile management
   - Investments listing
   
3. **Write Tests:**
   ```bash
   # Unit tests for use cases
   flutter test test/features/auth/domain/usecases/login_usecase_test.dart
   
   # Widget tests for screens
   flutter test test/features/support/presentation/screens/support_request_screen_test.dart
   ```

4. **Performance Optimization:**
   - Add caching layer (Hive or Shared Preferences)
   - Implement pagination for large lists
   - Add image caching (cached_network_image)

---

## 📚 Resources

- **Clean Architecture:** Read [CLEAN_ARCHITECTURE_README.md](CLEAN_ARCHITECTURE_README.md)
- **Folder Structure:** Check [ARCHITECTURE_DIAGRAM.txt](ARCHITECTURE_DIAGRAM.txt)
- **SignalR Docs:** https://docs.microsoft.com/en-us/aspnet/core/signalr/
- **GetIt Docs:** https://pub.dev/packages/get_it
- **Dartz Docs:** https://pub.dev/packages/dartz

---

## ✅ Checklist Before Deployment

- [ ] All screens are responsive (no hardcoded sizes)
- [ ] SignalR connects successfully to backend
- [ ] Firebase notifications work in foreground/background
- [ ] Error messages are user-friendly
- [ ] Loading states are implemented
- [ ] Forms have validation
- [ ] SafeArea is used on all root screens
- [ ] Logs are properly tagged
- [ ] .env file is configured
- [ ] Dependencies are initialized in main.dart

---

**Need help? Check the logs with the appropriate tags: `[SignalR]`, `[FCM]`, `[API]`, `[Auth]`, `[Support]`**
