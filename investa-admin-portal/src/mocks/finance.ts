
import { Account, Invoice, JournalEntry, CashFlowPoint, DashboardStat, ChartDataPoint } from '../types';

export const MOCK_COA: Account[] = [
  { id: '1', code: '1010', name: 'Petty Cash', type: 'Asset', balance: 1250.00, status: 'Active' },
  { id: '2', code: '1020', name: 'Main Operating Bank', type: 'Asset', balance: 452300.75, status: 'Active' },
  { id: '3', code: '1100', name: 'Accounts Receivable', type: 'Asset', balance: 85400.00, status: 'Active' },
  { id: '4', code: '2010', name: 'Accounts Payable', type: 'Liability', balance: 34200.50, status: 'Active' },
  { id: '5', code: '2100', name: 'Payroll Liabilities', type: 'Liability', balance: 12000.00, status: 'Active' },
  { id: '6', code: '3010', name: 'Retained Earnings', type: 'Equity', balance: 250000.00, status: 'Active' },
  { id: '7', code: '4010', name: 'Service Revenue', type: 'Revenue', balance: 678000.00, status: 'Active' },
  { id: '8', code: '5010', name: 'Office Supplies Expense', type: 'Expense', balance: 4500.25, status: 'Active' },
  { id: '9', code: '5020', name: 'Utility Expense', type: 'Expense', balance: 2300.00, status: 'Active' },
  { id: '10', code: '5030', name: 'Rent Expense', type: 'Expense', balance: 15000.00, status: 'Active' },
];

export const MOCK_INVOICES: Invoice[] = [
  { id: 'INV-001', clientName: 'Global Tech Solutions', amount: 15400.00, dueDate: '2024-04-15', status: 'Paid' },
  { id: 'INV-002', clientName: 'Apex Marketing Group', amount: 8200.50, dueDate: '2024-05-10', status: 'Unpaid' },
  { id: 'INV-003', clientName: 'Nebula Systems', amount: 3100.00, dueDate: '2024-03-01', status: 'Overdue' },
  { id: 'INV-004', clientName: 'Quantum Logistics', amount: 12500.00, dueDate: '2024-05-20', status: 'Unpaid' },
];

export const MOCK_JOURNALS: JournalEntry[] = [
  { id: 'JE-001', date: '2024-04-01', description: 'Monthly Office Rent', debit: 5000.00, credit: 0, account: 'Rent Expense' },
  { id: 'JE-002', date: '2024-04-01', description: 'Monthly Office Rent', debit: 0, credit: 5000.00, account: 'Main Operating Bank' },
  { id: 'JE-003', date: '2024-04-05', description: 'Client Payment - INV-001', debit: 15400.00, credit: 0, account: 'Main Operating Bank' },
  { id: 'JE-004', date: '2024-04-05', description: 'Client Payment - INV-001', debit: 0, credit: 15400.00, account: 'Accounts Receivable' },
];

export const MOCK_CASHFLOW: CashFlowPoint[] = [
  { date: 'Jan', inflow: 45000, outflow: 32000 },
  { date: 'Feb', inflow: 52000, outflow: 38000 },
  { date: 'Mar', inflow: 48000, outflow: 41000 },
  { date: 'Apr', inflow: 61000, outflow: 42000 },
];

export const DASHBOARD_STATS: DashboardStat[] = [
  { id: '1', label: 'Total Users', value: '1,234', change: 12.5, trend: 'up', iconName: 'users' },
  { id: '2', label: 'Revenue', value: '$45,231', change: 8.2, trend: 'up', iconName: 'revenue' },
  { id: '3', label: 'Active Sessions', value: '432', change: -2.4, trend: 'down', iconName: 'activity' },
  { id: '4', label: 'New Orders', value: '89', change: 5.7, trend: 'up', iconName: 'orders' },
];

export const REVENUE_DATA: ChartDataPoint[] = [
  { name: 'Mon', value: 4000, uv: 2400 },
  { name: 'Tue', value: 3000, uv: 1398 },
  { name: 'Wed', value: 2000, uv: 9800 },
  { name: 'Thu', value: 2780, uv: 3908 },
  { name: 'Fri', value: 1890, uv: 4800 },
  { name: 'Sat', value: 2390, uv: 3800 },
  { name: 'Sun', value: 3490, uv: 4300 },
];
