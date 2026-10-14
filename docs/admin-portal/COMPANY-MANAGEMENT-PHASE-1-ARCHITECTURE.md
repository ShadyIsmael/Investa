# Company Management Platform — Phase 1 Architecture Reference

This is the Phase 1 boundary reference for the Company Management Platform. It establishes ownership and sequencing without introducing the Phase 2 business models.

## A. Company Core

The Company Core is the primary application context. It owns customers, sales opportunities, quotations, contracts, products and services, pricing, licenses, subscriptions, renewals, invoices, collections, expenses, vendors, payments, cash, and accounting.

## B. Product Catalog

The future catalog is the commercial source of truth for what the company sells. A conceptual Product may include `Id`, `Code`, `Name`, `Description`, `Type`, `IsActive`, `SupportsLicense`, `SupportsSubscription`, `SupportsWorkspace`, and nullable `WorkspaceKey`.

Products may represent one-time sales, implementation/service fees, licenses, subscriptions, support/maintenance, or add-ons. Persistence and catalog behavior begin in Phase 2.

## C. Licensing

Company Core licensing is commercial entitlement data: Customer, Product, License Type, Activation Date, Expiry Date, Seats, Status, and Contract Reference. It is separate from any product-specific operational configuration.

## D. Subscriptions

Company Core subscriptions are commercial recurring commitments: Customer, Product, Plan, Billing Cycle, Start Date, Renewal Date, End Date, Quantity/Seats, Status, Price, and Discount. Billing behavior is deferred to later phases.

## E. Sales

Sales owns the commercial progression from Customer to Sales Opportunity to Quotation to Contract. A quotation or contract may contain multiple commercial line types.

## F. Finance

Finance owns invoices, collections, expenses, vendors, payments, and cash/bank operations. Existing Company Finance screens remain available through their legacy routes and are not rewritten in Phase 1.

## G. Accounting

Accounting owns the future Chart of Accounts, Journal Entries, General Ledger, Accounts Receivable, Accounts Payable, Accounting Periods, Trial Balance, and Financial Statements. Phase 1 exposes only structural routes and placeholders; it does not create an accounting schema.

## H. Product Workspaces

Workspaces are optional product-specific extensions. A product may be sold without a workspace. A workspace owns operational/configuration behavior that is specific to that product and must not duplicate Company Core commercial records.

## I. FOPX special case

FOPX One is the only current Product Workspace. Existing Overview, Clients, Opportunities, Moderation, Pricing/configuration, Credit, Trust/Verification, Reference Data, Notifications, and Settings routes remain under `/admin/fopx/...` according to their current implementation status.

Company Core answers “What did Customer ABC buy?” FOPX answers “How should FOPX operate or be configured for this product/customer?”

Company Customer and FOPX Client are intentionally different concepts. Related real-world entities may be linked in a future phase, but they are not merged by this realignment.

## J. Future product behavior

Future products such as NEXUS are not created or exposed in Phase 1. A future product becomes selectable as a workspace only when it has product-specific operational needs and an explicit workspace descriptor.

### Commercial modeling constraint

Quotations and Contracts must support mixed line types. For example, FOPX Enterprise may combine an implementation fee, annual subscription, license, additional seats, support, add-ons, and custom development. The design must not assume one contract equals one billing model.

### Permission namespace blueprint

Future Company Core permissions should use additive namespaces such as:

- `Company.Customers.*`
- `Company.Sales.*`
- `Company.Contracts.*`
- `Company.Products.*`
- `Company.Licensing.*`
- `Company.Subscriptions.*`
- `Company.Finance.*`
- `Company.Accounting.*`

Existing backend permissions and `FOPX.*` permissions remain unchanged during Phase 1.

### Agreed implementation phases

1. Phase 1 — MVP Realignment
2. Phase 2 — Customers & Product Catalog
3. Phase 3 — Sales & Contracts
4. Phase 4 — Licensing & Subscriptions
5. Phase 5 — Billing & Collections
6. Phase 6 — Accounting Core
7. Phase 7 — MVP Dashboard & Hardening

Phase 2 is the next implementation scope; it is not started by this document.
