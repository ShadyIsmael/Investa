# Equity Phase 2 Recovery Continuation Report

**Date:** 2026-09-07  
**Scope:** Corporate events, dilution, additional rounds, capitalization history, and Phase 2 runtime verification.

## Result

Phase 2 was implemented and runtime-verified on an isolated SQL Server database. The active `InvestaDb` remains unchanged at the recovered Equity Phase 1 baseline because the Phase 2 promotion command against the active database was blocked by the approval review.

**Classification: EQUITY PHASE 2 — RUNTIME VERIFIED WITH GAPS**

## Baseline and safety

- Active database: `InvestaDb`, `ONLINE`, recovery model `FULL`.
- Active migration history ends at `20260906101311_EquityPhase1OwnershipFoundation`.
- Active Phase 1 counts remain: `EquityPositions=2`, `EquityHoldingSnapshots=2`, `EquityHoldingLedgerEntries=2`.
- Active Phase 2 tables are absent, confirming that the active database was not promoted.
- Pre-apply safety backup: `C:\Program Files\Microsoft SQL Server\MSSQL17.MSSQLSERVER\MSSQL\Backup\InvestaDb_EquityPhase2PreApply_20260907_130922.bak`.
- The safety backup used `COPY_ONLY` and `CHECKSUM`; `RESTORE VERIFYONLY` passed.

## Implementation and migration audit

The Phase 2 migration was regenerated as `20260907100741_EquityPhase2CorporateEvents`. It creates the corporate-event and capitalization tables, indexes, and relationships required by Phase 2. The generated duplicate `AddColumn` operations for ledger fields already present in the Phase 1 baseline were removed from the migration. The inspected SQL contains no unrelated table or column destruction.

The implementation keeps the existing Phase 1 ownership foundation and adds:

- issuer/project-scoped corporate events;
- expected total-issued-shares and latest-applied-event baselines;
- transactional application with stale-baseline and concurrency protection;
- canonical `PendingApproval → Applied` lifecycle;
- `PendingCapitalization` for fully funded additional ShareBased positions;
- effective-date and backdating guards;
- fractional-share rejection for split and reverse-split events;
- immutable applied events and immutable event-position baselines;
- founder/admin approval rules and investor denial;
- capitalization snapshots and auditable event ledger entries.

No Phase 3 behavior was started.

## Isolated migration and database verification

The isolated target was `InvestaDb_EquityPhase2Pilot_20260907_132100`. The Phase 2 migration applied successfully after restoring the safety backup.

Read-only verification returned:

- database `ONLINE`, recovery model `FULL`;
- Phase 1 and Phase 2 migration rows present in `__EFMigrationsHistory`;
- `EquityCorporateEvents=6`;
- `EquityCapitalizationSnapshots=8`;
- `EquityCorporateEventPositions=8`;
- `EquityCapitalizationSnapshotHolders=12`;
- `EquityPositions=5`;
- `EquityHoldingSnapshots=5`;
- `EquityHoldingLedgerEntries=10`;
- `PaymentTransactions=0` and `WalletTransactions=0`.

`DBCC CHECKDB` and `DBCC CHECKCONSTRAINTS` returned no errors.

## Runtime UAT

The service-level runner used the actual negotiation, contract, and funding-declaration flow. The successful isolated run reported:

- PercentageBased scenario: active position, `10%` ownership.
- ShareBased scenario: `1,000 / 10,000` shares, `10%` ownership.
- Share issuance event: investor shares `1,000 → 1,000`, total issued shares `10,000 → 12,500`, ownership `10% → 8%`.
- Stale event rejected with `EQUITY_EVENT_STALE_CAPITALIZATION`; no extra ledger entry was created.
- Direct applied-event edit and delete were rejected.
- Investor mutation rejected with `EQUITY_EVENT_FORBIDDEN`.
- Founder self-approval rejected with `EQUITY_EVENT_SELF_APPROVAL`.
- Additional round created a distinct contract and position; the new position stayed pending capitalization until the event and was incorporated exactly once. Final total issued shares were `15,500`.
- 2:1 split preserved ownership; 1:3 reverse split was rejected with `EQUITY_EVENT_FRACTIONAL_SHARES`.
- Legacy payment, allocation, and wallet counts were unchanged at zero.

## Validation

- Equity, Loan, and Profit Sharing unit/regression filters: **40 passed**.
- Negotiation and contract-integrity integration tests: **11 passed** in the earlier isolated run.
- API Release build: **PASS**, zero errors.
- Angular build: **PASS**.
- i18n validation: **PASS**.
- `git diff --check`: **PASS**.
- Existing style URL check: **FAIL** for eight unrelated pre-existing components; outside this Phase 2 scope.

## Gaps and blockers

1. Phase 2 is not applied to the active `InvestaDb`; it remains a Phase 1-only database. Promotion requires an explicit decision to change that active database.
2. A literal live HTTP run against SQL Server was not completed because the checked-in startup configuration uses InMemory for `Testing` and automatically applies pending migrations in non-Testing mode. The isolated application-service and database UAT passed.
3. Existing style URL failures and dependency warnings remain unrelated repository debt.

## Final classification

**EQUITY PHASE 2 — RUNTIME VERIFIED WITH GAPS**
