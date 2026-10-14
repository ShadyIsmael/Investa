# FLUTTER FOUNDER — CURRENT STATE AUDIT REPORT

Audit date: 2026-09-18  
Audited application: `Flutter_Founder`  
Authoritative backend: current `Core-BackEnd` working tree  
Method: source tracing from UI entry points through state, services, DTO parsing, and backend controller/service contracts. No Founder feature, backend contract, or production source was changed.

## Executive conclusion

The Founder app is not ready for feature implementation on top of its current foundation. It is a partially connected legacy client whose visible product model is still “Investment + Requests + Engagement,” while the current backend is Project → Opportunity → Conversation → Offer/OfferLeg → Participation → Contract → Funding Declaration → Investor Confirmation, with downstream loan, profit-sharing, and equity lifecycles.

The highest-impact facts are:

- The checked-in Founder source has compile blockers in `lib/screens/profile_screen.dart` (malformed code at lines 446–467) and `lib/services/file_store_service.dart` (references nonexistent `EndpointResolver.fileStoreBaseUrl` and `fileStoreApiKey`).
- Authentication tokens are copied into ordinary `SharedPreferences`, a full access token is printed from the profile screen, and the app accepts arbitrary clear-text HTTP API URLs to which it sends bearer tokens.
- Login is the only substantially wired backend authentication flow. Startup trusts Firebase state or a local `logged_in` boolean without checking JWT presence, expiry, role, or refresh viability. The social buttons write `social-demo-token` and enter the app locally.
- The running app does not initialize the newer GetIt/clean-architecture stack. Most active screens instantiate legacy services directly and use local `setState`; the parallel clean stack is dead or incomplete.
- The visible Requests and Engagement modules are in-memory demo data. They are not negotiation conversations, offers, or participations.
- The visible Investments feature uses `/api/v1/investments` compatibility endpoints and owns `investmentTypeId` locally. This conflicts with the current contract, where investment type belongs to each `OfferLeg` and mixed-leg contracts can exist.
- Projects, canonical Opportunities, negotiation Conversations, Offers/OfferLegs, Participations, Contracts, Funding Declarations, Loan Obligations, Repayment Declarations, Profit Sharing, and Equity lifecycle support are absent from the Founder client.
- The dashboard consumes legacy credit/score endpoints, synthesizes data, and hardcodes counts; it does not consume `/api/v1/founder/dashboard` or its committed/declared/confirmed/outstanding semantics.
- Firebase registration and foreground/background receipt exist, but product-event mapping, notification-center APIs, and deep-link navigation do not.

Final result: audit complete, with architecture, security, compile, and core-product blockers.

## A. Architecture summary

### Current structure

| Layer/area | Actual current implementation | Classification | Evidence / consequence |
|---|---|---:|---|
| App composition | `main.dart` constructs `MaterialApp`, one `ChatController` provider, and switches between `AuthScreen` and `MainWrapper` | PARTIAL | No router, dependency initialization, auth guard, or role guard is wired. |
| UI | Large stateful screens under `lib/screens`; direct service construction and `setState` dominate | IMPLEMENTED | This is the active application path. |
| State | Screen-local `setState`, singleton `AppState`, one Provider-backed `ChatController` | CONFLICTING | Three patterns coexist; business data has no central invalidation/cache policy. |
| Legacy data layer | `lib/services/*` with `ApiClient`, dynamic maps, DTOs colocated inside services | IMPLEMENTED | This is what active screens use. |
| New data/domain layer | `lib/core`, `lib/features/auth`, `lib/features/support`, GetIt, repositories/use cases/providers | LEGACY | `initializeDependencies()` is never called; clean Auth/Support routes are not the running screens. |
| API clients | Legacy `ApiClient`, new `NetworkClient`, raw `http`, standalone `Dio`, and Firebase SDK calls | DUPLICATE | Different token/error/refresh behavior and base URL rules. |
| Routing | Ad hoc `MaterialPageRoute` plus unused placeholder `config/routes.dart` | CONFLICTING | Named route `/verification` is invoked by `TrustGateWidget`, but the running app has no `onGenerateRoute`. |
| Models | A mix of typed legacy models, service-local DTOs, and dynamic maps | CONFLICTING | No typed current product graph or capability model. |
| Backend authority | UI derives ownership, trust gating, statuses, mock counts, and flow state locally | DEFECTIVE | Business capability/lifecycle should come from backend response state/capability flags. |

### Active dependency flow

```text
main.dart
├─ Firebase + legacy notification initialization
├─ local Firebase/SharedPreferences login decision
├─ Provider(ChatController)
└─ AuthScreen or MainWrapper
   ├─ screen-local setState
   ├─ directly-created lib/services/*
   ├─ singleton AppState for cached profile/trust refresh
   └─ dynamic maps / legacy models

Unused parallel path:
core/di/injection_container.dart
└─ NetworkClient → repositories → use cases → AuthProvider/SupportProvider
   (not initialized by main.dart)
```

## B. Navigation map

### Reachable tree

```text
App start
├─ AuthScreen
│  ├─ ForgotPasswordScreen (UI stub: delay then success)
│  ├─ OTPScreen (Firebase phone auth)
│  │  └─ SignupScreen
│  └─ successful/local social login → MainWrapper
└─ MainWrapper bottom tabs
   ├─ DashboardScreen
   │  └─ ActivitiesScreen
   ├─ EngagementScreen (hardcoded users)
   │  ├─ ChatBoxScreen
   │  └─ UserProfileScreen
   ├─ InvestmentsScreen (legacy investment compatibility flow)
   │  ├─ NewInvestmentScreen
   │  │  └─ NewInvestmentImagesScreen
   │  └─ InvestmentInfoScreen
   │     └─ image management / partner bottom sheet
   ├─ RequestsScreen (in-memory mock requests)
   │  └─ duplicate ProfileScreen entry
   └─ ProfileScreen
      ├─ EditProfileScreen
      ├─ NewInvestmentScreen
      ├─ TraceScoreScreen
      ├─ TraceCreditScreen
      ├─ SupportChoiceScreen
      │  ├─ SupportChatIntroScreen → ChatWaitingScreen → ChatBoxScreen
      │  └─ legacy SupportRequestScreen
      └─ SettingsScreen
```

### Dead/incomplete routes

| Route/screen | State | Finding |
|---|---:|---|
| `config/routes.dart` | LEGACY | Not connected to `MaterialApp`; login/signup/home/support targets are placeholders. |
| `/verification` | DEFECTIVE | `TrustGateWidget` uses `pushNamed`, but no named-route map is active. |
| `features/support/.../SupportRequestScreen` | LEGACY | Depends on uninitialized GetIt registrations; the reachable profile path uses `screens/support_request_screen.dart`. |
| `FounderAnalyticsScreen` | LEGACY | No active navigation/import reaches it. Its endpoints are not current. |
| `SignalRConfigScreen` | LEGACY | SignalR is described as removed; no active route. |
| `VerificationScreen` | PARTIAL | Concrete screen exists, but the reusable gate’s named navigation cannot reach it. |

The Founder does need projects, opportunities, negotiations, offers, participation/contracts, funding, obligations, repayment, profile/settings, documents, and notifications. Those product routes are missing rather than merely hidden.

## C. Complete Flutter API inventory

Status vocabulary is the requested API classification: CURRENT, STALE, MISSING, DUPLICATE, UNUSED, UNKNOWN.

| Flutter method | HTTP | Endpoint | Request DTO | Response DTO / parser | Consumer | Status |
|---|---|---|---|---|---|---:|
| `AuthService.login` | POST | `/api/v1/Auth/login` | map: phoneNumber, password | `ApiResponse<AuthResponseDto>` parsed dynamically | `AuthScreen` | CURRENT |
| `AuthService.signup` | POST | `/api/Auth/sign-up` | map: phone/name/password/Firebase | dynamic token response | `SignupScreen` | STALE — backend route is `/api/v1/auth/sign-up` |
| `AuthRemoteDataSource.login` | POST | `/api/Auth/login` | map | `UserDto` | dead clean auth stack | UNUSED + STALE |
| `AuthRemoteDataSource.signup` | POST | `/api/Auth/sign-up` | map | `UserDto` | dead clean auth stack | UNUSED + STALE |
| `ApiClient` 401 refresh | POST | `/api/v1/Auth/refresh` | `{refreshToken}` | dynamic envelope/token | all active legacy services | CURRENT |
| `NetworkClient` 401 refresh | POST | `/api/v1/Auth/refresh-token` | `{refreshToken}` | top-level token assumptions | dead clean stack | UNUSED + STALE — backend is `/refresh` and wraps data |
| `AuthRemoteDataSource.sendFcmToken` | POST | `/api/users/fcm-token` | `{fcmToken}` | none | dead clean auth stack | DUPLICATE + UNUSED |
| `FCMService._syncTokenWithBackend` | POST | `/api/users/fcm-token` | `{fcmToken}` | status only | `main.dart` | CURRENT |
| `DashboardService.fetchSummary` | GET | `/api/dashboard/summary` | none | legacy `DashboardSummary` | `fetchDashboardData` | STALE for Founder product dashboard |
| `DashboardService.fetchTopCategories` | GET | `/api/dashboard/my/top-categories` | `take` | `TopCategoryDto[]` | `fetchDashboardData` | STALE — investor/legacy investment aggregation |
| Founder dashboard client | GET | `/api/v1/founder/dashboard` | optional date/display query | `ApiResponse<FounderDashboardDto>` | no screen | MISSING |
| `CreditsService.fetchTimeSeries` | GET | `/api/credits/{clientId}/timeseries` | date/metric/interval query | `TimeseriesPoint[]` | `fetchDashboardData` | STALE — no matching public controller |
| `CreditsService.fetchTransactions` | GET | `/api/credits/{userId}` | none | `CreditTransaction[]` | `fetchDashboardData` | STALE — no matching public controller |
| `ProfileService.fetchProfile` | GET | `/api/Profile/me` | none | `Profile` | `ProfileScreen` | CURRENT |
| `ProfileService.fetchProfileRaw` | GET | `/api/Profile/me` | none | dynamic map | auth/profile/dashboard | DUPLICATE |
| `ProfileService.updateProfile` | PUT | `/api/Profile/me` | dynamic map | `Profile`/map | `EditProfileScreen` | CURRENT but weakly typed |
| `ProfileService.startKyc` | POST | `/api/Profile/start-kyc` | auth header | status/body | no confirmed active action | STALE — controller route absent |
| `ProfileService.startEmailVerification` | POST | `/api/Profile/start-email-verification` | auth header | bool | edit/profile flow | STALE — controller route absent |
| `ProfileService.getCreditHistory` | GET | `/api/Profile/me/credits` | none | map list | profile/credit UI | CURRENT |
| `TrustService.fetchMyTrustProfile` | GET | `/api/v1/trust/me` | none | `TrustProfile` | `ProfileScreen`, verification | CURRENT |
| `TrustService.recalculate` | POST | `/api/v1/trust/me/recalculate` | empty map | `TrustProfile` | verification | CURRENT |
| `TrustService.submitVerification` | POST | `/api/v1/trust/me/verifications` | dynamic verification payload | bool | `VerificationScreen` | CURRENT |
| `CategoriesService.fetchCategories` | GET | `/api/v1/categories` | none | `Category[]` | `NewInvestmentScreen` | STALE — category controller was removed/replaced by project categories |
| `BusinessStagesService.fetchStages` | GET | `/api/v1/lookups/business-stages` | none | `BusinessStage[]` | `NewInvestmentScreen` | STALE — lookup route absent |
| `ProjectPhasesService.fetchPhases` | GET | `/api/v1/lookups/project-phases` | none | `ProjectPhase[]` | `NewInvestmentScreen` | STALE — current route is `/api/v1/project-stages` |
| `CurrencyService.fetchFundingCurrencies` | GET | `/api/currency?purpose=funding` | none | `CurrencyReference[]` | `NewInvestmentScreen` | CURRENT |
| `InvestmentsService.createInvestment` | POST | `/api/v1/investments` | `CreateInvestmentRequest`/map | dynamic `InvestmentDto` | `NewInvestmentScreen` | STALE product model / CONFLICTING semantics |
| `InvestmentsService.fetchByCategory` | GET | `/api/v1/investments/GetByCategory` | categoryId | dynamic list | `InvestmentsScreen` | STALE product model |
| `InvestmentsService.getById` | GET | `/api/v1/investments/{investmentId}` | none | dynamic map | `InvestmentInfoScreen` | STALE product model |
| `InvestmentsService.updateInvestment` | PUT | `/api/v1/investments/{investmentId}` | dynamic map | dynamic map | `InvestmentInfoScreen` | STALE product model |
| `InvestmentsService.uploadInvestmentImage` | POST | `/api/v1/investments/{id}/images` | multipart image | dynamic URL/map | legacy image screen | STALE product model |
| `ConversationsService.getMyConversations` | GET | `/api/conversations` | none | service-local `Conversation[]` | no consumer | UNUSED + STALE — backend is `/api/v1/conversations` |
| `ConversationsService.getMessages` | GET | `/api/conversations/{id}/messages` | none | service-local `ChatMessage[]` | no consumer | UNUSED + STALE |
| `ConversationsService.sendMessage` | POST | `/api/conversations/{id}/messages` | `{text}` | service-local `ChatMessage` | no consumer | UNUSED + STALE; current DTO uses `message` |
| Negotiation conversation/offer methods | mixed | `/api/v1/opportunities/.../conversations`, `/api/v1/conversations/.../offers`, direct offers | current negotiation DTOs | conversation/offer/OfferLeg DTOs | no screen | MISSING |
| `SupportChatHttpService.createSupportRequest` | POST | `/api/support/requests` | category/message/mobile | conversation ID map | support chat/clean support | CURRENT |
| `SupportChatHttpService.sendMessage` | POST | `/api/support/conversations/{id}/messages` | message/mobile | status | support chat | CURRENT |
| `SupportChatHttpService.closeConversation` | POST | `/api/support/conversations/{id}/close` | none | status | `ChatController` | STALE — backend uses `/status` |
| `SupportChatHttpService.getConversationHistory` | GET | `/api/support/conversations/{id}/messages` | none | map list | clean support | STALE — backend GET is conversation resource |
| `SupportChatHttpService.sendTypingIndicator` | POST | `/api/support/conversations/{id}/typing` | isTyping | status | clean support | STALE — route absent |
| `FileStoreService._uploadFile` | POST | external `/files/{category}` | multipart | `{url}` | no consumer | UNUSED + DEFECTIVE client configuration |
| `FileStoreService.deleteFile` | DELETE | external `/files/{category}/{file}` | none | status | no consumer | UNUSED + DEFECTIVE client configuration |
| governed file upload client | POST | `/api/v1/files/upload` | multipart categoryCode/project/entity | governed stored-file DTO | no screen | MISSING |
| `AnalyticsService.recordView` | POST | `/investments/analytics/{id}/view` | none | status | unreachable analytics/detail hooks | STALE |
| `AnalyticsService.recordLearnMore` | POST | `/investments/analytics/{id}/learn-more` | none | status | unreachable | STALE |
| `AnalyticsService.getFounderSummary` | GET | `/investments/analytics/summary` | days | dynamic map | unreachable `FounderAnalyticsScreen` | UNUSED + STALE |
| `AnalyticsService.getInvestmentMetrics` | GET | `/investments/analytics/{id}` | days | dynamic map | unreachable | UNUSED + STALE |
| `AnalyticsService.getOpportunitiesPerformance` | GET | `/investments/analytics/opportunities` | days | map list | unreachable | UNUSED + STALE |
| `AnalyticsService.getTopPerformingOpportunities` | GET | `/investments/analytics/top-performing` | limit/days | map list | unreachable | UNUSED + STALE |
| `AnalyticsService.getLowPerformingOpportunities` | GET | `/investments/analytics/low-performing` | limit/days | map list | unreachable | UNUSED + STALE |
| `AnalyticsService.getConversionFunnel` | GET | `/investments/analytics/conversion-funnel` | days | dynamic map | unreachable | UNUSED + STALE |
| Projects client | CRUD | `/api/v1/projects` | current Project DTOs | Project DTOs | none | MISSING |
| Opportunities client | CRUD/lifecycle | `/api/v1/opportunities` | current Opportunity DTOs | Opportunity/room/capabilities | none | MISSING |
| Contracts client | GET/email/document | `/api/v1/contracts/...` | IDs/email DTO | versioned contract DTOs/files | none | MISSING |
| Funding declarations client | POST/GET/confirm/dispute | `/api/v1/funding-declarations/...` | multipart/current DTOs | funding declaration DTOs | none | MISSING |
| Loan repayment/lifecycle client | POST/GET | `/api/v1/loan-repayments/...`, `/api/v1/loan-lifecycle/...` | current DTOs | obligation/schedule/declaration DTOs | none | MISSING |
| Profit-sharing client | POST/GET | `/api/v1/profit-sharing/...` | current DTOs/multipart | obligation/period/declaration DTOs | none | MISSING |
| Equity client | GET/POST | `/api/v1/equity/...` | current DTOs | positions/cap table/events/dividends/transfers | none | MISSING |
| Notification-center client | GET/POST/DELETE | `/api/v1/user-notifications` | paging/mark-read IDs | notification DTOs | none | MISSING |

## D. Feature inventory

Every row has exactly one feature classification from the requested vocabulary.

| Feature/module | Current screen/page | Current API/model/state | Wired? | Backend match | Classification | Gap and recommended action |
|---|---|---|---:|---:|---:|---|
| App shell | `main.dart`, `MainWrapper` | local state + Provider chat | Yes | No | CONFLICTING | Stabilize compile and choose the active architecture before new features. |
| Login | `AuthScreen` | legacy AuthService; local `logged_in` | Yes | Partial | DEFECTIVE | Preserve response envelope, expiry/role; remove local/demo bypasses. |
| Signup/OTP | `OTPScreen`, `SignupScreen` | Firebase phone + stale sign-up route | Yes | No | DEFECTIVE | Align one server-authoritative signup/verification flow. |
| Logout/session | Profile/settings/main callbacks | local storage/Firebase clear only | Yes | Partial | PARTIAL | Clear all app state consistently; add expired/invalid session handling. |
| Founder authorization | none | no role/capability context | No | No | MISSING | Consume backend role/capability flags; gate route visibility without replacing server authorization. |
| Dashboard | `DashboardScreen` | legacy summary, mock-data adapter, hardcoded counts | Yes | No | CONFLICTING | Replace adapter with `/api/v1/founder/dashboard`; render availability and funding semantics. |
| Projects | none | none | No | No | MISSING | Add typed project repository/state/screens using `/api/v1/projects`. |
| Opportunities | `InvestmentsScreen`, new/detail screens | legacy Investment model/service | Yes | No | LEGACY | Retire after current opportunity UI is implemented; do not map InvestmentId as canonical ID. |
| Negotiation conversations | `EngagementScreen` is demo people; stale unused service | hardcoded `ChatUser` list | No | No | MISSING | Implement `/api/v1/conversation-requests` and `/conversations` with server capabilities. |
| Offers | none | none | No | No | MISSING | Add Offer/OfferVersion/OfferLeg typed models and actions. |
| Participations | `RequestsScreen` resembles requests only visually | in-memory `RequestItem` | No | No | LEGACY | Replace with accepted-offer-native participation views/actions. |
| Contracts | flattened legacy fields in Investment model only | no service/state | No | No | MISSING | Add immutable/versioned contract read, preview/download/email. |
| Funding declarations | funding progress labels only | `currentAmount/targetAmount` | No | No | MISSING | Implement external receipt declaration and investor status; never imply custody/payment. |
| Funding semantics | investment “% funded” | local arithmetic | Yes | No | CONFLICTING | Use committed/declared/awaiting/disputed/confirmed/outstanding from backend verbatim. |
| Loan obligations | legacy loan fields only | no obligation model | No | No | MISSING | Add obligation/schedule read models after funding support. |
| Repayment | legacy repayment date/status fields only | no declaration/allocation model | No | No | MISSING | Implement external repayment declaration, confirmation/dispute, allocation, fully repaid/close. |
| Profit sharing | legacy `profitSharePercentage` only | no lifecycle model | No | No | MISSING | Add only after shared offer/contract/funding foundation. |
| Equity | create form assumes opportunity/investment equity type | legacy fields | Partial UI | No | CONFLICTING | Move type/terms to OfferLeg and later consume position/capitalization lifecycle. |
| Notifications/push | no notification list screen | FCMService + duplicate legacy wrapper | Partial | Partial | PARTIAL | Keep token sync/receipt; add event taxonomy, notification API, deep links, logout token handling. |
| Documents/files | legacy image picker/upload + unused external FileStore | dynamic URLs | Partial | No | DEFECTIVE | Use governed `/api/v1/files/upload` and opportunity/document metadata; validate type/size/visibility. |
| Profile | Profile/EditProfile/verification | typed-but-permissive service DTOs | Yes | Partial | PARTIAL | Fix compile blocker, remove editable server-owned metrics/role/wallet, align validation and capabilities. |
| Settings | theme/language/logout | SharedPreferences | Yes | Mostly local | PARTIAL | Keep local preferences; unify logout/session reset and localize all labels. |
| Trust verification | profile cards and VerificationScreen | TrustService/TrustProfile | Partial | Partial | PARTIAL | Fix route, consume permissions rather than only numeric local ordering. |
| Support | choice/chat/ticket screens | current + stale support routes | Partial | Partial | PARTIAL | Keep current create/send; update close/history; select one support implementation. |
| Founder analytics | unreachable screen | stale URLs, placeholder bearer token | No | No | LEGACY | Retire or rebuild against founder dashboard/approved analytics contract. |
| Credits/score traces | dashboard/trace screens | legacy profile/dashboard + generated data | Yes | Partial | LEGACY | Separate platform credits from investment funding; remove generated production-looking values. |
| Localization/RTL | app-wide locale toggle | JSON lookup + Material delegates | Partial | N/A | PARTIAL | Complete string extraction and locale-aware dates/numbers/currencies. |

## E. Backend alignment and model/DTO findings

### Product graph

The Flutter client has no canonical `Project`, `Opportunity`, negotiation `Conversation`, `Offer`, `OfferLeg`, `Participation`, `Contract`, `FundingDeclaration`, `LoanObligation`, `RepaymentSchedule`, or `RepaymentDeclaration` DTOs. Therefore all current fields, nullability, enums, dates, amount semantics, and capability flags for those models are missing rather than merely misnamed.

### Specific conflicts

| Area | Flutter current state | Backend current state | Severity |
|---|---|---|---:|
| Investment type ownership | `CreateInvestmentRequest.investmentTypeId`; create UI toggles Founding/Equity; detail infers one type | Terms belong to one or more OfferLegs; Loan/Equity/Profit Sharing may be mixed | P1 |
| Canonical IDs | `Investment.id` and `investmentId` drive list/detail/media | Opportunity has its own ID; `LegacyInvestmentId` is optional compatibility only | P1 |
| Opportunity create fields | legacy capital/share/profit/loan fields posted together | Opportunity core describes project/funding target; negotiated financial terms belong to OfferLeg | P1 |
| Funding | UI uses `currentAmount`, `% funded`, `target-current` | committed, declared, awaiting confirmation, disputed, confirmed, outstanding are distinct | P1/data-integrity UX |
| Contracts | dates/status flattened into Investment | accepted offer/version produces immutable/versioned contract with hashes and lifecycle | P1 |
| Loan | repayment dates and completion status flattened into Investment | obligation, schedule/installments, repayment declarations, investor decisions, allocations, lifecycle status | P1 |
| Dashboard | wallet, score, credits, synthetic counts/history | FounderDashboard metrics/projects/opportunities and money availability/approximation | P1 |
| Capability flags | local owner ID equality, trust-level ordering, local status mapping | opportunity room participant context exposes explicit capabilities; lifecycle/permissions are server-authoritative | P1 |
| Dates | unguarded `DateTime.parse` and local display | backend mixes UTC `DateTime` and project `DateOnly`; UI must parse/format deliberately | P2 |
| Amounts | `double`, `$` prefix, integer formatting | backend financial DTOs use decimal, ISO currencies, display currency/approximation metadata | P1 |
| Enums | Founding/Equity integer constants and local status normalization | current enums cover opportunity, funding, moderation, offer legs, obligations, declarations, disputes | P1 |

### Dashboard mismatch

The current backend provides `/api/v1/founder/dashboard` with projects, opportunities, total committed, declared, awaiting confirmation, disputed, confirmed, outstanding, availability flags, display currency, approximate flags, and time series. Flutter instead adapts `/api/dashboard/summary`, profile, credits, and top categories, then hardcodes `numberOfInvestments = 5`, `numberOfPartners = 12`, and `numberOfRequestsAwaiting = 3`. It also generates fallback credit/score series. This screen is wired but materially inaccurate for the Founder product.

## F. Authentication, authorization, and security

### Authentication findings

- Access and refresh token injection/refresh exists in the active `ApiClient`, including a one-retry marker.
- Access token expiry (`expiresAt`) and refresh expiry are not stored or evaluated.
- Startup authentication is `(FirebaseAuth.currentUser != null) || SharedPreferences['logged_in']`; it does not require a valid backend token.
- Refresh failure does not perform a centralized forced logout or clear all cached data.
- 401 gets refresh handling; 403 has no distinct authorization handling or UX.
- No Founder role is checked. Any locally “logged in” user sees Founder navigation; backend remains the only effective guard on calls.
- The clean auth repository does not store tokens from the response and uses stale endpoints; it is not active.
- Signup uses a stale unversioned route.
- Logout clears local storage but has no server-side refresh-token revoke endpoint call (none is currently used by Flutter).

### P0 security findings

1. **Full bearer token disclosure in logs.** `ProfileScreen._logAuthToken()` calls `debugPrint('ProfileScreen opened with token: $token')`. Anyone with log access gets the token.
2. **Tokens stored outside secure storage.** `SecureStorage.write()` always also writes the same key/value to `SharedPreferences`; reads fall back to it. Both access and refresh tokens therefore have an insecure copy.
3. **Bearer tokens can be sent over clear-text or to an arbitrary host.** Default candidates and `NetworkConfig` use HTTP, the login UI accepts a custom base URL, and the active interceptor attaches the bearer token to requests at that base. This creates network interception and credential exfiltration risk.

### P1 security findings

- Social login is a demo bypass: it writes `social-demo-token` and opens the Founder shell without backend authentication.
- Authentication requests log JSON payloads containing phone number and password; support request logs may include user-entered PII/content; FCM payloads are logged.
- The unused GetIt Dio logger is configured with request and response bodies enabled; activating it as-is would log credentials/tokens/PII.
- The legacy Firebase wrapper logs the first 20 characters of the FCM token.
- Profile JSON is persisted wholesale in `SharedPreferences`, potentially including PII.
- Development TLS accepts any certificate in debug mode. It is debug-gated, but combines dangerously with real credentials and should not be part of distributable test builds.
- Local API logs are written to an application file without data classification, redaction, retention, or explicit deletion beyond general preferences/storage handling.
- The app does not unregister the FCM token from backend on logout.

Firebase API keys/config files are expected client identifiers and are not classified as secrets by themselves. The issue is correct platform restriction/configuration and the iOS mismatch noted below.

## G. State management and error handling

### State management

- Global profile/trust: singleton `AppState`, with profile JSON cached in preferences.
- Chat: Provider `ChatController`, optimistic local messages, a pending queue, and FCM-driven changes.
- All other active screens: local `setState` and one-shot futures.
- Clean AuthProvider/SupportProvider: unused.
- Refresh strategy: dashboard listens to any `AppState.notifyListeners`; screens otherwise reload ad hoc. There is no query identity, cache lifetime, cancellation, deduplication, or session-scoped cache clearing contract.
- Optimistic updates exist for support chat and local mock requests; failure handling can leave optimistic messages visible in the main list while also queuing them.
- Business derivation occurs locally in opportunity status mapping, owner equality, trust-level ordering, funding progress, request status, hardcoded counts, and mock histories.

### Error-envelope loss

The current backend is not completely uniform: many endpoints use `{success,message,data,timestamp}`, business endpoints often include `code`/`errors`, and model validation returns field errors. Flutter does not preserve this information consistently.

- `NetworkClient._handleDioError` retains only `message` or `error`; it drops `success`, `code`, `data`, `errors`, status for most failures, and all field-level errors despite having a `ValidationFailure.fieldErrors` type.
- `ApiClient` returns raw Dio errors; each service independently converts them to null/empty list/bool or generic text.
- Dashboard, category, phase, credit, profile, trust, upload, and investment services frequently return null/empty/false, losing backend business explanations.
- Auth displays raw response bodies for some Dio failures (information leakage) but still does not map field validation. `_friendlyError` then replaces many messages with generic credential/network/server messages.
- Support service throws `Exception('Failed ...: status body')`; structured codes and field errors are lost.
- `InvestmentService` catches failures and often returns null, so create/update business validation cannot be rendered by field.
- Many screens show `Error: $e`, “Failed to…”, “Unable to load data”, or nothing at all.

Required foundation: one response/error model that preserves HTTP status plus backend `success`, `code`, `message`, `data`, `errors`, trace/correlation fields, and field validation, with localization rules that do not erase authoritative business messages.

## H. Firebase and notification status

| Capability/event | State | Classification | Finding |
|---|---|---:|---|
| Firebase project config | Android configured; iOS files present | PARTIAL | Android package matches JSON. Xcode bundle is `com.example.flutterDarkApp`, plist bundle is `com.investa58438.flutterdarkapp`, and Dart options use `investa_founder.a010`; iOS config is inconsistent. |
| Permission request | Implemented | IMPLEMENTED | Active FCMService requests permissions. |
| Device token registration | `/api/users/fcm-token` | IMPLEMENTED | Active service syncs after initialization/login. |
| Token refresh | listener + backend sync | IMPLEMENTED | No unregister on logout. |
| Foreground handling | local notification + stream | IMPLEMENTED | Generic channel/title/body. |
| Background/terminated receipt | handlers registered | PARTIAL | Data is logged/emitted; initial-message navigation is not completed. |
| Notification list API | none | MISSING | Backend `/api/v1/user-notifications` is unused. |
| Mark read/delete | none | MISSING | No UI or repository. |
| Deep links/navigation targets | logging/TODO only | MISSING | No navigator key/router integration. |
| Conversation Request | legacy `investment_request` refresh/log only | PARTIAL | Does not open negotiation request. |
| Offer | none | MISSING | No event mapping or destination. |
| Offer Accepted/Rejected | none | MISSING | No event mapping. |
| Funding Declaration | none | MISSING | No event mapping. |
| Funding Confirmation/Dispute | none | MISSING | No event mapping. |
| Repayment Declaration | none | MISSING | No event mapping. |
| Repayment Confirmation/Dispute | none | MISSING | No event mapping. |
| Loan Fully Repaid/Closed | none | MISSING | No event mapping. |

Three overlapping notification abstractions exist: active `FCMService`, unused `FirebaseMessagingService`, and almost-empty legacy `NotificationService`.

## I. Localization and RTL

- EN and AR JSON files each contain 141 keys and have matching key sets.
- `MaterialApp` registers English/Arabic and Flutter localization delegates. Flutter will set overall RTL direction for Arabic through the framework delegates.
- At least 193 direct `Text`, hint, or label literals were found in Dart source; auth, support, verification, opportunity create/detail, analytics, chat, OTP, and error messages remain English-hardcoded. One chat greeting is Arabic-hardcoded.
- Enum/status translations are local/manual and incomplete. Current OfferLeg, funding, obligation, repayment, dispute, profit-sharing, and equity enums are absent.
- Backend business messages are either shown raw (not guaranteed localized) or discarded/replaced. There is no code-to-localized-message policy.
- `RequestsScreen` uses `DateFormat.yMMMd().add_jm()` without an explicit active locale.
- Financial amounts frequently use `double`, `$`, concatenation, and `toStringAsFixed`; `NumberFormat.currency`, ISO currency metadata, Arabic digit/format policy, availability, and approximation flags are not used.
- No explicit RTL layout defect was proven for framework-aware rows, but hardcoded directional padding/alignment and English text require visual RTL QA after the app compiles.

## J. Dead and legacy code inventory

| Item | Classification | Evidence |
|---|---:|---|
| `config/routes.dart` | LEGACY | Placeholder screens; not connected to `MaterialApp`. |
| `core/di/injection_container.dart` and clean auth stack | UNUSED | Initialization is never called; active AuthScreen constructs legacy AuthService. |
| clean support stack | UNUSED | Reachable support path uses legacy screen/controller; it would fail GetIt lookup without initialization. |
| `ConversationsService` | UNUSED + STALE | No import consumer; unversioned negotiation routes and wrong request field. |
| `FirebaseMessagingService` | DUPLICATE + UNUSED | Active app constructs FCMService directly. |
| `SignalRService`/config screen | LEGACY | Stub/no active path; screen says SignalR removed. |
| `FounderAnalyticsScreen`/AnalyticsService | LEGACY | No route; stale endpoints and placeholder bearer string. |
| `FileStoreService` | UNUSED + DEFECTIVE | No consumer; missing EndpointResolver members; bypasses governed backend upload. |
| `RequestsService` | LEGACY | Hardcoded in-memory records and mutations. |
| `EngagementScreen.users` | LEGACY | Four hardcoded users; not negotiation data. |
| `mock_data.dart` | LEGACY | Generates histories/activities and hardcodes dashboard counts. |
| `Investment`/`InvestmentsService`/new investment screens | LEGACY | Compatibility architecture and single investment type. |
| old lookup services | STALE | categories/business stages/project phases target deleted/replaced routes. |
| duplicate DTOs | DUPLICATE | `ChatMessage` exists in multiple locations; conversation/chat DTOs are repeated; CreditTransaction exists in model and services. |
| commented/prototype code | LEGACY | Numerous TODOs/placeholders, removed-SignalR shell, social demo auth, placeholder route screens. |

No legacy code was deleted.

## K. Build, analyze, and test results

### Commands attempted

| Check | Result |
|---|---|
| `flutter --version` | FAILED: `flutter` is not recognized on this host. |
| `flutter pub get` | NOT RUN: same missing Flutter executable. |
| `flutter analyze` | NOT RUN: Flutter/Dart SDK unavailable. |
| `flutter test` | NOT RUN: Flutter/Dart SDK unavailable. |
| platform build | NOT RUN: Flutter SDK unavailable. |

### Source-proven blockers independent of the missing SDK

1. `lib/screens/profile_screen.dart:446-467` contains orphaned named arguments, fields, constructor parameters, and an `@override` outside a valid class declaration. This is a syntax/structure failure in an actively imported screen.
2. `lib/services/file_store_service.dart:20,22` references `EndpointResolver.instance.fileStoreBaseUrl` and `.fileStoreApiKey`; neither member exists.
3. iOS Firebase bundle identifiers are inconsistent across Xcode, plist, and Dart options; an iOS build/configuration would not be reliable even after Dart compilation is repaired.

The repository already contained extensive unrelated modified/untracked backend and portal work. The audit treated the current working tree as authoritative and made no attempt to clean or revert it.

## L. Gap register

| Area | Feature | Current status | Current API | Backend alignment | Problem | Severity | Recommended action | Priority |
|---|---|---:|---|---|---|---:|---|---:|
| Build | Founder source | DEFECTIVE | N/A | N/A | Active profile screen is malformed | P0 | Restore valid checked-in screen structure, then run full verification | 1 |
| Security | Token logging | DEFECTIVE | all authenticated calls | No | Full access token printed | P0 | Remove token logging and rotate any exposed non-test tokens | 1 |
| Security | Token storage | DEFECTIVE | auth | No | Tokens copied to SharedPreferences | P0 | Store tokens only in platform secure storage; migrate/delete insecure copies | 1 |
| Security | Transport/base URL | DEFECTIVE | all | No | HTTP/arbitrary host receives bearer token | P0 | Enforce approved HTTPS origins and environment configuration | 1 |
| Auth | Local/demo authentication | DEFECTIVE | login | No | `logged_in`, Firebase presence, or demo token opens Founder shell | P1 | Make backend session authoritative; remove demo path from production | 1 |
| Architecture | Parallel stacks | CONFLICTING | mixed | No | Active legacy stack plus unused clean stack | P1 | Select one client/state/error foundation and migrate incrementally | 1 |
| Error handling | Backend errors | DEFECTIVE | all | No | codes/errors/field validation discarded | P1 | Implement shared envelope/problem parser | 2 |
| Authorization | Founder/capabilities | MISSING | room/viewer state | No | UI has no role/capability context | P1 | Consume server capabilities and handle 403 distinctly | 2 |
| Dashboard | Founder portfolio | CONFLICTING | legacy dashboard | No | mock/hardcoded metrics and wrong semantics | P1 | Adopt `/api/v1/founder/dashboard` | 3 |
| Projects | CRUD/status | MISSING | none | No | No model/service/screen | P1 | Implement typed Project slice | 4 |
| Opportunities | CRUD/lifecycle | LEGACY | investments compatibility | No | Wrong ID/type/terms ownership | P1 | Implement Opportunity slice; plan legacy retirement | 5 |
| Conversations | negotiation | MISSING | stale unused service | No | Engagement is mock; no requests/actions | P1 | Implement current negotiation endpoints | 6 |
| Offers | versions/legs | MISSING | none | No | Core deal terms unavailable | P1 | Typed offers and mixed OfferLeg editor/viewer | 6 |
| Participation | accepted offer | MISSING | mock Requests | No | No offer-native participation | P1 | Consume backend-created participation/capabilities | 7 |
| Contracts | immutable versions | MISSING | none | No | Cannot view accepted contract | P1 | Add contract viewer/download/preview/email | 7 |
| Funding | external receipt declarations | MISSING | none | No | No declare/confirm/dispute; misleading funded UI | P1 | Build exact external-funds semantics and disclaimers | 8 |
| Loans | obligations/schedules | MISSING | none | No | Full lifecycle absent | P1 | Add read/action flows after funding | 9 |
| Repayment | declaration/confirmation/allocation | MISSING | none | No | Full lifecycle absent | P1 | Add server-driven workflow | 9 |
| Notifications | event/deep link center | PARTIAL | FCM only | Partial | No current taxonomy, list, read state, destinations | P1 | Add typed event registry, router, notification repository | 10 |
| Files | governed documents | DEFECTIVE | legacy/external | No | compile issue and governance bypass | P1 | Use `/api/v1/files/upload` and category policy | 11 |
| Profit sharing | obligations/distributions | MISSING | none | No | Lifecycle absent | P1 | Add after shared contract/funding foundation | 12 |
| Equity | positions/events/dividends | MISSING | legacy create fields | No | Current equity lifecycle absent | P1 | Add after shared contract/funding foundation | 13 |
| Localization | EN/AR/RTL | PARTIAL | N/A | N/A | 193+ hardcoded UI literals, non-localized formatting | P2 | Extract strings and format by locale/currency | 14 |
| Firebase iOS | config | DEFECTIVE | FCM | No | Bundle IDs disagree | P1 | Regenerate/align Firebase platform config | 10 |
| Cleanup | dead services/models/routes | LEGACY | mixed | No | Raises maintenance and accidental-use risk | P3 | Retire only after replacements and tests exist | 14 |

## M. Recommended phased roadmap

This sequence is based on observed reuse opportunities and blockers, not an assumption that every part is absent.

### Sprint 0 — Architecture and build blockers

- Reuse: theme, localization delegate, `EndpointResolver` concept, secure-storage-only implementation from `core`, existing widgets where contract-neutral.
- Fix: malformed profile source, missing file-store members by removing/replacing the unused path, dependency initialization decision, compile/analyze/test baseline.
- Retire later: placeholder router, duplicate client/service stacks, demo auth paths.
- Missing capability: one active architecture and testable composition root.
- Backend dependency: none; freeze against current controller contracts.

### Sprint 1 — Auth/API foundation

- Reuse: active refresh lock/retry ideas, backend login/refresh endpoints, FCM registration.
- Fix: secure storage, HTTPS allowlist, response/error parsing, expiry, 401/403, session clearing, redaction, role context.
- Retire: SharedPreferences token fallback, full-body credential logs, `social-demo-token`, stale clean auth routes.
- Missing capability: server-authoritative session and typed result/error envelopes.
- Backend dependency: confirm refresh-token revocation/logout policy and stable error envelope conventions.

### Sprint 2 — Founder dashboard

- Reuse: dashboard visual components and charts after removing fake data.
- Fix: currency/date formatting and availability states.
- Retire: `mock_data.dart` production fallback, hardcoded counts, legacy investor top-categories.
- Missing capability: `/api/v1/founder/dashboard` DTO/repository/state.
- Backend dependency: stable display-currency query/default and availability semantics.

### Sprint 3 — Projects

- Reuse: form widgets, file picker, category/currency UI primitives.
- Fix: use current project categories/stages and validation errors.
- Retire: old business/project-phase lookup services after migration.
- Missing capability: project list/detail/create/edit/status and capability-aware actions.
- Backend dependency: `/api/v1/projects`, project categories/stages, governed file categories.

### Sprint 4 — Opportunities

- Reuse: investment list/detail visual shells and image UI where suitable.
- Fix: canonical Opportunity ID, project context, lifecycle/funding fields, status/capabilities.
- Retire: `Investment` model and `/api/v1/investments` dependency once parity is proven.
- Missing capability: current Opportunity CRUD, room, media/documents, publish/review actions.
- Backend dependency: `/api/v1/opportunities` DTO stability and lifecycle policies.

### Sprint 5 — Conversations and offers

- Reuse: chat bubbles/composer and notification stream mechanics, not demo data or support-chat endpoints.
- Fix: typed negotiation messages/read state and backend action gating.
- Retire: hardcoded Engagement users and stale `ConversationsService`.
- Missing capability: conversation requests, accept/reject/withdraw/close, ready-to-proceed, offer versions, mixed OfferLegs.
- Backend dependency: NegotiationsController DTOs/capabilities and notification event contracts.

### Sprint 6 — Participation and contracts

- Reuse: request card visuals only after semantic rewrite; file preview/download components.
- Fix: accepted-offer/version identity, immutable terms, currency/amount precision.
- Retire: in-memory RequestsService and flattened contract fields.
- Missing capability: participation views and versioned contract viewer/download/preview/email.
- Backend dependency: offer-native participation and contract endpoints.

### Sprint 7 — Funding

- Reuse: governed file picker/upload and status components.
- Fix: all copy so the platform never implies collection, custody, transfer, escrow, or verification of funds.
- Retire: local “funded = currentAmount” arithmetic.
- Missing capability: founder declaration, proof, investor confirmation/dispute status, committed/declared/confirmed/outstanding views.
- Backend dependency: FundingDeclarationsController and notification codes.

### Sprint 8 — Loan obligations and repayment

- Reuse: generic timeline/status/document components.
- Fix: backend-driven action availability and decimal/date handling.
- Retire: legacy flattened loan fields.
- Missing capability: obligations, schedules, declarations, confirmation/dispute, allocations, fully repaid/default/close.
- Backend dependency: loan obligation query path, repayment/lifecycle endpoints, event codes.

### Sprint 9 — Notifications

- Reuse: active FCMService registration and local notification display.
- Fix: iOS Firebase config, logout unregister policy, payload redaction.
- Retire: duplicate FirebaseMessagingService and empty NotificationService.
- Missing capability: notification list/read/delete, typed event-to-route registry, cold/foreground navigation.
- Backend dependency: canonical event type/payload schema for every deal lifecycle event.

### Sprint 10 — Documents

- Reuse: file picker and preview UI.
- Fix: governed categories, MIME/size validation, entity/project association, visibility/download permissions.
- Retire: direct external FileStore API key client and investment-specific category strings.
- Missing capability: `/api/v1/files/upload` client and opportunity/project document metadata.
- Backend dependency: file category/policy endpoints and authorization rules.

### Sprint 11 — Profit sharing

- Reuse: OfferLeg, contract, funding, timeline, declaration, evidence, and decision components from earlier sprints.
- Fix/retire: legacy percentage-only fields.
- Missing capability: obligations, reporting periods, result declarations, distribution declarations, confirmations/disputes, closure.
- Backend dependency: ProfitSharingController and lifecycle event schema.

### Sprint 12 — Equity

- Reuse: OfferLeg/contract/funding/document/timeline components.
- Fix/retire: opportunity-level equity type and flattened share fields as deal authority.
- Missing capability: positions, ownership/capitalization, corporate events, dividends, transfers, closure.
- Backend dependency: Equity controllers and capability/event schema.

### Sprint 13 — Hardening and UAT

- Reuse: existing widget tests that remain semantically valid.
- Fix: full EN/AR extraction, RTL visual QA, timezone/currency precision, offline/retry behavior, accessibility, deep links, session expiry.
- Retire: remaining mocks, dead duplicate DTOs/services/screens after coverage and migration evidence.
- Missing capability: integration/contract tests across mixed-leg and dispute paths.
- Backend dependency: stable UAT environment, seeded Founder scenarios, notification delivery, representative files.

## Final classification

FLUTTER FOUNDER — AUDIT COMPLETE WITH BLOCKERS
