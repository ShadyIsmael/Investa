# FLUTTER FOUNDER — PREMIUM VISUAL REDESIGN REPORT

Date: 2026-09-20

## A. Why the previous UI felt generic

The Founder shell was functionally organized but visually read as a standard
Material dashboard: repeated bordered cards, title-only app bars, equal-weight
KPI tiles, default progress treatment, and list rows without lifecycle context.
Financial values were present, but they did not feel like a private deal
workspace or a commercial decision room.

## B. New art direction

The reference screens now use a calm, institutional Founder language:

- warm-neutral light canvas and deep purple context surfaces;
- near-black ink, quiet borders, and semantic success/warning/error colors;
- larger contextual headers before operational content;
- dominant financial numbers with tabular numerals;
- grouped metric bands, decision surfaces, timelines, and progressive disclosure;
- restrained motion for progress, navigation, and schedule expansion.

## C. Signature visual motif

The `FounderPathMotif` is a connected four-node deal path representing
Conversation → Offer → Contract → Funding. It is reused in the Home hero,
empty/loading states, contextual headers, and `FounderLifecycleTimeline`.

## D. Purple identity rules

Founder purple is used for identity, focus, current lifecycle stage, and primary
action. It is not used as a universal surface fill and never replaces semantic
status color. The visual tokens were aligned to the Founder direction:
`#6D4AFF`, `#3E276F`, `#17151C`, `#F8F7FA`, `#F2EEFF`, and `#DCD4FF`.

## E. Components created/refined

Implemented in `Flutter_Founder/lib/widgets/founder_ui.dart`:

- `FounderSurface` / visual `FounderCard` compatibility wrapper
- `FounderContextHeader`
- `FounderPathMotif`
- `FounderActionCenter`
- `FounderFundingProgress`
- `FounderLifecycleTimeline`
- `FounderDisclosure`
- branded `FounderEmptyState` and deal-path `FounderLoadingState`
- shared status badges, metric primitives, initials, and progress helpers

## F. Screens redesigned

1. Founder Home
2. Projects
3. Opportunity / Deal Details
4. Deal Details / Offer Review
5. Loan Details inside the Deal funding section

No backend business logic or API contract was changed.

## G. Default Material patterns removed from the reference screens

- title-only AppBars were replaced with contextual headers;
- the default `NavigationBar` was replaced with a restrained proprietary bottom
  navigation treatment;
- reference-screen surfaces no longer render through the default Material Card;
- default `ExpansionTile` schedule/terms presentation was replaced with
  `FounderDisclosure`;
- default `LinearProgressIndicator` was replaced with a custom funding bar;
- repeated list rows now communicate investor, opportunity, stage, and next
  context through lifecycle composition.

## H. Home before/after structural comparison

Before: greeting → attention card → six equal KPI cards → generic progress card
→ project cards.

After: Founder context hero → attention decision surface → dominant committed
capital band with supporting metrics → custom confirmed funding progress →
project context rows. The page now answers what is happening, what needs
attention, and where capital sits in its lifecycle.

## I. Projects redesign

Projects now read as strategic business entities. Each project has an indexed
identity block, lifecycle status, opportunity activity, custom funding signal,
committed/confirmed values, and an explicit view action. The screen begins with
a context header and avoids a title-plus-arrow list pattern.

## J. Opportunity redesign

Opportunity context is represented by the Deal Details reference screen. Its
header establishes the opportunity and counterparty before messages, offer,
participation, contract, and funding content. Funding uses the shared custom
financial progress language and preserves the authoritative lifecycle values.

## K. Deal / Offer redesign

Deals now display investor identity, opportunity, lifecycle position, status,
unread context, and recency. Offer review is composed as a decision room: offer
version/status header, commercial summary, investment legs, terms, history, and
a visually separated Accept / Respond / Reject action area.

## L. Loan redesign

Loan content is organized around obligation status, outstanding amount,
confirmed repayments, next due amount/date, a compact mobile repayment schedule,
repayment declaration history, and the contextual Record Repayment action.
Schedule rows are operational financial rows rather than a spreadsheet or
default expansion list.

## M. Arabic / RTL visual QA

The design system continues to use Noto Sans and directional layout guidance,
and the new components avoid hardcoded left/right layout decisions. Source
localization remains in English/Arabic parity for the existing lifecycle
surface.

A complete live Arabic/RTL emulator pass was not completed because the emulator
package manager entered `DEAD_OBJECT` state before the new APK could be
installed. This remains an explicit verification gap.

## N. Dark mode

The Founder dark palette remains deliberate rather than inverted: deep canvas,
elevated purple surfaces, dark borders, readable dark-primary actions, and
semantic status surfaces are preserved by the shared components.

## O. Accessibility

Interactive surfaces retain semantic button labels, selected navigation state,
48 px-or-greater navigation/action targets, icon-plus-text status meaning, and
text hierarchy that remains meaningful without color alone.

## P. Analyze

`flutter analyze --no-pub` completed with zero compile errors. The repository
still reports 118 warnings/info items, mostly existing legacy/deprecation/style
issues; the redesigned files contribute no analyzer errors.

## Q. Tests

`flutter test test/deal_flow_models_test.dart --no-pub` passed all 3 tests:

- offer parsing and commercial legs;
- room participation/contract parsing;
- mixed funding allocation and loan lifecycle parsing.

## R. APK build

Debug APK built successfully with isolated Gradle:

- Path: `Flutter_Founder/build/app/outputs/flutter-apk/app-debug.apk`
- Size: 169,925,124 bytes
- SHA-256: `14724686416BE441E62FE09CC953AEF672D2E51F6302ACF8B3CB2AE2B0B92BCA`

## S. Emulator visual verification

Not completed for the redesigned build. `adb install` pushed the APK but the
emulator package service returned `Broken pipe (32)`; after reboot,
`system_server` remained a zombie and `dumpsys package` returned `DEAD_OBJECT`.
Therefore no screenshot or live visual claim is made for this build.

## T. Remaining generic / legacy screens

Profile, authentication, support, legacy Requests/Investments, analytics, and
some form/sheet surfaces remain outside the five-screen reference pass. They
should inherit the new component language in the next propagation phase after
the reference screens are visually approved on a healthy emulator.

## FINAL CLASSIFICATION

**FLUTTER FOUNDER VISUAL IDENTITY — IMPLEMENTED WITH GAPS**
