# Opportunity Obligation Completion — Phase 6

## Separation of concerns

Funding closure and obligation completion are independent:

- `Opportunity.FundingStatus = Closed` only stops new Participations.
- Approved Participations, immutable contracts, cash-flow schedules, documents, and outstanding obligations remain active and queryable.
- A later Opportunity under the same Project has its own Participations and cannot alter the earlier Opportunity's obligations or completion state.

No confirmation represents platform custody, collection, distribution, settlement, payment movement, or proof of payment.

## Completion model

Each approved investment Participation receives two required `ParticipationObligationConfirmation` records:

1. the Opportunity founder;
2. that Participation's investor.

Each record stores the Participation and Opportunity correlation, required user, party role, pending/confirmed status, confirming identity, timestamp, declaration, idempotency key, and row version. The unique Participation/party constraint prevents duplicate required confirmations. The user/idempotency constraint prevents duplicate submissions.

A Participation is complete only when both required records are confirmed. An Opportunity relationship is `Completed` only when every approved investment Participation is complete. Otherwise it is `NotStarted` or `AwaitingConfirmations`.

The workflow may begin only after funding is Closed, all pending Participations are resolved, and at least one approved investment Participation exists. Only the exact required user can confirm their side. Confirmations are terminal and append audit history; they do not mutate accepted terms, contracts, cash-flow schedules, or payment data.

## API and UI

- `GET /api/v1/opportunities/{opportunityId}/obligations`
- `POST /api/v1/opportunities/{opportunityId}/obligations/initiate`
- `POST /api/v1/opportunities/{opportunityId}/obligations/participations/{participationRequestId}/confirm`
- UI: `/admin/opportunities/{id}/obligations`

Founder, obligated investors, and authorized administrators can view. Founder/admin can initiate; only a required founder/investor identity can confirm its own record.

## Notifications and audit

Initiation sends an in-app notification and email to every required party for every Participation. Final Opportunity completion sends both channels to every distinct obligated party. Messages and UI include the no-payment-proof disclaimer.

Initiation, each confirmation, and final Opportunity completion write security audit records with actor, entity correlation, timestamp, role, and disclaimer.

## Migration and compatibility

`AddOpportunityObligationCompletionPhase6` adds the confirmation table and the Opportunity completion status. Existing rows default to `NotStarted`; no Participation, contract, schedule, payment record, ID, route, or historical event is rewritten. Existing Funding Closed Opportunities can opt into the confirmation workflow.

Project Room redesign, payments, collections, distributions, escrow, and exits remain out of scope.
