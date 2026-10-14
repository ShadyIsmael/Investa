# COMPANY MANAGEMENT PLATFORM
# PHASE 2 — TASK 01 CUSTOMER FOUNDATION REPORT

## A Existing customer-related code found

The audit found the existing FOPX `Client` entity/service and FOPX user administration screens, plus unrelated supplier and authenticated-user concepts. No reusable commercial Company Customer or Company Customer Contact model existed. The existing `/admin/customers` route was a placeholder.

## B Domain decision

Company Customer is a new commercial master-data boundary. It is not the FOPX `Client` record, is not a rename of it, and is not automatically linked to it.

## C Customer model

`CompanyCustomer` is persisted with `Organization`/`Individual` type, immutable server-generated `CustomerCode`, legal/display names, tax and commercial registration identifiers, primary email/phone, website, address, country, city, notes, Active/Inactive status, and CreatedAt/UpdatedAt timestamps.

## D Contact model

`CompanyCustomerContact` is a separate persisted child entity with customer ownership, name, job title, email, phone, active state, primary state, and CreatedAt/UpdatedAt timestamps.

## E Customer code strategy

The service assigns the next server-side sequence as `CUS-000001`, `CUS-000002`, and so on. CustomerCode is never accepted from create/edit input, is not changed by update behavior, and is protected by unique database indexes on both the formatted code and its numeric sequence.

## F Status model

Customer and contact lifecycle state is explicit. Customers support `Active` and `Inactive`; contacts support active/inactive state. Status changes are mutations, not deletes.

## G Database migration

Two focused migrations were generated:

- `20261001130859_AddCompanyCustomerFoundation`: creates only `CompanyCustomers`, `CompanyCustomerContacts`, their relationship, and customer/contact indexes.
- `20261001131958_EnforceCompanyCustomerPrimaryContact`: replaces the contact customer index with a filtered unique index enforcing one active primary contact per customer.

The migrations have not been applied to a live/UAT database by this implementation pass.

## H Indexes

CustomerCode and CodeSequence are unique. TaxId is unique only when supplied through a filtered unique index. Status, type, CreatedAt, and contact ownership are indexed. The active-primary contact constraint is a filtered unique database index on CustomerId where IsPrimary and IsActive are true.

## I Backend endpoints

The controller exposes:

- `GET /api/v1/admin/customers` and `GET /api/v1/admin/customers/{id}`
- `POST /api/v1/admin/customers`
- `PUT /api/v1/admin/customers/{id}`
- `PATCH /api/v1/admin/customers/{id}/status`
- `POST /api/v1/admin/customers/{id}/contacts`
- `PUT /api/v1/admin/customers/{id}/contacts/{contactId}`
- `PATCH /api/v1/admin/customers/{id}/contacts/{contactId}/status`
- `PATCH /api/v1/admin/customers/{id}/contacts/{contactId}/primary`

The `/api/admin/customers` compatibility prefix is also supported.

## J Permissions

The canonical permission keys are `Company.Customers.View`, `Company.Customers.Create`, `Company.Customers.Edit`, and `Company.Customers.Manage`. Controller policies use permission authorization only; no role-name shortcut is used. Startup backfill creates missing canonical permissions idempotently, and compatibility aliases support the earlier `Customer.*` keys without changing the canonical contract.

## K List query architecture

The list service keeps the query server-side: `IQueryable` filters, search, controlled sort, `CountAsync`, `Skip/Take`, projection, and `ToListAsync`. The list projection excludes the full contact graph.

## L Search

Search covers CustomerCode, legal/display name, TaxId, primary email/phone, and active contact name.

## M Filters

Type and status filters are server-side and optional.

## N Sorting

Sorting is whitelisted to customer code, display name, CreatedAt, UpdatedAt, and status. Unsupported sort values fall back to CreatedAt; direction is restricted to ascending/descending behavior.

## O Pagination

Page and page size are server-side, page size is bounded to 100, and the response includes page, page size, total count, and items.

## P Create behavior

Create validates type, legal name, display name, and website format; normalizes optional values; assigns Active status and timestamps; generates CustomerCode; prevents duplicate supplied TaxId; and writes a traceable audit record with the authenticated actor when available.

## Q Edit behavior

Edit updates editable profile fields while preserving CustomerCode, validates the same profile rules, checks TaxId uniqueness excluding the current customer, updates UpdatedAt, and writes an audit record.

## R Contact behavior

Contacts can be added, edited, activated, deactivated, and selected as primary. Inactive contacts cannot be selected as primary. Contact mutations are permission-gated and audited.

## S Primary contact rule

The service clears competing primary flags and promotes the first active contact when a customer has active contacts but no primary. The filtered unique database index independently enforces no more than one active primary contact.

## T Duplicate prevention

CustomerCode and CodeSequence are database-unique. Supplied TaxId is normalized and checked in the service and protected by a filtered unique index. Names, phone numbers, and email addresses are intentionally not globally unique.

## U Delete/deactivation policy

There is no hard-delete endpoint. Customers and contacts are deactivated/reactivated through status operations, preserving history and auditability.

## V Customer detail structure

The detail screen is organized into identity, registration, primary contact data, contacts, future commercial sections, future finance sections, and system metadata. Empty future sections are explicit placeholders and do not fabricate data.

## W Future commercial sections

The UI reserves space for future products/services, pricing, sales, contracts, licensing, and finance/accounting capabilities, but this task creates none of those tables, APIs, links, or fake records.

## X FOPX Client separation

The Company Customer entities, service, routes, permissions, migrations, and UI are separate from the FOPX `Client` model and `/admin/fopx/users` flows. No automatic link or merge was introduced.

## Y Routes

The frontend provides `/admin/customers`, `/admin/customers/new`, `/admin/customers/:customerId`, and `/admin/customers/:customerId/edit`. The list/detail/form actions are permission-gated.

## Z Lazy boundary

Customer pages are isolated in `CustomersRoutes` and loaded through the dedicated route loader. The production route chunk is `CustomersRoutes-gfL107Yl.js` at 32.63 kB raw / 6.95 kB gzip in the validated build.

## AA EN/AR/RTL

Customer copy exists in English and Arabic translation files. Code, email, phone, and other direction-sensitive values use LTR-safe rendering while Arabic layout can remain RTL.

## AB Accessibility

The screens use semantic headings, labels, table headers, form validation messaging, visible loading/empty/error states, keyboard-operable controls, permission-aware actions, and responsive table behavior.

## AC Backend tests

Focused `CompanyCustomer` tests pass: 6 passed, 0 failed. Coverage includes code immutability, TaxId/name validation, list search/filter/sort/pagination, contact primary rules, status preservation, actor-attributed audit logging, and canonical permission policy inspection.

## AD Frontend tests

Focused customer tests pass: 5 passed. The full frontend suite also passed: 14 test files and 46 tests.

## AE TypeScript

`npx.cmd tsc --noEmit --pretty false` passed.

## AF Backend build

`Investa.API.csproj` builds successfully with 0 errors. The build reports pre-existing nullable/unused-code warnings.

## AG Frontend build

The production frontend build succeeds.

## AH Route chunk size

Validated customer lazy chunk: 32.63 kB raw and 6.95 kB gzip.

## AI Remaining gaps

The generated migrations still need to be applied to the intended UAT database. No live API/database smoke test or manual browser UAT was performed in this implementation pass. The repository continues to report pre-existing package vulnerability and assembly-version warnings during backend test/build commands. High-concurrency sequence allocation should be load-tested before production scale; database uniqueness remains the final duplicate guard.

## AJ USER UAT checklist

1. Apply both customer migrations to the UAT database and start the API/frontend.
2. Sign in with users having View, Create, Edit, and Manage permissions; verify unauthorized actions return the expected forbidden response.
3. Open `/admin/customers`; verify loading, empty, error, table, search, type/status filters, sorting, and pagination.
4. Create one Organization and one Individual; verify server-generated immutable codes and Active status.
5. Verify duplicate supplied TaxId is rejected while duplicate name, phone, or email is allowed.
6. Open detail and edit routes; verify profile updates do not change CustomerCode.
7. Add multiple contacts; verify only one active primary contact, inactive contacts cannot become primary, and primary selection promotes the chosen contact.
8. Deactivate/reactivate a customer and contact; verify records remain present and status actions are permission-gated.
9. Verify EN, AR, RTL, light/dark themes, keyboard interaction, responsive table behavior, and narrow-screen detail/form layout.
10. Verify no FOPX Client record was merged, modified, or auto-linked by Company Customer actions.

## AK Recommended Phase 2 Task 02 scope

Build the Product Catalog foundation only: separate product/service model, immutable product/service code, active/inactive lifecycle, core descriptive fields, server-side list/search/filter/sort/pagination, permissions, routes, migrations, tests, and EN/AR/RTL UI. Keep it separate from Customers; do not introduce sales, contracts, licensing, finance, accounting, or customer-product links until their dedicated scope is approved.

## Final classification

PHASE 2 TASK 01 — IMPLEMENTED / READY FOR USER UAT
