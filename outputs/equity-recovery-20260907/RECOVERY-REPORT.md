# Equity Phase 1 Recovery Report — 2026-09-07

## Classification

**EQUITY PHASE 1 RECOVERY — BLOCKED / MANUAL DBA RECOVERY REQUIRED**

Equity Phase 2 remains blocked and was not resumed.

## Incident state

The prior status report records that migration `20260906101311_EquityPhase1OwnershipFoundation` was reverted accidentally after `dotnet ef migrations remove --configuration Release --no-build --force` used a stale compiled assembly. The rollback removed the three Phase 1 Equity tables, eight `NegotiationOfferLegs` columns, and the earlier Phase 1 UAT rows. The current rebuilt migration source is incomplete and has no Designer file.

The prior report also records the last applied migration as `20260906081326_ProfitSharingLifecyclePhase3`, the database recovery model as `FULL`, and the latest known backup as `C:\Program Files\Microsoft SQL Server\MSSQL17.MSSQLSERVER\MSSQL\Backup\InvestaDb.bak` from 2026-08-23 15:08:08. That backup predates the Equity UAT and has not been tested for restore viability.

## Current read-only environment checks

- Repository: `C:\github\Investa` exists.
- SQL Server service `MSSQLSERVER`: running; start type Automatic.
- TCP port 1433: listening and reachable.
- The local SQL Server registry setting reports `ForceEncryption = 0`; the client-side SSPI/TLS failure still prevents the session from opening.
- The available `.uat-backups` directory was enumerated and contained no visible files.
- The known SQL backup directory exists, but direct access to `InvestaDb.bak` was denied to the current Windows account.
- Attempts to connect read-only to `localhost\InvestaDb` using Windows authentication failed before query execution with SSPI/TLS errors (`Failed to generate SSPI context` / `Encryption not supported on the client`).

Because no SQL session could be established, current migration history, schema, table counts, backup history, LSN chain, and database metadata could not be freshly captured. No backup, restore, migration update, schema edit, or data mutation was executed.

## Authentic Phase 1 migration evidence

The preserved `Investa.Infrastructure.dll` was inspected offline by invoking the compiled migration metadata. Its Phase 1 `Up` method contains 23 operations:

- 8 `NegotiationOfferLegs` columns:
  `EffectiveOwnershipDate`, `EquityOwnershipModel`, `InvestorShareCount`, `PostMoneyValuation`, `PreMoneyValuation`, `PricePerShare`, `ShareClass`, and `TotalIssuedShares`.
- 3 tables: `EquityPositions`, `EquityHoldingLedgerEntries`, and `EquityHoldingSnapshots`.
- 12 indexes, including the unique initial-activation event index and the supporting position/foreign-key indexes.

The current rebuilt source migration contains 10 operations: the same three table creations plus seven indexes. It contains none of the eight `NegotiationOfferLegs` additions and omits five indexes present in the authentic compiled migration:

- `IX_EquityPositions_AcceptedOfferId`
- `IX_EquityPositions_ContractVersionId`
- `IX_EquityPositions_FounderUserId`
- `IX_EquityPositions_OfferLegId`
- `IX_EquityPositions_ProjectId`

Therefore the current source migration is not an equivalent reconstruction and remains unsafe to apply. The source Designer file is missing. The preserved compiled artifacts are migration-definition evidence only; they do not restore deleted rows.

Preserved artifact hashes recorded in the prior status report:

| Artifact | SHA-256 |
|---|---|
| `Investa.Infrastructure.dll` | `6A837FD708074DBF5D728EF78527CE78EF7073B750D0FDD26BE7BA8D23EF8822` |
| `Investa.Infrastructure.pdb` | `D31A41962FD1D9B5009B1DA8DACEAB9D7A731084725A3AD9D558F9648226D1B5` |
| `Investa.Domain.dll` | `4D4D5FCCDEFE9E15A4DA129D16B7AD0AC06BE6E3458AD94BDD6EB2E3C879B282` |
| `Investa.Application.dll` | `EF42C5C125B0A4FF48A5EEF40B57DD54FB96EB98CD1594565184E29BAE71B105` |

## Recovery actions and results

No current-database backup was created because the required SQL connection could not be opened. No existing backup was overwritten or restored. No isolated recovery database was created. Normal restore and point-in-time restore were not attempted because backup metadata and log-chain continuity could not be queried.

The following remain unverified:

- backup readability and restore viability;
- full/differential/log backup chain and earliest recoverable point;
- whether any restore point contains the Phase 1 schema or UAT rows;
- final database migration history and Equity table counts;
- Phase 1 runtime re-verification.

## Phase 2 safety findings carried forward

The prior status report identifies these open P0 items: database/schema and UAT data loss; insufficient database-backed stale-state/concurrency protection for competing capitalization events; uncontrolled activation risk for additional ShareBased rounds; and incomplete protection against deleting or mutating applied events and children. P1 items include cross-Opportunity capitalization, reconciliation/effective-date/fractional-share coverage, notification and Room/API completeness, and the remaining test/authorization matrix.

No Phase 2 corporate-event, dilution, additional-round, or runtime implementation was performed in this recovery operation.

## Required next action

A DBA or an account with SQL Server access must perform a separate, non-overwriting recovery operation: capture a new full backup and verify it, inventory SQL backup history and the transaction-log chain, and restore into a new isolated recovery database. Only after the authentic Phase 1 migration baseline and the data-recovery outcome are established should the team reconstruct and offline-verify the canonical migration, choose a safe restore/rebuild path, and then re-run Phase 1 regression and runtime verification.

Until that evidence exists, do not apply the current rebuilt Phase 1 migration, do not run `Update-Database`, and do not resume Equity Phase 2.
