namespace ResetBusinessDataRunner;

/// <summary>
/// Explicit reset boundary. Unknown tables are never treated as business tables
/// automatically; this prevents a new reference/security table from being
/// deleted until it has been reviewed and added intentionally.
/// </summary>
public static class BusinessDataResetCatalog
{
    public static IReadOnlySet<string> BusinessTables { get; } = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
    {
        // Canonical Project / Opportunity aggregates.
        "Projects", "Opportunities", "OpportunityMedia", "OpportunityDocuments", "OpportunityEvents",
        "OpportunityTagAssignments", "OpportunityJoinRequests", "ProjectRoomEntries", "ProjectRoomDocuments",

        // Canonical Offer / Participation / Contract data.
        "NegotiationOffers", "NegotiationOfferLegs", "InvestmentContracts", "InvestmentContractVersions",
        "ContractEvents", "ParticipationObligationConfirmations", "PaymentTransactions", "PaymentAllocations",

        // Conversation and negotiation records.
        "Conversations", "ConversationRequests", "ConversationParticipants", "ChatMessages",
        "MessageAttachments", "MessageReactions", "BusinessMessages",

        // User-facing business relations and derived records.
        "InvestmentFavorites", "InvestmentViews", "InvestmentLearnMores", "Reports", "Notifications",
        "UserNotifications",

        // Obsolete investment/request schema retained only for physical cleanup.
        "Investments", "InvestmentParticipants", "InvestmentTeamMembers", "InvestmentEvents",
        "InvestmentRequests", "InvestmentImages",

        // Possible names from pre-FOPX schemas. They are deleted only when they
        // physically exist in the configured database.
        "Offers", "OfferVersions", "OfferLegs", "Participations", "ParticipationLegs",
        "ParticipationLegObligations", "ParticipationCashFlows", "CashFlows", "Obligations",
        "OpportunityRoomAccess", "OpportunityRoomEntries", "OpportunityRoomDocuments",
        "ProjectMedia", "ProjectDocuments", "ProjectUpdates", "ProjectFavorites", "OpportunityFavorites",
        "Favorites", "Follows", "Requests"
    };

    public static IReadOnlySet<string> PreservedTables { get; } = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
    {
        // ASP.NET Identity and application identity/security.
        "AspNetUsers", "AspNetRoles", "AspNetRoleClaims", "AspNetUserClaims", "AspNetUserLogins",
        "AspNetUserRoles", "AspNetUserTokens", "AuthUsers", "UserProfiles", "Clients",
        "ClientStatuses", "ClientStatusHistories", "Groups", "Permissions", "ApplicationPermissions",
        "GroupPermissions", "UserGroups", "Roles", "UserRoles", "RolePermissions", "UserSessions", "RefreshTokens",
        "UserTokens", "DeviceTokens", "UserVerification", "AuditLogs", "PendingAdminChanges",
        "ProfileChangeAudits", "EmailPreferences", "EmailVerificationOtps",

        // Reference/master data.
        "Lookups", "BusinessCategories", "OpportunityCategories", "OpportunityTags", "FundingGoals",
        "Currencies", "ExchangeRateSnapshots", "ReputationRules", "NotificationTemplates",
        "CreditConfigurations", "CreditPlans", "ServicePrices", "PricingRules", "ClientBusinessCategories",

        // User balances, support, and company finance are outside this reset.
        "CreditTransactions", "Wallets", "WalletTransactions", "Transactions", "SupportSessions", "Messages",
        "FinanceAccounts", "Suppliers", "IncomeCategories", "ExpenseCategories", "FinanceTransactions",
        "FinanceTransactionLines", "FinanceAttachments", "FinanceAuditEvents", "FinanceReconciliations"
    };

    public static IReadOnlyList<string> MajorAggregates { get; } =
    [
        "Projects", "Opportunities", "NegotiationOffers", "OpportunityJoinRequests",
        "InvestmentContracts", "Conversations", "PaymentTransactions"
    ];

    public static IReadOnlyList<string> ResolveExistingTables(IEnumerable<string> existingTables)
        => existingTables
            .Where(BusinessTables.Contains)
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToArray();

    public static bool IsPreserved(string tableName) => PreservedTables.Contains(tableName);
}
