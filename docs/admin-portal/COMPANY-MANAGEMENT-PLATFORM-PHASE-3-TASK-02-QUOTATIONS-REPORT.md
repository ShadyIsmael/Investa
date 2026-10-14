# COMPANY MANAGEMENT PLATFORM
# PHASE 3 — TASK 02 QUOTATIONS REPORT

## A. Existing quote/proposal code found

The delta audit found no reusable Company quotation aggregate or administration flow. Existing Offer, OfferVersion, OfferLeg, Negotiation Offer, Participation, and Contract-related concepts belong to the FOPX or other product domains and were not reused.

## B. Domain separation from FOPX Offer

Company quotations use dedicated CompanyQuotation and CompanyQuotationLine entities, DTOs, service, controller, routes, permissions, tables, lifecycle, and audit entity type. No FOPX Offer, OfferVersion, OfferLeg, negotiation, or participation code was changed.

## C. Quotation model

CompanyQuotation stores an immutable server number, CustomerId, optional SalesOpportunityId and ContactId, status, date-only IssueDate and ValidUntil, one Currency, authoritative Subtotal/DiscountTotal/TaxTotal/GrandTotal, payment/commercial terms, notes, lifecycle timestamps, rejection reason, and created/updated timestamps. Customer and document snapshots are stored on the aggregate.

## D. Quotation line model

CompanyQuotationLine stores QuotationId, LineNumber, SortOrder, nullable CatalogItemId, catalog code/name snapshots, description, decimal Quantity, Unit, UnitPrice, DiscountType/Value/Amount, TaxRate/Amount, LineSubtotal, and LineTotal.

## E. Number strategy

The server generates QTN-000001-style numbers from a separate NumberSequence. QuotationNumber and NumberSequence are uniquely indexed and are never accepted from the frontend. The numeric sequence leaves room for a later fiscal-year strategy without changing the document identity model.

## F. Customer relationship

Every quotation requires a Company Customer. New quotations require an active customer; an already-linked inactive customer remains readable for historical documents. The CustomerId foreign key remains available alongside immutable commercial snapshots.

## G. Opportunity relationship

SalesOpportunityId is optional and is validated against the Company Sales Opportunity aggregate. A linked opportunity must belong to the same customer and cannot be Lost. FOPX opportunity identifiers are not accepted by this Company Core contract.

## H. Contact relationship

ContactId is optional. A selected contact must belong to the selected customer and must be active for a new quotation. Contact name, email, and phone are snapshotted.

## I. Snapshot strategy

The quotation stores customer code/display-name snapshots and selected contact details. Each line stores catalog code/name, commercial description, unit, and authoritative unit price at quotation time. Detail and print rendering use these snapshots rather than mutable customer/catalog master values.

## J. Catalog line behavior

Only active Company Catalog Items are offered by the lookup. Selection pre-fills catalog identity, description, unit, capability flags, and BasePrice when the catalog currency matches the quotation currency. BasePrice is only a default; the quotation line price can be overridden and does not mutate the catalog.

## K. Custom line decision

Controlled custom lines are supported for bespoke implementation, professional services, and other one-off commercial work. They have no CatalogItemId and still require a name, description fallback, supported unit, non-negative unit price, quantity, discount, and tax validation. No shadow catalog item is created.

## L. Mixed commercial model

One quotation can contain catalog and custom lines together, with up to 100 lines. The model does not assume one product per quotation.

## M. Currency model

A quotation has exactly one active Currency Master code. All lines use that quotation currency. Multi-currency lines and FX conversion are intentionally excluded.

## N. Quantity/unit

Quantity is decimal and must be greater than zero. Supported MVP units are Unit, User, Seat, Month, Year, Project, Hour, and Day. Unit conversion is not implemented; the selected or entered unit is snapshotted.

## O. Discount model

Discounts are line-level only and support None, Percentage, and FixedAmount. Percentage values are limited to 0–100. Fixed amounts are non-negative and cannot reduce a line below zero. No quotation-level discount or pricing engine was added.

## P. Tax model

Tax is an explicit line-level percentage from 0–100. No jurisdiction, VAT default, tax code, withholding, or tax-authority integration is assumed.

## Q. Calculation order

The server recalculates every line as:

1. Gross line amount = Quantity × UnitPrice.
2. Apply the selected line discount.
3. Tax the discounted taxable amount.
4. LineTotal = taxable amount + TaxAmount.
5. Quote totals are sums of the authoritative rounded line results.

Client preview calculations mirror this order for UX only; submitted totals are ignored.

## R. Rounding strategy

All money calculations use decimal arithmetic and two-place MidpointRounding.AwayFromZero. Quantity is persisted as decimal(18,4); money values as decimal(18,2); tax rates as decimal(5,2). Decimal overflow is translated to QUOTATION_AMOUNT_INVALID rather than leaking an arithmetic exception.

## S. Status model

Persisted statuses are Draft, Sent, Accepted, and Rejected. No Contract state or excessive intermediate lifecycle was introduced.

## T. Expiry behavior

ValidUntil is optional and must be on or after IssueDate. IsExpired is computed when ValidUntil is before the current UTC business date and status is not Accepted or Rejected. Expiry does not mutate persisted status or trigger background jobs.

## U. Draft behavior

Draft quotations can be edited, including customer/contact/opportunity, terms, dates, and lines. No hard-delete endpoint was added.

## V. Sent behavior

Mark Sent is an explicit Manage action. It records SentAt and makes the quotation immutable; there is no generic status PUT.

## W. Accepted behavior

Accepted is allowed only from Sent, records AcceptedAt, and is terminal for this MVP. It does not create a Contract, entitlement, invoice, or accounting record.

## X. Rejected behavior

Rejected is allowed only from Sent and requires a trimmed reason of at most 1,000 characters. RejectedAt and RejectionReason are retained and the document is not deleted.

## Y. Revision/versioning decision

No full quotation revision engine was added. Sent, Accepted, and Rejected quotations are protected. A future controlled revision can introduce a new quotation revision/document without mutating the historical issued document.

## Z. Payment/commercial terms

PaymentTerms, CommercialTerms, and Notes are free-text MVP fields with a 4,000-character limit. Payment schedules, installment engines, legal clause libraries, e-signature, and contract templates remain outside this task.

## AA. Print representation

The detail and print route render a browser-print-friendly commercial document containing number, status, dates, customer/contact/opportunity, snapshot lines, discounts, tax, totals, terms, notes, and lifecycle data. A print API endpoint is also available. No fabricated company address, VAT number, logo, or bank details are shown.

## AB. Database migration

Migration 20261001181250_AddCompanyQuotationFoundation creates only CompanyQuotations and CompanyQuotationLines. It has not been applied to a live database.

## AC. Indexes

CompanyQuotations has unique QuotationNumber and NumberSequence indexes plus CustomerId, SalesOpportunityId, ContactId, Status, IssueDate, ValidUntil, and CreatedAt indexes. CompanyQuotationLines has QuotationId and CatalogItemId indexes. No snapshot-field indexes were added.

## AD. Endpoints

Canonical API routes are under /api/v1/admin/sales/quotations, with the existing compatibility prefix retained:

- GET collection, detail, and print.
- POST create.
- PUT Draft update.
- POST /send, /accept, and /reject transitions.
- GET customer, customer-contact, opportunity, catalog-item, and currency lookups.

Canonical frontend routes are:

- /admin/sales/quotations
- /admin/sales/quotations/new
- /admin/sales/quotations/:quotationId
- /admin/sales/quotations/:quotationId/edit
- /admin/sales/quotations/:quotationId/print

## AE. Permissions

Canonical permissions are Company.Sales.Quotations.View, Create, Edit, and Manage. View gates list/detail/print; Create gates Draft creation; Edit gates Draft editing; Manage gates Send/Accept/Reject. Existing SalesQuotation aliases are retained through the authorization compatibility map and an idempotent permission backfill.

## AF. List query

The service uses IQueryable filters, CountAsync, controlled ordering, Skip/Take, and projection before materialization. Page size is clamped to 1–100 and the response returns Page, PageSize, Total, and Items.

## AG. Search

Server search covers quotation number, customer code/name snapshots, and linked Company Sales Opportunity code/title. It is not limited to the current client page.

## AH. Filters

Supported server filters are status, customer, opportunity, currency, IssueDate range, and ValidUntil range.

## AI. Sorting

Sorting is whitelisted for CreatedAt, UpdatedAt, QuotationNumber, Customer, IssueDate, ValidUntil, Status, and GrandTotal. Default ordering is CreatedAt descending with a stable Id tie-breaker.

## AJ. Pagination

Pagination is server-side, capped at 100 rows per page, and exposed in both API and typed frontend query contracts.

## AK. Lookup contracts

Dedicated bounded lookup contracts return active customers, active customer contacts, non-Lost Company Sales Opportunities, active catalog items, and active currencies. Customer, opportunity, and catalog lookups are capped and searchable.

## AL. Create/edit UX

The typed feature boundary in features/sales/quotations provides a dense enterprise editor with header, lines, terms, and totals sections. It supports direct creation and the opportunityId query path without copying forecast value or probability.

## AM. Line editor

The editor supports catalog selection, custom lines, description, decimal quantity, unit, unit price override, discount type/value, tax rate, add/remove line, and immediate client preview. It uses controlled horizontal overflow for the dense desktop grid and saves once through the Draft request contract.

## AN. Detail architecture

Detail is a document-style page with identity, customer/contact/opportunity, commercial lines, totals, terms, lifecycle, system metadata, state-aware actions, and a print representation. Accepted and Rejected views are read-only.

## AO. Opportunity integration

Sales Opportunity detail exposes Create Quotation for permitted users when the opportunity is not Lost. The creation route pre-fills customer, primary contact, matching currency, and interested catalog lines while leaving price and final totals under quotation control.

## AP. Customer integration if implemented

No Customer detail redesign or unbounded related-quotation fetch was added. Quotation links return to the existing Customer detail route.

## AQ. Contract-readiness

The accepted quotation retains stable customer, contact, line, price, currency, and commercial-term snapshots suitable for a later Accepted Quotation → Contract foundation. Contract creation is intentionally not implemented.

## AR. Audit

Existing AuditLog infrastructure records Create, Draft Update, Sent, Accepted, and Rejected aggregate events with actor identity when available and serialized commercial context. No second audit framework was introduced.

## AS. Validation

Backend validation covers customer existence/active state, opportunity existence/customer match/suitability, contact ownership/activity, active currency, line count, catalog activity, custom-line requirements, supported units, quantity, non-negative prices, discount bounds, tax bounds, date ordering, rejection reason, Draft-only updates, valid transitions, and decimal overflow.

## AT. Calculation tests

CompanyQuotationServiceTests cover decimal quantity × price, percentage discount, fixed discount rejection, tax after discount, zero/default values, totals, multiple persisted lines, and overflow-safe amount validation.

## AU. Snapshot tests

The focused snapshot test changes customer display name, catalog name, and BasePrice after creation and verifies that quotation detail still returns the original customer and line snapshots and original issued price.

## AV. Backend tests

Focused quotation tests: 5 passed, 0 failed. The combined Company Customer, Catalog, Sales Opportunity, and Quotation regression filter passed 21 tests. Coverage includes service behavior, list/search/filter/sort/page contracts, lifecycle immutability, validation, and canonical controller permissions.

## AW. Frontend tests

QuotationPages.test.tsx passes 4 tests covering preview calculation order, list/search/sort behavior, opportunity prefill with dependent customer/contact/catalog data, and Sent → Accepted lifecycle/read-only behavior. The full frontend suite passes 17 test files and 59 tests.

## AX. TypeScript

npx tsc --noEmit --pretty false passed after the quotation test and overflow hardening changes.

## AY. Backend build

dotnet build Core-BackEnd/Investa.API/Investa.API.csproj --no-restore /m:1 passed with 0 warnings and 0 errors.

## AZ. Frontend build

npm run build passed. Vite transformed 2,536 modules and produced the production bundle successfully.

## BA. Route chunk size

The lazy quotation route chunk is QuotationRoutes-BoHiZQO0.js at 41.82 kB, 8.93 kB gzip.

## BB. Remaining gaps

Intentional future work includes company-profile identity fields for richer print stationery, Contract creation from Accepted quotations, quotation revision/version workflow, formal tax configuration, FX, billing, collections, accounting, licenses, subscriptions, and full API/integration test-host coverage. No gap blocks the requested quotation foundation.

## BC. USER UAT checklist

The user should perform the following manual checks:

- Open the quotation list, search, filter, sort, paginate, and confirm the operational table layout.
- Create a direct Draft with catalog, custom, mixed, quantity, discount, tax, date, currency, and terms data.
- Start from a suitable Sales Opportunity and confirm customer/contact/interested-line prefill without forecast-value copying.
- Confirm same-currency catalog pricing prefill and manual pricing when catalog currency differs.
- Confirm Draft edit, Send, Sent immutability, Accept, Reject with required reason, and terminal read-only actions.
- Open the print route and verify clean browser printing, snapshots, totals, dates, terms, and absence of fabricated company identity.
- Check permission-gated actions, keyboard/form accessibility, responsive line-grid behavior, EN/AR text, RTL layout, and light/dark presentation.

No manual UAT, login, browser verification, or live claim was performed by the agent.

## BD. Recommended Phase 3 Task 03 scope

Implement Company Contract foundation from an Accepted CompanyQuotation only: Contract and ContractLine domain model, immutable agreement snapshots, controlled Accepted → Contract creation, contract number/lifecycle, dedicated permissions, migration, detail/print/readiness contracts, and tests. Keep licenses, subscriptions, invoices, collections, and accounting outside Task 03 unless separately authorized.

## FINAL CLASSIFICATION

PHASE 3 TASK 02 — IMPLEMENTED / READY FOR USER UAT
