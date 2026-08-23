# Project / Funding Opportunity Redesign

**Status:** Phases 1–7 fully implemented.
**Canonical business chain:** `Project -> Opportunity -> Participation -> Contract`

## Implementation status

- Phase 0 architecture audit: complete.
- Phase 1 Project Foundation: complete; see [Project Foundation Phase 1](./project-foundation-phase-1.md).
- Phases 2–7: implemented. See [Phase 2](./project-opportunity-separation-phase-2.md), [Phase 3](./multiple-opportunities-phase-3.md), [Phase 4](./repeat-investment-phase-4.md), [Phase 5](./project-opportunity-lifecycle-phase-5.md), [Phase 6](./opportunity-obligation-completion-phase-6.md), [Phase 7](./project-room-redesign-phase-7.md).

Phase 4 keeps Opportunity as the public/funding aggregate, enables multiple ordered Opportunities per Project, and permits append-only repeat investment with a distinct contract per approved Participation. It does not implement lifecycle separation or a Project-scoped Project Room.

## 1. Purpose and non-negotiable rules

This redesign separates a long-lived business from each time-bounded fundraising opportunity it runs.

- A **Project** is the durable business, venture, or operating initiative.
- A **Funding Opportunity** is one fundraising round. `Opportunity` remains the compatibility name during migration.
- One Project may have zero, one, or many Funding Opportunitys.
- A **Participation** is one immutable investor commitment/submission to one opportunity.
- An investor may create another Participation in the same opportunity while that opportunity accepts investments. A prior approved Participation must not be reused or mutated.
- Once a opportunity is closed, the business can raise again only through a new opportunity.
- A **Contract** records the agreement produced from one or more accepted Participations; its historical versions are immutable.
- FOPX One is a coordination, documentation, and monitoring platform. It does **not** hold, transfer, distribute, settle, escrow, or guarantee investor funds or returns.
- After investment, platform scope is limited to project monitoring, updates, documents, milestones, contracts, notifications, and immutable history. Payment execution and custody are out of scope.

## 2. Audit scope and source limitations

The requested files `/docs/standards/agent-working-rules.md` and `/docs/standards/security-standards.md` do not exist in this checkout. No dedicated Opportunity, Participation, Contract, Project Room, Reputation, Finance, Notification, or architecture document exists under `/docs` either. The available baseline was:

- `/docs/01-system-overview.md`
- `/docs/02-domain-model.md`
- `/docs/03-features-inventory.md`
- `/docs/04-api-reference.md`
- `/docs/05-technical-debt.md`
- `/docs/06-development-guide.md`
- notification documentation under `Core-BackEnd/docs` and `investa-admin-portal/docs`
- current backend domain, application, infrastructure, API, tests, migrations, and all four clients

The existing top-level documentation describes an older `Investment` / `InvestmentRequest` design and is not authoritative for the newer `Opportunity` implementation. This document therefore uses current source and EF mappings as the primary evidence.

## 3. Current model

### 3.1 Active and legacy concepts

| Current concept | Current role | Audit finding |
|---|---|---|
| `Project` | Integer-key record with title, description, category, target/current amount, and risk | Disconnected legacy entity. It has no owner, lifecycle, audit fields, or relationship to `Opportunity`; its fields mix business and opportunity concerns. |
| `Opportunity` | Main aggregate for discovery, fundraising terms, media, documents, events, requests, and room | Functions simultaneously as Project and opportunity. It has no `ProjectId`. |
| `Investment` | Legacy client/API projection linked optionally to `Opportunity` | Duplicates opportunity fields, post-investment balances, status, media, and classification. It remains heavily referenced by web/mobile clients. |
| `OpportunityJoinRequest` | Conversation/general request or investment participation | Mutable workflow record used as the financial Participation. `Pending` becomes `Approved`; identity and accepted terms are not separated from review state. |
| `InvestmentParticipant` / `InvestmentRequest` | Older participation/request models | Parallel legacy paths create ambiguity over the authoritative participation record. |
| `InvestmentContract` | One contract per opportunity/founder/investor/model | Contract versions are immutable snapshots and each version uniquely references one join request. This is close to the desired audit behavior. |
| `OpportunityEvent` | Opportunity/project-room timeline | Supports immutable entries and idempotency, but every event is scoped to an Opportunity rather than a long-lived Project. |
| `OpportunityMedia` / `OpportunityDocument` | Opportunity and room files | All files are opportunity-scoped; reusable Project files do not have an owner. |
| `UserNotification` | In-app notification with event metadata | Has `OpportunityId`, but no `ProjectId`, `OpportunityId`, or `ParticipationId` typed references. |
| `ReputationTransaction` | Append-only reputation audit | Generic string reference fields can point to activity, but source terminology still uses `Investment`; rewards currently fire on request and approval. |
| `FinanceTransaction` | FOPX One company operating ledger | Correctly documents that it is company operating finance only, never investor/project/opportunity money. It must remain isolated from fundraising totals. |

### 3.2 Current lifecycle behavior

`OpportunityStatus` currently combines moderation, opportunity funding, and project delivery:

`Draft -> UnderReview -> Rejected/Approved -> Published -> Funding -> FullyFunded -> InProgress -> Completed -> Archived`

This causes `InProgress` and `Completed` (business/project delivery states) to coexist with `Funding` and `FullyFunded` (opportunity states). Public join eligibility also includes `Published`, `Funding`, `FullyFunded`, and `InProgress`; it only excludes `Completed` and `Archived`. As a result, the current guard does not reliably express “opportunity is open.”

`OpportunityJoinRequestStatus` is:

`Pending -> Approved | Rejected | Cancelled`

The database computes an active slot for `Pending` and `Approved` and enforces a unique index over opportunity, investor, and that slot. The service additionally returns the existing pending or approved request rather than creating a new one. This directly conflicts with repeat investment in an open opportunity.

Approval:

- mutates the request to `Approved`;
- locks all core Opportunity fields after the first approval;
- adds funding progress and project-room events;
- generates or supersedes a contract version;
- grants room access based on any approved request;
- applies reputation activity to founder and investor.

### 3.3 Material gaps

1. No durable Project-to-Opportunity relationship exists.
2. Project identity and opportunity offer terms are stored together.
3. Opportunity moderation, fundraising, and project delivery share one status enum.
4. Participation is not an immutable accepted commitment; it is a mutable request.
5. The active-request uniqueness constraint prevents repeat investment in the same open opportunity.
6. Contract identity is opportunity/investor/model based, while a new participation supersedes the prior active version. Product intent for additive commitments versus amended agreements is not explicit.
7. Project Room access and content are opportunity-scoped, so a later opportunity would create a separate long-term room/history for the same business.
8. Funding progress is derived from approved requests. It risks implying platform settlement and does not distinguish “committed,” “externally confirmed,” and “transferred.”
9. Legacy `Investment`, `InvestmentRequest`, `InvestmentParticipant`, and the newer Opportunity path coexist.
10. Notifications and activity links lack first-class Project, Opportunity, Participation, and Contract correlation.
11. Deletion cascades from Opportunity to requests, documents, media, and events are unsuitable once these records become immutable business history.
12. Top-level docs are stale and omit the current Opportunity architecture.

## 4. Target domain model

### 4.1 Aggregate relationships

```text
Project 1
  |-- * Opportunity
  |       |-- * Participation
  |       |       `-- 0..1 ContractVersion source
  |       |-- * OpportunityDocument / OpportunityMedia
  |       `-- * OpportunityEvent
  |-- * ProjectUpdate / Milestone / ProjectDocument
  `-- * Contract (or ContractGroup; product decision required)
          `-- * immutable ContractVersion
```

All externally visible identifiers should be opaque stable IDs. Existing integer IDs may remain during compatibility phases; new APIs must not infer relationships from ID formats.

### 4.2 Project fields

Project owns facts that remain true across fundraising rounds:

| Field group | Examples |
|---|---|
| Identity | `Id`, founder/business owner ID, legal/display name, slug, summary, long description |
| Business classification | category/industry, business stage, geography, tags that describe the business |
| Business profile | founding date, website, logo/brand media, team, business model |
| Durable risk/profile | risk classification and disclosures that describe the business, with dated history rather than silent overwrite |
| Delivery lifecycle | `ProjectStatus`, current operating/delivery stage |
| Project Room | room identity, project updates, milestones, monitoring documents, durable timeline |
| Governance/audit | created/updated timestamps, archive reason, row version, ownership changes |

`TargetAmount`, `CurrentAmount`, offered equity, interest, repayment terms, fundraising dates, and use of funds do not belong on Project.

### 4.3 Funding Opportunity fields

Opportunity owns the terms and state of one raise:

| Field group | Examples |
|---|---|
| Parent/reference | `ProjectId`, opportunity number/name, founder snapshot |
| Offer narrative | title, short description, opportunity-specific use of funds, opportunity cover/media |
| Funding | target amount, authoritative funding currency, minimum/maximum participation, opening/closing dates |
| Instrument | investment model and model-specific terms: share price/count/equity offered; profit share/frequency/term; loan rate/frequency/maturity |
| Classification | funding goal and any round-specific tags |
| Moderation | submission/review state, reviewer, decision reason/timestamps |
| Opportunity lifecycle | open/paused/closed/cancelled state and close reason/time |
| Derived metrics | committed amount/shares computed from accepted Participations; never a wallet or custody balance |
| Audit | immutable published terms snapshot/version, row version, created/updated timestamps |

The current `Opportunity` table already serves as the fundraising round conceptually. Add `ProjectId` first and preserve `OpportunityId` API aliases during transition.

### 4.4 Participation

Participation is a separate immutable business record, not the mutable request envelope.

Recommended fields:

- `Id`, `OpportunityId`, `InvestorId`, `SequenceNumber`
- immutable submitted terms snapshot and hash
- entered amount/currency and immutable FX snapshot reference
- authoritative opportunity amount/currency
- instrument-specific quantity/terms
- `SubmittedAt`, `AcceptedAt`, `RejectedAt`, `WithdrawnAt`, reviewers and reasons
- source conversation/offer IDs
- idempotency key and correlation ID
- `SupersedesParticipationId` only when correcting/replacing a record under an explicitly permitted workflow
- `ContractId` / `ContractVersionId` correlation

Do not update accepted monetary or instrument fields. Corrections, further investment, or renegotiation create a new Participation with its own identity and snapshot. A pending submission may be withdrawn, but its history remains.

The database rule should prevent duplicate retries, not repeat business. Use a unique idempotency key per submission. If the product allows only one pending negotiation at a time, enforce a partial unique index for `Pending` only—not `Accepted`.

### 4.5 Contract

Keep immutable document content, hashes, PDFs, version history, and events. Change the source relationship to the new Participation ID.

Two valid contract structures were considered:

- **Umbrella contract:** one contract per Project/investor/instrument; every accepted Participation adds a version or schedule. This preserves the current versioning direction but must make additive obligations explicit.
- **Per-participation contract:** one contract per accepted Participation. Amendments version that contract; a new investment creates a new contract. This gives the clearest immutable lineage and avoids making an additive investment appear to supersede the earlier agreement.

Phase 4 selects per-participation contracts for new approvals. Migrations retain all earlier contract IDs, versions, and source request IDs and do not collapse or rewrite historical umbrella contracts.

### 4.6 Project Room and history

Project Room should be Project-scoped. It aggregates:

- durable Project profile;
- all opportunities with their independent timelines and outcomes;
- accepted participant access;
- monitoring updates, documents, and milestones;
- contract links and immutable activity history.

Opportunity draft/review artifacts remain opportunity-scoped. Post-investment updates and monitoring artifacts default to Project scope, with optional `OpportunityId` correlation. Access should be an explicit grant derived from accepted Participation and retained according to the contract/product policy; it must not depend on the current status of one mutable request.

No Project Room workflow may represent platform-held funds, initiate payouts, record distributions as performed by FOPX One, or guarantee a return. An externally reported payment or milestone may be stored only as a document/update supplied by a party, with source, timestamp, status, and disclaimer.

## 5. Target lifecycle states

Use separate state machines.

### Project

`Draft -> Active -> Paused -> Completed -> Archived`

`Completed` describes the business initiative/delivery lifecycle, not fundraising. Archive is administrative and does not delete history.

### Opportunity moderation

`Draft -> Submitted -> UnderReview -> Approved | ChangesRequested | Rejected`

An approved opportunity may then be scheduled/opened. Rejected and changes-requested opportunities retain review history.

### Opportunity fundraising

`Scheduled -> Open -> Paused -> Closed`

Close reasons are data, not new states: `TargetReached`, `DeadlineReached`, `FounderClosed`, `Cancelled`, `ComplianceClosed`. Only `Open` accepts a new Participation. Reopening a closed opportunity should be disallowed by default; create a new opportunity instead. Whether a paused opportunity accepts pending workflow actions is an open decision.

### Participation

`Draft -> Submitted -> UnderReview/Negotiating -> Accepted | Rejected | Withdrawn | Expired`

Accepted is terminal for its terms. A further investment starts a new Participation. “Room access,” “contract ready,” and “viewed” are projections/events, not Participation states.

### Contract

Contract: `Active -> Terminated` (retain unless product requires `PendingSignature`).
Version: `Generated -> Active -> Superseded | Terminated | Cancelled`.

If platform approval currently constitutes electronic acknowledgement, legal/product review must confirm that semantics. Otherwise add explicit party acknowledgement/signature states; do not imply execution merely from founder approval.

## 6. Security, compliance, and integrity requirements

Because the repository security standards file is absent, implementation must create or adopt an approved security standard before Phase 1. At minimum:

- authorize every Project/Opportunity/Participation/Contract operation by ownership or explicit access grant;
- prevent cross-project IDOR by resolving child records through their parent;
- preserve immutable accepted Participation terms, contract hashes, timeline entries, and FX snapshots;
- use optimistic concurrency for opportunity capacity approvals and transactional revalidation;
- use idempotency for participation submission, approval, contract generation, events, and notifications;
- replace destructive cascades with restrictive deletion/soft archive for financial/legal history;
- retain current file validation, size/type checks, malware scan status, private visibility, and signed/authorized retrieval;
- minimize sensitive investor data in notifications, analytics, exports, logs, and room summaries;
- record actor, reason, timestamp, and before/after state for moderation and lifecycle transitions;
- keep company finance authorization and data stores isolated from fundraising projections;
- label all “funded” figures as accepted/committed amounts unless independent external confirmation is represented;
- include the FOPX One non-custody/non-guarantee disclaimer in opportunity, participation, contract, and monitoring surfaces.

## 7. Affected modules

### Backend

| Area | Affected modules |
|---|---|
| Domain | `Project`, `Opportunity`, `Investment`, `OpportunityJoinRequest`, `InvestmentParticipant`, `InvestmentRequest`, `InvestmentContract*`, events/documents/media, notification and chat correlation entities, enums |
| Application | `OpportunityService` (large mixed service), `InvestmentContractService`, compatibility mapper, DTOs, mappings, validators, reputation integration, project activity timeline, cash-flow projections |
| Infrastructure | `ApplicationDbContext`, Opportunity/Investment backfills, EF migrations and snapshot, seed/demo backfills, indexes and delete behavior |
| API | opportunities, join requests, contracts, conversations/negotiation, notifications, reputation, analytics/dashboard, reporting, favorites, document/media endpoints |
| Tests | opportunity creation/security/concurrency/documents, negotiation journeys, room backfill/activity, contracts, notifications, reputation, payment/cash-flow projection tests |

New bounded services should be `ProjectService`, `OpportunityService`, `ParticipationService`, `ContractService`, and `ProjectRoomService`. Compatibility controllers may delegate to them; business rules must not be duplicated.

### Frontend and mobile

| Client | Affected modules |
|---|---|
| Angular client portal | `opportunity.service.ts`, `investment.service.ts`, `requests.service.ts`, `contract.service.ts`, cash-flow service; discovery/details/editor; participation builder; requests; investments/projects list; opportunity room; contract views; notifications; routes, realtime event correlation, i18n |
| React admin portal | opportunity lookup/moderation and dashboards/analytics/reporting; notification broadcasts/templates; reputation rules; any opportunity statistics. Company finance screens should change only to preserve separation/disclaimers. |
| Flutter Founder | legacy `Investment` models/services/screens, opportunity status UI, project phase service, dashboard/analytics, notifications and routing |
| Flutter Partner | legacy `Investment` models/services/screens, participation entry, status UI, project list/room access, contracts and notifications |

Client rollout needs additive fields first: `projectId`, `opportunityId` (with `opportunityId` alias), opportunity status, Project summary, and Participation identity. Do not change routes and payload names in the same release as data backfill.

## 8. Safe migration approach

No migration is created in Phase 0. The eventual migration should be expand/backfill/verify/switch/contract:

1. **Inventory and invariants**
   - Profile production row counts, nullability, orphaned links, duplicate Opportunity/Investment pairs, requests per investor, contract source links, and cascade-delete risks.
   - Freeze canonical mappings and publish reconciliation queries before writes.

2. **Expand**
   - Add the durable Project schema and nullable `Opportunity.ProjectId`.
   - Add the new Participation table without removing `OpportunityJoinRequest`.
   - Add typed correlation columns to contracts, events, documents, notifications, and conversations as required.
   - Keep all existing endpoints and IDs.

3. **Backfill Projects**
   - Default to one Project per current Opportunity because there is no reliable data proving that two opportunities represent the same business.
   - Link the legacy `Investment` compatibility row through its `OpportunityId`.
   - Do not automatically merge by founder, title, company name, phone, or fuzzy similarity. Produce a review queue for optional manual merges.
   - Snapshot the current long-lived fields into Project and leave opportunity terms on Opportunity.

4. **Backfill Participations**
   - Create one Participation for every investment-type `OpportunityJoinRequest`, retaining original ID correlation, timestamps, status, terms JSON, FX snapshot, reviewer, conversation, and accepted offer.
   - Do not convert general participation/conversation requests into financial Participations.
   - Link contract versions through the new Participation while retaining `SourceParticipationRequestId` until verification.

5. **Dual-read and shadow verification**
   - New services write canonical records; compatibility projections return legacy payloads.
   - Prefer an outbox/transactional projection over uncontrolled bidirectional dual writes.
   - Compare per-opportunity accepted amount, shares, participant counts, room access, contract lineage, notifications, and reputation references.

6. **Switch clients gradually**
   - Admin/internal reads first, then founder, then investor surfaces.
   - Feature-flag new Project pages and repeat-investment flow.
   - Preserve `/opportunities` routes as opportunity aliases for at least one deprecation window.

7. **Constrain**
   - After reconciliation, make `ProjectId` non-null.
   - Replace the active-request uniqueness index with pending-only/idempotency constraints.
   - Change historical foreign keys to restrictive delete behavior and archive flows.

8. **Contract legacy model**
   - Stop writes to legacy `Investment`, `InvestmentRequest`, and `InvestmentParticipant`.
   - Remove compatibility code only after telemetry shows no old-client use and rollback/backfill artifacts are retained.

Every phase requires a database backup, resumable/idempotent backfill, row-count and amount reconciliation, dry run, rollback plan, and audit export. Monetary totals must be reconciled in opportunity currency from immutable accepted Participation records; no wallet or company-finance table may be used.

## 9. Phased implementation plan

| Phase | Outcome | Exit criteria |
|---|---|---|
| 0 — Audit | This decision document, field ownership, gaps, dependencies, decisions | Architecture/product/security approval; no code |
| 1 — Foundations | **Complete:** durable Project parent, additive `ProjectId`, one-per-Opportunity backfill | Existing clients pass; Project link backfilled and reconciled |
| 2 — Immutable Participation | Canonical Participation service/table and repeat participation in Open opportunity | Concurrency/idempotency tests; totals match; closed opportunities reject new records |
| 3 — Contracts and access | Participation-linked contracts and explicit Project Room grants | Contract lineage and hashes preserved; authorization tests pass |
| 4 — Project Room | Project-scoped updates, documents, milestones, aggregate history | Multi-opportunity Project displays correctly; participant privacy verified |
| 5 — Client rollout | Angular, React, founder and partner apps use Project/Opportunity/Participation | Feature flags stable; compatibility telemetry below threshold |
| 6 — Legacy retirement | Remove duplicate Investment/request/participant writes and aliases | Reconciliation signed off; rollback window elapsed; docs/API updated |

## 10. Open product and legal decisions

These decisions block final schema/API design:

1. What uniquely identifies a Project/business, and may a Project have multiple owners or transfer ownership?
2. Can more than one opportunity be `Open` for a Project at once? If yes, may instruments/currencies differ?
3. Does `Published` mean visible only, while `Open` alone accepts Participations?
4. Can a paused opportunity accept a previously negotiated Participation or only resume viewing?
5. Are opportunity target, deadline, min/max, and instrument terms immutable after opening? Which changes require a new opportunity?
6. Is acceptance a commitment, an externally executed investment, or only founder approval? What evidence confirms off-platform completion?
7. Should a repeat investment create a separate contract or a new additive version of an umbrella contract?
8. Does a new version supersede earlier obligations, amend them, or add to them? The current service assumes supersession.
9. Are investor/founder electronic acknowledgements legally required beyond approval? Which jurisdiction and retention policy apply?
10. How long does Project Room access persist after opportunity close, contract termination, or investor exit?
11. Which Project documents carry across opportunities, and which must be snapshotted into each opportunity at publication?
12. Are accepted amounts shown publicly, privately, or only in aggregate? What anonymity rules apply across multiple Participations?
13. Which reputation events are appropriate? A submission charge/reward must not imply successful funding or payment.
14. What terminology replaces “funded,” “cash flow,” “payout,” and “distribution” so the UI cannot imply custody or guarantee?
15. Who may close/cancel an opportunity, and what happens to pending Participations and negotiations?
16. Can legacy Opportunities be manually grouped into one Project, and who approves that merge?
17. What is the deprecation window for legacy `Investment` APIs and mobile versions?

## 11. Recommended architecture decisions for approval

- Adopt Project as the aggregate root for durable business identity and Project Room.
- Treat current Opportunity as the fundraising round and add `ProjectId` before any rename.
- Create a first-class immutable Participation record; retain join/conversation workflow separately.
- Allow multiple accepted Participations per investor per Open opportunity.
- Permit only one pending participation workflow per investor/opportunity unless product explicitly permits parallel negotiations.
- Close opportunities permanently; use a new opportunity for a subsequent raise.
- Derive opportunity commitment totals only from accepted Participations.
- Keep FOPX One company finance wholly separate from Project/Opportunity/Participation data.
- Prefer per-Participation contracts unless legal/product explicitly approves additive umbrella-contract version semantics.
- Archive instead of delete for all Project, Opportunity, Participation, Contract, and activity-history records.
