# Investa — Multi-Platform Investment Platform

Investa is a production-grade, multi-platform investment ecosystem for founders, partners, and administrators. It follows Clean Architecture principles across all five platforms.

---

## Platform Overview

| Platform | Tech Stack | Purpose |
|---|---|---|
| **Core Backend** | .NET 9, Clean Architecture, EF Core, SignalR | Single source of truth — REST API + real-time hub |
| **Admin Portal** | React 19, TypeScript, Vite, Tailwind CSS | Internal management, KYC approvals, support dashboard |
| **Client Portal** | Angular 19, standalone components, signals | External investor-facing web portal |
| **Flutter Founder** | Flutter (Dart ≥3.0), GetIt, Provider | Mobile app for project owners/founders |
| **Flutter Partner** | Flutter (Dart ≥3.0), GetIt, Provider | Mobile app for partners and intermediaries |

---

## Repository Structure

```
gitInvesta/
├── Core-BackEnd/               # .NET Clean Architecture API
│   ├── Investa.API/            # Controllers, Middleware, Swagger
│   ├── Investa.Application/    # Use Cases, Services, DTOs
│   ├── Investa.Domain/         # Entities, Interfaces, Value Objects
│   └── Investa.Infrastructure/ # EF Core, Migrations, Repositories
│
├── Flutter_Founder/            # Founder mobile app
│   └── lib/
│       ├── core/               # DI, Network, Services
│       ├── features/           # Auth, Support (Clean Architecture)
│       ├── screens/            # UI Screens
│       └── services/           # Legacy service layer
│
├── Flutter_Partner/            # Partner mobile app (mirrors Founder)
│
├── investa-admin-portal/       # React admin portal
│   └── src/
│       ├── components/         # Shared UI components
│       ├── context/            # AuthContext, RBAC
│       ├── features/           # Auth, Support, Finance modules
│       └── services/           # API client, SignalR, Firebase
│
└── investa-client-portal/      # Angular client portal
    └── src/app/
        ├── core/               # Guards, Interceptors
        ├── pages/              # Feature pages (lazy-loaded)
        └── services/           # Auth, Profile, Investment services
```

---

## Quick Start

### Backend
```bash
cd Core-BackEnd
dotnet restore
dotnet run --project Investa.API
# API available at http://localhost:5235
```

### Admin Portal
```bash
cd investa-admin-portal
npm install
npm run dev
# Dev server at http://localhost:5173
```

### Client Portal
```bash
cd investa-client-portal
npm install
npm run start
# Dev server at http://localhost:4200
```

### Flutter Apps
```bash
cd Flutter_Founder   # or Flutter_Partner
flutter pub get
flutter run
```

---

## Key Technologies

- **Authentication**: Firebase Auth (phone OTP) + JWT (backend RBAC)
- **Real-time**: SignalR (`/hubs/chat`) for admin chat; FCM for mobile push
- **State Management**: Provider + GetIt (Flutter), React Context (Admin), Angular signals (Client)
- **Database**: SQL Server with EF Core migrations
- **CI**: Docker Compose (`Core-BackEnd/docker-compose.yml`)

---

## Architecture Principles

All platforms follow **SOLID**, **DRY**, and **KISS** principles:

- **Clean Architecture layers**: Domain → Application → Infrastructure → Presentation
- **Role-Based Access Control (RBAC)**: enforced at API + all frontends
- **No hardcoded URLs**: dynamic resolution via hostname/environment config
- **Audit Trail**: every credit transaction has bilingual (AR/EN) justification
- **No debug code in production**: all `console.log`/`console.debug`/`console.info` removed

---

## Documentation Index

| Document | Description |
|---|---|
| [Core-BackEnd/CLEAN_ARCHITECTURE_REFACTORING.md](Core-BackEnd/CLEAN_ARCHITECTURE_REFACTORING.md) | Backend architecture overview |
| [Core-BackEnd/RBAC_IMPLEMENTATION_GUIDE.md](Core-BackEnd/RBAC_IMPLEMENTATION_GUIDE.md) | RBAC setup and role definitions |
| [Core-BackEnd/SECURITY_REFACTORING_PLAN.md](Core-BackEnd/SECURITY_REFACTORING_PLAN.md) | Security hardening details |
| [Flutter_Founder/CLEAN_ARCHITECTURE_README.md](Flutter_Founder/CLEAN_ARCHITECTURE_README.md) | Flutter Clean Architecture guide |
| [Flutter_Founder/FCM_IMPLEMENTATION.md](Flutter_Founder/FCM_IMPLEMENTATION.md) | Firebase Cloud Messaging setup |
| [Flutter_Founder/QUICK_START.md](Flutter_Founder/QUICK_START.md) | Flutter environment setup |
| [investa-admin-portal/docs/ARCHITECTURE.md](investa-admin-portal/docs/ARCHITECTURE.md) | Admin portal architecture |
| [investa-admin-portal/docs/PERMISSIONS.md](investa-admin-portal/docs/PERMISSIONS.md) | Admin RBAC permissions guide |
| [investa-admin-portal/docs/SECURITY_CHECKLIST.md](investa-admin-portal/docs/SECURITY_CHECKLIST.md) | Security checklist |
| [CODE_REVIEW_AND_CLEANUP_REPORT.md](CODE_REVIEW_AND_CLEANUP_REPORT.md) | Full code quality audit (May 2026) |

---

## Code Quality Status (May 2026)

| Platform | Errors | Warnings | Notes |
|---|---|---|---|
| Core Backend (.NET) | 0 | 0 | Build clean |
| Flutter Founder | 0 | 0 | 38 info (cosmetic only) |
| Flutter Partner | 0 | 0 | Mirrors Founder fixes |
| Admin Portal (React) | 0 | 0 | No debug logs |
| Client Portal (Angular) | 0 | 0 | No debug logs |
