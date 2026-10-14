# FOPX Mobile Design System

Status: Founder V2 phase 0.1 foundation hardening

## Shared principles

FOPX Mobile is composition-led, calm, and operational. Visual hierarchy comes from typography, spacing, grouping, and controlled color before decorative containers. Meaningful objects may use surfaces; repeated card stacks and generic dashboard tiles are not the default language.

Default Material visual output is not acceptable. Material widgets may provide accessibility and interaction mechanics internally, but the visible identity comes from the FOPX shell, semantic tokens, custom navigation states, contextual headers, purposeful surfaces, and restrained motion.

## Shared primitives vs persona styling

`fopx_ui` contains persona-aware primitives: `FopxButton`, `FopxTextField`, `FopxSurface`, `FopxStatusBadge`, `FopxAvatar`, `FopxEmptyState`, `FopxErrorState`, `FopxLoadingState`, `FopxFinancialValue`, `FopxLifecycleTimeline`, and `FopxNotificationBell`. These consume the active theme and do not encode Founder purple as a generic widget assumption.

Founder composition supplies the Founder persona tokens. A future Partner app may supply a different persona palette and its own screen composition while continuing to use the same shared primitive contracts.

## Founder identity

Founder uses purple/violet strategically:

- Primary: `#6D4AFF`
- Deep purple: `#3E276F`
- Ink: `#17151C`
- Warm neutral canvas: `#F8F7FA`
- Soft purple: `#F2EEFF`
- Muted lavender: `#DCD4FF`

Purple identifies the product, focus, selected state, key action, and lifecycle emphasis. Neutral surfaces and strong ink typography carry most of the interface so purple remains meaningful.

## Type and rhythm

The system uses a compact display scale for page identity, a 21px title level for contextual chrome, and readable 14–16px body levels. English uses the explicit `Aptos` family with bundled `NotoNaskhArabic`, then `Segoe UI`, `Tahoma`, `Arial`, and `sans-serif` fallbacks. Bundling the Arabic face makes browser and mobile rendering deterministic while preserving the platform fallback stack.

Canonical spacing is `xxs=2`, `xs=4`, `sm=8`, `md=12`, `lg=16`, `xl=24`, `xxl=32`, `pageGutter=22`, `compactPageGutter=16`, `controlGap=12`, `formGap=16`, `sectionGap=24`, `largeSectionGap=32`, and `surfacePadding=20`. Typography is `displaySmall=36/1.05`, `headlineMedium=28/1.10`, `titleLarge=21/1.20`, `titleMedium=16/1.25`, `bodyLarge=16/1.45`, `bodyMedium=14/1.40`, `bodySmall=12/1.35`, `labelLarge=14/1.10`, and `labelMedium=12/1.15`. Financial hero/value/supporting styles are `32/1.05`, `24/1.10`, and `12/1.20`. Touch targets are at least 48px.

## Surfaces, buttons, and inputs

Surfaces are quiet, high-contrast groups with `control=18`, `surface=24`, `feature=30`, `modal=30`, and `pill=999` radii. Buttons use `primary`, `secondary`, `tertiary`, and `destructive` variants, a 48px minimum target, focus/pressed/disabled/busy semantics, press-scale feedback, and an intentional purple action field. Inputs expose helper, error, enabled, read-only, prefix, suffix, and keyboard contracts. Loading replaces the button label without shifting layout. Inputs use floating labels, generous vertical padding, directional-safe alignment, and distinct enabled/focused/error borders.

The state matrix is explicit: enabled = full contrast and action affordance; pressed = 0.985 scale; focused = primary outline; disabled = muted fill/text and no action; busy = stable layout with progress; success/error = semantic color plus text/icon; unavailable = explicit copy such as `Unavailable`, never a fabricated value. Semantic colors are exposed through `FopxSemanticColors`: success, warning, error, info, neutral, and current. Light and dark palettes have separate background, surface, elevated-surface, primary, secondary text, border, divider, disabled, and lifecycle values.

### Phone and country-code contract

Phone identity is owned by the backend authentication contract. The current login endpoint is `POST /api/v1/auth/login` with `LoginDto.PhoneNumber`; the backend normalizes to an E.164-like value with a leading `+`, and the current Egyptian default is `+20`. The public `GET /api/v1/countries` endpoint is the runtime country-master source; the mobile client keeps the current seeded country list as an offline fallback only.

`FopxCountryCodeSelector` and `FopxPhoneField` live in `fopx_ui` and consume the active theme rather than Founder-specific colors. `FopxPhoneNormalizer` lives in `fopx_core` and is the single client normalization path. It handles local trunk prefixes, `+`/`00` international input, spaces and separators, full international pastes, and accidental duplicate dialing codes. A full international paste may update the effective country when its prefix matches an active backend country; ambiguous or unsupported prefixes remain controlled validation errors.

The visible local number is never stored as a preference and is not sent directly. Login submits only the normalized `phoneNumber` value expected by the backend. The phone digits render with LTR numeric direction inside both EN/LTR and AR/RTL layouts, while the country selector, country names, search sheet, labels, and semantics follow the active locale and direction. The selector announces country name plus calling code, supports keyboard activation, provides a searchable sheet, and preserves a 48px touch target.

## Status and lifecycle

Status uses color plus label and a dot; color is never the only signal. Financial values preserve the explicit currency code. `FopxLifecycleTimeline` reserves emphasis for the current step and visually de-emphasizes upcoming steps.

## Financial numerals and future chart contract

Financial hero, value, and supporting styles request the OpenType `tnum` feature through `FontFeature.tabularFigures()`. This gives aligned financial columns when the active face supports tabular figures. If the selected face does not expose `tnum` (including an Arabic fallback), Flutter keeps that face's normal numeral widths; the UI does not synthesize or claim alignment. Currency codes remain explicit, locale formatting remains authoritative, and no FX conversion is performed by the formatter.

Charts are intentionally not implemented in foundation. Future chart widgets must consume the `FopxChartColors` semantic roles below rather than feature-specific colors:

| Role | Light | Dark | Usage |
| --- | --- | --- | --- |
| `text` | `#67616F` | `#BDB5C8` | Chart labels and value annotations |
| `axis` | `#E3DFE9` | `#3B3344` | Axis lines and ticks |
| `grid` | `#EDEAF1` | `#332C3B` | Grid lines; subordinate to axes |
| `primarySeries` | `#6D4AFF` | `#B7A6FF` | Primary measure |
| `secondarySeries` | `#3E276F` | `#8F76F5` | Comparison measure |
| `neutralSeries` | `#67616F` | `#BDB5C8` | Context or baseline series |
| `positive` | `#197A58` | `#6FD0A7` | Positive/success meaning |
| `warning` | `#9A6400` | `#F2BF64` | Warning meaning |
| `negative` | `#B6404E` | `#FF8692` | Negative/error meaning |
| `selected` | `#6D4AFF` | `#B7A6FF` | Selected/highlighted datum |
| `tooltip` | `#FFFFFF` | `#25202C` | Tooltip surface |
| `legend` | `#17151C` | `#F5F2FA` | Legend labels |
| `unavailable` | `#9B95A4` | `#777080` | Empty/unavailable chart state |

Chart implementations must preserve readable text in both themes, keep selected data distinguishable without relying only on color, use `AlignmentDirectional`/RTL-aware ordering, and show a clear empty or unavailable state instead of an empty frame.

## Motion

Motion is short, stateful, and interruptible. Canonical durations are `fast=120ms`, `standard=220ms`, and `emphasized=360ms`, using ease-out cubic for control feedback and ease-in-out cubic for emphasized transitions. Navigation uses a restrained platform transition, selected navigation uses a soft container/scale change, notification badges use scale/fade, loading uses a calm shimmer, and button feedback uses a small press scale. `FopxMotion.duration` resolves durations to zero when `MediaQuery.disableAnimations` is active; loading becomes static as well. Avoid bounce, crypto-style effects, blocking transitions, and movement without a hierarchy or feedback purpose.

## Navigation and top chrome

The Founder shell has a custom top chrome with brand mark, contextual page identity, notification bell, and account affordance. Bottom navigation is a four-item custom bar: Home, Projects, Deals, Chat. Notifications are never a bottom tab. Profile is never a bottom tab.

## Notification bell

The bell has a minimum 48px target, an accessible label, an optional unread count, and an animated badge change. A null count is represented as unavailable, not as a fabricated zero or fake notification list. Bell activation opens Notification Center.

## Loading, empty, and error states

Loading is branded and quiet. Empty states use an icon, title, and explanatory body with enough whitespace to feel intentional. Error states preserve the backend's authoritative message and expose a retry action when available. Screens must not show fake production-looking Projects, Deals, or Conversations.

Feedback contracts are shared through `FopxInlineFeedback`, `FopxFeedback.showSnackBar`, `FopxFeedback.showConfirmDialog`, and `showFopxBottomSheet`. Dialogs and sheets use the same modal radius, surface, spacing, and action hierarchy as the rest of the system.

## EN / AR / RTL

All foundation copy is localized. Use `AlignmentDirectional`, `EdgeInsetsDirectional`, `PositionedDirectional`, and semantic ordering instead of left/right assumptions. Arabic is a designed composition: brand and icons remain legible, page titles reflow, the bell and profile relationship stays balanced, and navigation labels remain readable rather than simply mirrored.

## Accessibility

Use semantic labels for navigation, profile, notification count, and lifecycle status. Keep contrast strong, preserve scalable text, provide minimum touch targets, announce selected navigation state, and pair notification meaning with text/semantics rather than color alone.

The notification contract is explicit: `null` count means “unread count unavailable”, zero has no badge, 1–9 display directly, and 10+ displays `10+`. `tool/foundation_showcase.dart` is the development-only gallery for checking light/dark, EN/AR/RTL, compact widths, control states, operational states, and reduced-motion behavior. It is not a production route and contains no production data.
