export type NavigationStatus = 'available' | 'placeholder' | 'legacy';

import { policyForRoute } from './routeRegistry';

export type NavigationGroup = 'company' | 'workspace' | 'system';

export interface NavigationItem {
  key: string;
  labelKey: string;
  route: string;
  icon: string;
  group: NavigationGroup;
  section?: string;
  sectionLabelKey?: string;
  requiredPermissions?: string[];
  anyOf?: string[];
  status?: NavigationStatus;
}

function applyRoutePolicies(items: NavigationItem[]): NavigationItem[] {
  return items.map(item => {
    const policy = policyForRoute(item.route);
    return {
      ...item,
      requiredPermissions: policy.requiredPermissions,
      anyOf: policy.anyOf,
    };
  });
}

const COMPANY_NAVIGATION_DEFINITION: NavigationItem[] = [
  { key: 'dashboard', labelKey: 'centralAdmin.companyNav.dashboard', route: '/admin', icon: 'home', group: 'company', section: 'home', sectionLabelKey: 'centralAdmin.sections.home' },

  { key: 'customers', labelKey: 'centralAdmin.companyNav.customers', route: '/admin/customers', icon: 'users', group: 'company', section: 'sales', sectionLabelKey: 'centralAdmin.sections.sales', status: 'placeholder' },
  { key: 'sales-opportunities', labelKey: 'centralAdmin.companyNav.salesOpportunities', route: '/admin/sales/opportunities', icon: 'sparkles', group: 'company', section: 'sales', status: 'available' },
  { key: 'quotations', labelKey: 'centralAdmin.companyNav.quotations', route: '/admin/sales/quotations', icon: 'clipboard-check', group: 'company', section: 'sales', status: 'available' },
  { key: 'contracts', labelKey: 'centralAdmin.companyNav.contracts', route: '/admin/sales/contracts', icon: 'handshake', group: 'company', section: 'sales', status: 'available' },

  { key: 'products', labelKey: 'centralAdmin.companyNav.products', route: '/admin/catalog/products', icon: 'tag', group: 'company', section: 'catalog', sectionLabelKey: 'centralAdmin.sections.catalog', status: 'available' },

  { key: 'licenses', labelKey: 'centralAdmin.companyNav.licenses', route: '/admin/licensing/licenses', icon: 'shield-check', group: 'company', section: 'licensing', sectionLabelKey: 'centralAdmin.sections.licensing', status: 'placeholder' },
  { key: 'subscriptions', labelKey: 'centralAdmin.companyNav.subscriptions', route: '/admin/licensing/subscriptions', icon: 'credit-card', group: 'company', section: 'licensing', status: 'placeholder' },
  { key: 'renewals', labelKey: 'centralAdmin.companyNav.renewals', route: '/admin/licensing/renewals', icon: 'sync', group: 'company', section: 'licensing', status: 'placeholder' },

  { key: 'invoices', labelKey: 'centralAdmin.companyNav.invoices', route: '/admin/finance/invoices', icon: 'orders', group: 'company', section: 'finance', sectionLabelKey: 'centralAdmin.sections.finance', status: 'placeholder' },
  { key: 'collections', labelKey: 'centralAdmin.companyNav.collections', route: '/admin/finance/collections', icon: 'cash', group: 'company', section: 'finance', status: 'placeholder' },
  { key: 'expenses', labelKey: 'centralAdmin.companyNav.expenses', route: '/admin/finance/expenses', icon: 'revenue', group: 'company', section: 'finance', status: 'placeholder' },

  { key: 'chart-of-accounts', labelKey: 'centralAdmin.companyNav.chartOfAccounts', route: '/admin/accounting/chart-of-accounts', icon: 'chart', group: 'company', section: 'accounting', sectionLabelKey: 'centralAdmin.sections.accounting', status: 'placeholder' },
  { key: 'journals', labelKey: 'centralAdmin.companyNav.journals', route: '/admin/accounting/journals', icon: 'clipboard-check', group: 'company', section: 'accounting', status: 'placeholder' },
  { key: 'general-ledger', labelKey: 'centralAdmin.companyNav.generalLedger', route: '/admin/accounting/general-ledger', icon: 'activity', group: 'company', section: 'accounting', status: 'placeholder' },
  { key: 'trial-balance', labelKey: 'centralAdmin.companyNav.trialBalance', route: '/admin/accounting/trial-balance', icon: 'chart', group: 'company', section: 'accounting', status: 'placeholder' },
  { key: 'statements', labelKey: 'centralAdmin.companyNav.statements', route: '/admin/accounting/statements', icon: 'revenue', group: 'company', section: 'accounting', status: 'placeholder' },

  { key: 'fopx-one', labelKey: 'centralAdmin.workspaceName', route: '/admin/fopx', icon: 'trending-up', group: 'workspace', section: 'workspaces', sectionLabelKey: 'centralAdmin.sections.productWorkspaces' },

  { key: 'users', labelKey: 'centralAdmin.companyNav.users', route: '/admin/users', icon: 'users', group: 'system', section: 'administration', sectionLabelKey: 'centralAdmin.sections.administration' },
  { key: 'access', labelKey: 'centralAdmin.companyNav.rolesPermissions', route: '/admin/access', icon: 'shield-check', group: 'system', section: 'administration' },
  { key: 'company-settings', labelKey: 'centralAdmin.companyNav.companySettings', route: '/admin/settings', icon: 'adjustments', group: 'system', section: 'administration', status: 'placeholder' },
];

const FOPX_NAVIGATION_DEFINITION: NavigationItem[] = [
  { key: 'overview', labelKey: 'centralAdmin.fopxNav.overview', route: '/admin/fopx/overview', icon: 'grid', group: 'workspace', requiredPermissions: ['Dashboard.View'] },
  { key: 'projects', labelKey: 'centralAdmin.fopxNav.projects', route: '/admin/fopx/projects', icon: 'briefcase', group: 'workspace', requiredPermissions: ['FOPX.Projects.View'], status: 'placeholder' },
  { key: 'opportunities', labelKey: 'centralAdmin.fopxNav.opportunities', route: '/admin/fopx/opportunities', icon: 'sparkles', group: 'workspace', requiredPermissions: ['FOPX.Opportunities.View'], status: 'available' },
  { key: 'conversations', labelKey: 'centralAdmin.fopxNav.conversations', route: '/admin/fopx/conversations', icon: 'headset', group: 'workspace', requiredPermissions: ['FOPX.Conversations.View'], status: 'available' },
  { key: 'deals', labelKey: 'centralAdmin.fopxNav.deals', route: '/admin/fopx/deals', icon: 'handshake', group: 'workspace', requiredPermissions: ['FOPX.Deals.View'], status: 'placeholder' },
  { key: 'funding', labelKey: 'centralAdmin.fopxNav.funding', route: '/admin/fopx/funding', icon: 'cash', group: 'workspace', requiredPermissions: ['FOPX.Funding.View'], status: 'placeholder' },
  { key: 'contracts', labelKey: 'centralAdmin.fopxNav.contracts', route: '/admin/fopx/contracts', icon: 'clipboard-check', group: 'workspace', requiredPermissions: ['FOPX.Contracts.View'], status: 'placeholder' },
  { key: 'moderation', labelKey: 'centralAdmin.fopxNav.moderation', route: '/admin/fopx/moderation', icon: 'shield-check', group: 'workspace', requiredPermissions: ['FOPX.Moderation.View'], status: 'available' },
  { key: 'users', labelKey: 'centralAdmin.fopxNav.users', route: '/admin/fopx/users', icon: 'users', group: 'workspace', requiredPermissions: ['FOPX.Clients.View'], status: 'available' },
  { key: 'notifications', labelKey: 'centralAdmin.fopxNav.notifications', route: '/admin/fopx/notifications', icon: 'bell', group: 'system', requiredPermissions: ['Global.Notifications.Manage'], status: 'available' },
  { key: 'audit', labelKey: 'centralAdmin.fopxNav.audit', route: '/admin/fopx/audit', icon: 'clipboard-check', group: 'system', requiredPermissions: ['FOPX.Audit.View'], status: 'placeholder' },
  { key: 'integrations', labelKey: 'centralAdmin.fopxNav.integrations', route: '/admin/fopx/integrations', icon: 'shuffle', group: 'system', requiredPermissions: ['Global.SystemHealth.View'], status: 'available' },
  { key: 'settings', labelKey: 'centralAdmin.fopxNav.settings', route: '/admin/fopx/settings', icon: 'adjustments', group: 'system', requiredPermissions: ['FOPX.Settings.Manage'], status: 'placeholder' },
];

export const COMPANY_NAVIGATION = applyRoutePolicies(COMPANY_NAVIGATION_DEFINITION);
/** Compatibility export for modules that still use the former global name. */
export const GLOBAL_NAVIGATION = COMPANY_NAVIGATION;
export const FOPX_NAVIGATION = applyRoutePolicies(FOPX_NAVIGATION_DEFINITION);

export function isFopxPath(pathname: string): boolean {
  return pathname === '/admin/fopx' || pathname.startsWith('/admin/fopx/') ||
    pathname === '/dashboard' || pathname.startsWith('/clients') ||
    pathname.startsWith('/operations') || pathname.startsWith('/reference-data') ||
    pathname === '/credit' || pathname.startsWith('/config/credit') ||
    pathname.startsWith('/support') || pathname.startsWith('/admin-support');
}

export function getNavigationForPath(pathname: string): NavigationItem[] {
  return isFopxPath(pathname) ? FOPX_NAVIGATION : COMPANY_NAVIGATION;
}
