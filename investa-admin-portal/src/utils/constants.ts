/**
 * Application Constants
 */

import { NavItem } from '@/types';

export const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', iconName: 'grid', path: '/', permissions: ['Dashboard.View'] },
  { id: 'clients', label: 'Clients', iconName: 'briefcase', path: '/clients', permissions: ['Client.View', 'Client.Manage'] },
  {
    id: 'role-access-management',
    label: 'Role Access Management',
    iconName: 'shield-check',
    path: '/role-access-management',
    permissions: ['RBAC.View'],
    children: [
      { id: 'users', label: 'Users', iconName: 'users', path: '/users', permissions: ['User.View', 'User.Manage'] },
      { id: 'groups', label: 'Groups', iconName: 'users', path: '/groups', permissions: ['Group.Manage'] },
      { id: 'roles', label: 'Roles', iconName: 'handshake', path: '/roles', permissions: ['Role.Manage'] }
    ]
  },
  { 
    id: 'finance', 
    label: 'Finance', 
    iconName: 'cash', 
    path: '/finance',
    permissions: ['Finance.View', 'Finance.Manage'],
    children: [
      { id: 'coa', label: 'Chart of Accounts', iconName: 'grid', path: '/finance/coa', permissions: ['Account.View'] },
      { id: 'billing', label: 'Invoicing & Billing', iconName: 'credit-card', path: '/finance/billing', permissions: ['Billing.View', 'Invoice.Manage'] },
      { id: 'journals', label: 'Journal Entries', iconName: 'activity', path: '/finance/journals', permissions: ['Journal.View', 'Journal.Create'] },
      { id: 'cashflow', label: 'Cash Flow Management', iconName: 'revenue', path: '/finance/cashflow', permissions: ['CashFlow.View'] },
      { id: 'bankrec', label: 'Bank Reconciliation', iconName: 'shield-check', path: '/finance/bankrec', permissions: ['BankRec.View', 'BankRec.Manage'] },
    ]
  },
  { 
    id: 'reporting', 
    label: 'Financial Reporting', 
    iconName: 'chart', 
    path: '/reporting',
    permissions: ['Report.View'],
    children: [
      { id: 'pl', label: 'Profit & Loss', iconName: 'activity', path: '/reporting/pl', permissions: ['Report.View'] },
      { id: 'balancesheet', label: 'Balance Sheet', iconName: 'grid', path: '/reporting/balancesheet', permissions: ['Report.View'] },
      { id: 'aging', label: 'Aging Report', iconName: 'chart', path: '/reporting/aging', permissions: ['Report.View'] },
    ]
  },
  { id: 'audit', label: 'Audit Trail', iconName: 'shield-check', path: '/audit', permissions: ['Audit.View'] },
  { id: 'analytics', label: 'Advanced Analytics', iconName: 'sparkles', path: '/analytics', permissions: ['Analytics.View'] },
  { 
    id: 'config', 
    label: 'Configurations', 
    iconName: 'settings', 
    path: '/config',
    permissions: ['Config.Manage'],
    children: [
      { id: 'credit', label: 'Credit Setup', iconName: 'credit-card', path: '/config/credit', permissions: ['Credit.Configure'] },
      { id: 'offers', label: 'Offer Management', iconName: 'tag', path: '/config/offers', permissions: ['Offer.Manage'] },
      { id: 'apitester', label: 'API Tester', iconName: 'terminal', path: '/config/api-tester', permissions: ['System.Debug'] },
      { id: 'notification-templates', label: 'Notification Templates', iconName: 'bell', path: '/config/notification-templates', permissions: ['Config.Manage'] },
    ]
  },
  { id: 'system-config', label: 'System Configuration', iconName: 'cog', path: '/system-config', permissions: ['System.Configure'] },
  { id: 'settings', label: 'Global Settings', iconName: 'adjustments', path: '/settings', permissions: ['Settings.Manage'] },
];
