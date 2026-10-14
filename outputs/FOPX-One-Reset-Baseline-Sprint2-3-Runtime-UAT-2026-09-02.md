# FOPX One — Reset, Clean Baseline, Sprint 2/3 Runtime UAT

Date: 2026-09-02  
Environment: local runtime — API `http://localhost:5235`, FileStore `http://localhost:5240`, client `http://localhost:3000`

## Executive result

- **DATABASE BASELINE CLEAN** — PASS
- **SPRINT 2 RUNTIME VERIFIED** — PASS
- **SPRINT 3 RUNTIME VERIFIED** — PASS
- Overall real-money launch readiness: **NOT READY**. Sprint 2/3 behavior is verified, but the product still lacks an actual money movement/custody lifecycle and the normal participation path cannot use a newly created opportunity whose model is `Unspecified`.

## Test identities and data

| Role | Identity | Result |
|---|---|---|
| Founder | Ahmed Elmasry — `01022322291` / `P@ss0rd` | Login succeeded |
| Investor | Khaled Ibrahim — `01022322295` / `P@ss0rd` | Login succeeded |
| Project | NileHarvest Cold Chain — project ID `2` | Created and activated |
| Opportunity | NileHarvest Aswan Cold-Chain Expansion — opportunity ID `2` | Published |
| Target | `8,000,000 EGP` | Verified in public and room DTOs |
| Participation | `2,000,000 EGP` | Participation ID `1` |
| Offer | Version `1`, Loan leg, `18%`, `24` months, monthly repayment | Accepted by Founder |

## Database baseline and seed

1. Audited the current EF model, migrations, seeds, and the `BusinessCategories` blocker.
2. Removed the obsolete migration chain and historical migration metadata from `Core-BackEnd/Investa.Infrastructure/Migrations`.
3. Created the consolidated migration `20260902164904_InitialCleanBaseline`.
4. Reset/recreated local `InvestaDb` using `Tools/ReseedDatabase`.
5. Applied the new migration successfully; the reseed run completed with `Database seeding completed successfully` and `Reseed complete`.
6. Reseeded identity/RBAC, currencies, project categories, funding goals, tags, risk levels, file governance, and development users/opportunities.
7. Confirmed the new migration contains current Sprint 2/3 tables and fields, including `FundingDeclarations`, `ConfirmedByInvestorId`, and `DisputedByInvestorId`, with no `BusinessCategories` reference in the new migration.

Note: EF migration listing could not query migration history from the separate CLI process because local SQL Server authentication/encryption negotiation failed there. The same database connection worked from the running API and reseed process, and the reseed output confirmed migration application.

## Founder journey

| Step | Result | Evidence |
|---|---|---|
| Login | PASS | `POST /api/v1/auth/login` → `200` |
| Create complete project | PASS | `POST /api/v1/projects` → `201`; project ID `2` |
| Activate project | PASS | `POST /api/v1/projects/2/status` → `200`; status `Active` |
| Create opportunity | PASS | `POST /api/v1/opportunities` → `201`; target `8,000,000 EGP` |
| Publish opportunity | PASS | `POST /api/v1/opportunities/2/publish` → `200`; status `Published` |
| Review participation/offer | PASS | Founder received and accepted Investor’s exact Offer Version `1` |
| Open Founder Room | PASS | `GET /api/v1/opportunities/2/room` → `200` |
| Record declarations | PASS | Declaration A and B created by Founder; IDs `1` and `2` |

### Founder-path defect observed

The standard investment participation endpoint rejected a newly created opportunity with:

`POST /api/v1/opportunities/2/join-requests` → `400 Unsupported investment model.`

The create/edit DTO does not expose a way to configure the investment model and terms; creation leaves the model as `Unspecified`. The runtime test therefore continued through the implemented structured direct-offer path, which successfully generated the Loan participation and contract.

## Investor journey

| Step | Result | Evidence |
|---|---|---|
| Login | PASS | `POST /api/v1/auth/login` → `200` |
| Browse public opportunities | PASS | `GET /api/v1/public/opportunities` → `200`; UAT opportunity visible |
| Open public details | PASS | `GET /api/v1/public/opportunities/2` → `200`; project context, target, currency, use of funds and terms visible |
| Submit structured offer | PASS | `POST /api/v1/opportunities/2/offers` → `201`; Offer ID `1`, Version `1`, Loan leg `2,000,000 EGP` |
| Founder accepts exact version | PASS | `POST /api/v1/opportunities/2/offers/1/accept` → `200`; offer status `Accepted` |
| Participation created | PASS | Participation ID `1`, approved amount `2,000,000 EGP`, immutable terms snapshot |
| Contract generated | PASS | Contract ID `1`, number `INV-2-1-B3368A3F`, status `Active`, version `1` |
| Open Investor Room | PASS | `GET /api/v1/opportunities/2/room` → `200`; approved participant access enabled |

## Sprint 2/3 runtime results

### Declaration A — confirm

- Founder created `750,000 EGP`, no proof attached.
- Investor confirmed with comment: `Investor confirms receipt of Declaration A.`
- Decision endpoint returned `200`.
- Stored status: `Confirmed`.
- Stored confirmer: the test Investor.

Observed after A:

| Aggregate | Observed |
|---|---:|
| Committed | `2,000,000 EGP` |
| Declared | `750,000 EGP` |
| Confirmed | `750,000 EGP` |
| Disputed | `0 EGP` |
| Outstanding | `1,250,000 EGP` |
| Progress | `9.38%` |

### Declaration B — dispute

- Founder created `250,000 EGP` with optional PDF proof attached.
- Investor disputed with reason: `Investor disputes Declaration B: transfer reference and amount require reconciliation.`
- Decision endpoint returned `200`.
- Stored status: `Disputed`.
- Stored disputing Investor and dispute reason were visible in the authorized Founder/Investor declaration views.

Final observed aggregate:

| Aggregate | Expected | Observed |
|---|---:|---:|
| Committed | `2,000,000 EGP` | `2,000,000 EGP` |
| Declared | `1,000,000 EGP` | `1,000,000 EGP` |
| Confirmed | `750,000 EGP` | `750,000 EGP` |
| Disputed | `250,000 EGP` | `250,000 EGP` |
| Outstanding | `1,250,000 EGP` | `1,250,000 EGP` |
| Progress | `9.375%` | `9.38%` |

The amount semantics are correct. Progress is rounded to two decimal places by the runtime DTO and existing test expectation; this is a precision mismatch against the requested exact display value.

## Founder vs Investor visibility after acceptance

| Capability/data | Founder | Investor | Public |
|---|---|---|---|
| Project context and public opportunity terms | Yes | Yes | Yes |
| Approved participation and accepted Offer Version | Yes | Yes | No private participation detail |
| Active contract summary | Yes | Yes | No |
| Monthly loan schedule | Yes | Yes | No |
| Funding declarations | Authorized room/declaration view | Authorized room/declaration view | No |
| Declaration status and dispute reason | Yes | Yes | No |
| Proof file | Authorized private proof endpoint | Authorized private proof endpoint | `401` |
| Private project documents/files | Yes | Room-authorized access | Not exposed by public DTO |
| Founder editing of locked core opportunity | No after first investor | No | N/A |
| Actual payment transaction details | No recorded transaction | Empty transaction list | No |

The public opportunity DTO had no `fundingDeclarations`, `proofFileName`, `proofFileSize`, `proofMimeType`, or `proofDownloadUrl` properties. The public endpoint remained `200` while exposing only public-safe opportunity data.

## Money/payment lifecycle actually available

Implemented and observed:

- Commitment/participation is separate from actual receipt.
- Founder can declare receipt manually.
- Investor can confirm or dispute the declaration.
- Confirmed-only amount drives funded progress; disputed amount remains declared but not confirmed.
- Loan contract schedule is generated from the accepted Loan leg: monthly interest schedule and principal at maturity.
- Founder payment summary endpoint returned the outstanding loan summary.
- Investor payment detail contained zero actual payment transactions.
- No `PaymentTransaction` was created by declarations, confirmation, or dispute.
- Wallet transactions before/after declaration decisions: `0 → 0` for both test users.
- CREDIT history count before/after declaration decisions: unchanged for both test users.

Not implemented or not demonstrated as a real money lifecycle:

- payment collection, PSP integration, escrow/custody, wallet settlement, or investor-to-founder money movement;
- refund/cancellation workflow;
- automated principal/interest collection and reconciliation;
- late/default handling, grace periods, rescheduling, write-off, or recovery;
- profit-sharing distributions;
- equity ownership, cap-table allocation, transfer, or exit;
- overfunding allocation and commitment reservation rules;
- legal acceptance/signature, KYC/AML eligibility gates, and regulatory suitability;
- disputes beyond recording a reason and notifying the Founder;
- lifecycle closure and final settlement controls.

## Defects and gaps

### Implemented and working

- Clean current-schema baseline without the `BusinessCategories` blocker.
- Project → opportunity → publication flow.
- Public discovery and safe public DTO shaping.
- Structured Offer Version/Loan Leg → accepted participation → active contract → room access.
- Funding declaration creation, confirmation, dispute, immutable terminal decisions, private proof endpoint, aggregate semantics, and notifications/events.
- No wallet/CREDIT or actual payment transaction side effects from Sprint 2/3 decisions.

### Implemented but problematic

1. **Normal participation path blocked for newly created opportunities.** New opportunity creation leaves `InvestmentModel = Unspecified`; the standard join endpoint returns `400 Unsupported investment model`. **P0.**
2. **Progress precision.** `9.375%` is returned/displayed as `9.38%`. **P1** if exact financial reporting is required.
3. **Local health check is unhealthy.** `/health` returned `503` because Firebase was configured as misconfigured, although the API, FileStore, and client served requests. **P1** for deployment/readiness observability.
4. **Proof metadata is shared in authorized declaration/room DTOs.** This is private from public users, but the product should explicitly document whether both parties should see the proof file and metadata. **P1.**

### Missing product capability

The platform is not yet a production investment/payment product because the actual money lifecycle is absent. A declaration is an auditable assertion, not a payment, and the runtime correctly did not convert it into a `PaymentTransaction`.

## Prioritized recommendations

### P0 — before any real-money launch

- Add an explicit, validated investment-model/terms configuration step to opportunity creation or make the normal participation endpoint derive its supported model from the accepted Offer Leg.
- Define and implement the regulated money flow: payment provider, custody/escrow ownership, settlement, refunds, cancellation, reconciliation, and immutable transaction ledger.
- Add KYC/AML, eligibility, consent/legal acceptance, and jurisdiction rules before allowing binding participation or funds transfer.

### P1 — before controlled pilot

- Define loan repayment, default, late, grace, rescheduling, recovery, and dispute operations end-to-end.
- Define equity/profit-sharing accounting, distributions, ownership/exit, and closure workflows.
- Preserve full precision internally and expose a separately labelled display precision for progress/reporting.
- Add explicit proof-access policy and audit logging for every proof view/download.
- Fix Firebase readiness configuration or separate optional integrations from hard health failure.
- Add notifications for every declaration state, dispute response, payment due date, overdue state, and settlement.

### P2 — scale and UX hardening

- Add overfunding/reservation rules, idempotent retries, bulk reconciliation, exports, operational dashboards, and dispute SLAs.
- Add lifecycle closure screens and participant-facing statements.
- Add cross-role UX tests for public, Founder, Investor, Reviewer, and Admin visibility.

## Verification commands/results

- Focused Sprint 2/3 tests: **17 passed, 0 failed** (`FullyQualifiedName~Funding`).
- Backend Release build: **passed, 0 errors**; warnings remain, including nullable warnings and package vulnerability/restore warnings.
- Frontend `npm run validate:i18n`: **passed**.
- Frontend production `npm run build`: **passed** after allowing Angular/esbuild worker startup.
- `git diff --check`: no whitespace errors; Git emitted existing LF/CRLF normalization warnings.
- Runtime services were stopped after UAT; the unrelated `NEXUS.Api` process was not touched.

## Files/artifacts relevant to this task

- New baseline: `Core-BackEnd/Investa.Infrastructure/Migrations/20260902164904_InitialCleanBaseline.cs`
- New baseline designer: `Core-BackEnd/Investa.Infrastructure/Migrations/20260902164904_InitialCleanBaseline.Designer.cs`
- Current model snapshot: `Core-BackEnd/Investa.Infrastructure/Migrations/ApplicationDbContextModelSnapshot.cs`
- Sprint 2/3 runtime implementation and tests remain in the current working tree, including `FundingDeclarationService`, `FundingSemantics`, `FundingDeclaration` DTO/entity files, and the focused unit tests.
- No Flutter files were modified by this UAT execution.
