# Investa – System Overview

## Platform Summary

**Investa** is an investment platform connecting **founders** (who post investment opportunities) with **partners/investors** (who browse, engage, and request investments). The system enforces identity verification (KYC), a credibility scoring mechanism, wallet credit, and a role-based access control model.

---

## Architecture at a Glance

```
┌────────────────────────────────────────────────────────────┐
│                  Flutter_Founder (Mobile)                  │
│                  Flutter_Partner (Mobile)                  │
│              investa-client-portal (Angular)               │
│              investa-admin-portal (React + TS)             │
└─────────────────────────┬──────────────────────────────────┘
                           │ REST / SignalR / FCM
┌─────────────────────────▼──────────────────────────────────┐
│                 Core-BackEnd (ASP.NET Core 9)              │
│          Clean Architecture: Domain → Application          │
│                    → Infrastructure → API                  │
└─────────────────────────┬──────────────────────────────────┘
                           │
              ┌────────────▼──────────┐
              │    SQL Server (EF)    │
              └───────────────────────┘
                           │
              ┌────────────▼──────────┐
              │   InvestaFileStore    │  (separate ASP.NET microservice)
              └───────────────────────┘
```

---

## System Layers

### 1. Core Backend – `Core-BackEnd/`

| Project | Purpose |
|---|---|
| `Investa.Domain` | Entities, domain rules, no dependencies |
| `Investa.Application` | Services, interfaces, DTOs, mapping profiles, validators |
| `Investa.Infrastructure` | EF Core DbContext, repositories, migrations, external services |
| `Investa.API` | ASP.NET Core controllers, middleware, auth configuration |
| `Investa.Tests` / `Investa.Application.Tests` | Unit and integration tests |

**Tech stack:** .NET 9, EF Core, SQL Server, ASP.NET Core Identity (GUID keys), SignalR, Firebase FCM, AutoMapper, FluentValidation, JWT auth.

### 2. Admin Portal – `investa-admin-portal/`

React 18 + TypeScript + Vite. Role-protected portal for platform administrators.

**Key features:** Dashboard, RBAC management (Groups/Roles/Permissions), investment approvals, KYC review, user management, chat support, credit charge, notification templates.

**Libraries:** React Router, Axios, Firebase SDK, @microsoft/signalr, Recharts, TailwindCSS.

### 3. Client Portal – `investa-client-portal/`

Angular 17+ (standalone components), TypeScript, TailwindCSS. Bilingual (AR/EN).

**Key features:** Landing pages, login/signup, investment browsing, contact, blog. Admin sub-section for founder-role users (investment submission, profile, requests, transactions).

### 4. Flutter Founder App – `Flutter_Founder/`

Flutter/Dart, Clean Architecture. Mobile app for **founders** who create and manage investment opportunities.

**Key features:** Auth (phone OTP + Google), KYC, investment creation/management, credibility score tracking, credit wallet, support chat (SignalR), FCM notifications.

### 5. Flutter Partner App – `Flutter_Partner/`

Flutter/Dart, Clean Architecture. Mobile app for **partners/investors** who browse and invest.

**Key features:** Auth (phone OTP + Google), KYC, investment discovery, engagement, credit plans purchase, notifications, professional dashboard, support chat.

### 6. File Store – `InvestaFileStore/`

Separate ASP.NET microservice that serves uploaded files (images, documents). Operates independently from the main API.

---

## Data Flow Summary

```
User (mobile/web)
  → Auth (JWT) via AuthController
  → Protected endpoints based on role (Founder / Partner / Admin)
  → Business logic in Application Services
  → Persistence via Repository<T> + UnitOfWork (EF Core)
  → SQL Server

File uploads → InvestaFileStore (served as static/CDN-like)
Push notifications → Firebase FCM (via NotificationService)
Real-time chat → SignalR Hub (UnifiedSupportController)
```

---

## Deployment Notes

- Both worktrees: `D:\projects\Investa\gitInvesta` (feature/dev) and `D:\projects\Investa\gitInvesta-main` (main)
- Backend runs via `dotnet run` in `Core-BackEnd/Investa.API/`
- Client portal: `ng serve` in `investa-client-portal/`
- Admin portal: `npm run dev` in `investa-admin-portal/`
- Flutter apps: `flutter run` in `Flutter_Founder/` or `Flutter_Partner/`
