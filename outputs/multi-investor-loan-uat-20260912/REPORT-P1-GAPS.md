# Loan lifecycle P1 gaps — verification report

Date: 2026-09-13
Database scope: active `InvestaDb` only. No migration was applied and no database was modified by this work.

## Status

The source fixes for G-001, G-002, and G-004 are implemented and covered by focused tests. Final live HTTP verification is blocked by the local SQL Server connection: `Microsoft.Data.SqlClient.SqlException` reports that the target principal name is incorrect / encryption is unsupported for the current Windows SSPI session. The API consequently cannot execute authenticated database-backed requests in the current environment.

Classification: **LOAN LIFECYCLE P1 GAPS — PARTIALLY CLOSED**

## G-001 — Opportunity / Room projection

Root cause: the projection path was present in source but the previously running Release binary predated the source fix. The canonical path now loads approved participation-linked `LoanObligation` rows and derives the status from their lifecycle states. `FullyRepaid`, `Closed`, and `Defaulted` are terminal; all terminal obligations produce `Completed`; any non-terminal obligation produces `AwaitingConfirmations`; no obligations produce `NotStarted`. `NotScheduled` is normalized to `Open` for published/funding opportunities when no explicit schedule was set.

Files: `Core-BackEnd/Investa.Application/Services/OpportunityService.cs`, `Core-BackEnd/Investa.Application/Services/ProjectRoomService.cs`.

## G-002 — Investor participation summary

The dashboard projection now loads each investor's obligations with installments and repayment allocations. Existing funding fields are scoped to that investor's approved participation and confirmed declarations; opportunity-wide values are exposed only through explicit `Opportunity*` fields. Loan fields include principal, total due, total repaid, outstanding, next due amount/date, maturity, lifecycle status, fully-repaid and closed timestamps, with short contract-facing aliases for dashboard clients. Contract id/version selection is scoped to the investor's participation.

Expected values for the existing UAT rows remain: A `100000 / 110000 / 110000 / 0`, B `80000 / 84800 / 84800 / 0`, C `120000 / 134400 / 134400 / 0`, each closed. These values could not be re-read over HTTP after the rebuild because of the SQL connection blocker.

Files: `Core-BackEnd/Investa.Application/DTOs/OpportunityDtos.cs`, `Core-BackEnd/Investa.Application/Services/OpportunityService.cs`.

## G-004 — InstallmentIdsJson

Root cause: selected installments were attached only through a navigation object in the declaration join entity, which could fail during the multipart selected-id path and surface as HTTP 500. The service now writes the exact `LoanRepaymentInstallmentId` foreign key. Duplicate ids are rejected with controlled `LOAN_REPAYMENT_INSTALLMENT_INVALID`; foreign, cancelled, and paid rows remain rejected; omitted selectors retain FIFO behavior. JSON parsing also rejects duplicate selections with the same controlled 400 error.

Files: `Core-BackEnd/Investa.Application/Services/LoanRepaymentService.cs`, `Core-BackEnd/Investa.API/Controllers/LoanRepaymentsController.cs`.

## Verification

- Focused Loan P1 tests: **23 passed** (including per-investor isolation and duplicate installment rejection).
- Backend Release build: **passed**, 0 errors.
- Client production build: **passed** after rerunning with the required process permission (Angular production bundle generated).
- i18n validation: **passed**.
- `git diff --check`: **passed**.
- Live API health before the final SQL failure was reachable, but database-backed Room, Opportunity, and dashboard requests returned HTTP 500 because SQL Server could not establish the Windows SSPI/encrypted connection. No live post-fix HTTP result is claimed.

## DBA / environment blocker

Restore the local SQL Server client/server encryption and Windows SSPI configuration, then rerun the existing Project 5 / Opportunity 5 HTTP checks. Do not classify this as runtime closed until Room/Opportunity state and all three investor summaries are observed over HTTP, and the selected-installment multipart request returns controlled success/400 responses instead of 500.

