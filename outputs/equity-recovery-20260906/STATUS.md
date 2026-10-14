# Equity Phase 2 — incomplete; do not deploy

Classification: FAILED

## Incident and verified state

During this task the agent ran `dotnet ef migrations remove --configuration Release --no-build --force` against the existing local development environment. The compiled migration assembly was stale. Instead of removing only the new Phase 2 migration, EF reverted the already-applied `20260906101311_EquityPhase1OwnershipFoundation` migration.

The rollback removed the local EquityPositions, EquityHoldingSnapshots and EquityHoldingLedgerEntries tables, and eight Equity fields on NegotiationOfferLegs. Earlier UAT evidence recorded two positions, two initial snapshots and two ledger entries. Those records are not restored. Other source changes in the dirty worktree have been preserved.

A subsequent manually reconstructed Phase 1 source file is incomplete: it omits the OfferLeg additions and has no accompanying Designer file. **Do not apply that file or use the current migration chain to repair InvestaDb.** Phase 2 has not been successfully applied. Automatic safety review rejected the proposed database update because the reconstructed baseline was unverified. That rejection has not been bypassed; subsequent database checks were read-only.

Read-only SQL inspection confirmed:

- No Equity tables currently present.
- Last applied migration: `20260906081326_ProfitSharingLifecyclePhase3`.
- Database recovery model: FULL.
- Latest recorded database backup: 2026-08-23 15:08:08, predating Equity UAT.
- Backup location: `C:\Program Files\Microsoft SQL Server\MSSQL17.MSSQLSERVER\MSSQL\Backup\InvestaDb.bak`.

The backup's contents, accessibility and restore viability have not been tested. Do not restore this old backup over the current database.

## Preserved authentic migration evidence

The pre-rollback Release integration-test Infrastructure assembly still contains the original Phase 1 migration. Its UpOperations were inspected without connecting to SQL. They contain eight OfferLeg additions, three Equity tables and twelve indexes, including the initial-activation uniqueness index.

The following original build artifacts were copied into this directory before any integration rebuild. These are migration recovery evidence, **not a database backup**:

| File | SHA-256 |
| --- | --- |
| Investa.Infrastructure.dll | 6A837FD708074DBF5D728EF78527CE78EF7073B750D0FDD26BE7BA8D23EF8822 |
| Investa.Infrastructure.pdb | D31A41962FD1D9B5009B1DA8DACEAB9D7A731084725A3AD9D558F9648226D1B5 |
| Investa.Domain.dll | 4D4D5FCCDEFE9E15A4DA129D16B7AD0AC06BE6E3458AD94BDD6EB2E3C879B282 |
| Investa.Application.dll | EF42C5C125B0A4FF48A5EEF40B57DD54FB96EB98CD1594565184E29BAE71B105 |

Recovering the original schema definition does not recover deleted row data. Authentic migration source/Designer regeneration and semantic comparison with this assembly remain to be done offline.

## Safe code work completed in the continuation

- Event mutation loads use tracked entities so newly appended ledger and snapshot children are persisted with the event.
- Investor event reads filter position movements to the requesting investor, instead of exposing every affected position.
- Corporate mutation controller calls no longer treat Reviewer as Admin/Operations. Existing read-role behavior is unchanged.
- No Flutter, payment, custody, escrow or wallet work was added in this continuation.

Files changed in this continuation:

- `Core-BackEnd/Investa.Application/Services/EquityPositionService.cs`
- `Core-BackEnd/Investa.API/Controllers/EquityController.cs`
- This status document and the four preserved build artifacts.

Earlier unfinished Phase 2 changes remain in the domain entities/enums, application DTOs/service/interface/Opportunity Room mappings, persistence context/migrations, Equity controller/tests, and Angular Room/model/i18n files. They are not a release-ready implementation.

## Verification

- Release unit-test project build succeeded, including backend API and dependencies: zero errors; existing package vulnerability and code warnings remain.
- Focused Equity/Loan/ProfitSharing/Funding suite: **45 passed, 0 failed**, including the six current EquityPositionServiceTests (four Phase 1 cases and two Phase 2 cases).
- Angular production build passed earlier in this task; no UI edits were made in the final continuation.
- Centralized i18n validation passed again.
- `git diff --check` passed again; line-ending warnings were emitted.
- Complete Phase 2 test matrix and current integration regression run are not complete.
- No successful Phase 2 runtime UAT; no runtime issuance/split/additional-round IDs can be reported.

Passing these limited tests does not establish concurrency, full authorization coverage, new-round safety or deployment readiness.

## Open gap register

P0:

- Local Phase 1 schema/data loss caused by this task; original baseline source not yet fully recovered.
- Competing project capitalization events lack adequate database-backed stale-state/concurrency protection.
- Additional share-based rounds can still activate independently of the required controlled issuance.
- Applied-event/child deletion and mutation protection is incomplete.

P1:

- Project-wide capitalization across different Opportunities is incomplete.
- Full additional-round reconciliation, effective-date restrictions and fractional-share coverage are incomplete.
- Multi-position notification handling and Room/API timeline/localization completeness need further work.
- Full required unit/integration matrix and runtime authorization/legacy-count verification are outstanding.

No lack of custody, brokerage, official registration or fully diluted cap-table support is classified as a gap.

## Proposed recovery boundary — not executed

Obtain explicit approval for a separate recovery operation. Preserve the current database and transaction-log evidence using non-overwriting backups, then investigate restoration into a **new, isolated recovery database**. If the available backup/log chain permits it, test a point-in-time restore before the rollback there. Never replace InvestaDb or fabricate historical ledger rows. If recovery is not possible, report that outcome and seek a separate decision about recreating disposable UAT scenarios through supported product flows.

Only after the authentic migration baseline and data-recovery outcome are established should local migration application and Phase 2 runtime work resume.
