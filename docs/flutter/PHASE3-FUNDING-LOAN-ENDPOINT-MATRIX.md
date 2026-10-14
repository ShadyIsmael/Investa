# Flutter Founder Phase 3 — Funding and Loan endpoint matrix

This matrix records the backend contract audited before the Founder UI implementation. FOPX records declarations and decisions; it does not receive or transfer money.

| Flow | Endpoint | Founder use | Investor/other use | Authoritative response |
|---|---|---|---|---|
| Deal state | `GET /api/v1/opportunities/{opportunityId}/room` | Read approved participations, accepted contracts, per-leg funding, Loan obligation, schedule, and funding history | Scoped by backend authorization | `OpportunityRoomDto` |
| Funding declaration | `POST /api/v1/funding-declarations/opportunities/{opportunityId}/participations/{participationId}` | Multipart declaration with amount, 3-letter currency, received date, external method, optional reference/notes, and exact mixed-leg allocations | — | `FundingDeclarationDto` with `PendingConfirmation` |
| Funding history | `GET /api/v1/funding-declarations/opportunities/{opportunityId}/participations/{participationId}` | Read declaration history and statuses | Scoped by backend authorization | `FundingDeclarationDto[]` |
| Funding decision | `POST /api/v1/funding-declarations/{declarationId}/confirm` or `/dispute` | Not shown as Founder action | Investor-only decision | Confirmed/disputed declaration; confirmation may activate Loan obligation |
| Repayment declaration | `POST /api/v1/loan-repayments/opportunities/{opportunityId}/obligations/{loanObligationId}` | Multipart external repayment declaration; no local FIFO or balance calculation | — | `LoanRepaymentRecordDto` with `PendingConfirmation` |
| Repayment history | `GET /api/v1/loan-repayments/opportunities/{opportunityId}/participations/{participationId}` | Read declaration history | Scoped by backend authorization | `LoanRepaymentRecordDto[]` |
| Repayment decision | `POST /api/v1/loan-repayments/{declarationId}/confirm` or `/dispute` | Not shown as Founder action | Investor-only decision; confirmation allocates to canonical schedule | `LoanRepaymentRecordDto` and refreshed room summary |
| Lifecycle operations | `POST /api/v1/loan-lifecycle/{loanObligationId}/default` or `/close` | Not exposed as Founder action | Admin/Operations only | `LoanLifecycleSnapshotDto` |
| Completion view | `GET /api/v1/opportunities/{opportunityId}/obligations` | Read-only completion state when available | Backend-scoped | `OpportunityObligationCompletionDto` |

Mixed allocation is authoritative: `ParticipationLegDto.OfferLegId` identifies the exact accepted leg. A declaration must reconcile its allocations exactly to the declared amount; the backend rejects excessive, duplicate, unknown, or mismatched allocations.

The Founder UI exposes operational actions only for Loan legs. Equity and Profit Sharing legs remain visible for context and allocation display, but no lifecycle action is implemented for them in this phase.
