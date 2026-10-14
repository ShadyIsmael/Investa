import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FOPX_WORKSPACE } from '@/core/workspaces';
import { isFopxPath } from '@/core/navigation';

const labels: Record<string, string> = {
  admin: 'centralAdmin.identity',
  fopx: 'centralAdmin.workspaceName',
  sales: 'centralAdmin.sections.sales',
  catalog: 'centralAdmin.sections.catalog',
  licensing: 'centralAdmin.sections.licensing',
  finance: 'centralAdmin.sections.finance',
  accounting: 'centralAdmin.sections.accounting',
  overview: 'centralAdmin.nav.overview',
  customers: 'centralAdmin.companyNav.customers',
  new: 'centralAdmin.customers.newTitle',
  edit: 'centralAdmin.customers.editTitle',
  quotations: 'centralAdmin.companyNav.quotations',
  contracts: 'centralAdmin.companyNav.contracts',
  products: 'centralAdmin.companyNav.products',
  licenses: 'centralAdmin.companyNav.licenses',
  subscriptions: 'centralAdmin.companyNav.subscriptions',
  renewals: 'centralAdmin.companyNav.renewals',
  invoices: 'centralAdmin.companyNav.invoices',
  collections: 'centralAdmin.companyNav.collections',
  expenses: 'centralAdmin.companyNav.expenses',
  'chart-of-accounts': 'centralAdmin.companyNav.chartOfAccounts',
  journals: 'centralAdmin.companyNav.journals',
  'general-ledger': 'centralAdmin.companyNav.generalLedger',
  'trial-balance': 'centralAdmin.companyNav.trialBalance',
  statements: 'centralAdmin.companyNav.statements',
  operations: 'centralAdmin.fopxNav.operations',
  pricing: 'centralAdmin.fopxNav.pricing',
  credit: 'centralAdmin.fopxNav.credit',
  'reference-data': 'centralAdmin.fopxNav.referenceData',
  support: 'centralAdmin.fopxNav.conversations',
  clients: 'centralAdmin.fopxNav.users',
  users: 'centralAdmin.nav.users',
  access: 'centralAdmin.nav.access',
  audit: 'centralAdmin.nav.audit',
  notifications: 'centralAdmin.nav.notifications',
  system: 'centralAdmin.nav.system',
  integrations: 'centralAdmin.nav.integrations',
  settings: 'centralAdmin.nav.settings',
  projects: 'centralAdmin.fopxNav.projects',
  opportunities: 'centralAdmin.fopxNav.opportunities',
  conversations: 'centralAdmin.fopxNav.conversations',
  deals: 'centralAdmin.fopxNav.deals',
  funding: 'centralAdmin.fopxNav.funding',
  moderation: 'centralAdmin.fopxNav.moderation',
};

export const Breadcrumbs: React.FC = () => {
  const { pathname } = useLocation();
  const { t } = useTranslation();
  const segments = pathname.split('/').filter(Boolean);
  const isFopx = isFopxPath(pathname);
  const items = isFopx
    ? (pathname.startsWith('/admin/fopx') ? ['admin', 'fopx', ...segments.slice(2)] : ['admin', 'fopx', ...segments])
    : segments.slice(0, 3);
  const unique = items.filter((segment, index) => items.indexOf(segment) === index);

  return (
    <nav aria-label={t('centralAdmin.breadcrumbs')} className="flex items-center gap-1.5 text-xs text-muted-foreground min-w-0">
      {unique.map((segment, index) => {
        const labelKey = labels[segment];
        const contextualLabelKey = segment === 'opportunities' && pathname.startsWith('/admin/sales/opportunities')
          ? 'centralAdmin.companyNav.salesOpportunities'
          : labelKey;
        const label = contextualLabelKey === 'centralAdmin.workspaceName' ? FOPX_WORKSPACE.name : t(contextualLabelKey || 'centralAdmin.states.unknownRoute', { defaultValue: segment });
        const href = segment === 'admin' ? '/admin' : segment === 'fopx' ? FOPX_WORKSPACE.routePrefix : pathname;
        return (
          <React.Fragment key={`${segment}-${index}`}>
            {index > 0 && <span aria-hidden="true">/</span>}
            {index === unique.length - 1 ? <span className="font-semibold text-foreground truncate">{label}</span> : <Link className="hover:text-foreground" to={href}>{label}</Link>}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

