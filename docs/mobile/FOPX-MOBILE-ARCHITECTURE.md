# FOPX Mobile Architecture

Status: Founder V2 phase 0.1 foundation hardening

## Founder first, Partner deferred

`Flutter_Founder` is a clean V2 application. The previous Founder application is preserved on the `Flutter_Founder_Legacy_20260921` Git branch and is not an architectural dependency of this foundation. Partner Mobile is intentionally deferred. Shared primitives and technical services are kept in `packages/fopx_core` and `packages/fopx_ui` so a future Partner app can consume them without inheriting Founder screens or persona styling.

## Repository shape

```text
Flutter_Founder/
  lib/
    app/                 shell, bootstrap, routing, locale state
    features/            phase-0 route shells by product area
  test/
packages/
  fopx_core/             API, auth, secure session, formatting, locale, Firebase
  fopx_ui/               persona-aware reusable visual primitives
docs/mobile/
```

The packages remain intentionally small. Shared behavior belongs in `fopx_core`; shared visual behavior belongs in `fopx_ui`; persona-specific composition stays in the app.

`fopx_ui` owns the visual contracts in `theme/fopx_tokens.dart`, `theme/persona_tokens.dart`, and the shared widgets. The token layer is the boundary for spacing, radii, typography, semantic colors, motion, icon sizes, reduced-motion behavior, financial display styles, and component state behavior. The app owns composition and route-specific copy; feature screens do not duplicate token values.

## Current product model

The future product graph is Project → Opportunity → Conversation → Offer → Offer Version / OfferLeg → Accepted Offer → Participation → Contract → Funding Declaration → Investor Confirmation → Investment Lifecycle. Lifecycle variants such as Loan, Equity, Profit Sharing, and Mixed-Leg belong to OfferLeg and later agreement/lifecycle models. There is no canonical V2 `Investment` aggregate and no `investmentTypeId` on Opportunity.

Chat is the negotiation workspace: conversation, messages, offers, counter-offers, versions, decisions, and negotiation history. A Deal is the current accepted commercial relationship: participation, contract, funding declarations, repayment or profit-sharing lifecycle, documents, activity, and status. A future accepted Chat can link to its active Deal; a Deal is never another chat screen.

## State and networking

- Riverpod is the single state/dependency composition approach.
- Local ephemeral state stays in widgets; backend-authoritative lifecycle state belongs to server state providers when business features arrive.
- Dio is the only HTTP stack.
- `FopxApiClient` injects bearer credentials from secure storage, applies timeouts and cancellation, parses the backend error envelope, refreshes a 401 once with concurrency coalescing, retries the original request once, and passes 403 through as a controlled error.
- Access and refresh tokens are stored only in `flutter_secure_storage`. Preferences are reserved for non-sensitive settings such as language.
- No token, password, or sensitive request body is logged.

## Authentication

Any valid authenticated FOPX account may enter Founder Mobile. The app does not gate entry on Founder role, Investor role, ClientType, or a combined role check. Backend authorization remains authoritative per resource/action. A failed refresh clears the secure session and returns to Login. A 403 does not log the user out.

## Routing and deep links

`go_router` owns the route graph. Phase 0 includes `/login`, `/home`, `/projects`, `/deals`, `/chat`, `/notifications`, and `/profile`. The shell owns exactly four destinations: Home, Projects, Deals, Chat. Notifications and Profile are secondary routes opened from top chrome. Future entity routes can be added beside the shell without changing the primary navigation contract: Project, Opportunity, Conversation, Offer, Deal, Contract, Funding, Loan, and Repayment.

## Shared features

Profile, Chat, Notifications, Documents, Offer Viewer, Offer Builder, and Contract Viewer should share data contracts and primitives while allowing Founder and Partner to have different persona experiences. For example, `FopxOfferSummary` may be shared while Founder and Partner decision experiences remain app-specific.

## Notifications and Firebase

`FopxNotificationBell` supports an optional unread count and an accessible deep-link entry to Notification Center. Null means unavailable; the UI never fabricates unread notifications. Firebase Messaging initialization, permission, token retrieval, refresh lifecycle, and the future navigation integration point live in `FirebaseFoundation`. Business event taxonomy and SignalR are out of scope for phase 0. Notification payloads must eventually resolve to exact targets such as Funding Declaration, Offer, Conversation, Deal, Repayment, or Contract rather than routing every event to Home.

## Localization and formatting

English and Arabic are available from the first screen. Locale state is persisted as a non-sensitive preference; `Directionality` follows the active locale. Foundation layouts use directional alignment and spacing. Dates, times, numbers, and currency belong to `FopxFormatters`. Currency formatting always requires an explicit currency code; FOPX never silently converts or adds EGP, USD, or EUR.

`FopxFormatters.formatCurrency` preserves null as an unavailable value and supports an explicit approximate marker. No FX conversion, inferred currency, or default financial amount is permitted. The showcase uses an unavailable financial state to verify this rule without inventing product data.

## Financial semantics

FOPX One does not collect, hold, transfer, escrow, or verify investment funds. Future funding and repayment UI represents declarations and confirmations of transactions occurring outside FOPX. The mobile architecture must not introduce Wallet, Pay, Transfer, Escrow Balance, or an FOPX-held balance concept.

## Phase-0 boundary

Home is a shell only. Projects, Deals, and Chat are route shells only. There is no dashboard, CRUD workflow, fake production data, offer workflow, funding, contract, document, profile business UI, or Partner app in this phase.

## Phase-0.1 verification boundary

The hardening pass adds focused contract tests for semantic theme tokens, English/Arabic font fallback metadata, explicit currency/unavailable formatting, notification overflow semantics, RTL localization, and reduced motion. Runtime visual evidence is collected from the development-only showcase when a web target is available. Android APK verification remains dependent on the host's Android SDK/Gradle file-lock and NDK state; a generated APK is not treated as a clean build unless the Flutter command exits successfully.
