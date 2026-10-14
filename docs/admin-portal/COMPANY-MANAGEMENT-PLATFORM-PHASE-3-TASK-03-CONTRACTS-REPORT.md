# COMPANY MANAGEMENT PLATFORM
# PHASE 3 — TASK 03 COMPANY CONTRACTS REPORT

## A. Existing contract-related code found

The delta audit found the existing FOPX `InvestmentContract`, contract versions/events, and related FOPX deal concepts. No Company commercial contract aggregate or administration flow existed before this task.

## B. Domain separation from FOPX Contract

Company contracts use dedicated `CompanyContract` and `CompanyContractLine` entities, services, controllers, tables, permissions, routes, and audit entity type. FOPX `InvestmentContract` and its lifecycle remain unchanged.

## C. Contract model

`CompanyContract` stores immutable CTR identity, customer/source quotation relationships, optional opportunity/contact traceability, customer/contact snapshots, Draft/Active/Completed/Terminated status, one currency, DateOnly commercial dates, copied authoritative totals, terms/notes, lifecycle timestamps, termination reason, and timestamps.

## D. Contract line model

`CompanyContractLine` preserves the source quotation line ID, line ordering, nullable catalog reference, catalog/item snapshots, description, quantity, unit, unit price, discount/tax values, line subtotal/total, and immutable license/subscription capability snapshots.

## E. Contract number strategy

The server generates `CTR-000001`-style numbers from a Company-contract-specific `NumberSequence`. `ContractNumber` and `NumberSequence` are uniquely indexed and never accepted from the client.

## F. Source Quotation rule

Creation is source-bound: only an existing `CompanyQuotation` in `Accepted` status can create a contract. There is no generic direct-contract creation endpoint.

## G. One-contract-per-quotation rule

`SourceQuotationId` is a required unique foreign key. The service returns the existing contract for an idempotent repeat request and handles unique-key races as a clean business conflict.

## H. Customer relationship

The contract retains the source quotation's Company Customer ID and immutable code/name/legal-name snapshots. The customer relationship is restrictive and historical display does not depend on current master text.

## I. Opportunity/contact traceability

Optional `SalesOpportunityId` and `ContactId` are copied from the accepted quotation. Opportunity/contact display also uses stored contact snapshots; no unbounded related fetch was added.

## J. Snapshot strategy

Customer, contact, quotation line, catalog identity, descriptions, commercial values, and capability flags are copied at conversion. Detail and print views use contract snapshots and do not recalculate from current catalog data.

## K. Quote-to-Contract conversion

The atomic conversion validates the accepted source, validates source line calculations and totals, validates active currency, applies contract metadata, copies authoritative totals and lines, adds an AuditLog record, and saves header/lines together.

## L. Custom line preservation

Custom quotation lines remain contract lines with `CatalogItemId = null`, their source line ID, item name, description, unit, and authoritative financial values intact. No shadow catalog item is created.

## M. Mixed commercial model

A contract can contain catalog-backed and custom lines in the same agreement. The contract does not assume every line has a current catalog record.

## N. Currency / money behavior

The contract copies the accepted quotation's single active currency and authoritative decimal totals. No FX, multi-currency line, or conversion logic was added.

## O. Contract dates

Effective, start, end, and signed dates are nullable `DateOnly` values. The server rejects an end date before start or effective date and performs no unrequested complex chronology rules.

## P. Status model

The persisted lifecycle is `Draft → Active → Completed` or `Draft → Active → Terminated`. Completed and Terminated are terminal; no reopen or reactivate transition exists.

## Q. Draft behavior

Conversion creates Draft. Draft editing is limited to dates, signed date, payment terms, commercial terms, and notes. Source quotation, customer, currency, number, lines, snapshots, and financial values remain read-only.

## R. Commercial line immutability

There is no contract line edit API or UI. Contract detail, print, and draft screens render the copied commercial lines read-only.

## S. Activate behavior

Manage permission is required. Activation requires Draft status, valid dates, at least one line, source quotation still Accepted, and internally consistent copied totals. It records `ActivatedAt` and performs no provisioning.

## T. Complete behavior

Manage permission is required. Only Active contracts can be completed; `CompletedAt` is recorded and the contract becomes terminal.

## U. Termination behavior

Manage permission is required. Only Active contracts can be terminated, and a trimmed reason of at most 1,000 characters is required. `TerminatedAt` and `TerminationReason` are stored; no settlement or accounting side effect occurs.

## V. Payment/commercial terms

Payment terms, commercial terms, and notes are copied from the quotation by default and may be set as contract-specific metadata while Draft, with a 4,000-character server limit.

## W. Contract value semantics

Subtotal, discount total, tax total, grand total, and all line amounts are agreement snapshots copied from the accepted quotation. The service validates their internal consistency and never reprices from the catalog.

## X. Capability snapshot decision

The chosen MVP decision is line-level snapshots: `SupportsLicenseSnapshot` and `SupportsSubscriptionSnapshot` are captured at conversion. Custom lines default to false. These flags indicate future fulfillment readiness only.

## Y. License-readiness

License-capable catalog lines are visibly marked by their immutable capability snapshot. No License aggregate, entitlement, activation, provisioning, or licensing side effect was implemented.

## Z. Subscription-readiness

Subscription-capable catalog lines are visibly marked by their immutable capability snapshot. No Subscription, renewal, billing cadence, or provisioning behavior was implemented.

## AA. Database migration

Added `20261001185633_AddCompanyContractFoundation` with only `CompanyContracts` and `CompanyContractLines`. The migration was generated and inspected but not applied to a live database.

## AB. Indexes

Unique indexes cover contract number, number sequence, and source quotation. Supporting indexes cover customer, opportunity, status, effective/start/end dates, created time, contract lines, source quotation lines, catalog items, and conventionally indexed nullable relationships.

## AC. Endpoints

Canonical endpoints are `GET /api/v1/admin/sales/contracts`, `GET /{id}`, `GET /by-quotation/{quotationId}`, `GET /{id}/print`, `POST /from-quotation/{quotationId}`, `PUT /{id}`, and Manage actions `POST /{id}/activate`, `/complete`, and `/terminate`. The legacy `/api/admin/sales/contracts` prefix is retained for compatibility.

## AD. Permissions

Canonical Company permissions are `Company.Sales.Contracts.View`, `Create`, `Edit`, and `Manage`. Startup backfill is idempotent, and legacy `SalesContract.*` aliases continue to authorize through the compatibility handler.

## AE. List query

The backend applies filters and search to `IQueryable`, counts before paging, then projects only list fields. It does not materialize the full contract set.

## AF. Search

Search covers contract number, customer code/name snapshot, source quotation number, and optional opportunity code/title.

## AG. Filters

Supported filters include status, customer, opportunity, currency, effective-date range, start-date range, and end-date range.

## AH. Sorting

Controlled server sorting covers contract number, customer, status, effective/start/end dates, grand total, updated time, and created time, with deterministic ID tie-breaking.

## AI. Pagination

Page and page size are server-clamped, with a maximum page size of 100. The query performs `CountAsync`, `Skip`, `Take`, and projection in that order.

## AJ. Detail architecture

The Company Contract detail is a dedicated document-style view with source quotation, customer, optional opportunity/contact, immutable line table, copied totals, metadata, and lifecycle history. Print uses the same data contract.

## AK. Edit behavior

Only Draft metadata can be edited through the dedicated Edit route and API. Active, Completed, and Terminated contracts have no edit or delete affordance.

## AL. Quotation integration

Accepted quotation detail now shows Create Contract when no source contract exists and the user has Create permission; otherwise it shows View Contract when a linked contract exists and View permission is present.

## AM. Customer / Opportunity integration

Links are lightweight ID-based links to existing Company Customer and Sales Opportunity detail routes. No customer or opportunity redesign was introduced.

## AN. Print representation

The print route is a browser-print-friendly contract document with no fake company identity. It presents source, snapshots, lines, capability markers, terms, totals, and lifecycle timestamps.

## AO. Audit

Creation, metadata update, activation, completion, and termination write the existing `AuditLog` entity with Company Contract entity type and relevant identifiers/change data.

## AP. Validation

Server validation covers accepted source state, source existence, active currency, source line values/totals, dates, terms length, lifecycle transitions, line presence for activation, and termination reason. Client validation is UX-only.

## AQ. Atomicity

Conversion begins a unit-of-work transaction, adds header, lines, and audit record, saves, and commits together. A persistence conflict rolls back and returns an existing source contract when the unique source key now resolves.

## AR. Conversion tests

Backend tests cover accepted conversion, rejected source statuses, duplicate/idempotent conversion, inconsistent source totals, date rejection, mixed catalog/custom lines, and no contract persistence after rejection.

## AS. Snapshot tests

Backend tests mutate customer and catalog values after conversion and verify contract customer/item/price/capability snapshots remain unchanged. Custom-line null catalog and false capability snapshots are covered.

## AT. Lifecycle tests

Backend tests cover Draft activation, Active completion, Active termination, required termination reason, invalid transitions, terminal immutability, and lifecycle timestamps.

## AU. Backend tests

Focused contract tests: 5 passed. Full unit suite: 364 passed, 1 unrelated existing Playwright/Edge renderer test failed because the installed Edge process closed after launch in the test environment; the initial sandboxed run reported the same environment issue as `spawn EPERM`.

## AV. Frontend tests

Focused contract page tests: 4 passed. Full frontend suite: 18 files and 63 tests passed. Coverage includes list search/filter, source-bound create with read-only lines, draft activation refresh, and accepted quotation Create/View Contract links.

## AW. TypeScript

`npx.cmd tsc --noEmit --pretty false` passed.

## AX. Backend build

`dotnet build Core-BackEnd/Investa.API/Investa.API.csproj --no-restore /m:1 -v:minimal` passed with 0 warnings and 0 errors after the contract changes.

## AY. Frontend build

`npm.cmd run build` passed: 2,541 modules transformed and production assets emitted successfully.

## AZ. Route chunk size

The lazy Company Contract route chunk is `ContractRoutes-BabdD1nA.js`, 28.62 kB / 5.73 kB gzip in the verified build. The feature is not in the initial shell bundle.

## BA. Remaining gaps

The live database migration still needs to be applied through the deployment process. No e-signature, amendments/versioning, renewals, invoices, collections, accounting, entitlement provisioning, FX, or project fulfillment behavior is included by design. The unrelated Playwright renderer test remains environment-sensitive.

## BB. USER UAT checklist

1. Apply the generated migration in the intended environment.
2. Sign in with View/Create/Edit/Manage combinations and verify each Company Contract route is permission-gated.
3. Open an Accepted Company Quotation and create one contract; repeat the action and verify the existing contract is shown.
4. Verify catalog and custom lines, customer/contact/opportunity links, snapshots, currency, copied totals, terms, and capability markers.
5. Edit only Draft metadata; confirm lines, source, customer, currency, number, and totals are read-only.
6. Activate with valid dates, then verify completion and termination paths, required termination reason, terminal behavior, print output, light/dark mode, Arabic/RTL, responsive tables, and accessible keyboard labels.

## BC. Recommended Phase 4 first task

Start with a bounded Company fulfillment/readiness foundation that consumes the contract line capability snapshots and defines the first explicit downstream ownership boundary before implementing License or Subscription records. Keep provisioning, entitlements, billing, and renewals out until that contract is approved.

## Final classification

PHASE 3 TASK 03 — IMPLEMENTED / READY FOR USER UAT
