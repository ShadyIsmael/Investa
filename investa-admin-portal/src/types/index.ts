/**
 * Centralized Type Definitions
 */

// ============================================
// RBAC System Types (Backend-aligned)
// ============================================

export interface User {
  id: string; // GUID
  firstName: string | null;
  lastName: string | null;
  name: string; // Full name (computed)
  email: string | null;
  role: string | null; // Legacy role field
  roleId: string | null; // GUID
  groupName: string | null;
  groupId: number | null;
  roleName: string | null;
  status: 'Active' | 'Inactive';
  lastLogin: string | null; // ISO 8601 datetime
  createdAt: string; // ISO 8601 datetime
  updatedAt: string | null; // ISO 8601 datetime
  avatar: string | null; // URL
  metadata: {
    department?: string;
    location?: string;
    [key: string]: any;
  };
}

export interface PaginatedUsers {
  items: User[];
  total: number;
  page: number;
  pageSize: number;
}

export interface MemberSample {
  id: string; // GUID
  name: string | null;
  email: string | null;
  role: string | null;
}

export interface Group {
  id: number;
  name: string;
  slug: string | null;
  description: string | null;
  parentGroupId: number | null;
  memberCount: number;
  membersSample: MemberSample[];
  permissions: string[]; // Array of permission keys (e.g., "Finance.View")
  status: 'Active' | 'Inactive';
  createdAt: string; // ISO 8601 datetime
  updatedAt: string | null; // ISO 8601 datetime
  metadata: {
    location?: string;
    departmentCode?: string;
    [key: string]: any;
  };
}

export interface PaginatedGroups {
  items: Group[];
  total: number;
  page: number;
  pageSize: number;
}

export interface GroupCreateDto {
  name: string;
  description?: string;
  parentGroupId?: number;
  isActive?: boolean;
  metadata?: Record<string, any>;
}

export interface GroupUpdateDto {
  name: string;
  description?: string;
  parentGroupId?: number;
  isActive?: boolean;
  metadata?: Record<string, any>;
}

export interface Role {
  id: string; // GUID
  name: string;
  description: string | null;
  groupId: number;
  isActive: boolean;
  createdAt: string; // ISO 8601 datetime
}

export interface RoleWithGroup extends Role {
  groupName: string;
}

export interface PaginatedRoles {
  items: RoleWithGroup[];
  total: number;
  page: number;
  pageSize: number;
}

export interface RoleCreateDto {
  name: string;
  description?: string;
  groupId: number;
}

export interface AssignPermissionsDto {
  permissionIds: number[];
}

export interface AssignUsersDto {
  userIds: string[]; // Array of GUIDs
}

export interface Permission {
  id: number;
  key: string; // e.g., "clients.view", "invoices.create"
  resource: string; // e.g., "clients", "invoices"
  action: string; // e.g., "view", "create"
  description: string | null;
  createdAt: string;
}

export interface PaginatedPermissions {
  items: Permission[];
  total: number;
  page: number;
  pageSize: number;
}

// ============================================
// Legacy/Other Types
// ============================================

export interface Client {
  id: string;
  name: string;
  email: string;
  registrationDate: string;
  status: 'Active' | 'Inactive' | 'Suspended' | 'Pending';
  verificationPercent: number;
  avatar: string;
}

export interface SupportRequest {
  id: string;
  clientName: string;
  subject: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  createdAt: string;
  slaDueAt: string; // ISO string for the deadline
  assignedTo?: string;
}

export interface ReportedUser {
  id: number;
  name: string;
  email: string;
  reportCount: number;
  reason: string;
  status: 'Investigating' | 'Resolved' | 'Banned';
  avatar: string;
}

export interface DashboardStat {
  id: string;
  label: string;
  value: string;
  change: number; // percentage
  trend: 'up' | 'down' | 'neutral';
  iconName: 'users' | 'revenue' | 'activity' | 'orders';
}

export interface NavItem {
  id: string;
  label: string;
  iconName: string;
  path: string;
  /** Permission required to view this navigation item (e.g., 'Dashboard.View', 'Users.Manage') */
  permissions?: string[];
  /** If true, requires ALL permissions; if false, requires ANY permission */
  requireAll?: boolean;
  children?: NavItem[];
}

export interface ChartDataPoint {
  name: string;
  value: number;
  uv: number;
}

export enum AiStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}

export interface AiSearchResult {
  type: 'user' | 'stat' | 'account' | 'invoice' | 'general';
  id?: string | number;
  title: string;
  subtitle: string;
  explanation: string;
}

export interface Account {
  id: string;
  code: string;
  name: string;
  type: 'Asset' | 'Liability' | 'Equity' | 'Revenue' | 'Expense';
  balance: number;
  status: 'Active' | 'Inactive';
}

export interface Invoice {
  id: string;
  clientName: string;
  amount: number;
  dueDate: string;
  status: 'Paid' | 'Unpaid' | 'Overdue';
}

export interface JournalEntry {
  id: string;
  date: string;
  description: string;
  debit: number;
  credit: number;
  account: string;
}

export interface CashFlowPoint {
  date: string;
  inflow: number;
  outflow: number;
}

export interface ClientProfile {
  id: number;
  userId: string;
  firstName: string;
  lastName?: string;
  gender?: string;
  personalImageUrl?: string;
  mobileNumber?: string;
  firebaseUid?: string;
  phone?: string;
  email?: string;
  country?: string;
  city?: string;
  district?: string;
  address1?: string;
  address2?: string;
  nationalId?: string;
  nationalIdImageUrl?: string;
  birthDate?: string;
  age?: number;
  websiteUrl?: string;
  linkedInUrl?: string;
  facebookUrl?: string;
  businessTitle?: string;
  categoryIds?: number[];
  score?: number;
  credit?: number;
  createdAt?: string;
  updatedAt?: string;
  statusId?: number;
  statusName?: string;
  penaltyDurationDays?: number | null;
}

export interface ChatRequestPayload {
  id: string;
  fromUserId: number | string | null;
  fromName?: string | null;
  message: string;
  createdAt: string; // ISO timestamp
}

export interface Message {
  id: string;
  fromUserId?: number | string | null;
  from?: string | null; // phone or name
  text: string;
  createdAt: string; // ISO timestamp
}

export interface Conversation {
  id: string; // guid
  userMobile: string;
  lastMessage: string;
  unreadCount: number;
  messages: Message[];
}
