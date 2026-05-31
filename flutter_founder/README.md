# Investa — Flutter Founder App

Mobile application for **project founders** on the Investa investment platform. Allows founders to list investment opportunities, manage funding requests, communicate with the support team, and track their credibility score.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Flutter (Dart ≥3.0) |
| State Management | Provider + ChangeNotifier |
| Dependency Injection | GetIt |
| HTTP Client | Dio |
| Real-time | SignalR (`/hubs/chat`) |
| Authentication | Firebase Auth (phone OTP) + JWT |
| Push Notifications | Firebase Cloud Messaging (FCM) |
| Local Notifications | flutter_local_notifications |
| Secure Storage | flutter_secure_storage |

---

## Project Structure

```
lib/
├── main.dart                     # App entry point, FCM init, theme/locale
├── config/
│   ├── app_config.dart           # Env constants (Env.engageCreditCost, etc.)
│   ├── routes.dart               # Named route definitions
│   └── theme.dart                # Light/Dark ThemeData
├── core/
│   ├── di/injection_container.dart   # GetIt service locator setup
│   ├── error/failures.dart           # Typed failure classes (ServerFailure, etc.)
│   ├── network/
│   │   ├── network_config.dart       # mDNS-aware base URL resolution
│   │   └── network_client.dart       # Dio client (auth injection, 401 refresh)
│   └── services/
│       ├── fcm_service.dart          # FCM token sync + foreground handling
│       ├── logger_service.dart       # Structured logger wrapper
│       ├── secure_storage_service.dart
│       ├── signalr_service.dart      # SignalR hub connection + events
│       └── support_chat_http_service.dart
├── controllers/
│   └── chat_controller.dart      # ChangeNotifier for support chat state
├── features/
│   ├── auth/                     # Clean Architecture: Login, Signup, Logout
│   └── support/                  # Clean Architecture: Support sessions
├── screens/                      # UI screens (auth, dashboard, investments, etc.)
├── services/                     # Legacy service layer (API, Profile, Investments)
├── models/                       # Data models (ChatMessage, Investment, etc.)
├── widgets/                      # Shared UI widgets
└── theme/                        # App palette and color extensions
```

---

## Quick Start

```bash
flutter pub get
flutter run
```

For Android emulator (backend on same machine):
```bash
# Set API_BASE_URL to 10.0.2.2 in your .env or NetworkConfig
flutter run -d android
```

See [QUICK_START.md](QUICK_START.md) for full environment setup and `.env` configuration.

---

## Environment Configuration

Create a `.env` file in the project root:

```env
BASE_HOST_NAME=YOUR-MACHINE-NAME
API_BASE_URL=http://YOUR-MACHINE-NAME:5235
SIGNALR_HUB_URL=http://YOUR-MACHINE-NAME:5235/hubs/chat
```

For Android emulator use `10.0.2.2` instead of `localhost`.

---

## Key Features

- **Authentication**: Phone-number OTP via Firebase, JWT for API calls
- **Dashboard**: Investment portfolio overview, credibility score badge
- **New Investment**: Multi-step form with image upload (up to 5 per investment)
- **Requests**: View and manage investor funding requests
- **Support Chat**: Real-time support via SignalR with FCM fallback
- **Profile**: Edit personal info, nationality, KYC documents
- **Bilingual**: Full AR/EN localization (`lib/l10n/`)

---

## Architecture

Follows Clean Architecture with strict layer separation:

```
Presentation (screens, widgets)
    ↕
Application (providers, controllers)
    ↕
Domain (entities, use cases, repository interfaces)
    ↕
Data (remote datasources, repository implementations)
    ↕
Core (DI, network, services)
```

---

## Documentation

| File | Description |
|---|---|
| [QUICK_START.md](QUICK_START.md) | Environment setup and run guide |
| [CLEAN_ARCHITECTURE_README.md](CLEAN_ARCHITECTURE_README.md) | Architecture patterns used |
| [FCM_IMPLEMENTATION.md](FCM_IMPLEMENTATION.md) | Firebase Cloud Messaging setup |
| [FCM_MIGRATION_SUMMARY.md](FCM_MIGRATION_SUMMARY.md) | FCM migration notes |
| [BACKEND_API_SPEC.md](BACKEND_API_SPEC.md) | API endpoints reference |
| [ANDROID_BUILD_FIX.md](ANDROID_BUILD_FIX.md) | Android build troubleshooting |
| [ISSUES/](ISSUES/) | Known issues and resolutions |

---

## Code Quality (May 2026)

- **0 errors, 0 warnings** (`dart analyze lib`)
- 38 info-level hints (cosmetic `withOpacity` deprecations — non-breaking)
- All deprecated `WillPopScope` replaced with `PopScope`
- All `BuildContext` async-gap safety issues resolved
- All unused fields, dead methods, and dead code removed
- Hardcoded phone numbers replaced with dynamic `AppState` / Firebase lookup
- `ChatController` uses proper GetIt dependency injection

