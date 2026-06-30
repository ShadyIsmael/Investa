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
  { 
    id: 'finance', 
    label: 'Finance', 
    labelKey: 'nav.finance',
    iconName: 'cash', 
    path: '/finance',
    permissions: ['Finance.View', 'Finance.Manage'],
    children: [
      { id: 'coa', label: 'Chart of Accounts', labelKey: 'nav.chartOfAccounts', iconName: 'grid', path: '/finance/coa', permissions: ['Account.View'] },
      { id: 'billing', label: 'Invoicing & Billing', labelKey: 'nav.invoicingBilling', iconName: 'credit-card', path: '/finance/billing', permissions: ['Billing.View', 'Invoice.Manage'] },
      { id: 'journals', label: 'Journal Entries', labelKey: 'nav.journalEntries', iconName: 'activity', path: '/finance/journals', permissions: ['Journal.View', 'Journal.Create'] },
      { id: 'cashflow', label: 'Cash Flow Management', labelKey: 'nav.cashFlowManagement', iconName: 'revenue', path: '/finance/cashflow', permissions: ['CashFlow.View'] },
      { id: 'bankrec', label: 'Bank Reconciliation', labelKey: 'nav.bankReconciliation', iconName: 'shield-check', path: '/finance/bankrec', permissions: ['BankRec.View', 'BankRec.Manage'] },
    ]
  },
  { 
    id: 'reporting', 
    label: 'Financial Reporting', 
    labelKey: 'nav.financialReporting',
    iconName: 'chart', 
    path: '/reporting',
    permissions: ['Report.View'],
    children: [
      { id: 'pl', label: 'Profit & Loss', labelKey: 'nav.profitLoss', iconName: 'activity', path: '/reporting/pl', permissions: ['Report.View'] },
      { id: 'balancesheet', label: 'Balance Sheet', labelKey: 'nav.balanceSheet', iconName: 'grid', path: '/reporting/balancesheet', permissions: ['Report.View'] },
      { id: 'aging', label: 'Aging Report', labelKey: 'nav.agingReport', iconName: 'chart', path: '/reporting/aging', permissions: ['Report.View'] },
    ]
  },
  { id: 'audit', label: 'Audit Trail', labelKey: 'nav.auditTrail', iconName: 'shield-check', path: '/audit', permissions: ['Audit.View'] },
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
      }
    ]
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
