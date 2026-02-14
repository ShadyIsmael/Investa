using System;

namespace Investa.Domain.Entities.Security
{
    /// <summary>
    /// Canonical user roles used across the system.
    /// Keep values in sync with AspNetRoles.Name
    /// Two roles only: OrgUser (internal staff) and Client (external users).
    /// Admin privileges are managed via RBAC Groups and Permissions.
    /// </summary>
    public enum UserRoles
    {
        OrgUser = 0,
        Client = 1
    }

    /// <summary>
    /// Centralized permission keys to avoid hard-coded strings across the codebase.
    /// Use SystemPermissions.SuperAccess for wildcard admin.
    /// </summary>
    public static class SystemPermissions
    {
        public const string SuperAccess = "*.*";

        public const string DashboardView = "Dashboard.View";
        public const string ClientView = "Client.View";
        public const string ClientManage = "Client.Manage";

        public const string UserView = "User.View";
        public const string UserEdit = "User.Edit";
        public const string UserDelete = "User.Delete";
        public const string UserCreate = "User.Create";
        public const string UserManage = "User.Manage";

        public const string GroupView = "Group.View";
        public const string GroupEdit = "Group.Edit";
        public const string GroupDelete = "Group.Delete";
        public const string GroupManage = "Group.Manage";

        public const string RoleView = "Role.View";
        public const string RoleEdit = "Role.Edit";
        public const string RoleDelete = "Role.Delete";
        public const string RoleManage = "Role.Manage";

        public const string PermissionManage = "Permission.Manage";

        public const string SupportView = "Support.View";
        public const string ChatView = "Chat.View";

        public const string FinanceView = "Finance.View";
        public const string FinanceManage = "Finance.Manage";

        public const string AccountView = "Account.View";
        public const string BillingView = "Billing.View";

        public const string InvoiceCreate = "Invoice.Create";
        public const string InvoiceManage = "Invoice.Manage";
        public const string InvoiceApprove = "Invoice.Approve";

        public const string JournalView = "Journal.View";
        public const string JournalCreate = "Journal.Create";

        public const string CashFlowView = "CashFlow.View";
        public const string BankRecView = "BankRec.View";
        public const string BankRecManage = "BankRec.Manage";

        public const string ReportView = "Report.View";
        public const string ReportExport = "Report.Export";

        public const string AuditView = "Audit.View";
        public const string AnalyticsView = "Analytics.View";

        public const string SettingsManage = "Settings.Manage";
        public const string ConfigManage = "Config.Manage";

        public const string CreditConfigure = "Credit.Configure";
        public const string OfferManage = "Offer.Manage";

        public const string SystemDebug = "System.Debug";
    }
}
