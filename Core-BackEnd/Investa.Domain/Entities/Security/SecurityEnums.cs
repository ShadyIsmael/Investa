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
        public const string FinanceCreate = "Finance.Create";
        public const string FinanceEditDraft = "Finance.EditDraft";
        public const string FinanceSubmit = "Finance.Submit";
        public const string FinanceReview = "Finance.Review";
        public const string FinanceConfirm = "Finance.Confirm";
        public const string FinanceReverse = "Finance.Reverse";
        public const string FinanceManageMasterData = "Finance.ManageMasterData";

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

        public const string OfferManage = "Offer.Manage";

        // FOPX Opportunity Administration. Legacy Opportunity.* keys remain
        // valid through the permission-policy compatibility mapping; role names
        // are not authorization grants.
        public const string FopxOpportunitiesView = "FOPX.Opportunities.View";
        public const string FopxOpportunitiesReview = "FOPX.Opportunities.Review";
        public const string FopxOpportunitiesManage = "FOPX.Opportunities.Manage";

        public const string CompanyCustomersView = "Company.Customers.View";
        public const string CompanyCustomersCreate = "Company.Customers.Create";
        public const string CompanyCustomersEdit = "Company.Customers.Edit";
        public const string CompanyCustomersManage = "Company.Customers.Manage";

        public const string CompanyProductsView = "Company.Products.View";
        public const string CompanyProductsCreate = "Company.Products.Create";
        public const string CompanyProductsEdit = "Company.Products.Edit";
        public const string CompanyProductsManage = "Company.Products.Manage";

        public const string CompanySalesOpportunitiesView = "Company.Sales.Opportunities.View";
        public const string CompanySalesOpportunitiesCreate = "Company.Sales.Opportunities.Create";
        public const string CompanySalesOpportunitiesEdit = "Company.Sales.Opportunities.Edit";
        public const string CompanySalesOpportunitiesManage = "Company.Sales.Opportunities.Manage";
        public const string CompanySalesQuotationsView = "Company.Sales.Quotations.View";
        public const string CompanySalesQuotationsCreate = "Company.Sales.Quotations.Create";
        public const string CompanySalesQuotationsEdit = "Company.Sales.Quotations.Edit";
        public const string CompanySalesQuotationsManage = "Company.Sales.Quotations.Manage";
        public const string CompanySalesContractsView = "Company.Sales.Contracts.View";
        public const string CompanySalesContractsCreate = "Company.Sales.Contracts.Create";
        public const string CompanySalesContractsEdit = "Company.Sales.Contracts.Edit";
        public const string CompanySalesContractsManage = "Company.Sales.Contracts.Manage";

        public const string SystemDebug = "System.Debug";

        // Admin User Management permissions
        public const string AdminUsersView = "AdminUsers.View";
        public const string AdminUsersCreate = "AdminUsers.Create";
        public const string AdminUsersEdit = "AdminUsers.Edit";
        public const string AdminUsersChangeStatus = "AdminUsers.ChangeStatus";
        public const string AdminUsersLockUnlock = "AdminUsers.LockUnlock";
        public const string AdminUsersManageRoles = "AdminUsers.ManageRoles";
        public const string AdminUsersRequestPasswordReset = "AdminUsers.RequestPasswordReset";
        public const string AdminUsersApproveChanges = "AdminUsers.ApproveChanges";
        public const string AdminUsersViewAudit = "AdminUsers.ViewAudit";

        public const string FinanceRecordPayment = "Finance.RecordPayment";
        public const string FinanceReversePayment = "Finance.ReversePayment";
    }
}
