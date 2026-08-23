# Project / Opportunity Lifecycle — Phase 5

## Scope

Phase 5 separates the durable Project lifecycle from Opportunity moderation and fundraising. `Opportunity` remains the public/API term and its existing `Status` remains a backward-compatible projection. No Project Room, payment, distribution, exit, or follower model is introduced.

## Authoritative lifecycles

Project transitions are `Draft -> Active`, `Active -> Paused -> Active`, `Active | Paused -> Completed`, and administrative archive without history deletion.

Opportunity moderation is stored independently as `Draft`, `Submitted`, `UnderReview`, `Approved`, `ChangesRequested`, or `Rejected`. Existing approve, reject, and publish routes populate it while keeping their contracts.

Opportunity funding is stored independently as `NotScheduled`, `Scheduled`, `Open`, `Paused`, or `Closed`. Only `Open`, after `FundingOpensAt` and before `FundingClosesAt`, accepts a new Participation. `Closed` is terminal; a later raise requires another Opportunity.

Closure reasons are `TargetReached`, `DeadlineReached`, `FounderClosed`, `Cancelled`, and `ComplianceClosed`. Closing records `ClosedAt`. Date eligibility is checked at the Participation boundary, so an expired Opportunity stops new submissions immediately.

## Authorization, audit, and compatibility

Founders can transition only owned Opportunities and Projects. Admin/reviewer Opportunity endpoints keep role authorization. Transitions write Project audit records or Opportunity events with actor, before/after state, time, and reason.

Existing IDs, routes, approved Participations, contracts, My Investments, investor relationships, and history remain unchanged. Legacy published/funding rows remain compatible during rolling deployment. Opportunity closure never changes its parent Project state.

## Migration and APIs

`AddProjectOpportunityLifecyclePhase5` adds indexed lifecycle columns plus nullable funding dates, close time, and reason. Backfill maps existing legacy statuses deterministically without regrouping Projects or altering financial/history records. Clean databases receive valid defaults.

Additive endpoints:

- `POST /api/v1/projects/{id}/status`
- `POST /api/v1/opportunities/{id}/funding-status`
- `POST /api/v1/admin/opportunities/{id}/funding-status`

Projections include moderation/funding state, dates, closure reason, and participation eligibility.

## Deferred

Project Room redesign, payments, distributions, exits, public Project pages, follower models, and physical Opportunity renaming remain out of scope.
