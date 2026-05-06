# Investa — Flutter Partner App

Mobile application for **investment partners and intermediaries** on the Investa platform. Partners can browse investment opportunities, manage their client portfolio, communicate with the support team, and track performance metrics.

---

## Tech Stack

Identical to Flutter_Founder — see [Flutter_Founder/README.md](../Flutter_Founder/README.md) for the full stack reference. Both apps share the same architecture and core services.

---

## Project Structure

```
lib/
├── main.dart
├── config/               # Routes, Theme, App config
├── core/
│   ├── di/               # GetIt DI container
│   ├── error/            # Typed failure classes
│   ├── network/          # Dio client, NetworkConfig
│   └── services/         # FCM, SignalR, Logger, SecureStorage
├── controllers/          # ChatController (ChangeNotifier)
├── features/
│   ├── auth/             # Login, Signup, Logout (Clean Architecture)
│   └── support/          # Support sessions (Clean Architecture)
├── screens/              # All UI screens
├── services/             # API, Profile, Investment services
├── models/               # Domain models
├── widgets/              # Shared widgets
└── theme/                # App palette
```

---

## Quick Start

```bash
flutter pub get
flutter run
```

See [QUICK_START.md](QUICK_START.md) for environment configuration.

---

## Key Differences from Flutter_Founder

| Feature | Flutter_Founder | Flutter_Partner |
|---|---|---|
| Primary role | Project creator | Investor/intermediary |
| Investment flow | Create & manage projects | Browse & engage with projects |
| Dashboard focus | Own projects, funding progress | Portfolio, engagement metrics |
| KYC | Founder identity docs | Partner compliance docs |

---

## Documentation

| File | Description |
|---|---|
| [QUICK_START.md](QUICK_START.md) | Environment setup |
| [CLEAN_ARCHITECTURE_README.md](CLEAN_ARCHITECTURE_README.md) | Architecture patterns |
| [FCM_IMPLEMENTATION.md](FCM_IMPLEMENTATION.md) | Push notifications setup |
| [FLUTTER_PARTNER_REFACTORING.md](FLUTTER_PARTNER_REFACTORING.md) | Partner-specific changes |
| [FLUTTER_PARTNER_INVESTMENT_FLOW.md](FLUTTER_PARTNER_INVESTMENT_FLOW.md) | Investment flow documentation |
| [BACKEND_API_SPEC.md](BACKEND_API_SPEC.md) | API endpoints reference |
| [ISSUES/](ISSUES/) | Known issues and resolutions |

---

## Code Quality (May 2026)

- **0 errors, 0 warnings** (`dart analyze lib`)
- All deprecated `WillPopScope` replaced with `PopScope`
- All `BuildContext` async-gap safety issues resolved
- Unused fields and dead code removed
- Hardcoded phone numbers replaced with dynamic `AppState` / Firebase lookup

