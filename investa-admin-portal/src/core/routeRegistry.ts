import type { RoutePolicy } from './routePolicy';

export type RouteOwnership = 'company' | 'fopx';
export type RouteAvailability = 'available' | 'placeholder' | 'redirect';

export interface CanonicalRouteDefinition extends RoutePolicy {
  path: string;
  ownership: RouteOwnership;
  component: string;
  availability?: RouteAvailability;
}

/**
 * The central route contract for the Company Management shell. App.tsx owns
 * JSX composition; this registry owns the security, ownership, and availability
 * metadata that must stay aligned with navigation and future route-level audits.
 */
export const CANONICAL_ROUTE_REGISTRY = [
  { path: '/admin', ownership: 'company', component: 'GlobalOverview', requiredPermissions: ['Company.Dashboard.View'] },
  { path: '/admin/customers', ownership: 'company', component: 'CustomerListPage', requiredPermissions: ['Company.Customers.View'] },
  { path: '/admin/customers/new', ownership: 'company', component: 'CustomerFormPage', requiredPermissions: ['Company.Customers.Create'] },
  { path: '/admin/customers/:customerId', ownership: 'company', component: 'CustomerDetailPage', requiredPermissions: ['Company.Customers.View'] },
  { path: '/admin/customers/:customerId/edit', ownership: 'company', component: 'CustomerFormPage', requiredPermissions: ['Company.Customers.Edit'] },
  { path: '/admin/sales/opportunities', ownership: 'company', component: 'SalesOpportunityListPage', requiredPermissions: ['Company.Sales.Opportunities.View'] },
  { path: '/admin/sales/opportunities/new', ownership: 'company', component: 'SalesOpportunityFormPage', requiredPermissions: ['Company.Sales.Opportunities.Create'] },
  { path: '/admin/sales/opportunities/:opportunityId', ownership: 'company', component: 'SalesOpportunityDetailPage', requiredPermissions: ['Company.Sales.Opportunities.View'] },
  { path: '/admin/sales/opportunities/:opportunityId/edit', ownership: 'company', component: 'SalesOpportunityFormPage', requiredPermissions: ['Company.Sales.Opportunities.Edit'] },
  { path: '/admin/sales/quotations', ownership: 'company', component: 'QuotationListPage', requiredPermissions: ['Company.Sales.Quotations.View'] },
  { path: '/admin/sales/quotations/new', ownership: 'company', component: 'QuotationFormPage', requiredPermissions: ['Company.Sales.Quotations.Create'] },
  { path: '/admin/sales/quotations/:quotationId', ownership: 'company', component: 'QuotationDetailPage', requiredPermissions: ['Company.Sales.Quotations.View'] },
  { path: '/admin/sales/quotations/:quotationId/edit', ownership: 'company', component: 'QuotationFormPage', requiredPermissions: ['Company.Sales.Quotations.Edit'] },
  { path: '/admin/sales/quotations/:quotationId/print', ownership: 'company', component: 'QuotationPrintPage', requiredPermissions: ['Company.Sales.Quotations.View'] },
  { path: '/admin/sales/contracts', ownership: 'company', component: 'ContractListPage', requiredPermissions: ['Company.Sales.Contracts.View'] },
  { path: '/admin/sales/contracts/from-quotation/:quotationId', ownership: 'company', component: 'ContractFormPage', requiredPermissions: ['Company.Sales.Contracts.Create'] },
  { path: '/admin/sales/contracts/:contractId', ownership: 'company', component: 'ContractDetailPage', requiredPermissions: ['Company.Sales.Contracts.View'] },
  { path: '/admin/sales/contracts/:contractId/edit', ownership: 'company', component: 'ContractFormPage', requiredPermissions: ['Company.Sales.Contracts.Edit'] },
  { path: '/admin/sales/contracts/:contractId/print', ownership: 'company', component: 'ContractPrintPage', requiredPermissions: ['Company.Sales.Contracts.View'] },
  { path: '/admin/catalog/products', ownership: 'company', component: 'CatalogListPage', requiredPermissions: ['Company.Products.View'] },
  { path: '/admin/catalog/products/new', ownership: 'company', component: 'CatalogFormPage', requiredPermissions: ['Company.Products.Create'] },
  { path: '/admin/catalog/products/:itemId', ownership: 'company', component: 'CatalogDetailPage', requiredPermissions: ['Company.Products.View'] },
  { path: '/admin/catalog/products/:itemId/edit', ownership: 'company', component: 'CatalogFormPage', requiredPermissions: ['Company.Products.Edit'] },
  { path: '/admin/licensing/licenses', ownership: 'company', component: 'PendingModulePage', requiredPermissions: ['Company.Licensing.View'], availability: 'placeholder' },
  { path: '/admin/licensing/subscriptions', ownership: 'company', component: 'PendingModulePage', requiredPermissions: ['Company.Subscriptions.View'], availability: 'placeholder' },
  { path: '/admin/licensing/renewals', ownership: 'company', component: 'PendingModulePage', requiredPermissions: ['Company.Subscriptions.Renewals.View'], availability: 'placeholder' },
  { path: '/admin/finance/invoices', ownership: 'company', component: 'PendingModulePage', requiredPermissions: ['Company.Finance.Invoices.View'], availability: 'placeholder' },
  { path: '/admin/finance/collections', ownership: 'company', component: 'PendingModulePage', requiredPermissions: ['Company.Finance.Collections.View'], availability: 'placeholder' },
  { path: '/admin/finance/expenses', ownership: 'company', component: 'PendingModulePage', requiredPermissions: ['Company.Finance.Expenses.View'], availability: 'placeholder' },
  { path: '/admin/accounting/chart-of-accounts', ownership: 'company', component: 'PendingModulePage', requiredPermissions: ['Company.Accounting.ChartOfAccounts.View'], availability: 'placeholder' },
  { path: '/admin/accounting/journals', ownership: 'company', component: 'PendingModulePage', requiredPermissions: ['Company.Accounting.Journals.View'], availability: 'placeholder' },
  { path: '/admin/accounting/general-ledger', ownership: 'company', component: 'PendingModulePage', requiredPermissions: ['Company.Accounting.GeneralLedger.View'], availability: 'placeholder' },
  { path: '/admin/accounting/trial-balance', ownership: 'company', component: 'PendingModulePage', requiredPermissions: ['Company.Accounting.TrialBalance.View'], availability: 'placeholder' },
  { path: '/admin/accounting/statements', ownership: 'company', component: 'PendingModulePage', requiredPermissions: ['Company.Accounting.Statements.View'], availability: 'placeholder' },
  { path: '/admin/company', ownership: 'company', component: 'PendingModulePage', requiredPermissions: ['Company.Administration.View'], availability: 'placeholder' },
  { path: '/admin/users', ownership: 'company', component: 'UsersList', requiredPermissions: ['Global.Users.View'] },
  { path: '/admin/access', ownership: 'company', component: 'AccessControlHub', requiredPermissions: ['Global.Access.View'] },
  { path: '/admin/access/groups', ownership: 'company', component: 'Groups', requiredPermissions: ['Global.Access.View'] },
  { path: '/admin/access/roles', ownership: 'company', component: 'Roles', requiredPermissions: ['Global.Access.View'] },
  { path: '/admin/access/approvals', ownership: 'company', component: 'AdminUserReviewQueue', requiredPermissions: ['Global.Users.Manage'] },
  { path: '/admin/audit', ownership: 'company', component: 'PendingModulePage', requiredPermissions: ['Global.Audit.View'], availability: 'placeholder' },
  { path: '/admin/notifications', ownership: 'company', component: 'NotificationTemplates', requiredPermissions: ['Global.Notifications.Manage'] },
  { path: '/admin/system', ownership: 'company', component: 'SystemConfiguration', requiredPermissions: ['Global.System.Configure'] },
  { path: '/admin/integrations', ownership: 'company', component: 'PlatformStatusPage', requiredPermissions: ['Global.SystemHealth.View'] },
  { path: '/admin/settings', ownership: 'company', component: 'PendingModulePage', requiredPermissions: ['Company.Administration.View'], availability: 'placeholder' },
  { path: '/admin/fopx', ownership: 'fopx', component: 'FopxWorkspaceRedirect', authenticated: true, availability: 'redirect' },
  { path: '/admin/fopx/overview', ownership: 'fopx', component: 'Dashboard', requiredPermissions: ['Dashboard.View'] },
  { path: '/admin/fopx/projects', ownership: 'fopx', component: 'PendingModulePage', requiredPermissions: ['FOPX.Projects.View'], availability: 'placeholder' },
  { path: '/admin/fopx/opportunities', ownership: 'fopx', component: 'OpportunityListPage', requiredPermissions: ['FOPX.Opportunities.View'] },
  { path: '/admin/fopx/opportunities/:opportunityId', ownership: 'fopx', component: 'OpportunityDetailPage', requiredPermissions: ['FOPX.Opportunities.View'] },
  { path: '/admin/fopx/conversations', ownership: 'fopx', component: 'SupportAdmin', requiredPermissions: ['FOPX.Conversations.View'] },
  { path: '/admin/fopx/deals', ownership: 'fopx', component: 'PendingModulePage', requiredPermissions: ['FOPX.Deals.View'], availability: 'placeholder' },
  { path: '/admin/fopx/funding', ownership: 'fopx', component: 'PendingModulePage', requiredPermissions: ['FOPX.Funding.View'], availability: 'placeholder' },
  { path: '/admin/fopx/contracts', ownership: 'fopx', component: 'PendingModulePage', requiredPermissions: ['FOPX.Contracts.View'], availability: 'placeholder' },
  { path: '/admin/fopx/moderation', ownership: 'fopx', component: 'ModerationReports', requiredPermissions: ['FOPX.Moderation.View'] },
  { path: '/admin/fopx/users', ownership: 'fopx', component: 'ClientsList', requiredPermissions: ['FOPX.Clients.View'] },
  { path: '/admin/fopx/users/:clientId', ownership: 'fopx', component: 'ClientDetailsRoute', requiredPermissions: ['FOPX.Clients.View'] },
  { path: '/admin/fopx/notifications', ownership: 'fopx', component: 'NotificationBroadcasts', requiredPermissions: ['Global.Notifications.Manage'] },
  { path: '/admin/fopx/audit', ownership: 'fopx', component: 'PendingModulePage', requiredPermissions: ['FOPX.Audit.View'], availability: 'placeholder' },
  { path: '/admin/fopx/integrations', ownership: 'fopx', component: 'PlatformStatusPage', requiredPermissions: ['Global.SystemHealth.View'] },
  { path: '/admin/fopx/settings', ownership: 'fopx', component: 'PendingModulePage', requiredPermissions: ['FOPX.Settings.Manage'], availability: 'placeholder' },
] as const satisfies readonly CanonicalRouteDefinition[];

export const LEGACY_ROUTE_REDIRECTS = {
  '/support': '/admin-support',
  '/dashboard': '/admin/fopx/overview',
  '/clients': '/admin/fopx/users',
  '/groups': '/admin/access/groups',
  '/roles': '/admin/access/roles',
  '/system-config': '/admin/system',
} as const;

const routePolicies = Object.fromEntries(
  CANONICAL_ROUTE_REGISTRY.map(route => {
    const definition = route as CanonicalRouteDefinition;
    return [
      definition.path,
      {
        authenticated: definition.authenticated,
        requiredPermissions: definition.requiredPermissions,
        anyOf: definition.anyOf,
        allOf: definition.allOf,
      },
    ];
  }),
) as Record<string, RoutePolicy>;

export function policyForRoute(path: string): RoutePolicy {
  return routePolicies[path] ?? { authenticated: true };
}

export function getCanonicalRoute(path: string): CanonicalRouteDefinition | undefined {
  return CANONICAL_ROUTE_REGISTRY.find(route => route.path === path);
}

export const CANONICAL_ROUTE_POLICIES = routePolicies;
