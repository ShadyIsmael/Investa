# Flutter Partner — Investor Portal Mirror: Full Technical Document

**Branch:** `feature/flutter-partner-investor-mirror`  
**Date:** June 1, 2026  
**Author:** Senior Software Architect

---

## 1. Executive Summary

The Investa **Client Portal** (Angular 17+) is the definitive investor-facing experience: a battle-tested, production-grade web application that serves as the single source of truth for investor UX patterns, API contracts, and domain logic. This document specifies how every investor-facing feature of the client portal is to be accurately mirrored into the **Flutter Partner** app, while:

- Eliminating all fake / hardcoded mock data
- Enforcing Clean Architecture (service layer → screen layer, no business logic in widgets)
- Achieving production-quality UX (loading states, graceful error handling, bilingual EN/AR support)
- Maintaining and extending the existing dark-first design system (`AppPalette`, `AppTheme`)

---

## 2. Platform Architecture Reference

| Layer | Technology | Role |
|---|---|---|
| Backend API | .NET 9 ASP.NET Core + EF Core + SQL Server | Single source of truth |
| Admin Portal | React + Vite + Recharts | Internal management |
| Client Portal | Angular 17+ (standalone, signals) | **Reference implementation** |
| Flutter Partner | Flutter 3.x + Dio + Provider | **Target of this document** |
| Flutter Founder | Flutter 3.x | Founder experience (out of scope) |

---

## 3. Client Portal Feature Inventory (Investor Perspective)

### 3.1 Navigation Structure
The client portal exposes the following top-level routes for authenticated investors:

| Route | Screen | Access Pattern |
|---|---|---|
| `/admin/dashboard` | Dashboard | Main landing page |
| `/admin/investments` | Browse Investments | Category + filter browsing |
| `/admin/investments/:id` | Investment Preview | Drill-down detail |
| `/admin/notifications` | Notifications | Bell icon + dedicated page |
| `/admin/profile` | Investor Profile | Multi-section form |
| `/admin/credit-charge` | Credit Charge | Plan selection + purchase |
| `/admin/transactions` | Credit History | Paginated transaction log |
| `/admin/requests` | Requests | Incoming/outgoing tabs |
| `/admin/settings` | Settings | Language + theme toggle |

### 3.2 Feature Details

#### Dashboard (`/admin/dashboard`)
**Investor-specific signals:**
- `portfolioValue` — sum of `investedAmount` across all investments where invested > 0
- `myInvestments` — investments user has committed to
- `favoriteInvestments` — watchlisted items
- `currentCredits` — live user credit balance from `UserService`
- `incomingRequestsCount` — from `RequestsService`
- `featuredInvestments` — top 3 by credibility score

**Charts (D3):**
- Pie chart: investment category distribution
- Line chart: credit history & credibility score over time (day/month/year intervals)
- Bar chart: funding progress across my investments

**API sources:**
- `GET /api/investments` — investment list (already wired in Flutter Partner via `InvestmentsService`)
- `GET /api/dashboard/summary` — credit/score timeseries (already wired via `DashboardService.fetchSummary()`)
- `GET /api/dashboard/my/top-categories` — pie allocation (already wired via `DashboardService.fetchTopCategories()`)

**Flutter Partner current state:** Dashboard uses `fetchDashboardData()` in `mock_data.dart`. This function already tries the real API first (`DashboardService.fetchSummary()`, `fetchTopCategories()`) and only falls back to mock if the call fails. The `activities` list is entirely hardcoded mock data with no server equivalent.

**Action:** Remove hardcoded `activities` and the `_generateMockTransactions()` fallback from `mock_data.dart`. Replace the "Recent Activities" dashboard section with a real **Recent Requests** feed sourced from the requests API.

---

#### Investments (`/admin/investments`)
**Features:**
- Category filter chips (from `GET /api/categories`)
- Advanced filter bottom sheet: keyword search, risk level (Low/Medium/High), investment type (Founding/Equity), funding % range, favorites only
- Infinite scroll (load more on scroll-near-bottom, `ITEMS_PER_PAGE = 8`)
- Investment card: image, name, category, risk badge, funding progress bar, credibility score
- Engagement flow: costs `ENGAGEMENT_CREDIT_COST = 5` credits → `POST /api/requests/engage/{investmentId}`
- Investment/share purchase dialog (equity type)
- Favorites toggle

**Flutter Partner current state:** `InvestmentsScreen` — real API via `InvestmentsService`, `CategoriesService`, bottom-sheet advanced filter, `ValueNotifier<InvestmentFilter>`. **Functionally equivalent.** Minor UX gap: no favorites toggle UI on card.

**Action:** Add favorites toggle button on investment cards. Confirm `ENGAGEMENT_CREDIT_COST = 5` is enforced.

---

#### Notifications (`/admin/notifications`)
**Features:**
- Tabs: All | Unread
- Paginated list (pageSize = 20 per load)
- Each item: title, message, timestamp, type icon, read/unread indicator
- Actions: tap to mark read, swipe/button to delete, "Mark All Read" header action
- Polling every 30 seconds in navbar (unread badge count)

**API endpoints:**
- `GET /api/v1/user-notifications?page={p}&pageSize={n}` → `{ items: [...], totalCount, unreadCount }`
- `POST /api/v1/user-notifications/mark-read` body `{ ids: [id] }` (single) or `{}` (all)
- `DELETE /api/v1/user-notifications/{id}`

**Flutter Partner current state:** No dedicated notifications screen. Firebase FCM handles push notifications only. The in-app notification list does not exist.

**Action:** Create `NotificationApiService` + `NotificationsScreen`. Add notification bell with unread badge in `MainWrapper` app bar.

---

#### Profile (`/admin/profile`)
**Sections:**
1. **Personal** — firstName, lastName, bio, gender, nationality, DoB, avatar upload
2. **Contact** — phone1, phone2, home/work address, LinkedIn, Facebook
3. **KYC / Identity** — national ID number, expiry, verification status, ID document upload
4. **Credibility Score** — visual ring + score history
5. **Credit Balance** — wallet balance, link to credit history
6. **Audit/System** — created at, last login IP, client type

**Flutter Partner current state:** `ProfileScreen` calls real `ProfileService` API. `EditProfileScreen` exists. `TraceScoreScreen` exists. **Mostly equivalent.**

**Action:** No major changes needed. Ensure wallet balance displayed correctly.

---

#### Credit Charge (`/admin/credit-charge`)
**Flow:**
1. Load admin-configured plans → `GET /api/credit-plans`
2. User selects a plan card
3. Order summary panel shows: plan name, credits, billing period, total price
4. "Purchase" → `POST /api/credit-plans/{id}/purchase`
5. Success dialog shows: reference number, credits added
6. `UserService.setCredits(result.newBalance)` updates the in-memory balance

**Flutter Partner current state:** **FAKE** — hardcoded `CreditPackage` list, `Future.delayed(2s)` instead of real API call.

**Action:** Full rewrite using `CreditPlansService`. Mirror the Angular component exactly.

---

#### Credit History / Transactions (`/admin/transactions`)
**Features:**
- Fetch from `GET /api/profile/me/credits`
- Response: `[{ id, amount, justificationEn, justificationAr, createdAt, type }]`
- Display as paginated table (10 items/page)
- Each row: date, amount (color-coded: green=positive, red=negative), justification (bilingual), type badge
- "Running total" score = sum of all amounts
- Tap row → detail dialog

**Flutter Partner current state:** **FAKE** — `List.generate(25, ...)` with mock data. `ProfileService.getCreditHistory()` exists and calls `GET /api/Profile/me/credits` but is never used in this screen.

**Action:** Full rewrite using `ProfileService.getCreditHistory()`. Add bilingual `justificationEn` / `justificationAr` display.

---

#### Requests (`/admin/requests`)
**Features:**
- Tabs: Income (incoming) | Outcome (outgoing)
- Per-request: project name, image, author, status badge, date, amount
- Status values: `Pending | Negotiating | Partner | Rejected`
- Actions (on Pending): Accept, Decline, Cancel
- Search filter

**Flutter Partner current state:** `RequestsScreen` — real API via `RequestsService`, tabs, search, Accept/Decline/Cancel actions. **Functionally equivalent.**

**Action:** No changes needed.

---

## 4. API Contract Summary

| Feature | Method | Endpoint | Notes |
|---|---|---|---|
| Investments list | GET | `/api/investments` | Auth: Bearer |
| Investment categories | GET | `/api/categories` | |
| Dashboard summary | GET | `/api/dashboard/summary` | Returns credit+score timeseries |
| Top categories (pie) | GET | `/api/dashboard/my/top-categories?take=5` | |
| Notifications list | GET | `/api/v1/user-notifications?page=&pageSize=` | `{ items, totalCount, unreadCount }` |
| Mark notification read | POST | `/api/v1/user-notifications/mark-read` | body `{ ids: [...] }` or `{}` for all |
| Delete notification | DELETE | `/api/v1/user-notifications/{id}` | |
| Credit plans | GET | `/api/credit-plans` | Returns active plans |
| Purchase credit plan | POST | `/api/credit-plans/{id}/purchase` | Returns `{ referenceNumber, planName, creditsAdded, newBalance }` |
| Credit history | GET | `/api/Profile/me/credits` | Returns `[{ id, amount, justificationEn, justificationAr, type, createdAt }]` |
| Requests (income) | GET | `/api/requests/income` | |
| Requests (outcome) | GET | `/api/requests/outcome` | |
| Profile | GET | `/api/Profile/me` | |
| Update profile | PUT | `/api/Profile/me` | |

**Authentication:** All endpoints require `Authorization: Bearer {token}`. Token is stored in `SecureStorage` under key `auth_token` and automatically injected by `ApiClient`'s Dio interceptor.

---

## 5. Gap Analysis: Flutter Partner vs Client Portal

| Feature | Client Portal | Flutter Partner (Before) | Flutter Partner (After) |
|---|---|---|---|
| Dashboard | ✅ Real API + D3 charts | ⚠️ Real API + mock fallback | ✅ Real API, mock removed |
| Investments | ✅ Real API + filters | ✅ Real API + filters | ✅ No change (parity) |
| Notifications screen | ✅ Dedicated page | ❌ Missing | ✅ New screen |
| Notifications badge | ✅ Unread count in navbar | ❌ Missing | ✅ Bell in AppBar |
| Credit Charge | ✅ Real API (plans + purchase) | ❌ Hardcoded fake plans | ✅ Real API |
| Credit History | ✅ Real API + bilingual | ❌ List.generate() fake | ✅ Real API + bilingual |
| Profile | ✅ Real API | ✅ Real API | ✅ No change (parity) |
| Requests | ✅ Real API + actions | ✅ Real API + actions | ✅ No change (parity) |
| Mock code | N/A | ❌ Multiple fake generators | ✅ All removed |

---

## 6. Architecture Decisions

### 6.1 Service Layer Pattern
All API calls are encapsulated in dedicated service classes following the existing pattern:

```dart
class XyzService {
  final ApiClient _client;
  String get _baseUrl {
    final u = EndpointResolver.instance.selectedApiBaseUrl;
    return u.startsWith('http') ? u : 'http://$u';
  }
  // ...
}
```

No raw HTTP code in screens. Services return typed DTOs. Screens catch exceptions from services and display graceful error states.

### 6.2 Bilingual Support
All translatable text uses `AppLocalizations.of(context).t('key')`. New i18n keys are added to both `en.json` and `ar.json`. Server-provided bilingual fields (e.g., `justificationEn` / `justificationAr`) are selected based on the current app locale: if `Localizations.localeOf(context).languageCode == 'ar'` → use Arabic field.

### 6.3 State Management
- `AppState.instance` (singleton `ChangeNotifier`) — profile/wallet balance
- `ValueNotifier<T>` — screen-local state for filter, pagination, loading
- No external state managers introduced (consistent with existing codebase)

### 6.4 Theme / Color System
All new screens follow `AppPalette` + `AppTheme`:
- Dark background: `AppPalette.midnightDeep` / `Color(0xFF1E293B)` for cards
- Accent: `theme.colorScheme.primary` (plum-derived)
- Success: `Colors.green` / `AppPalette.success`
- Danger: `AppPalette.danger` / `Colors.red.shade700`
- Typography: `GoogleFonts.outfit` for headings, `GoogleFonts.robotoMono` for reference numbers

### 6.5 Error & Loading States
Every screen that makes network calls implements the three-state pattern:
1. **Loading** — `CircularProgressIndicator` centered
2. **Error** — icon + message + retry button
3. **Empty** — friendly empty state illustration + message

---

## 7. New Files Created

| File | Type | Description |
|---|---|---|
| `lib/services/credit_plans_service.dart` | New | `CreditPlan` model + `CreditPlansService` (fetch plans, purchase plan) |
| `lib/services/notification_api_service.dart` | New | `AppNotification` model + `NotificationApiService` (fetch, mark read, delete) |
| `lib/screens/notifications_screen.dart` | New | Full notifications UI with tabs, pagination, swipe-to-delete |

## 8. Files Rewritten

| File | Change | Reason |
|---|---|---|
| `lib/screens/credit_charge_screen.dart` | Full rewrite | Replace fake hardcoded packages with real API plans |
| `lib/screens/trace_credit_screen.dart` | Full rewrite | Replace `List.generate()` mock with real API + bilingual |
| `lib/services/mock_data.dart` | Partial clean | Remove hardcoded activities, `_generateMockTransactions()`, rely fully on server data |

## 9. Files Updated

| File | Change |
|---|---|
| `lib/screens/main_wrapper.dart` | Add notifications bell icon in custom AppBar with unread badge |
| `assets/lang/en.json` | Add 15 new i18n keys for notifications and credit screens |
| `assets/lang/ar.json` | Arabic translations for all new keys |

---

## 10. UX Decisions

### Credit Charge Screen
- Grid of plan cards (2 columns, fixed max-width 240px each)
- Selected card: highlighted border + primary color tint + checkmark badge
- Sticky bottom panel: order summary + Purchase button
- Post-purchase: success dialog with reference number (monospace font, prominent)
- Error: SnackBar with red background

### Credit History (Trace Credits)
- Balance summary card at top (total credits = sum of all amounts)
- Scrollable list with infinite pagination (10/page, load-more button)
- Each item: color-coded amount chip (green/red), type badge, bilingual justification, date
- Tap item → bottom sheet detail (not a dialog, better mobile UX)
- Empty state with "Charge Credits" CTA button

### Notifications Screen
- Sticky filter tabs: All | Unread (with count badge)
- Notification cards: type icon with colored background, title, message excerpt, relative time
- Mark-read on tap (immediate optimistic UI update)
- Swipe right-to-left → delete (Dismissible widget)
- "Mark All Read" button in AppBar (only visible when unread > 0)
- Load More button at bottom (not infinite auto-scroll for explicit UX control)
- Empty state per filter

### Main Wrapper Notifications Bell
- Bell icon in AppBar (top-right corner of the main scaffold)
- Unread badge overlaid: red circle with count (hides at 0)
- Taps to `NotificationsScreen` via `Navigator.push`
- Badge refreshes on app resume and on notification mark-read

---

## 11. Implementation Order

1. `credit_plans_service.dart` — new service (dependency for screen)
2. `notification_api_service.dart` — new service (dependency for screen)
3. `credit_charge_screen.dart` — full rewrite
4. `trace_credit_screen.dart` — full rewrite
5. `notifications_screen.dart` — new screen
6. `main_wrapper.dart` — add bell
7. `mock_data.dart` — remove mock generators
8. `en.json` + `ar.json` — new i18n keys
