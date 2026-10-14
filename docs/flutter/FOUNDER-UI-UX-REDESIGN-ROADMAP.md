# FOPX One Founder UI/UX Redesign Roadmap

Status: Phase 1 foundation and first controlled implementation slice complete

## Navigation and screen inventory

| Current screen | Future screen | Action | Priority | Dependencies | Phase |
|---|---|---|---|---|---|
| Dashboard | Home / Founder dashboard | Replace mock and wallet metrics with authoritative dashboard read model | P0 | `GET /api/v1/founder/dashboard` | 1 |
| Investments | Projects | Retire legacy investment list; render Founder-owned Projects and Opportunities | P0 | Project/opportunity read models | 1–2 |
| Engagement | Deals / Conversations | Replace static chat list with authenticated negotiation inbox | P0 | Negotiations endpoints and offer DTOs | 1–2 |
| Requests | Pending actions / workflow inbox | Map to backend actionability projection; no generic request semantics | P0 | Pending action projection | 3 |
| Investment info | Opportunity / Deal detail | Rebuild around Opportunity, OfferLeg, Participation, Contract | P0 | Detail endpoints and capability flags | 3 |
| New investment | Create Project / Opportunity | Retire until Founder create flow is aligned to current domain | P0 | Project/opportunity write contract | 4 |
| Founder analytics | Portfolio reporting | Replace or retire; no synthetic analytics or unsupported earnings | P1 | Authoritative reporting/earnings source | 5 |
| Profile | Founder profile / settings | Keep profile foundation, remove legacy investment entry points | P1 | Profile/trust contracts | 4 |
| Activities | Activity timeline | Reuse pattern inside Project/Deal/Contract detail | P1 | Activity read model | 3–4 |
| Support screens | Support | Reuse with new shell and theme | P2 | None beyond existing support stack | 5 |

## Implemented in this slice

| Area | Result | Backend dependency |
|---|---|---|
| Theme | Purple Founder tokens, light/dark surfaces, semantic colors, Noto Sans typography | None |
| Components | Cards, section headers, metrics, status badges, loading and empty/error states | None |
| Shell | Home, Projects, Deals, Notifications, Profile | None |
| Home | Attention-first dashboard, portfolio metrics, progress, project preview | `GET /api/v1/founder/dashboard` |
| Projects | Project list and mobile detail sheet with Opportunity summaries | Same dashboard read model; detail tabs still a gap |
| Deals | Authenticated conversation/request inbox and message detail | Negotiation endpoints |
| Notifications | Authenticated notification inbox, read/read-all actions, action URL visibility | Notifications endpoints |
| Localization | New shell/dashboard/deal/notification copy in EN and AR | None |

## Controlled implementation order

1. Design tokens and reusable primitives — complete.
2. App shell and navigation — complete for the new primary IA.
3. Home dashboard — complete against the backend read model; pending action
   detail is still a backend projection gap.
4. Projects and Opportunities — project summary is implemented; full
   Opportunity detail and lifecycle actions are next.
5. Conversations and Offers — inbox/message context is implemented; offer
   history and capability-driven accept/respond/reject UI are next.
6. Deal / Participation / Contract — next high-priority slice.
7. Funding Declaration and Investor Confirmation — implement only against
   existing canonical endpoints and external-funding semantics.
8. Loan / Repayment — implement principal/interest/schedule/confirmation flow.
9. Notifications deep-link routing — action URLs must resolve to exact target
   screens, not Home.
10. Profile cleanup, Profit Sharing, Equity — reuse the same token/component
    system and backend-authoritative lifecycle rules.

## Backend gaps discovered

- Dashboard returns a pending action count, not a typed actionable item list;
  Home cannot yet deep-link each pending action without client-side inference.
- Detailed Founder-scoped Project tabs for People, Documents, and Activity are
  not in the dashboard read model.
- Negotiation offer endpoints expose the data and capability flags, but the new
  Founder UI has not yet added Offer Review actions.
- Notification `ActionUrl` is preserved but app routing/deep-link resolution is
  still to be implemented.
- The backend explicitly reports realized earnings as unavailable and
  followers as deferred; the UI must keep those states unavailable.
- Funding received is platform-recorded and must not be described as bank
  settlement or independently verified receipt.

## UX gaps to address next

- Provide an exact Pending Actions list with context, due state, and deep link.
- Add Conversation → Offer history → Current Offer as one decision surface.
- Add capability-driven Offer Review actions: Accept, Respond/Counter, Reject,
  Withdraw only when backend flags allow them.
- Build Deal detail around accepted Offer, Participation, Contract, Funding,
  Documents, and Activity.
- Add Project detail tabs without overloading the first screen.
- Remove legacy investment creation and wallet/balance affordances from Profile
  and secondary screens.
- Exercise small-phone, Arabic RTL, text scaling, dark mode, offline, and
  forbidden states in runtime QA.

## Acceptance gates

- `flutter analyze` has no new errors.
- `flutter test` passes with tests aligned to the new shell and read models.
- `flutter build apk --debug` succeeds.
- Runtime inspection verifies no overflow, no mock business values, no wallet
  semantics, and correct EN/AR/RTL behavior.
