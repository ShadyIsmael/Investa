# Repeat Investment — Phase 4

Status: implemented (2026-07-30)

## Business rules

- An investor may submit another investment Participation to the same Opportunity while that Opportunity remains eligible for participation.
- At most one Pending request per investor and Opportunity is retained as the accidental-duplicate guard.
- Approved Participations never occupy that pending slot and never block a later Participation.
- Every investment Participation has a stable one-based sequence within its investor/Opportunity pair.
- An Approved Participation and its funding/FX/terms snapshot are terminal. Later investment creates another row; it never updates the earlier amount or snapshot.
- A client-provided idempotency key replays the original Participation for the same investor and Opportunity. It does not create or charge for a duplicate retry.
- Existing investors may participate in any eligible later Opportunity under the same Project.

## Contracts

Phase 4 adopts a per-Participation contract for new approvals. Each Approved investment Participation creates:

- a distinct `InvestmentContract`;
- one active initial `InvestmentContractVersion`;
- an immutable terms/document snapshot and hash;
- a unique source link to that Participation request.

Earlier contracts and versions are preserved. A repeat investment does not supersede or mutate its predecessor. Existing umbrella-style contracts created before Phase 4 remain readable and are not split or rewritten.

## Totals and projections

`GET /api/v1/opportunities/my-participations` remains grouped by Opportunity for compatibility and now adds:

- investor total for the Project;
- investor total for the Opportunity;
- ordered individual Participations;
- the contract ID, number, version, and document hash for each Participation.

Opportunity funding totals continue to derive only from Approved investment Participations in the Opportunity funding currency. Company finance, wallets, payments, custody, distributions, and exits are not used.

## Security, idempotency, and side effects

Existing Opportunity eligibility, ownership, investor/founder authorization, capacity revalidation, optimistic concurrency, audit timeline, notification, reputation, and paid-action flows remain in place. Their reference identity is the new Participation request ID, so repeat approvals create independent events and rewards without overwriting prior history.

The paid-action reference incorporates the submission idempotency key. Retrying the same key reuses the original charge; a genuinely additional Participation uses a new key and follows the existing charging policy.

## Migration

Migration `AddRepeatInvestmentPhase4`:

1. changes the active request slot to include Pending only;
2. adds nullable idempotency keys and a filtered unique index;
3. adds Participation sequence and deterministically backfills investment requests by `CreatedAt`, then ID;
4. adds a filtered unique Opportunity/investor/sequence index;
5. changes the contract investor/Opportunity/instrument index from unique to non-unique.

All existing Opportunity, request, contract, and version IDs are preserved.

## Deferred

Lifecycle redesign, Project Room redesign, payment execution/tracking changes, distributions, exits, physical Opportunity renaming, and conversion of the request envelope into a separately named database table remain outside Phase 4.
