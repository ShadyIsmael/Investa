# Investa Mobile App - Clean Architecture Refactoring

## 🏗️ Architecture Overview

This app follows **Clean Architecture** principles with strict separation of concerns across three layers:

### **1. Domain Layer** (Business Logic)
- **Entities**: Pure Dart classes representing core business models
- **Repositories**: Abstract interfaces defining data operations
- **Use Cases**: Single-purpose business operations

### **2. Data Layer** (Data Management)
- **DTOs (Data Transfer Objects)**: JSON serialization models
- **Data Sources**: Remote API and SignalR communication
- **Repository Implementations**: Concrete implementations of domain contracts

### **3. Presentation Layer** (UI)
- **Providers**: State management using Provider/ChangeNotifier
- **Screens**: UI components (widgets)
- **Widgets**: Reusable UI components

---

## 📁 New Folder Structure

```
lib/
├── core/                           # Core infrastructure
│   ├── di/
│   │   └── injection_container.dart   # Dependency injection setup
│   ├── error/
│   │   └── failures.dart              # Error handling classes
│   ├── network/
│   │   ├── network_client.dart        # Dio HTTP client
│   │   └── network_config.dart        # Network configuration
│   └── services/
│       ├── logger_service.dart        # Centralized logging
│       ├── secure_storage_service.dart
│       ├── signalr_service.dart       # SignalR hub connection
│       └── firebase_messaging_service.dart
│
├── features/                       # Feature-based modules
│   ├── auth/
│   │   ├── data/
│   │   │   ├── datasources/
│   │   │   │   └── auth_remote_datasource.dart
│   │   │   ├── models/
│   │   │   │   └── user_dto.dart
│   │   │   └── repositories/
│   │   │       └── auth_repository_impl.dart
│   │   ├── domain/
│   │   │   ├── entities/
│   │   │   │   └── user.dart
│   │   │   ├── repositories/
│   │   │   │   └── auth_repository.dart
│   │   │   └── usecases/
│   │   │       ├── login_usecase.dart
│   │   │       ├── signup_usecase.dart
│   │   │       └── logout_usecase.dart
│   │   └── presentation/
│   │       ├── providers/
│   │       │   └── auth_provider.dart
│   │       ├── screens/
│   │       └── widgets/
│   │
│   └── support/
│       ├── data/
│       │   ├── datasources/
│       │   │   └── support_remote_datasource.dart
│       │   └── repositories/
│       │       └── support_repository_impl.dart
│       ├── domain/
│       │   ├── entities/
│       │   │   └── support_message.dart
│       │   ├── repositories/
│       │   │   └── support_repository.dart
│       │   └── usecases/
│       │       ├── send_support_request_usecase.dart
│       │       └── listen_to_support_messages_usecase.dart
│       └── presentation/
│           ├── providers/
│           │   └── support_provider.dart
│           ├── screens/
│           │   └── support_request_screen.dart
│           └── widgets/
│
├── config/                         # App configuration
│   ├── app_config.dart
│   ├── routes.dart
│   └── theme.dart
│
└── main_clean.dart                 # New clean entry point
```

---

## 🔧 Key Components

### **NetworkConfig**
```dart
// Default Base URL: https://scaling-memory-554v4q9wwg375p9-5000.app.github.dev
// SignalR Hub: https://scaling-memory-554v4q9wwg375p9-5000.app.github.dev/hubs/chat

final networkConfig = NetworkConfig();
print(networkConfig.baseUrl);        // Uses mDNS by default
print(networkConfig.signalRHubUrl);  // Auto-derived from base URL

// Override if needed
networkConfig.setCustomBaseUrl('http://192.168.1.100:5000');
```

**Features:**
- mDNS support with `.local` suffix for physical devices
- Automatic fallback to alternative URLs
- Environment variable support via `.env`

---

### **SignalRService**
```dart
// Located at: lib/core/services/signalr_service.dart

final signalRService = sl<SignalRService>();

// Connect to hub
await signalRService.connect();

// Send support request
final request = SupportRequestDto(
  userMobile: '0123456789',
  message: 'Need help with investment',
  type: 'Request',
);
await signalRService.sendSupportRequest(request);

// Listen to messages
signalRService.onSupportMessage.listen((message) {
  print('New message: ${message.message}');
});
```

**Backend Integration:**
- **Hub URL**: `/hubs/chat`
- **Method (Send)**: `RequestSupport(SupportRequestDto)`
- **Event (Listen)**: `ReceiveSupportRequest`
- **DTOs**: All use camelCase to match backend JSON policy

---

### **Firebase Messaging Service**
```dart
// Located at: lib/core/services/firebase_messaging_service.dart

final fcmService = sl<FirebaseMessagingService>();

// Initialize (called in main.dart)
await fcmService.initialize();

// Get FCM token
final token = await fcmService.getToken();

// Send token to backend
await authRepository.sendFcmToken(token);

// Listen to foreground messages
fcmService.onMessage.listen((message) {
  print('Foreground message: ${message.notification?.title}');
});
```

**Features:**
- Foreground message handling with local notifications
- Background/terminated state handling
- Notification tap navigation
- **Deduplication**: Avoids showing duplicate notifications when SignalR and FCM send the same message

---

### **Dependency Injection**
```dart
// Located at: lib/core/di/injection_container.dart

// Initialize in main.dart
await initializeDependencies();

// Access anywhere
final authProvider = sl<AuthProvider>();
final supportProvider = sl<SupportProvider>();
final logger = sl<LoggerService>();
```

**Registered Services:**
- Logger, Secure Storage, Network Client
- SignalR Service, Firebase Messaging
- All Repositories, Use Cases, and Providers

---

## 🎨 Responsive UI Guidelines

### **No Hardcoded Sizes!**
```dart
// ❌ BAD
Container(width: 300, height: 200, ...)

// ✅ GOOD
Container(
  width: MediaQuery.of(context).size.width * 0.8,
  height: MediaQuery.of(context).size.height * 0.25,
  ...
)
```

### **Use Flex Widgets**
```dart
Column(
  children: [
    Expanded(flex: 2, child: Header()),
    Expanded(flex: 5, child: Content()),
    Expanded(flex: 1, child: Footer()),
  ],
)
```

### **Scrollable Forms**
```dart
Scaffold(
  body: SafeArea(
    child: SingleChildScrollView(
      padding: EdgeInsets.all(16),
      child: Form(...),
    ),
  ),
)
```

### **ScreenUtil for Scaling**
```dart
// Configured in main_clean.dart
Text(
  'Hello',
  style: TextStyle(fontSize: 16.sp), // Scales based on screen density
)

SizedBox(height: 20.h, width: 100.w) // Responsive spacing
```

---

## 🚀 Getting Started

### **1. Install Dependencies**
```bash
flutter pub get
```

### **2. Set Up Environment**
Create a `.env` file:
```env
BASE_HOST_NAME=DESKTOP-DIH7CQH
API_BASE_URL=https://scaling-memory-554v4q9wwg375p9-5000.app.github.dev
SIGNALR_HUB_URL=https://scaling-memory-554v4q9wwg375p9-5000.app.github.dev/hubs/chat
```

### **3. Run the App**
```bash
# Use the new clean architecture entry point
flutter run lib/main_clean.dart
```

---

## 🔥 Error Handling

### **Failure Classes**
All errors are treated as data (functional programming style):

```dart
// Network failures
NetworkFailure('No internet connection')

// Server failures
ServerFailure('Invalid credentials', 401)

// SignalR failures
SignalRFailure('Failed to connect to hub')

// Validation failures
ValidationFailure('Phone number is required')
```

### **Usage in Providers**
```dart
final result = await loginUseCase(
  phoneNumber: phone,
  password: password,
);

result.fold(
  (failure) {
    // Handle error
    showSnackBar(failure.message);
  },
  (user) {
    // Handle success
    navigateToHome();
  },
);
```

---

## 📡 SignalR Integration Details

### **Backend Alignment**
- **Hub Path**: `/hubs/chat`
- **Connection**: WebSockets with automatic reconnection
- **Authentication**: Bearer token via `Authorization` header

### **Methods & Events**
| Direction | Name | Payload |
|-----------|------|---------|
| Send → | `RequestSupport` | `SupportRequestDto` |
| ← Receive | `ReceiveSupportRequest` | `SupportMessageDto` |
| ← Receive | `AdminJoined` | `AdminJoinedDto` |
| ← Receive | `UserTyping` | `UserTypingDto` |

### **DTO Structure (camelCase)**
```dart
{
  "userMobile": "0123456789",
  "message": "I need help",
  "type": "Request",
  "conversationId": "abc123" // Optional
}
```

---

## 🧪 Testing Strategy

### **Unit Tests**
- Test use cases in isolation
- Mock repositories using `mockito`

### **Widget Tests**
- Test UI components
- Mock providers

### **Integration Tests**
- Test complete features end-to-end

---

## 📚 Additional Documentation

- **[Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)** by Uncle Bob
- **[Flutter Best Practices](https://flutter.dev/docs/development/best-practices)**
- **[SignalR Documentation](https://docs.microsoft.com/en-us/aspnet/core/signalr/)**

---

## ✅ Checklist

- [x] Core infrastructure (DI, Network, Logging)
- [x] SignalR service with Clean Architecture
- [x] Auth feature (Login, Signup, Logout)
- [x] Support feature with SignalR integration
- [x] Firebase Messaging with deduplication
- [x] Responsive UI guidelines
- [x] Error handling with Failures
- [x] Theme configuration
- [x] Routing system

---

## 🎯 Next Steps

1. **Migrate existing screens** from `lib/screens/` to feature modules
2. **Implement remaining features** (Dashboard, Profile, Investments)
3. **Add unit tests** for use cases and repositories
4. **Add widget tests** for screens
5. **Configure Firebase** (update `google-services.json` and iOS config)
6. **Test on physical devices** to validate mDNS hostname resolution

---

**Built with ❤️ following Google Expert Level Standards**
