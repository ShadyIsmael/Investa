# Equity Phase 1 — Development Baseline Rebuild Report

**Date:** 2026-09-07  
**Database:** `InvestaDb` (development SQL Server instance)  
**Scope:** Clean development rebuild through Equity Phase 1 only. Equity Phase 2 was not applied.

## Result

The disposable development database was rebuilt from the clean migration chain, seeded, exercised through the supported application service flow, and promoted to `InvestaDb`.

- Previous affected database preserved as: `InvestaDb_PreEquityRebuild_20260907_112500`
- Isolated DBA recovery database preserved as: `InvestaDb_EquityRecovery_20260907_103500`
- Current `InvestaDb`: `ONLINE`, recovery model `FULL`
- No production database was accessed or changed.
- No Flutter code was changed for this rebuild.
- No Equity Phase 2 migration was applied.

## Migration baseline

The database was created from zero and migrated through:

`20260906101311_EquityPhase1OwnershipFoundation`

`20260906110658_EquityPhase2CorporateEvents` remains **Pending** in EF migration listing. The Phase 2 tables are absent from the active database:

- `EquityCorporateEvents`
- `EquityCapitalizationSnapshots`
- `EquityCorporateEventPositions`
- `EquityCapitalizationSnapshotHolders`

The Phase 1 migration was reconciled with the current Phase 1 model by restoring its designer, restoring the required OfferLeg fields/indexes, and adding the nullable ledger history fields currently projected by the Phase 1 model. No migration history row was edited manually.

## Seeded foundation

The supported development seeder completed successfully. Counts in the active database include:

| Area | Count |
|---|---:|
| AuthUsers | 28 |
| AspNetUsers | 21 |
| AspNetRoles | 1 |
| Currencies | 8 |
| Lookups | 3 |
| Permissions | 7 |
| ProjectCategories | 18 |

## Equity Phase 1 UAT

The UAT runner used the actual negotiation, contract, funding declaration, and Equity position services. It did not insert Equity rows directly.

### PercentageBased scenario

- Opportunity / offer / participation / contract / leg / position: `1 / 1 / 1 / 1 / 1 / 1`
- Partial funding left the position `PendingFunding`; snapshots `0`; ledger entries `0`.
- Completing the committed amount changed the position to `Active`.
- Ownership: `10%`.
- Exactly one initial snapshot and one `InitialActivation` ledger entry were created.

### ShareBased scenario

- Opportunity / offer / participation / contract / leg / position: `2 / 2 / 2 / 2 / 2 / 2`
- Investor shares: `1,000`.
- Total issued shares: `10,000`.
- Derived ownership: `10.0%`.
- Partial funding did not activate ownership; full funding produced exactly one snapshot and one `InitialActivation` ledger entry.

Final active-database counts:

| Table | Count |
|---|---:|
| Projects | 2 |
| Opportunities | 2 |
| NegotiationOffers | 2 |
| NegotiationOfferLegs | 2 |
| OpportunityJoinRequests | 2 |
| InvestmentContracts | 2 |
| FundingDeclarations | 4 |
| EquityPositions | 2 |
| EquityHoldingSnapshots | 2 |
| EquityHoldingLedgerEntries | 2 |
| PaymentTransactions | 0 |
| PaymentAllocations | 0 |
| WalletTransactions | 0 |

## Database verification

- `EquityPositions` columns: 27
- `EquityHoldingSnapshots` columns: 17
- `EquityHoldingLedgerEntries` columns: 22
- Primary keys, foreign keys, unique indexes, and Phase 1 lookup indexes were present.
- `DBCC CHECKDB`: **PASS**
- `DBCC CHECKCONSTRAINTS`: **PASS**
- Phase 1 migration present in `__EFMigrationsHistory`: **YES**

## Authorization and history verification

Service-level authorization verification returned:

`investor=1 founder=1 admin=1 unrelatedDenied=True history=1 asOfOwnership=10.000000`

This confirms investor, founder, and admin access, denial for an unrelated investor, one historical holding record, and the expected as-of ownership. A literal live HTTP request was not run because the checked-in startup configuration uses an InMemory database in `Testing` and automatically migrates all pending migrations in non-Testing environments; starting it against the active Phase 1-only database would violate the Phase 2 boundary.

## Regression and build checks

- Equity unit tests: **6 passed**.
- Loan regression tests: **18 passed**.
- Profit Sharing regression tests: **15 passed**.
- Negotiation and contract integrity integration tests: **11 passed**.
- Full API Release build: **PASS**, 0 errors (warnings only, including existing package vulnerability/version warnings).
- Angular production build: **PASS**.
- i18n validation: **PASS**.
- Sass deprecation check: **PASS**.
- `git diff --check`: **PASS**.
- Existing `check:styleurls` script: **FAIL** for eight pre-existing components lacking `styles`/`styleUrls`; these components were outside this rebuild scope and were not modified.

## Remaining gaps

1. Live HTTP API verification against the Phase 1-only SQL database is not proven under the current startup safety configuration; application-service and integration verification passed.
2. The repository's existing style URL check remains red for eight unrelated components.
3. Existing dependency vulnerability/version warnings remain; they are unrelated to the Equity baseline.

## Classification

**EQUITY PHASE 1 BASELINE — REBUILT / RUNTIME VERIFIED WITH GAPS**
