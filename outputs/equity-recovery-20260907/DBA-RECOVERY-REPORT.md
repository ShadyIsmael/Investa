# DBA — Equity Phase 1 SQL Server Recovery Report

Date: 2026-09-07

## Final classification

**DBA RECOVERY — NO VALID PRE-INCIDENT RESTORE POINT**

The active `InvestaDb` was not restored, migrated, edited, or otherwise modified. The isolated recovery database was retained.

## Required result fields

| Item | Result |
|---|---|
| New safety backup | PASS — `C:\Program Files\Microsoft SQL Server\MSSQL17.MSSQLSERVER\MSSQL\Backup\InvestaDb_DBARecovery_20260907_103500.bak` |
| `RESTORE VERIFYONLY` (new backup) | PASS — backup set valid; checksum present |
| Recovery model | `FULL` |
| Backup chain discovered | Full backup only: 2026-08-23 original and 2026-09-07 copy-only safety backup; no differential or transaction-log backups in `msdb` |
| LSN chain continuous | NO — no log-backup chain is available to bridge the incident |
| Point-in-time recovery available | NO |
| Selected recovery point | 2026-08-23 15:08:08 full backup, the only pre-incident full backup found; it predates the Equity UAT and Phase 1 migration |
| Isolated recovery DB | `InvestaDb_EquityRecovery_20260907_103500` |
| Restore result | PASS — restored from the verified 2026-08-23 full backup using `WITH MOVE` into the isolated database |
| Equity Phase 1 migration present | NO |
| `EquityPositions` count | 0 — table absent |
| `EquityHoldingSnapshots` count | 0 — table absent |
| `EquityHoldingLedgerEntries` count | 0 — table absent |
| Integrity result | PASS for the restored database: `DBCC CHECKDB` completed without reported errors and `DBCC CHECKCONSTRAINTS` completed without reported violations; Equity-specific key/index checks are not applicable because the tables are absent |

## Active database protection and state

The read-only state capture before backup showed:

- Database: `InvestaDb`
- SQL Server instance: `Shady`
- Timestamp: `2026-09-07 10:34:32.5184851`
- State: `ONLINE`, access `MULTI_USER`
- Recovery model: `FULL`
- Last applied migration: `20260906081326_ProfitSharingLifecyclePhase3`
- Equity tables: absent
- Surrounding counts: Projects 11, Opportunities 11, OpportunityJoinRequests 11, InvestmentContracts 11, InvestmentContractVersions 11, NegotiationOffers 13, NegotiationOfferLegs 13, PaymentTransactions 0, PaymentAllocations 0, WalletTransactions 0

The new backup was created at 10:34:45 as `COPY_ONLY, CHECKSUM`. SQL Server recorded backup set ID 2 with:

- First LSN: `60000000230400001`
- Last LSN: `60000000232800001`
- Checkpoint LSN: `60000000230400001`
- Database backup LSN: `0`
- First/last recovery fork: `45CE9367-10BF-4704-B02A-C1F6B9E9F4B4`
- Backup size: 28,401,664 bytes

## Backup and LSN audit

The only pre-existing `msdb` record was the full backup at `2026-08-23 15:08:08`, backup set ID 1, stored at `C:\Program Files\Microsoft SQL Server\MSSQL17.MSSQLSERVER\MSSQL\Backup\InvestaDb.bak`:

- First LSN: `134000004470400001`
- Last LSN: `134000004472800001`
- Checkpoint LSN: `134000004470400001`
- Database backup LSN: `0`
- First/last recovery fork: `98AA5F98-E163-4E2E-820B-E7C8BA7944B3`
- Recovery model recorded: `FULL`
- Differential backups: none found
- Transaction-log backups: none found

The old backup did not contain checksum metadata. `RESTORE VERIFYONLY` without checksum enforcement passed; checksum-enforced verification was correctly rejected because the backup set has no checksum information.

The filesystem `.uat-backups` directory contained no visible backup files. No additional backup or log chain was found through the available SQL Server history. The resulting evidence proves that a continuous path from the 2026-08-23 full backup to the Equity incident is unavailable.

## Isolated restore verification

The 2026-08-23 full backup restored successfully to `InvestaDb_EquityRecovery_20260907_103500`. Its migration history ends at `20260806125057_UpdateOpportunityType` (product version `10.0.10`); it contains no `EquityPhase1OwnershipFoundation` entry and no Equity Phase 1 tables. The recovered database is `ONLINE`, `MULTI_USER`, and `FULL`.

`DBCC CHECKDB (InvestaDb_EquityRecovery_20260907_103500) WITH NO_INFOMSGS, ALL_ERRORMSGS` produced no error output. `DBCC CHECKCONSTRAINTS WITH ALL_CONSTRAINTS` completed without reported violations.

## DBA blockers and stop condition

The old full backup is valid and restorable but predates the Equity Phase 1 schema and UAT data. No differential or log backups exist to reach the incident window, so neither schema nor data recovery can be proven from the available chain. The current database safety backup is preserved, and the isolated recovery database must remain available for any later DBA investigation.

No EF migration, `Update-Database`, manual table recreation, migration-history edit, or Equity Phase 2 work was performed.

STOP.
