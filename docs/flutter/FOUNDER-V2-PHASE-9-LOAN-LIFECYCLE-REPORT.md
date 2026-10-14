# Founder Mobile V2 — Phase 9 Loan Lifecycle

## Delivered

- Reads the persisted loan obligation, repayment summary, schedule, installment
  balances, status history, due/overdue values, and backend lifecycle metadata.
- Allows a Founder to declare a partial or full external repayment only against
  an active loan obligation and within the server-reported outstanding amount.
- Allows selecting schedule installments for repayment allocation; the app
  submits the selected installment numbers and leaves allocation/balance
  authority with the backend.
- Added optional PDF/JPG/PNG repayment evidence upload and authorized evidence
  download. Repayment history shows backend status and dispute reason.
- The Founder role does not gain investor confirmation/dispute or
  operations-only default/closure powers. Server-provided lifecycle state is
  displayed without locally calculating authoritative loan balances.

## Validation

- Loan/funding workflow tests: **5 passed**, including active-obligation guard,
  amount bounds, and selected installment submission.
- Full Flutter suite: **107 tests passed**.
- `flutter analyze --no-pub`: **No issues found**.
- Android debug APK build for the Development emulator API URL: **passed**.
- Build emitted a non-blocking future Kotlin Gradle Plugin compatibility
  warning from `firebase_core`.

## Remaining work and UAT boundary

- Authenticated Development readback of partial/full repayments, proof files,
  installment allocation, investor decisions, and lifecycle transitions is
  deferred in [FOUNDER-V2-PENDING-UAT.md](FOUNDER-V2-PENDING-UAT.md).
- No repayment declaration or external transfer was made during implementation
  validation.
