# COMPANY MANAGEMENT PLATFORM
# PHASE 2 — TASK 02 PRODUCT CATALOG REPORT

## A. Existing catalog/product code found

The delta audit found legacy `ServicePrice`, `PricingRule`, `PricingService`, and FOPX credit/operational pricing concepts. None represents the Company commercial catalog. They remain in their existing FOPX/credit boundaries and were not reused as Company Products & Services.

## B. Domain decision

The Company Core now owns one independent `CompanyCatalogItem` root for commercial Products and Services. It is the source of truth for what the company sells, without introducing sales, quotation, contract, licensing, subscription, invoice, or accounting records.

## C. Catalog model

`CompanyCatalogItem` contains Id, immutable server-generated Code, Name, concise Description, Product/Service Type, Active/Inactive Status, explicit capability flags, optional WorkspaceKey, controlled DefaultUnit, optional BasePrice/Currency, and CreatedAt/UpdatedAt.

## D. Product/Service type strategy

One root supports exactly two MVP types: `Product` and `Service`. No separate Product and Service subsystems or large taxonomy were introduced.

## E. Code generation

The service generates stable codes as `CAT-000001`, `CAT-000002`, and so on from a server-side sequence. Code is not accepted from frontend input, is immutable on edit, is not the primary key, and is protected by unique Code and CodeSequence indexes.

## F. Capability model

Capabilities are explicit persisted booleans: SupportsLicense, SupportsSubscription, and SupportsWorkspace. They are not derived from item names. Capability filters are available server-side for all three flags.

## G. Workspace relationship

Workspace support is metadata only. The current supported key is `fopx`, representing FOPX One. The service requires a valid `fopx` key when workspace support is enabled and clears/rejects WorkspaceKey when workspace support is disabled. No Workspace table, CRUD, plugin registry, NEXUS workspace, pricing synchronization, client synchronization, or provisioning was added.

## H. Default unit

DefaultUnit is an optional controlled value from Unit, User, Seat, Month, Year, Project, Hour, or Day. No unit conversion or accounting logic was added.

## I. Base price/currency behavior

BasePrice is optional commercial reference metadata only. It must be non-negative. Currency is required when BasePrice is supplied, normalized to uppercase, and validated against an active Currency Master code. No FX, contract pricing, invoice amount, tax transaction, or FOPX operational fee behavior was added.

## J. Status model

Catalog items use Active/Inactive lifecycle state. Deactivation/reactivation is supported and no hard-delete endpoint exists.

## K. Database migration

`20261001164338_AddCompanyCatalogFoundation` creates only `CompanyCatalogItems`, its required fields, and the justified indexes. No Plans, Licenses, Subscriptions, Quotations, Contracts, Invoice Lines, or Accounting tables were added.

The migration has not been applied to a live/UAT database during this implementation pass.

## L. Indexes

Code and CodeSequence are unique. Type, Status, and CreatedAt are indexed. Descriptive fields are not indexed broadly; capability filtering remains server-side without adding low-selectivity indexes.

## M. Backend endpoints

The controller provides:

- `GET /api/v1/admin/catalog/products`
- `GET /api/v1/admin/catalog/products/{id}`
- `POST /api/v1/admin/catalog/products`
- `PUT /api/v1/admin/catalog/products/{id}`
- `PATCH /api/v1/admin/catalog/products/{id}/status`

The compatibility prefix `/api/admin/catalog/products` is also supported.

## N. Permissions

Canonical permission keys are `Company.Products.View`, `Company.Products.Create`, `Company.Products.Edit`, and `Company.Products.Manage`. Startup backfill creates missing keys idempotently. API policies use permission authorization only, with compatibility aliases for earlier `Product.*` keys and no role-name shortcuts.

## O. List query architecture

The list service follows `IQueryable → filters → search → controlled sort → CountAsync → Skip/Take → lightweight projection → ToListAsync`. Full catalog materialization and client-side paging are not used.

## P. Search

Server-side search covers Code, Name, and Description.

## Q. Filters

Type and Status filters are supported, along with SupportsLicense, SupportsSubscription, and SupportsWorkspace capability filters.

## R. Sorting

Sorting is restricted to Code, Name, Type, BasePrice, UpdatedAt, Status, and the default CreatedAt ordering. Unsupported fields fall back to CreatedAt; arbitrary property sorting is not exposed.

## S. Pagination

Page and PageSize are server-side, PageSize is bounded to 100, and responses return Page, PageSize, Total, and Items.

## T. Create behavior

Create validates Name, Type, Description length, DefaultUnit, non-negative BasePrice, Currency rules, capability/workspace consistency, and active Currency Master membership. It assigns the server-generated CAT code, Active status, timestamps, and an existing-convention audit record.

## U. Edit behavior

Authorized edit users can update Name, Description, Type, DefaultUnit, BasePrice/Currency, capabilities, and WorkspaceKey. Code remains immutable. Type changes are allowed in this phase because no commercial references exist yet; future reference-aware restrictions can be added at the service boundary.

## V. Activate/deactivate

Manage users can activate or deactivate items through the status endpoint. Historical readability is preserved, and status mutations are audited.

## W. Detail structure

The detail page contains Item Identity, Commercial Profile, Capabilities, Product Workspace when applicable, Future Commercial Activity, Future Licensing, and System Information. Future sections explicitly show unavailable state and do not fabricate records.

## X. FOPX pricing separation

Company Catalog BasePrice is optional commercial reference metadata and is independent from FOPX operational `ServicePrice`, `PricingRule`, credit pricing, and other workspace pricing configuration. No synchronization or merge was introduced.

## Y. Customer separation

Company Catalog remains independent from the Phase 2 Task 01 Company Customer domain. No CustomerCatalogItem, CustomerProduct, PurchasedProducts, or other customer-product relationship was added.

## Z. Licensing separation

SupportsLicense is only an eligibility capability flag. No License records or licensing workflows were created.

## AA. Subscription separation

SupportsSubscription is only an eligibility capability flag. No Subscription records, Plans, billing cycles, or renewal workflows were created.

## AB. Routes

The canonical Company Core routes are:

- `/admin/catalog/products`
- `/admin/catalog/products/new`
- `/admin/catalog/products/:itemId`
- `/admin/catalog/products/:itemId/edit`

The navigation label remains Products & Services. No `/admin/fopx/products` route was introduced.

## AC. Lazy boundary

Catalog pages are isolated in `CatalogRoutes` and loaded through a dedicated lazy route module. The production chunk is `CatalogRoutes-DqEqLJnn.js` at 28.41 kB raw / 6.49 kB gzip.

## AD. EN/AR/RTL

Catalog strings exist in English and Arabic through the existing i18n system. Codes and currency values render LTR-safe, and the layouts support Arabic RTL direction without introducing a catalog-specific localization system.

## AE. Accessibility

The UI uses semantic headings, labels, table headers, associated validation, keyboard-operable links/actions, native accessible checkboxes/selects, visible loading/empty/error states, status text independent of color, and a conditional WorkspaceKey field.

## AF. Backend tests

Focused Company Catalog tests pass: 5 passed, 0 failed. Coverage includes Product and Service creation, code generation and immutability, paging, search, type/status/capability filters, safe sorting, detail/missing-item behavior, activate/deactivate, price/currency/workspace validation, permission policy inspection, and audit creation. The API build also succeeds.

## AG. Frontend tests

Focused catalog tests pass: 5 passed. The full frontend suite passes: 15 test files and 51 tests.

## AH. TypeScript

`npx.cmd tsc --noEmit --pretty false` passes.

## AI. Backend build

`Investa.API.csproj` builds successfully after migration generation with 0 warnings and 0 errors on the final incremental validation. Focused test commands continue to surface pre-existing package vulnerability and assembly-version warnings.

## AJ. Frontend build

The production frontend build succeeds after transforming 2,526 modules.

## AK. Catalog route chunk

Validated lazy chunk: `CatalogRoutes-DqEqLJnn.js` — 28.41 kB raw and 6.49 kB gzip.

## AL. Remaining gaps

The generated migration still needs to be applied to the intended UAT database. No live API/database smoke test or manual browser UAT was performed, by instruction. Existing repository dependency vulnerability and assembly-version warnings remain outside this task. The CAT sequence strategy should be load-tested under concurrent creation before production scale; database uniqueness remains the duplicate guard.

## AM. USER UAT checklist

1. Apply `20261001164338_AddCompanyCatalogFoundation` to the UAT database and start the API/frontend.
2. Verify View, Create, Edit, and Manage permission behavior, including forbidden access and hidden unauthorized actions.
3. Open `/admin/catalog/products`; verify table loading, empty state, search, Product/Service filter, Active/Inactive filter, all three capability filters, sorting, and pagination.
4. Create a Product with BasePrice/Currency, a Service without price, and a workspace-enabled Product using FOPX One; verify CAT codes are generated server-side.
5. Verify negative price, missing currency, inactive/unknown currency, unsupported unit, fake workspace, and workspace-disabled key are rejected.
6. Open detail and edit routes; verify description, unit, reference price, capabilities, and workspace metadata; verify Code cannot change.
7. Activate and deactivate an item; verify it remains readable and appears in status filters.
8. Verify Company Catalog changes do not create Customer links, FOPX pricing changes, licenses, subscriptions, sales records, contracts, invoices, or accounting records.
9. Verify EN, AR, RTL, light/dark themes, keyboard navigation, status labels, responsive desktop/tablet table behavior, and conditional workspace fields.

## AN. Recommended next task

Implement Phase 2 Task 03 Sales Opportunity foundation only: separate Company Sales Opportunity persistence, lifecycle, customer reference, catalog-item reference design, server-side administration, permissions, audit, and UI. Do not start quotations, contracts, licensing, subscriptions, invoices, collections, or accounting until their dedicated scopes are approved.

## Final classification

PHASE 2 TASK 02 — IMPLEMENTED / READY FOR USER UAT
