export interface RoutePolicy {
  authenticated?: boolean;
  requiredPermissions?: string[];
  anyOf?: string[];
  allOf?: string[];
}

/**
 * Canonical policy names are intentionally additive. The API remains the
 * authority and existing flat permission keys continue to work unchanged.
 */
export const PERMISSION_COMPATIBILITY: Record<string, string[]> = {
  'Company.Dashboard.View': ['Global.SystemHealth.View', 'Dashboard.View'],
  'Company.Customers.View': ['Global.Users.View', 'User.View', 'User.Manage'],
  'Company.Customers.Create': ['Customer.Create', 'Customer.Manage'],
  'Company.Customers.Edit': ['Customer.Edit', 'Customer.Manage'],
  'Company.Customers.Manage': ['Customer.Manage'],
  'Company.Products.View': ['Product.View', 'Product.Manage'],
  'Company.Products.Create': ['Product.Create', 'Product.Manage'],
  'Company.Products.Edit': ['Product.Edit', 'Product.Manage'],
  'Company.Products.Manage': ['Product.Manage'],
  'Company.Sales.Opportunities.View': [],
  'Company.Sales.Opportunities.Create': ['SalesOpportunity.Create', 'SalesOpportunity.Manage'],
  'Company.Sales.Opportunities.Edit': ['SalesOpportunity.Edit', 'SalesOpportunity.Manage'],
  'Company.Sales.Opportunities.Manage': ['SalesOpportunity.Manage'],
  'Company.Sales.Quotations.View': [],
    'Company.Sales.Quotations.Create': ['SalesQuotation.Create', 'SalesQuotation.Manage'],
    'Company.Sales.Quotations.Edit': ['SalesQuotation.Edit', 'SalesQuotation.Manage'],
    'Company.Sales.Quotations.Manage': ['SalesQuotation.Manage'],
  'Company.Sales.Contracts.View': [],
  'Company.Sales.Contracts.Create': ['SalesContract.Create', 'SalesContract.Manage'],
  'Company.Sales.Contracts.Edit': ['SalesContract.Edit', 'SalesContract.Manage'],
  'Company.Sales.Contracts.Manage': ['SalesContract.Manage'],
  'Company.Contracts.View': ['Company.Sales.Contracts.View'],
  'Company.Licensing.View': [],
  'Company.Subscriptions.View': [],
  'Company.Subscriptions.Renewals.View': [],
  'Company.Finance.Invoices.View': [],
  'Company.Finance.Collections.View': [],
  'Company.Finance.Expenses.View': [],
  'Company.Accounting.ChartOfAccounts.View': [],
  'Company.Accounting.Journals.View': [],
  'Company.Accounting.GeneralLedger.View': [],
  'Company.Accounting.TrialBalance.View': [],
  'Company.Accounting.Statements.View': [],
  'Company.Administration.View': ['Global.Access.View', 'Global.Users.View', 'User.Manage'],
  'Global.SystemHealth.View': ['Dashboard.View', 'System.View', 'User.Manage'],
  'Global.Users.View': ['User.View', 'User.Manage'],
  'Global.Users.Manage': ['User.Manage'],
  'Global.Access.View': ['RBAC.View', 'Group.View', 'Group.Manage', 'Role.View', 'Role.Manage'],
  'Global.Access.Manage': ['Group.Manage', 'Role.Manage', 'RBAC.View'],
  'Global.Notifications.Manage': ['Config.Manage', 'User.Manage'],
  'Global.System.Configure': ['System.Configure', 'Config.Manage'],
  'Global.Settings.Manage': ['Settings.Manage', 'User.Manage'],
  'FOPX.Clients.View': ['Client.View', 'Client.Manage'],
  'FOPX.Opportunities.View': ['Opportunity.View', 'Opportunity.Manage'],
  'FOPX.Opportunities.Review': ['Opportunity.Review', 'Opportunity.Manage'],
  'FOPX.Opportunities.Manage': ['Opportunity.Manage'],
  'FOPX.Moderation.View': ['User.Manage'],
  'FOPX.Conversations.View': ['Support.View', 'User.Manage'],
};

export function permissionCandidates(permission: string): string[] {
  return [permission, ...(PERMISSION_COMPATIBILITY[permission] || [])];
}

export function matchesPermission(required: string, actual: string[]): boolean {
  if (actual.includes('*') || actual.includes('*.*')) return true;
  return permissionCandidates(required).some(candidate => actual.includes(candidate));
}

export function canAccessPolicy(policy: RoutePolicy, actual: string[], authenticated: boolean): boolean {
  if (policy.authenticated !== false && !authenticated) return false;
  const required = policy.requiredPermissions || [];
  const anyOf = policy.anyOf || [];
  const allOf = policy.allOf || [];
  return required.every(permission => matchesPermission(permission, actual)) &&
    (!anyOf.length || anyOf.some(permission => matchesPermission(permission, actual))) &&
    allOf.every(permission => matchesPermission(permission, actual));
}

