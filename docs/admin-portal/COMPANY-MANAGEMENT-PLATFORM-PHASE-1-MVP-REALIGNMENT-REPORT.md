# COMPANY MANAGEMENT PLATFORM — PHASE 1 MVP REALIGNMENT REPORT

## A. Previous product framing

The existing shell presented itself as a Central Administration surface with a global/platform context and FOPX as the most prominent workspace. Legacy navigation also mixed product operations, platform administration, finance, and reference data.

## B. New Company Management framing

`/admin` is now the Company Management home. Company Core is the primary context and owns shared commercial and operational records across products. Product Workspaces are optional extensions entered from Company Core.

The visible identity now uses Company Management / Company Core wording in the shell, login surface, workspace context, loading states, breadcrumbs, and branding constants.

## C. Company Core domains

The Phase 1 navigation establishes these Company Core domains:

- Home
- Sales
- Catalog
- Licensing
- Finance
- Accounting
- Administration

The future commercial flow is represented structurally as Customer → Sales Opportunity → Quotation → Contract → License/Subscription → Invoice → Collection → Accounting.

## D. Product Workspace role

Product Workspaces are optional product-specific operational/configuration extensions. A product may exist commercially without a workspace. Company Core remains the source of truth for commercial facts.

## E. FOPX Workspace preservation

FOPX One remains the only selectable Product Workspace. Existing `/admin/fopx/...` routes remain registered and lazy-loaded, including Overview, Clients, Opportunities, Conversations, Moderation, Notifications, Integrations, Settings, and existing placeholder areas.

Existing legacy FOPX routes for clients, operations, pricing/configuration, credit, reference data, and support retain FOPX context. No NEXUS workspace or fake workspace was created.

## F. Navigation before

The primary navigation was organized around global administration items such as Overview, Users, Access, Audit, Notifications, System, Integrations, and Settings. FOPX was a separate workspace, but the root dashboard and several legacy routes were framed as platform administration or FOPX-first operations.

## G. Navigation after

The primary Company Core navigation is now:

- Home: Dashboard
- Sales: Customers, Sales Opportunities, Quotations, Contracts
- Catalog: Products & Services
- Licensing: Licenses, Subscriptions, Renewals
- Finance: Invoices, Collections, Expenses
- Accounting: Chart of Accounts, Journal Entries, General Ledger, Trial Balance, Financial Statements
- Product Workspaces: FOPX One
- Administration: Users, Roles & Permissions, Company Settings

The new business modules are intentional controlled placeholders. They do not show fake records or pretend to be implemented.

## H. Company routes

Canonical Company Core families were added to the route registry:

- `/admin`
- `/admin/customers`
- `/admin/sales/opportunities`
- `/admin/sales/quotations`
- `/admin/sales/contracts`
- `/admin/catalog/products`
- `/admin/licensing/licenses`
- `/admin/licensing/subscriptions`
- `/admin/licensing/renewals`
- `/admin/finance/invoices`
- `/admin/finance/collections`
- `/admin/finance/expenses`
- `/admin/accounting/chart-of-accounts`
- `/admin/accounting/journals`
- `/admin/accounting/general-ledger`
- `/admin/accounting/trial-balance`
- `/admin/accounting/statements`
- `/admin/company`

Existing administrative routes such as `/admin/users`, `/admin/access`, `/admin/notifications`, and `/admin/settings` are now owned by Company Core in the registry.

## I. FOPX routes preserved

The existing canonical FOPX route family remains under `/admin/fopx/...`, including:

- `/admin/fopx/overview`
- `/admin/fopx/users`
- `/admin/fopx/opportunities`
- `/admin/fopx/opportunities/:opportunityId`
- `/admin/fopx/conversations`
- `/admin/fopx/moderation`
- `/admin/fopx/notifications`
- `/admin/fopx/settings`

The existing FOPX opportunity administration functionality was not rebuilt or moved into Company Core.

## J. Legacy route mappings

Working legacy routes remain available. Existing redirect mappings remain intact:

- `/dashboard` → `/admin/fopx/overview`
- `/clients` → `/admin/fopx/users`
- `/clients/:clientId` → `/admin/fopx/users/:clientId`
- `/groups` → `/admin/access/groups`
- `/roles` → `/admin/access/roles`
- `/system-config` → `/admin/system`
- `/support` → `/admin-support`

Legacy Company Finance routes remain available without being rewritten. Company Finance is treated as Company Core/legacy finance rather than as a product workspace.

## K. Company Dashboard structure

The Company dashboard is now a restrained structural shell. It presents:

- the Company Core commercial flow;
- reserved authoritative signal areas for pipeline, contracts, subscriptions, invoices, collections, and expenses;
- “Not available yet” states instead of fabricated KPI values;
- current platform health as an operational dependency signal; and
- a contextual entry point to FOPX One.

The previous FOPX-oriented operational dashboard remains at `/admin/fopx/overview`.

## L. Product Catalog architecture

The intended Product boundary is documented without adding persistence. A future Product may include Id, Code, Name, Description, Type, IsActive, SupportsLicense, SupportsSubscription, SupportsWorkspace, and nullable WorkspaceKey.

Catalog pricing represents what the company charges for products, licenses, subscriptions, services, support, and add-ons. Implementation begins in Phase 2.

## M. Licensing architecture

Company Core licensing is intended to own Customer, Product, License Type, Activation Date, Expiry Date, Seats, Status, and Contract Reference. It is commercial entitlement data, not product-specific operational configuration.

## N. Subscription architecture

Company Core subscriptions are intended to own Customer, Product, Plan, Billing Cycle, Start Date, Renewal Date, End Date, Quantity/Seats, Status, Price, and Discount. Recurring billing behavior is deferred.

## O. Sales architecture

Sales owns the commercial progression from Customer to Sales Opportunity to Quotation to Contract. Quotations and contracts must support mixed line types such as implementation fees, annual subscriptions, licenses, additional seats, support, add-ons, and custom development.

## P. Finance architecture

Company Core Finance is the future owner of invoices, collections, expenses, vendors, payments, and cash/banks. Existing Company Finance functionality remains available through legacy routes and was not rewritten in Phase 1.

## Q. Accounting architecture

Accounting is reserved for Chart of Accounts, Journal Entries, General Ledger, Accounts Receivable, Accounts Payable, Accounting Periods, Trial Balance, and Financial Statements. Only route and navigation placeholders were added; no accounting schema or engine was created.

## R. Commercial vs FOPX pricing boundary

Company Catalog Pricing answers what the company charges customers for a product, license, subscription, service, support, or add-on. FOPX Pricing Configuration remains product-specific operational/configuration behavior. The two concepts were not merged.

## S. Company Customer vs FOPX Client boundary

Company Customer is the person or organization buying from the company. FOPX Client is a user/client/participant inside the FOPX product domain. They may be related later, but the Phase 1 realignment does not merge their models.

## T. Product Workspace capability model

The workspace model remains optional and currently exposes only FOPX One. Workspace selection is now interpreted as product workspace context, not an application-wide environment switch. No Workspace CRUD or future-product records were added.

## U. Existing modules reclassified

- FOPX Opportunities, Clients, Moderation, Credit, Trust/Verification, Reference Data, notifications, and configuration remain FOPX Workspace concerns.
- Users and Roles & Permissions are Company Administration concerns.
- Company Finance remains a Company Core/legacy finance concern.
- Company Catalog Pricing is a future Company Core concern; FOPX pricing configuration remains separate.
- Support remains preserved as a legacy/product-context route pending a later ownership decision.

## V. Deferred modules

Customers, Product Catalog, Sales, Quotations, Contracts, Licensing, Subscriptions, Invoices, Collections, Expenses, and Accounting are represented by controlled placeholders only. No fake data, speculative ERP schema, subscription engine, invoice engine, or accounting engine was introduced.

## W. Permission namespace blueprint

The forward-compatible blueprint is documented as additive Company namespaces:

- `Company.Customers.*`
- `Company.Sales.*`
- `Company.Contracts.*`
- `Company.Products.*`
- `Company.Licensing.*`
- `Company.Subscriptions.*`
- `Company.Finance.*`
- `Company.Accounting.*`

Existing backend permission names and `FOPX.*` permissions were not broadly renamed.

## X. Architecture documentation added

Added [COMPANY-MANAGEMENT-PHASE-1-ARCHITECTURE.md](C:/github/Investa/docs/admin-portal/COMPANY-MANAGEMENT-PHASE-1-ARCHITECTURE.md), covering Company Core, Product Catalog, Licensing, Subscriptions, Sales, Finance, Accounting, Product Workspaces, FOPX, future products, mixed commercial lines, customer/client boundaries, permission namespaces, and the agreed Phase 1–7 map.

## Y. Tests

Frontend validation passed:

- 13 test files passed.
- 41 tests passed.
- Route registry tests cover Company ownership, placeholder availability, canonical Company routes, FOPX preservation, and legacy route declarations.
- Navigation tests cover Company Core vs FOPX context, Company Finance separation, MVP route groups, and absence of NEXUS.

No manual UAT was performed.

## Z. TypeScript

`npx tsc --noEmit --pretty false` passed with exit code 0.

## AA. Frontend build

`npm run build` completed successfully with Vite production output.

## AB. Backend build if applicable

Not applicable. No backend files or domain/database contracts were changed in Phase 1.

## AC. Remaining realignment gaps

- Company business modules are intentionally not implemented until their planned phases.
- Existing legacy routes outside `/admin` still need a later systematic route-by-route ownership cleanup after their business contracts are understood.
- Company permission namespaces are a blueprint only; backend permission assignment and enforcement will be introduced with each business module.
- Support ownership and the relationship between Company Customer and FOPX Client require a later domain decision before integration work.
- The Company dashboard has no authoritative business KPIs until the underlying modules exist.

## AD. USER UAT checklist

The user should verify:

- `/admin` presents Company Management, not FOPX or platform administration.
- Company Core navigation is grouped as Home, Sales, Catalog, Licensing, Finance, Accounting, Product Workspaces, and Administration.
- Placeholder modules show intentional unavailable states without fake data.
- `/admin/fopx` enters FOPX One context and existing FOPX Opportunity routes remain available.
- Returning from FOPX returns to Company Core.
- `/company-finance` remains available as a legacy Company Finance route.
- `/dashboard` and `/clients` preserve their existing FOPX redirects.
- EN, AR, RTL, Light, Dark, and accessibility behavior remain acceptable.

## AE. Exact recommended PHASE 2 first task

Implement **Customers & Product Catalog foundations**: define the Company Customer and Product/Service persistence models, migrations, permission contracts, and minimal list/detail APIs; keep FOPX Client separate; support Product capability flags including optional workspace association; and add focused tests before building the first working Company Core screens.

Final classification: PHASE 1 — MVP REALIGNMENT IMPLEMENTED / READY FOR USER UAT
