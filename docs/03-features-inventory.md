# Investa – Features Inventory

## Business Domains & Implemented Features

---

### 1. Authentication & Identity
- Phone number + OTP verification (Firebase Auth)
- Google Sign-In (mobile apps)
- JWT token issuance and refresh
- Role-based login (Founder / Partner / Admin)
- Session management (inactivity timeout on web)
- FCM device token registration on login

**Files:** `AuthController.cs`, `JwtTokenService.cs`, `features/auth/` (Flutter), `pages/login/` (Angular)

---

### 2. KYC / User Profile
- Multi-step KYC form (identity, company, HR letter upload)
- KYC completion tracking (`IsKycVerified`, `KycCompleted`)
- Profile view and edit (name, DOB, country, company, contact)
- Profile change audit trail (`ProfileChangeAudit`)
- File upload for HR letter / documents (via InvestaFileStore)

**Files:** `ProfileController.cs`, `ProfileService.cs`, `ClientsController.cs`, `kyc_verification_screen.dart`, `pages/admin/profile/`

---

### 3. Investment Lifecycle
- Create investment opportunity (founder) — multi-step form with images
- Investment types: `Debt`, `Equity`, `RealEstate`, `EquityCrowdfunding`
- Investment phases / stages (project phases tracker)
- Investment approval workflow (admin review)
- Partner browsing and filtering investments
- Favorite investments per user
- Investment team members
- Investment media (images, reorder, delete)
- Investment event tracking

**Files:** `InvestmentsController.cs`, `InvestmentService.cs`, `InvestmentEventsController.cs`, `new_investment_screen.dart`, `investments_screen.dart`, `investment_info_screen.dart`

---

### 4. Investment Requests (Engagement)
- Partner submits investment request
- Founder reviews and approves/rejects
- Admin can view all requests
- Request type linked to investment type
- Founder's requests list view
- Partner's requests list view

**Files:** `InvestmentRequestsController.cs`, `InvestmentRequestService.cs`, `requests_screen.dart`, `pages/admin/requests/`

---

### 5. Credibility Score System
- Admin assigns credibility score changes to clients (`CreditTransaction`)
- Justification in Arabic and English
- Client can view their credibility history
- Score visible as a badge in mobile apps
- Score affects platform trust/credibility visibility

**Files:** `CreditController.cs` (via `ScoreTransactionsController.cs`), `CreditService.cs`, `trace_score_screen.dart`, `credit_history_widget.dart`

> Note: `CreditTransaction` entity name is misleading — it tracks **credibility score**, not money. See [technical-debt.md](./06-technical-debt.md).

---

### 6. Wallet / Credit Plans
- Partners purchase credit plans (packages that add wallet balance)
- `CreditPlan` defines plan name, amount, price
- `CreditPlanPurchase` records the purchase
- Admin can charge credit to a user directly (`credit-charge`)
- Credit balance shown in dashboard

**Files:** `CreditPlansController.cs`, `CreditsService` (Flutter), `credit_plans_service.dart`, `pages/admin/credit-charge/`

---

### 7. Notifications
- FCM push notifications (Firebase Cloud Messaging) — mobile apps
- In-app notification records (`Notifications` table)
- Notification templates management (admin)
- User notification feed with read/unread state
- Real-time notification dispatch from admin actions

**Files:** `UserNotificationsController.cs`, `NotificationTemplatesController.cs`, `NotificationService.cs`, `notifications_screen.dart`, `fcm_service.dart`

---

### 8. Support Chat
- User initiates support session
- Admin responds in real-time via SignalR
- Messages encrypted with AES-GCM
- Paginated message history
- Support session categories (choice screen before chat)
- Chat waiting screen while agent connects
- Admin chat dashboard with active sessions list

**Files:** `UnifiedSupportController.cs`, `ChatService.cs`, `ChatMessage` entity, `support_request_screen.dart`, `chat_box_screen.dart`, `features/support/` (Flutter Clean Arch)

---

### 9. RBAC (Role-Based Access Control)
- Groups → Roles → Permissions three-tier model
- Custom `PermissionAuthorizationHandler` for fine-grained access
- Admin can create/edit groups and assign roles
- Admin can assign users to groups
- Permissions seeded at startup

**Files:** `GroupsAdminController.cs`, `RolesAdminController.cs`, `PermissionsAdminController.cs`, `GroupService.cs`, `Authorization/` folder

---

### 10. Admin Dashboard
- Summary stats (total users, investments, pending approvals)
- Recent credit transactions
- User growth charts
- Investment status breakdown

**Files:** `DashboardController.cs` (admin), `Dashboard.tsx`, `pages/admin/dashboard/`

---

### 11. Categories & Lookups
- Investment categories (create, update, list)
- Lookup tables for dropdowns (business stages, etc.)
- Bilingual labels (AR/EN)

**Files:** `CategoriesController.cs`, `LookupsController.cs`, `CategoryService.cs`

---

### 12. Localization (i18n)
- Backend responses in AR/EN via `Accept-Language` header and resource files
- Client portal: JSON translation files in `assets/i18n/ar.json` / `en.json`, custom `TranslatePipe`
- Admin portal: inline English strings (no i18n)
- Flutter apps: ARB files via `flutter_localizations`, `AppLocalizations`

---

### 13. File Storage (InvestaFileStore)
- Separate ASP.NET microservice
- Stores uploaded files (profile photos, HR letters, investment images)
- Referenced by URL in main DB records

---

## Features Present in Mobile Only

| Feature | Founder App | Partner App |
|---|---|---|
| New investment creation | ✓ | – |
| Investment image upload | ✓ | – |
| Score trace screen | ✓ | ✓ |
| Credit charge screen | – | ✓ |
| Credit plans purchase | – | ✓ |
| Professional dashboard | – | ✓ |
| Notifications screen | – | ✓ |
| Engagement confirmation | – | ✓ |

## Features Present in Admin Portal Only

- RBAC management (groups, roles, permissions)
- User list with KYC status
- Investment opportunity approval/rejection
- Notification templates management
- Credit charge (direct wallet credit)
- System health check
- Gemini AI integration (dashboard assistant)
