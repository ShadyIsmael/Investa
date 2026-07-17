/**
 * Application Constants
 */

import { NavItem } from '@/types';

export const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', labelKey: 'nav.dashboard', iconName: 'grid', path: '/', permissions: ['Dashboard.View'] },
  { id: 'clients', label: 'Clients', labelKey: 'nav.clients', iconName: 'briefcase', path: '/clients', permissions: ['Client.View', 'Client.Manage'] },
  {
    id: 'role-access-management',
    label: 'Role Access Management',
    labelKey: 'nav.roleAccessManagement',
    iconName: 'shield-check',
    path: '/role-access-management',
    permissions: ['RBAC.View'],
    children: [
      { id: 'users', label: 'Users', labelKey: 'nav.users', iconName: 'users', path: '/users', permissions: ['User.View', 'User.Manage'] },
      { id: 'groups', label: 'Groups', labelKey: 'nav.groups', iconName: 'users', path: '/groups', permissions: ['Group.Manage'] },
      { id: 'roles', label: 'Roles', labelKey: 'nav.roles', iconName: 'handshake', path: '/roles', permissions: ['Role.Manage'] }
    ]
  },
  { id: 'audit', label: 'Audit Trail', labelKey: 'nav.auditTrail', iconName: 'shield-check', path: '/audit', permissions: ['Audit.View'] },
  {
    id: 'company-finance', label: 'Company Finance', labelKey: 'nav.companyFinance', iconName: 'cash', path: '/company-finance', permissions: ['Finance.View'],
    children: [
      { id: 'company-finance-overview', label: 'Overview', labelKey: 'companyFinance.nav.overview', iconName: 'grid', path: '/company-finance', permissions: ['Finance.View'] },
      { id: 'company-finance-money-in', label: 'Money In', labelKey: 'companyFinance.nav.moneyIn', iconName: 'revenue', path: '/company-finance/money-in', permissions: ['Finance.View'] },
      { id: 'company-finance-money-out', label: 'Money Out', labelKey: 'companyFinance.nav.moneyOut', iconName: 'cash', path: '/company-finance/money-out', permissions: ['Finance.View'] },
      { id: 'company-finance-founder-payments', label: 'Founder Payments', labelKey: 'companyFinance.nav.founderPayments', iconName: 'handshake', path: '/company-finance/founder-payments', permissions: ['Finance.View'] },
      { id: 'company-finance-accounts', label: 'Accounts', labelKey: 'companyFinance.nav.accounts', iconName: 'briefcase', path: '/company-finance/accounts', permissions: ['Finance.View'] },
      { id: 'company-finance-suppliers', label: 'Suppliers', labelKey: 'companyFinance.nav.suppliers', iconName: 'users', path: '/company-finance/suppliers', permissions: ['Finance.View'] },
      { id: 'company-finance-subscriptions', label: 'Subscriptions', labelKey: 'companyFinance.nav.subscriptions', iconName: 'credit-card', path: '/company-finance/subscriptions', permissions: ['Finance.View'] },
      { id: 'company-finance-assets', label: 'Company Assets', labelKey: 'companyFinance.nav.assets', iconName: 'grid', path: '/company-finance/assets', permissions: ['Finance.View'] },
      { id: 'company-finance-documents', label: 'Documents', labelKey: 'companyFinance.nav.documents', iconName: 'terminal', path: '/company-finance/documents', permissions: ['Finance.View'] },
      { id: 'company-finance-reports', label: 'Reports', labelKey: 'companyFinance.nav.reports', iconName: 'chart', path: '/company-finance/reports', permissions: ['Finance.View'] },
      { id: 'company-finance-reconciliation', label: 'Reconciliation', labelKey: 'companyFinance.nav.reconciliation', iconName: 'shuffle', path: '/company-finance/reconciliations', permissions: ['Finance.View'] },
      { id: 'company-finance-review-queue', label: 'Review Queue', labelKey: 'companyFinance.nav.reviewQueue', iconName: 'clipboard-check', path: '/company-finance/review-queue', permissions: ['Finance.Review', 'Finance.Confirm'] },
      { id: 'company-finance-settings', label: 'Settings', labelKey: 'companyFinance.nav.settings', iconName: 'settings', path: '/company-finance/settings', permissions: ['Finance.View'] },
    ],
  },
  { id: 'analytics', label: 'Advanced Analytics', labelKey: 'nav.advancedAnalytics', iconName: 'sparkles', path: '/analytics', permissions: ['Analytics.View'] },
  {
    id: 'operations',
    label: 'Operations',
    labelKey: 'nav.operations',
    iconName: 'shield-check',
    path: '/operations',
    permissions: ['User.Manage'],
    children: [
      {
        id: 'reputation-rules',
        label: 'Reputation Rules',
        labelKey: 'nav.reputationRules',
        iconName: 'shield-check',
        path: '/operations/reputation-rules',
        permissions: ['User.Manage'],
      },
      {
        id: 'pricing',
        label: 'Pricing',
        labelKey: 'nav.pricing',
        iconName: 'cash',
        path: '/operations/pricing',
        permissions: ['User.Manage'],
      },
      {
        id: 'notifications',
        label: 'Notifications',
        labelKey: 'nav.notifications',
        iconName: 'bell',
        path: '/operations/notifications',
        permissions: ['User.Manage'],
      },
      {
        id: 'moderation-reports',
        label: 'Moderation Reports',
        labelKey: 'nav.moderationReports',
        iconName: 'shield-check',
        path: '/operations/reports',
        permissions: ['User.Manage'],
      },
    ]
  },
  {
    id: 'reference-data',
    label: 'Reference Data',
    labelKey: 'nav.referenceData',
    iconName: 'grid',
    path: '/reference-data',
    permissions: ['User.Manage'],
    children: [
      {
        id: 'opportunity-categories',
        label: 'Categories',
        labelKey: 'nav.opportunityCategories',
        iconName: 'tag',
        path: '/reference-data/opportunity-categories',
        permissions: ['User.Manage'],
      },
      {
        id: 'opportunity-tags',
        label: 'Tags',
        labelKey: 'nav.opportunityTags',
        iconName: 'tag',
        path: '/reference-data/opportunity-tags',
        permissions: ['User.Manage'],
      },
      {
        id: 'funding-goals',
        label: 'Funding Goals',
        labelKey: 'nav.fundingGoals',
        iconName: 'cash',
        path: '/reference-data/funding-goals',
        permissions: ['User.Manage'],
      },
    ],
  },
  { 
    id: 'config', 
    label: 'Configurations', 
    labelKey: 'nav.configurations',
    iconName: 'settings', 
    path: '/config',
    permissions: ['Config.Manage'],
    children: [
      { id: 'credit', label: 'Credit Setup', labelKey: 'nav.creditSetup', iconName: 'credit-card', path: '/credit' },
      { id: 'offers', label: 'Offer Management', labelKey: 'nav.offerManagement', iconName: 'tag', path: '/config/offers', permissions: ['Offer.Manage'] },
      { id: 'apitester', label: 'API Tester', labelKey: 'nav.apiWorkbench', iconName: 'terminal', path: '/config/api-tester', permissions: ['System.Debug'] },
      { id: 'notification-templates', label: 'Notification Templates', labelKey: 'nav.notificationTemplates', iconName: 'bell', path: '/config/notification-templates', permissions: ['Config.Manage'] },
    ]
  },
  { id: 'system-config', label: 'System Configuration', labelKey: 'nav.systemConfiguration', iconName: 'cog', path: '/system-config', permissions: ['System.Configure'] },
  { id: 'settings', label: 'Global Settings', labelKey: 'nav.globalSettings', iconName: 'adjustments', path: '/settings', permissions: ['Settings.Manage'] },
];
