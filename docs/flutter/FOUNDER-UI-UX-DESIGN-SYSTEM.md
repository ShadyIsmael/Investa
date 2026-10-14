# FOPX One Founder UI/UX Design System

Status: Premium visual identity implemented for the five Founder reference screens in `Flutter_Founder`

## FOUNDER VISUAL LANGUAGE

Founder is a private deal-management workspace for a person building and
funding businesses. The visual direction is premium, calm, strategic,
institutional, and data-led. It is intentionally distinct from a generic
Material dashboard or a crypto/​​neon fintech product.

### Art direction

Use warm-neutral surfaces, deep institutional purple, near-black ink, quiet
borders, and restrained semantic colors. Purple is a signal of Founder
identity, focus, and action; it is not a background paint or a substitute for
status colors. Information should feel composed like a decision room: a
contextual header first, a clear financial hierarchy second, and progressive
disclosure for operational detail.

### Signature motif: the Founder deal path

The reusable Founder motif is a connected path of four nodes. It represents
capital moving through conversation, offer, contract, and funding. The motif is
implemented by `FounderPathMotif` and appears in the Home hero, contextual
headers, empty/loading states, and lifecycle timelines. Keep it subtle and
structured; it is a product signature, not decoration.

### Surface hierarchy

Avoid a repeated stack of identical cards. Use edge-to-edge contextual headers,
metric bands, meaningful object surfaces, compact rows, lifecycle timelines,
and disclosure panels. A surface should represent a meaningful object or
decision. Supporting metadata belongs in grouped rows or inline clusters.

### Metric and financial hierarchy

Financial values use tabular numerals, explicit currency codes, and a clear
label/value relationship. Prefer `FounderFundingProgress`, metric bands, and
financial pairs over ordinary text rows. The required hierarchy is:

`Target → Committed → Declared → Confirmed → Outstanding`

### Lifecycle visual language

Use `FounderLifecycleTimeline` for deal progression and `FounderDisclosure` for
history, schedule, and terms. Current stage is purple and completed stages use
the same path language with a check; future stages remain quiet. A lifecycle
screen should make the next decision or action obvious in three seconds.

### Interaction principles

Primary actions are contextual and deliberate. Secondary, quiet, and
destructive actions must not share the same filled treatment. Use calm motion
for selection, disclosure, progress, and navigation. Every interactive object
has a minimum 48 px touch target and a semantic label.

### What not to do

Do not use generic dashboard KPI grids, default ListTile/Card/ExpansionTile
compositions, title-only AppBars, default progress bars for financial meaning,
or purple as a universal fill. Do not turn Founder into a social feed,
neon-fintech surface, or spreadsheet squeezed onto a phone.

**Using default Material visual styling without Founder-specific composition is
not acceptable for production Founder screens.**

This is the source of truth for Founder-facing Flutter work. It describes the
visual language and interaction rules for the current Deal & Transparency
Platform lifecycle:

`Project → Opportunity → Conversation → Offer → Offer Version / OfferLeg → Participation → Contract → Funding Declaration → Investor Confirmation → Investment Lifecycle`

The Founder app must not use the old `Investment`, `Requests`, `Engagement`,
`Wallet`, or payment-transfer vocabulary as the organizing model.

## Founder brand identity

Founder is the purple/violet product identity within FOPX One. The visual tone
is premium, institutional, calm, and data-led. Purple is reserved for Founder
identity and primary actions; status meaning is carried by text and icons as
well as color.

Tokens live in `Flutter_Founder/lib/theme/founder_design_system.dart` and are
consumed by `Flutter_Founder/lib/theme/app_theme.dart`.

## Color tokens

| Role | Light | Dark / usage |
|---|---|---|
| Primary | `#6D4AFF` | `#B6A4FF` in dark mode |
| Primary strong | `#4C2FBF` | Deep purple action/context color |
| Deep | `#34206D` | Hero/background anchor only |
| Soft surface | `#F3EFFF` | Selected, pending, or Founder-tinted surface |
| Canvas | `#F8F6FF` | Light app background |
| Ink | `#211B35` | Primary light-mode text |
| Muted | `#6D6780` | Supporting text |
| Border | `#E7E1F4` | Quiet structural boundary |
| Success | `#147A5B` | Confirmed/complete |
| Warning | `#946B00` | Pending/outstanding |
| Danger | `#B42318` | Rejected/disputed/error |
| Info | `#2B61A8` | Informational context |

Do not use wallet, balance, pay, receive money, transfer, escrow, or platform
balance labels. Use `Committed`, `Declared Received`, `Confirmed Received`, and
`Outstanding`. A funding declaration is a Founder declaration of an external
transaction; it is not a platform settlement confirmation.

## Typography

The default family is Noto Sans through `FounderTypography`, which preserves a
professional hierarchy in both English and Arabic. Numeric values receive the
largest emphasis in financial components.

| Level | Guidance |
|---|---|
| Page title | 24 px, bold |
| Section title | 18 px, bold |
| Primary metric | 18–24 px, bold |
| Body | 15 px, 1.45 line height |
| Supporting text | 13 px, muted |
| Caption/status | 11–13 px, semibold |

Do not make a financial label visually compete with its amount.

## Spacing, radius, and elevation

Spacing tokens are 4, 8, 12, 16, 20, 24, and 32 px. Use 16 px as the default
card inset, 24 px as screen horizontal padding, and 32 px between major
sections. Use 10 px for small controls, 14 px for inputs/buttons, and 18 px for
cards and sheets.

Elevation is intentionally quiet. Prefer a 1 px border and surface contrast;
use a small shadow only when it materially separates a floating control.

## Components

Reusable components currently live in
`Flutter_Founder/lib/widgets/founder_ui.dart`:

- `FounderCard` — consistent bordered surface with optional tap behavior.
- `FounderSectionHeader` — title/supporting copy/trailing action hierarchy.
- `FounderMetric` — icon, primary value, label, and optional supporting state.
- `FounderStatusBadge` — neutral/info/success/warning/danger tone with text.
- `FounderEmptyState` — intentional empty, retry, and unavailable state.
- `FounderLoadingState` — compact, centered loading state.

New screens should compose these primitives instead of adding local card,
badge, spacing, or error styles.

## Navigation

Primary Founder navigation is limited to five destinations:

1. Home — attention first, then portfolio snapshot.
2. Projects — projects owned by the Founder and their Opportunities.
3. Deals — Conversations, Offer context, and later active deal views.
4. Notifications — actionable event inbox with deep-link metadata.
5. Profile — account, trust, language, theme, security, and support.

Legacy `Requests`, `Investments`, and `Engagement` are not primary navigation
concepts. Their workflows are mapped in the roadmap and may remain temporarily
reachable while backend-backed replacements are completed.

## Financial metrics

The Home dashboard uses `GET /api/v1/founder/dashboard` only. It displays:

- Total Projects
- Active Opportunities
- Total Committed
- Confirmed Received
- Outstanding
- Active Investors
- Funding progress
- Pending action count

The client preserves unavailable and approximate money states. It does not
sum unlike currencies, infer earnings, derive followers from favorites, or
create mock values.

## Forms, dialogs, and bottom sheets

Forms use the centralized input theme, 48 px minimum action height, explicit
field labels, and backend validation messages. Destructive actions are
secondary and require a confirmation dialog. Mobile detail flows use a
bottom sheet only when the user is reviewing context, not when a task requires
long-form editing.

Future funding and repayment forms must use:

- Declare External Funding Received
- Amount, Received Date, Method, External Reference, optional Proof
- Pending Investor Confirmation / Confirmed / Disputed
- Record Repayment with backend FIFO allocation when that capability is
  authoritative

The UI must never imply custody, escrow, transfer, or settlement verification.

## Loading, empty, error, offline, and forbidden states

Every primary read screen must have an explicit state. A blank screen is not a
valid state. Preserve the backend business reason when it is available; do not
collapse all business failures into `Something went wrong`.

- Loading: `FounderLoadingState` or a screen-specific skeleton.
- Empty: explain what will appear and why it is currently empty.
- Error/offline: show the failed purpose and offer retry.
- Forbidden: preserve authorization semantics; do not treat 403 as expiry.
- No actions: show a calm completed state, not an error.

## RTL and localization rules

- Use `AppLocalizations.t(key)` and keep English/Arabic keys in parity.
- Use `EdgeInsetsDirectional`, `AlignmentDirectional`, and start/end alignment
  for new work.
- Do not hardcode left/right chevrons or text alignment.
- Keep currency code and amount as a single semantic value; do not split a
  bidirectional financial value into unrelated text fragments.
- Test Arabic with long labels, mixed Arabic/English project names, dates, and
  numeric values.
- Navigation icons must communicate the same direction in RTL; use Flutter's
  directional icons where available.

## Accessibility rules

- Minimum touch target: 48 × 48 px.
- Status meaning must be conveyed by label/icon, not color alone.
- Interactive cards and notifications expose a semantic label.
- Keep text scalable; do not use fixed-height text containers.
- Preserve focus order in forms and dialogs.
- Purple text on a light surface uses the strong purple or dark ink token;
  light purple is a surface tint only.

## Motion

Use motion for navigation, loading feedback, refresh, and bottom-sheet
transitions. Avoid decorative gradients, celebration animations, or motion that
competes with financial decisions.
