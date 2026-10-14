# COMPANY MANAGEMENT PLATFORM
# PHASE 3 — TASK 01 SALES OPPORTUNITIES REPORT

## A. Existing sales/CRM code found

The audit found the existing FOPX Opportunity participant/funding workflow and its `/admin/fopx/opportunities` route. No existing Company Core sales-opportunity aggregate was suitable for reuse. The Phase 2 Company Customer and Company Catalog foundations are the existing Company-side relationship sources.

## B. Separation

Company Sales Opportunities are implemented as a separate Company Core aggregate, service, controller, tables, permissions, routes, frontend module, and audit boundary. No FOPX Opportunity table, lifecycle, service, API, or synchronization is reused.

## C. Model

`CompanySalesOpportunity` contains Id, immutable server code sequence/code, Title, CustomerId, optional PrimaryContactId, Stage, Status, ExpectedValue, Currency, Probability, date-only ExpectedCloseDate, optional SalesOwnerUserId, Source, Description, Notes, LostReason, WonAt, LostAt, CreatedAt, UpdatedAt, and a collection of `CompanySalesOpportunityItem` catalog references.

## D. Code

Codes are generated server-side as `SAL-000001`, `SAL-000002`, and so on. The numeric sequence and code are unique database-protected fields. Client requests cannot set or edit the code.

## E. Customer

Create requires a Company Customer. The service validates that a new relationship targets an active customer. Existing historical relationships may remain readable when a customer is later inactive.

## F. Contact

The primary contact is optional. When supplied, it must be an active contact belonging to the selected Company Customer. Contacts are loaded through a customer-scoped lookup endpoint.

## G. Catalog

An opportunity may reference distinct active Company Catalog Products and Services, up to 100 items. The relationship stores catalog identity and notes only; it does not store quantity, quote price, tax, discount, or invoice data.

## H. Stage

Stages are `New`, `Qualified`, `Proposal`, and `Negotiation`. Stage changes are server-validated, editable only while Open, and audited.

## I. Status

Statuses are `Open`, `Won`, and `Lost`. Won and Lost are terminal states and cannot be reopened or edited through the opportunity administration surface.

## J. Won

Won is an explicit Manage action. It sets Status to Won, records WonAt, updates UpdatedAt, writes an audit event, and creates no quotation, contract, invoice, licensing, subscription, or accounting record.

## K. Lost

Lost is an explicit Manage action and requires a trimmed reason of at most 1,000 characters. It sets Status to Lost, records LostReason and LostAt, updates UpdatedAt, writes an audit event, and remains terminal.

## L. Expected value/currency

ExpectedValue is optional and must be non-negative. Currency is optional metadata, but when supplied it is normalized to uppercase and must match an active Currency Master code. No monetary transaction is created.

## M. Probability

Probability is optional and constrained server-side to 0 through 100.

## N. Close date

ExpectedCloseDate is nullable and persisted as a date-only value. List filtering supports inclusive ExpectedCloseFrom and ExpectedCloseTo boundaries.

## O. Owner

SalesOwnerUserId is nullable. The owner lookup and validation accept only active internal `OrgUser` records; owner display data is included in list/detail responses.

## P. Source

Source is optional and uses the controlled values Referral, Website, Direct, ExistingCustomer, Partner, and Other.

## Q. Migration

`20261001171656_AddCompanySalesOpportunityFoundation` creates `CompanySalesOpportunities` and `CompanySalesOpportunityItems`, their fields, restricted foreign keys, and indexes. The migration has been generated and compiled but has not been applied to a live/UAT database during this pass.

## R. Indexes

The migration adds unique CodeSequence and OpportunityCode indexes plus indexes for CreatedAt, CustomerId/Status, ExpectedCloseDate, PrimaryContactId, SalesOwnerUserId, Status/Stage, CatalogItemId, and the opportunity-item composite relationship. Foreign keys to Customer, Contact, Catalog Item, and AuthUser use restricted delete behavior to preserve history.

## S. Endpoints

The controller provides:

- `GET /api/v1/admin/sales/opportunities`
- `GET /api/v1/admin/sales/opportunities/{id}`
- `POST /api/v1/admin/sales/opportunities`
- `PUT /api/v1/admin/sales/opportunities/{id}`
- `PATCH /api/v1/admin/sales/opportunities/{id}/stage`
- `POST /api/v1/admin/sales/opportunities/{id}/won`
- `POST /api/v1/admin/sales/opportunities/{id}/lost`
- `GET /api/v1/admin/sales/opportunities/lookup/customers`
- `GET /api/v1/admin/sales/opportunities/lookup/customers/{customerId}/contacts`
- `GET /api/v1/admin/sales/opportunities/lookup/catalog-items`
- `GET /api/v1/admin/sales/opportunities/lookup/owners`

The compatibility prefix `/api/admin/sales/opportunities` is also supported.

## T. Permissions

Canonical permissions are `Company.Sales.Opportunities.View`, `Company.Sales.Opportunities.Create`, `Company.Sales.Opportunities.Edit`, and `Company.Sales.Opportunities.Manage`. Startup backfill adds missing definitions idempotently. Authorization retains compatibility aliases for legacy `SalesOpportunity.*` keys without sharing FOPX Opportunity permissions.

## U. List query

The list service uses server-side IQueryable filtering, search, controlled ordering, count, projection, and Skip/Take pagination. It does not materialize the full opportunity set for client-side processing.

## V. Search

Search covers OpportunityCode, Title, CustomerCode, Customer display name, and Sales Owner name.

## W. Filters

The API supports Stage, Status, CustomerId, CatalogItemId, SalesOwnerUserId, ExpectedCloseFrom, and ExpectedCloseTo filters.

## X. Sorting

Sorting is restricted to CreatedAt, UpdatedAt, Title, Customer, Stage, Status, ExpectedValue, and ExpectedCloseDate. Unsupported values fall back to CreatedAt, with deterministic Id tie-breaking.

## Y. Pagination

Page and PageSize are server-side. PageSize is clamped to a maximum of 100. Responses return Page, PageSize, Total, and Items.

## Z. Lookup

Customer, contact, catalog-item, and owner lookups are server-side and bounded. Customers and catalog items must be active; contacts must be active and customer-scoped; owners must be active internal users.

## AA. Create

Create validates title, customer/contact relationship, stage/source enums, expected value, currency, probability, notes/description lengths, owner, and catalog-item relationships. It assigns the server code, Open status, timestamps, and a create audit event.

## AB. Edit/closed

Open opportunities can be edited through the PUT contract and stage action. Won and Lost opportunities are read-only; service-side guards prevent edits, stage changes, Won/Lost repetition, and reopening even if a client bypasses UI controls.

## AC. Detail

Detail presents identity, stage/status, customer/contact, catalog interests, forecast metadata, owner/source, notes, outcome timestamps/reason, and system timestamps. Terminal records expose outcome history without edit or reopen actions.

## AD. Customer navigation

List and detail customer references link to `/admin/customers/:customerId`. This is navigation into the existing Company Customer module; no duplicate customer data or relationship workflow was added.

## AE. Catalog navigation

Detail catalog interests link to `/admin/catalog/products/:itemId`, preserving the existing Company Catalog boundary.

## AF. Customer integration

Sales Opportunities reference Company Customer and Company Customer Contact through foreign keys and lookup validation. No customer totals, customer status changes, customer-facing CRM workflow, or reverse synchronization was introduced.

## AG. Audit

Create, edit, stage change, Won, and Lost actions create AuditLog records with entity type, entity ID, action, serialized change context, timestamp, and the authenticated actor when available.

## AH. FOPX isolation

The existing `/admin/fopx/opportunities` route and FOPX Opportunity administration remain intact. Company Sales Opportunity routes, permissions, tables, services, and navigation entries are distinct; no FOPX participant, funding, review, or operational state is changed.

## AI. Quotation-readiness

The foundation intentionally stops before quotations. It provides the customer and catalog references that a future quotation boundary may consume, but does not create quote lines, negotiated prices, taxes, discounts, quantities, contracts, licensing, subscriptions, invoices, collections, or accounting postings.

## AJ. Routes

The canonical Company routes are:

- `/admin/sales/opportunities`
- `/admin/sales/opportunities/new`
- `/admin/sales/opportunities/:opportunityId`
- `/admin/sales/opportunities/:opportunityId/edit`

The existing `/admin/fopx/opportunities` route remains separately owned by FOPX.

## AK. Lazy

Sales opportunity pages are isolated in `SalesOpportunityRoutes.ts` and loaded through a dedicated lazy route loader. They are not included in the initial Company shell module.

## AL. EN/AR/RTL

English and Arabic strings cover navigation, forms, statuses, stages, sources, validation, empty/loading/error states, outcomes, and actions. Existing language direction handling is preserved; identifiers, codes, dates, and monetary values use LTR-safe rendering where appropriate.

## AM. Accessibility

The UI uses semantic page headings and sections, associated labels, native select/input/checkbox controls, table headers, keyboard-operable links and buttons, visible loading/empty/error states, status text that is not color-only, `aria-busy`, alert regions, and responsive table behavior.

## AN. Backend tests

The focused `CompanySalesOpportunityServiceTests` suite passes: 5 passed, 0 failed. Coverage includes immutable code, customer/contact/item validation, multiple interests, server-side list/search/page-size behavior, terminal Won/Lost behavior, and permission attributes. The combined Company Customer/Catalog/Sales foundation selection passes 16 tests. The final serial `Investa.API.csproj` build passes with 0 warnings and 0 errors.

## AO. Frontend tests

The focused Sales Opportunity page suite passes: 4 passed. The complete frontend suite passes: 16 test files and 55 tests.

## AP. TypeScript

`npx.cmd tsc --noEmit --pretty false` passes.

## AQ. Backend build

`dotnet build Core-BackEnd/Investa.API/Investa.API.csproj --no-restore /m:1` passes with 0 warnings and 0 errors after migration generation and final cleanup.

## AR. Frontend build

The production frontend build succeeds after transforming 2,531 modules.

## AS. Chunk size

Validated lazy chunk: `SalesOpportunityRoutes-Bh3kICDA.js` — 31.57 kB raw and 6.84 kB gzip.

## AT. Gaps

The generated migration still needs application to the intended UAT database. No live API/database smoke test or manual browser UAT was performed. The server-side sequence strategy is protected by unique indexes but should be concurrency/load-tested before production scale. Quotation, contract, licensing, subscription, billing, and accounting workflows remain intentionally out of scope.

## AU. UAT checklist

1. Apply `20261001171656_AddCompanySalesOpportunityFoundation` to the UAT database and start the API/frontend.
2. Verify View, Create, Edit, and Manage permission behavior, including forbidden access and hidden unauthorized actions.
3. Open `/admin/sales/opportunities`; verify loading, empty, search, Stage/Status filters, sorting, server pagination, and the 100-item page-size cap.
4. Create opportunities against active customers, an optional customer-owned contact, multiple active catalog items, an optional owner, expected value/currency, probability, close date, source, description, and notes; verify `SAL-000001`-style server codes.
5. Verify inactive customers, foreign/inactive contacts, inactive/unknown catalog items, inactive/unknown currencies, invalid owner, negative value, probability outside 0–100, invalid enums, and oversized text are rejected.
6. Verify open edit and stage changes, immutable codes, customer navigation, catalog navigation, and bilingual English/Arabic display with RTL direction.
7. Mark an opportunity Won and verify WonAt, terminal read-only behavior, audit data, and no auto-created quotation/contract/billing/accounting records.
8. Mark an opportunity Lost with and without a reason; verify required LostReason, LostAt, terminal behavior, and audit data.
9. Verify `/admin/fopx/opportunities` remains the existing FOPX module and does not show Company Sales Opportunities.
10. Verify responsive layout, keyboard navigation, status/stage text, loading/error/empty states, and light/dark themes.

## AV. Task 02 scope

Phase 3 Task 02 should define the next approved Company commercial boundary, likely quotation foundation only: quote persistence, explicit opportunity linkage, quote lines and pricing rules, lifecycle, permissions, audit, and administration. It must not silently add contracts, licensing, subscriptions, invoicing, collections, or accounting.

## Final classification

PHASE 3 TASK 01 — IMPLEMENTED / READY FOR USER UAT
