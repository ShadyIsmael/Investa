using Investa.Domain;
using Investa.Domain.Entities;

using Investa.Domain.Entities.Enums;

using Investa.Domain.Entities.Security;

using Investa.Domain.Entities.Company;

using Microsoft.AspNetCore.Identity.EntityFrameworkCore;

using Investa.Infrastructure.Identity;

using Microsoft.EntityFrameworkCore;

using Microsoft.EntityFrameworkCore.ChangeTracking;



namespace Investa.Infrastructure.Persistence;



/// <summary>

/// Application database context that combines business entities with ASP.NET Core Identity

/// Inherits from IdentityDbContext to support user authentication and authorization

/// </summary>

public partial class ApplicationDbContext : IdentityDbContext<ApplicationIdentityUser, ApplicationIdentityRole, Guid>

{

    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)

        : base(options)

    {

    }

    private static readonly string[] ImmutableContractProperties =
    [
        nameof(InvestmentContract.ContractNumber),
        nameof(InvestmentContract.OpportunityId),
        nameof(InvestmentContract.AcceptedOfferId),
        nameof(InvestmentContract.AcceptedOfferVersionNumber),
        nameof(InvestmentContract.ParticipationRequestId),
        nameof(InvestmentContract.FounderUserId),
        nameof(InvestmentContract.InvestorUserId),
        nameof(InvestmentContract.InvestmentModel),
        nameof(InvestmentContract.OpportunityTitleSnapshot),
        nameof(InvestmentContract.FounderNameSnapshot),
        nameof(InvestmentContract.InvestorNameSnapshot),
        nameof(InvestmentContract.AcceptedCurrency),
        nameof(InvestmentContract.AcceptedAmount),
        nameof(InvestmentContract.AcceptanceTimestamp),
        nameof(InvestmentContract.CreatedAt)
    ];

    private static readonly string[] ImmutableLoanObligationProperties =
    [
        nameof(LoanObligation.ParticipationRequestId),
        nameof(LoanObligation.ContractId),
        nameof(LoanObligation.ContractVersionId),
        nameof(LoanObligation.AcceptedOfferId),
        nameof(LoanObligation.AcceptedOfferVersionNumber),
        nameof(LoanObligation.OfferLegId),
        nameof(LoanObligation.OfferLegNumber),
        nameof(LoanObligation.FounderUserId),
        nameof(LoanObligation.InvestorUserId),
        nameof(LoanObligation.Principal),
        nameof(LoanObligation.Currency),
        nameof(LoanObligation.InterestRate),
        nameof(LoanObligation.TermMonths),
        nameof(LoanObligation.RepaymentModel),
        nameof(LoanObligation.PrincipalRepaymentMethod),
        nameof(LoanObligation.ContractualStartDate),
        nameof(LoanObligation.ContractualMaturityDate),
        nameof(LoanObligation.CreatedAt)
    ];

    private static readonly string[] ImmutableLoanInstallmentProperties =
    [
        nameof(LoanRepaymentInstallment.LoanObligationId),
        nameof(LoanRepaymentInstallment.InstallmentNumber),
        nameof(LoanRepaymentInstallment.DueDate),
        nameof(LoanRepaymentInstallment.PrincipalDue),
        nameof(LoanRepaymentInstallment.InterestDue),
        nameof(LoanRepaymentInstallment.TotalDue),
        nameof(LoanRepaymentInstallment.Currency),
        nameof(LoanRepaymentInstallment.CreatedAt)
    ];

    private static readonly string[] ImmutableEquityPositionProperties =
    [
        nameof(EquityPosition.ParticipationRequestId), nameof(EquityPosition.ContractId), nameof(EquityPosition.ContractVersionId),
        nameof(EquityPosition.AcceptedOfferId), nameof(EquityPosition.AcceptedOfferVersionNumber), nameof(EquityPosition.OfferLegId),
        nameof(EquityPosition.OfferLegNumber), nameof(EquityPosition.OpportunityId), nameof(EquityPosition.ProjectId),
        nameof(EquityPosition.FounderUserId), nameof(EquityPosition.InvestorUserId), nameof(EquityPosition.InvestmentAmount), nameof(EquityPosition.Currency),
        nameof(EquityPosition.OwnershipModel), nameof(EquityPosition.ContractualOwnershipPercentage), nameof(EquityPosition.InvestorShareCount),
        nameof(EquityPosition.TotalIssuedShares), nameof(EquityPosition.ShareClass), nameof(EquityPosition.PricePerShare), nameof(EquityPosition.PreMoneyValuation),
        nameof(EquityPosition.PostMoneyValuation), nameof(EquityPosition.EffectiveOwnershipDate), nameof(EquityPosition.CreatedAt)
    ];

    private static readonly string[] ImmutableEquitySnapshotProperties =
    [
        nameof(EquityHoldingSnapshot.EquityPositionId), nameof(EquityHoldingSnapshot.OwnershipModel), nameof(EquityHoldingSnapshot.EffectiveDate),
        nameof(EquityHoldingSnapshot.ContractualOwnershipPercentage), nameof(EquityHoldingSnapshot.InvestorShareCount), nameof(EquityHoldingSnapshot.TotalIssuedShares),
        nameof(EquityHoldingSnapshot.DerivedOwnershipPercentage), nameof(EquityHoldingSnapshot.ShareClass), nameof(EquityHoldingSnapshot.PricePerShare),
        nameof(EquityHoldingSnapshot.PreMoneyValuation), nameof(EquityHoldingSnapshot.PostMoneyValuation), nameof(EquityHoldingSnapshot.ContractId),
        nameof(EquityHoldingSnapshot.ContractVersionId), nameof(EquityHoldingSnapshot.AcceptedOfferId), nameof(EquityHoldingSnapshot.OfferLegId), nameof(EquityHoldingSnapshot.CreatedAt)
    ];

    private static readonly string[] ImmutableEquityLedgerProperties =
    [
        nameof(EquityHoldingLedgerEntry.EquityPositionId), nameof(EquityHoldingLedgerEntry.EventType), nameof(EquityHoldingLedgerEntry.EffectiveDate),
        nameof(EquityHoldingLedgerEntry.ShareDelta), nameof(EquityHoldingLedgerEntry.ResultingInvestorShares), nameof(EquityHoldingLedgerEntry.ResultingTotalIssuedShares),
        nameof(EquityHoldingLedgerEntry.ResultingOwnershipPercentage), nameof(EquityHoldingLedgerEntry.ContractualOwnershipPercentage), nameof(EquityHoldingLedgerEntry.ContractId),
        nameof(EquityHoldingLedgerEntry.ContractVersionId), nameof(EquityHoldingLedgerEntry.AcceptedOfferId), nameof(EquityHoldingLedgerEntry.OfferLegId), nameof(EquityHoldingLedgerEntry.ActorUserId),
        nameof(EquityHoldingLedgerEntry.ActorType), nameof(EquityHoldingLedgerEntry.CorrelationId), nameof(EquityHoldingLedgerEntry.CreatedAt)
    ];

    private static readonly string[] ImmutableEquityCorporateEventProperties =
    [
        nameof(EquityCorporateEvent.ProjectId), nameof(EquityCorporateEvent.OpportunityId), nameof(EquityCorporateEvent.EventType),
        nameof(EquityCorporateEvent.EffectiveDate), nameof(EquityCorporateEvent.InitiatedByUserId), nameof(EquityCorporateEvent.SharesIssued),
        nameof(EquityCorporateEvent.ResultingTotalIssuedShares), nameof(EquityCorporateEvent.SplitNumerator), nameof(EquityCorporateEvent.SplitDenominator),
        nameof(EquityCorporateEvent.ShareClass), nameof(EquityCorporateEvent.Currency), nameof(EquityCorporateEvent.PreMoneyValuation),
        nameof(EquityCorporateEvent.PostMoneyValuation), nameof(EquityCorporateEvent.PricePerShare), nameof(EquityCorporateEvent.Reason),
        nameof(EquityCorporateEvent.Notes), nameof(EquityCorporateEvent.CreatedAt), nameof(EquityCorporateEvent.BeforeCapitalizationSnapshotJson),
        nameof(EquityCorporateEvent.AfterCapitalizationSnapshotJson), nameof(EquityCorporateEvent.BeforeSnapshotHash), nameof(EquityCorporateEvent.AfterSnapshotHash),
        nameof(EquityCorporateEvent.Status), nameof(EquityCorporateEvent.SubmittedAt), nameof(EquityCorporateEvent.ApprovedByUserId),
        nameof(EquityCorporateEvent.ApprovedAt), nameof(EquityCorporateEvent.AppliedByUserId), nameof(EquityCorporateEvent.AppliedAt),
        nameof(EquityCorporateEvent.ExpectedTotalIssuedShares), nameof(EquityCorporateEvent.ExpectedLatestAppliedEventId)
    ];

    private static readonly string[] ImmutableEquityCapitalizationSnapshotProperties =
    [ nameof(EquityCapitalizationSnapshot.EquityCorporateEventId), nameof(EquityCapitalizationSnapshot.IsBefore), nameof(EquityCapitalizationSnapshot.CapturedAt), nameof(EquityCapitalizationSnapshot.TotalIssuedShares), nameof(EquityCapitalizationSnapshot.Currency), nameof(EquityCapitalizationSnapshot.SnapshotHash) ];
    private static readonly string[] ImmutableEquityCapitalizationHolderProperties =
    [ nameof(EquityCapitalizationSnapshotHolder.EquityCapitalizationSnapshotId), nameof(EquityCapitalizationSnapshotHolder.EquityPositionId), nameof(EquityCapitalizationSnapshotHolder.InvestorUserId), nameof(EquityCapitalizationSnapshotHolder.InvestorShares), nameof(EquityCapitalizationSnapshotHolder.OwnershipPercentage), nameof(EquityCapitalizationSnapshotHolder.ShareClass) ];

    private static readonly string[] ImmutableContractVersionProperties =
    [
        nameof(InvestmentContractVersion.ContractId),
        nameof(InvestmentContractVersion.VersionNumber),
        nameof(InvestmentContractVersion.VersionType),
        nameof(InvestmentContractVersion.PreviousVersionId),
        nameof(InvestmentContractVersion.SourceParticipationRequestId),
        nameof(InvestmentContractVersion.SourceNegotiationOfferId),
        nameof(InvestmentContractVersion.TermsSnapshotJson),
        nameof(InvestmentContractVersion.PreviousTermsSnapshotJson),
        nameof(InvestmentContractVersion.ChangesSnapshotJson),
        nameof(InvestmentContractVersion.DocumentHash),
        nameof(InvestmentContractVersion.DocumentContent),
        nameof(InvestmentContractVersion.CreatedAt),
        nameof(InvestmentContractVersion.ActivatedAt)
    ];

    public override int SaveChanges(bool acceptAllChangesOnSuccess)
    {
        ValidateImmutableContractChanges();
        return base.SaveChanges(acceptAllChangesOnSuccess);
    }

    public override Task<int> SaveChangesAsync(bool acceptAllChangesOnSuccess, CancellationToken cancellationToken = default)
    {
        ValidateImmutableContractChanges();
        return base.SaveChangesAsync(acceptAllChangesOnSuccess, cancellationToken);
    }

    private void ValidateImmutableContractChanges()
    {
        ChangeTracker.DetectChanges();
        foreach (var entry in ChangeTracker.Entries<InvestmentContract>().Where(e => e.State == EntityState.Modified))
            EnsureImmutablePropertiesUnchanged(entry, ImmutableContractProperties, "Contract legal snapshot fields are immutable after creation.");

        foreach (var entry in ChangeTracker.Entries<InvestmentContractVersion>().Where(e => e.State == EntityState.Modified))
            EnsureImmutablePropertiesUnchanged(entry, ImmutableContractVersionProperties, "Contract version legal snapshot fields are immutable after activation.");

        foreach (var entry in ChangeTracker.Entries<LoanObligation>().Where(e => e.State == EntityState.Modified))
            EnsureImmutablePropertiesUnchanged(entry, ImmutableLoanObligationProperties, "Loan obligation contractual terms are immutable after activation.");

        foreach (var entry in ChangeTracker.Entries<LoanRepaymentInstallment>().Where(e => e.State == EntityState.Modified))
            EnsureImmutablePropertiesUnchanged(entry, ImmutableLoanInstallmentProperties, "Loan repayment schedule terms are immutable after creation.");

        foreach (var entry in ChangeTracker.Entries<EquityPosition>().Where(e => e.State == EntityState.Modified))
            EnsureImmutablePropertiesUnchanged(entry, ImmutableEquityPositionProperties, "Equity position contractual terms are immutable after creation.");
        foreach (var entry in ChangeTracker.Entries<EquityHoldingSnapshot>().Where(e => e.State == EntityState.Modified))
            EnsureImmutablePropertiesUnchanged(entry, ImmutableEquitySnapshotProperties, "Initial Equity holding snapshots are immutable.");
        foreach (var entry in ChangeTracker.Entries<EquityHoldingLedgerEntry>().Where(e => e.State == EntityState.Modified))
            EnsureImmutablePropertiesUnchanged(entry, ImmutableEquityLedgerProperties, "Equity ownership ledger entries are immutable.");
        foreach (var entry in ChangeTracker.Entries<EquityCorporateEvent>().Where(e => e.State == EntityState.Modified))
        {
            var originalStatus = entry.Property(nameof(EquityCorporateEvent.Status)).OriginalValue;
            var wasApplied = Equals(originalStatus, EquityCorporateEventStatus.Applied) || string.Equals(originalStatus?.ToString(), EquityCorporateEventStatus.Applied.ToString(), StringComparison.Ordinal);
            if (wasApplied) EnsureImmutablePropertiesUnchanged(entry, ImmutableEquityCorporateEventProperties, "Applied Equity corporate events are immutable.");
        }
        foreach (var entry in ChangeTracker.Entries<EquityCorporateEvent>().Where(e => e.State == EntityState.Deleted))
        {
            var status = entry.Property(nameof(EquityCorporateEvent.Status)).OriginalValue;
            if (Equals(status, EquityCorporateEventStatus.Applied) || string.Equals(status?.ToString(), EquityCorporateEventStatus.Applied.ToString(), StringComparison.Ordinal))
                throw new InvalidOperationException("Applied Equity corporate events cannot be deleted.");
        }
        foreach (var entry in ChangeTracker.Entries<EquityCapitalizationSnapshot>().Where(e => e.State == EntityState.Modified))
            EnsureImmutablePropertiesUnchanged(entry, ImmutableEquityCapitalizationSnapshotProperties, "Equity capitalization snapshots are immutable.");
        foreach (var entry in ChangeTracker.Entries<EquityCapitalizationSnapshotHolder>().Where(e => e.State == EntityState.Modified))
            EnsureImmutablePropertiesUnchanged(entry, ImmutableEquityCapitalizationHolderProperties, "Equity capitalization snapshot holders are immutable.");
    }

    private static void EnsureImmutablePropertiesUnchanged(EntityEntry entry, IEnumerable<string> properties, string message)
    {
        foreach (var propertyName in properties)
        {
            var property = entry.Property(propertyName);
            if (!Equals(property.OriginalValue, property.CurrentValue))
                throw new InvalidOperationException(message);
        }
    }



    // Stores extended profile information for users (full name, contact, addresses, timestamps)

    // Only present for Client accounts (not OrgUser/admin accounts)

    public DbSet<UserProfile> UserProfiles { get; set; }



    // Legacy/central authentication records that mirror or complement Identity users

    public DbSet<AuthUser> AuthUsers { get; set; }



    // Client-specific records containing business/customer details

    public DbSet<Client> Clients { get; set; }



    // Lookup table for client statuses (Active, Suspended, etc.)

    public DbSet<ClientStatus> ClientStatuses { get; set; }



    // History of changes to a client's status over time

    public DbSet<ClientStatusHistory> ClientStatusHistories { get; set; }



    // Investments made by users

    public DbSet<Investment> Investments { get; set; }



    // Tracks individual investor participation in investment opportunities

    public DbSet<InvestmentParticipant> InvestmentParticipants { get; set; }



    // Team members/founders associated with investment opportunities

    public DbSet<InvestmentTeamMember> InvestmentTeamMembers { get; set; }



    // Favorite/watchlist entries for clients

    public DbSet<InvestmentFavorite> InvestmentFavorites { get; set; }



    // Append-only events for investment lifecycle changes

    public DbSet<InvestmentEvent> InvestmentEvents { get; set; }



    // Financial transactions tied to user wallets

    public DbSet<Transaction> Transactions { get; set; }



    // Generic lookup values used across the system (multilingual keys/values)

    public DbSet<Lookup> Lookups { get; set; }



    // Administrative groups (roles/teams) in the application

    public DbSet<Group> Groups { get; set; }



    // Permission definitions used to gate features

    public DbSet<Permission> Permissions { get; set; }



    // Enhanced permission system with resource-action model

    public DbSet<ApplicationPermission> ApplicationPermissions { get; set; }



    // Many-to-many join between Groups and Permissions

    public DbSet<GroupPermission> GroupPermissions { get; set; }



    // Assignments of users to groups

    public DbSet<UserGroup> UserGroups { get; set; }



    // Group-Bound Role Architecture entities

    public new DbSet<Investa.Domain.Entities.Security.Role> Roles { get; set; }

    public new DbSet<Investa.Domain.Entities.Security.UserRole> UserRoles { get; set; }

    public DbSet<Investa.Domain.Entities.Security.RolePermission> RolePermissions { get; set; }



    // User session tracking for refresh tokens and security

    public DbSet<UserSession> UserSessions { get; set; }



    // Audit trail for compliance and security monitoring

    public DbSet<AuditLog> AuditLogs { get; set; }

    // Pending admin user changes for Maker/Checker workflow
    public DbSet<PendingAdminChange> PendingAdminChanges { get; set; }



    // Business category taxonomy used for client classification

    public DbSet<ProjectCategory> ProjectCategories { get; set; }



    // Profile change audit trail for sensitive profile modifications (national id, business role)

    public DbSet<ProfileChangeAudit> ProfileChangeAudits { get; set; }



    // Chat module entities (conversations, messages, attachments, reactions)

    public DbSet<Investa.Domain.Entities.Chat.Conversation> Conversations { get; set; }

    public DbSet<Investa.Domain.Entities.Chat.ConversationRequest> ConversationRequests { get; set; }

    public DbSet<Investa.Domain.Entities.Chat.ChatMessage> ChatMessages { get; set; }

    public DbSet<Investa.Domain.Entities.Chat.ConversationParticipant> ConversationParticipants { get; set; }

    public DbSet<Investa.Domain.Entities.Chat.NegotiationOffer> NegotiationOffers { get; set; }

    public DbSet<Investa.Domain.Entities.Chat.NegotiationOfferLeg> NegotiationOfferLegs { get; set; }

    public DbSet<Investa.Domain.Entities.Chat.MessageAttachment> MessageAttachments { get; set; }

    public DbSet<Investa.Domain.Entities.Chat.MessageReaction> MessageReactions { get; set; }



    // Support Session entities (new support request handling)

    public DbSet<SupportSession> SupportSessions { get; set; }

    public DbSet<Message> Messages { get; set; }



    // Refresh tokens for long-lived authentication sessions

    public DbSet<RefreshToken> RefreshTokens { get; set; }



    // Records credit-related balance changes per user
    public DbSet<CreditTransaction> CreditTransactions { get; set; }
    // ── Wallet Engine (Sprint 1) ────────────────────────────────────
    // One wallet per user. Holds the canonical spendable balance.
    public DbSet<Wallet> Wallets { get; set; }
    // Immutable, append-only audit log of every wallet balance change.
    public DbSet<WalletTransaction> WalletTransactions { get; set; }



    // Admin-defined credit plans available for purchase

    public DbSet<CreditPlan> CreditPlans { get; set; }



    // Records every credit-plan purchase by a user

    public DbSet<CreditPlanPurchase> CreditPlanPurchases { get; set; }



    // Pricing engine source of truth for platform service prices
    public DbSet<ServicePrice> ServicePrices { get; set; }
    public DbSet<PricingRule> PricingRules { get; set; }

    // Investment Opportunity Lifecycle foundation
    public DbSet<Project> Projects { get; set; }
    public DbSet<Opportunity> Opportunities { get; set; }
    public DbSet<OpportunityMedia> OpportunityMedia { get; set; }
    public DbSet<OpportunityDocument> OpportunityDocuments { get; set; }
    public DbSet<OpportunityEvent> OpportunityEvents { get; set; }
    public DbSet<OpportunityJoinRequest> OpportunityJoinRequests { get; set; }
    public DbSet<FundingDeclaration> FundingDeclarations { get; set; }
    public DbSet<FundingDeclarationLegAllocation> FundingDeclarationLegAllocations { get; set; }
    public DbSet<ParticipationObligationConfirmation> ParticipationObligationConfirmations { get; set; }
    public DbSet<LoanObligation> LoanObligations { get; set; }
    public DbSet<LoanRepaymentInstallment> LoanRepaymentInstallments { get; set; }
    public DbSet<LoanRepaymentDeclaration> LoanRepaymentDeclarations { get; set; }
    public DbSet<LoanRepaymentDeclarationInstallment> LoanRepaymentDeclarationInstallments { get; set; }
    public DbSet<LoanRepaymentAllocation> LoanRepaymentAllocations { get; set; }
    public DbSet<ProfitSharingObligation> ProfitSharingObligations { get; set; }
    public DbSet<ProfitSharingReportingPeriod> ProfitSharingReportingPeriods { get; set; }
    public DbSet<ProfitSharingPeriodDeclaration> ProfitSharingPeriodDeclarations { get; set; }
    public DbSet<ProfitSharingEntitlement> ProfitSharingEntitlements { get; set; }
    public DbSet<ProfitSharingDistributionDeclaration> ProfitSharingDistributionDeclarations { get; set; }
    public DbSet<ProfitSharingDistributionAllocation> ProfitSharingDistributionAllocations { get; set; }
    public DbSet<EquityPosition> EquityPositions { get; set; }
    public DbSet<EquityHoldingSnapshot> EquityHoldingSnapshots { get; set; }
    public DbSet<EquityHoldingLedgerEntry> EquityHoldingLedgerEntries { get; set; }
    public DbSet<EquityCorporateEvent> EquityCorporateEvents { get; set; }
    public DbSet<EquityCorporateEventPosition> EquityCorporateEventPositions { get; set; }
    public DbSet<EquityCapitalizationSnapshot> EquityCapitalizationSnapshots { get; set; }
    public DbSet<EquityCapitalizationSnapshotHolder> EquityCapitalizationSnapshotHolders { get; set; }
    public DbSet<EquityDividendDeclaration> EquityDividendDeclarations { get; set; }
    public DbSet<EquityDividendEntitlement> EquityDividendEntitlements { get; set; }
    public DbSet<EquityDividendDistributionDeclaration> EquityDividendDistributionDeclarations { get; set; }
    public DbSet<EquityDividendDistributionConfirmation> EquityDividendDistributionConfirmations { get; set; }
    public DbSet<EquityTransfer> EquityTransfers { get; set; }
    public DbSet<EquityClosureSnapshot> EquityClosureSnapshots { get; set; }
    public DbSet<ProjectRoomEntry> ProjectRoomEntries { get; set; }
    public DbSet<ProjectRoomDocument> ProjectRoomDocuments { get; set; }
    public DbSet<ExchangeRateSnapshot> ExchangeRateSnapshots { get; set; }
    public DbSet<Currency> Currencies { get; set; }
    public DbSet<Country> Countries { get; set; }
    public DbSet<InvestmentContract> InvestmentContracts { get; set; }
    public DbSet<InvestmentContractVersion> InvestmentContractVersions { get; set; }
    public DbSet<ContractEvent> ContractEvents { get; set; }
    public DbSet<OpportunityTag> OpportunityTags { get; set; }
    public DbSet<OpportunityTagAssignment> OpportunityTagAssignments { get; set; }
    public DbSet<FundingGoal> FundingGoals { get; set; }
    public DbSet<RiskLevel> RiskLevels { get; set; }
    public DbSet<FileCategory> FileCategories { get; set; }
    public DbSet<FileStoragePolicy> FileStoragePolicies { get; set; }
    public DbSet<StoredFile> StoredFiles { get; set; }



    // Records score/points transactions for users (e.g., reward points)

    public DbSet<ScoreTransaction> ScoreTransactions { get; set; }

    // Reputation rules for system and admin-defined reputation adjustments

    public DbSet<ReputationRule> ReputationRules { get; set; }

    // All reputation changes are stored in ReputationTransaction

    public DbSet<ReputationTransaction> ReputationTransactions { get; set; }

    public DbSet<Report> Reports { get; set; }


    // Investment requests between investors and founders

    public DbSet<InvestmentRequest> InvestmentRequests { get; set; }



    // Many-to-many join between Clients and ProjectCategories

    public DbSet<ClientProjectCategory> ClientProjectCategories { get; set; }



    // Firebase Cloud Messaging device tokens for push notifications (new keyword hides Identity's UserTokens)

    public new DbSet<UserToken> UserTokens { get; set; }

    // Multi-device push notification tokens (supports multiple devices per user)

    public DbSet<DeviceToken> DeviceTokens { get; set; }



    // Images associated with investments (gallery)

    public DbSet<InvestmentImage> InvestmentImages { get; set; }



    // In-app notification system

    public DbSet<NotificationTemplate> NotificationTemplates { get; set; }

    public DbSet<Notification> Notifications { get; set; }

    public DbSet<UserNotification> UserNotifications { get; set; }

    // Email outbox for async email delivery

    public DbSet<EmailOutbox> EmailOutbox { get; set; }

    public DbSet<EmailHistory> EmailHistory { get; set; }

    public DbSet<EmailPreference> EmailPreferences { get; set; }
    public DbSet<EmailVerificationOtp> EmailVerificationOtps { get; set; }

    // Analytics tracking entities

    public DbSet<InvestmentView> InvestmentViews { get; set; }

    public DbSet<InvestmentLearnMore> InvestmentLearnMores { get; set; }

    // Company operating finance. Deliberately separate from platform wallets and investments.
    public DbSet<FinanceAccount> FinanceAccounts { get; set; }
    public DbSet<Supplier> Suppliers { get; set; }
    public DbSet<IncomeCategory> IncomeCategories { get; set; }
    public DbSet<ExpenseCategory> ExpenseCategories { get; set; }
    public DbSet<FinanceTransaction> FinanceTransactions { get; set; }
    public DbSet<FinanceTransactionLine> FinanceTransactionLines { get; set; }
    public DbSet<FinanceAttachment> FinanceAttachments { get; set; }
    public DbSet<FinanceAuditEvent> FinanceAuditEvents { get; set; }
    public DbSet<FinanceReconciliation> FinanceReconciliations { get; set; }
    public DbSet<PaymentTransaction> PaymentTransactions { get; set; }
    public DbSet<PaymentAllocation> PaymentAllocations { get; set; }

    // Commercial Company Management counterparties. These are deliberately
    // separate from Clients, which belong to the FOPX participant domain.
    public DbSet<CompanyCustomer> CompanyCustomers { get; set; }
    public DbSet<CompanyCustomerContact> CompanyCustomerContacts { get; set; }
    public DbSet<CompanyCatalogItem> CompanyCatalogItems { get; set; }
    public DbSet<CompanySalesOpportunity> CompanySalesOpportunities { get; set; }
    public DbSet<CompanySalesOpportunityItem> CompanySalesOpportunityItems { get; set; }
    public DbSet<CompanyQuotation> CompanyQuotations { get; set; }
    public DbSet<CompanyQuotationLine> CompanyQuotationLines { get; set; }
    public DbSet<CompanyContract> CompanyContracts { get; set; }
    public DbSet<CompanyContractLine> CompanyContractLines { get; set; }



    protected override void OnModelCreating(ModelBuilder modelBuilder)

    {

        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<EmailVerificationOtp>(entity =>
        {
            entity.HasIndex(x => new { x.UserId, x.NormalizedEmail, x.Purpose });
            entity.Property(x => x.NormalizedEmail).IsRequired();
            entity.Property(x => x.OtpHash).IsRequired();
        });

        ConfigureCompanyFinance(modelBuilder);

        modelBuilder.Entity<CompanyCustomer>(customer =>
        {
            customer.HasKey(x => x.Id);
            customer.Property(x => x.CustomerCode).HasMaxLength(32).IsRequired();
            customer.Property(x => x.LegalName).HasMaxLength(200).IsRequired();
            customer.Property(x => x.DisplayName).HasMaxLength(200).IsRequired();
            customer.Property(x => x.Type).HasConversion<string>().HasMaxLength(24).IsRequired();
            customer.Property(x => x.Status).HasConversion<string>().HasMaxLength(24).IsRequired();
            customer.Property(x => x.CreatedAt).HasDefaultValueSql("GETDATE()");
            customer.Property(x => x.UpdatedAt).HasDefaultValueSql("GETDATE()");
            customer.HasIndex(x => x.CustomerCode).IsUnique();
            customer.HasIndex(x => x.CodeSequence).IsUnique();
            customer.HasIndex(x => x.TaxId).IsUnique().HasFilter("[TaxId] IS NOT NULL");
            customer.HasIndex(x => x.Status);
            customer.HasIndex(x => x.Type);
            customer.HasIndex(x => x.CreatedAt);
        });

        modelBuilder.Entity<CompanyCustomerContact>(contact =>
        {
            contact.HasKey(x => x.Id);
            contact.Property(x => x.Name).HasMaxLength(160).IsRequired();
            contact.Property(x => x.JobTitle).HasMaxLength(120);
            contact.Property(x => x.Email).HasMaxLength(160);
            contact.Property(x => x.Phone).HasMaxLength(40);
            contact.Property(x => x.CreatedAt).HasDefaultValueSql("GETDATE()");
            contact.Property(x => x.UpdatedAt).HasDefaultValueSql("GETDATE()");
            contact.HasIndex(x => x.CustomerId);
            contact.HasIndex(x => new { x.CustomerId, x.IsPrimary });
            contact.HasIndex(x => x.CustomerId).IsUnique().HasFilter("[IsPrimary] = 1 AND [IsActive] = 1");
            contact.HasOne(x => x.Customer).WithMany(x => x.Contacts).HasForeignKey(x => x.CustomerId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<CompanyCatalogItem>(item =>
        {
            item.HasKey(x => x.Id);
            item.Property(x => x.Code).HasMaxLength(32).IsRequired();
            item.Property(x => x.Name).HasMaxLength(200).IsRequired();
            item.Property(x => x.Description).HasMaxLength(1000);
            item.Property(x => x.Type).HasConversion<string>().HasMaxLength(32).IsRequired();
            item.Property(x => x.Status).HasConversion<string>().HasMaxLength(32).IsRequired();
            item.Property(x => x.WorkspaceKey).HasMaxLength(64);
            item.Property(x => x.DefaultUnit).HasMaxLength(32);
            item.Property(x => x.BasePrice).HasColumnType("decimal(18,2)");
            item.Property(x => x.Currency).HasMaxLength(3);
            item.Property(x => x.CreatedAt).HasDefaultValueSql("SYSUTCDATETIME()");
            item.Property(x => x.UpdatedAt).HasDefaultValueSql("SYSUTCDATETIME()");
            item.HasIndex(x => x.Code).IsUnique();
            item.HasIndex(x => x.CodeSequence).IsUnique();
            item.HasIndex(x => x.Type);
            item.HasIndex(x => x.Status);
            item.HasIndex(x => x.CreatedAt);
        });

        modelBuilder.Entity<CompanySalesOpportunity>(opportunity =>
        {
            opportunity.HasKey(x => x.Id);
            opportunity.Property(x => x.OpportunityCode).HasMaxLength(32).IsRequired();
            opportunity.Property(x => x.Title).HasMaxLength(200).IsRequired();
            opportunity.Property(x => x.Stage).HasConversion<string>().HasMaxLength(32).IsRequired();
            opportunity.Property(x => x.Status).HasConversion<string>().HasMaxLength(32).IsRequired();
            opportunity.Property(x => x.Source).HasConversion<string>().HasMaxLength(32);
            opportunity.Property(x => x.Currency).HasMaxLength(3);
            opportunity.Property(x => x.ExpectedValue).HasColumnType("decimal(18,2)");
            opportunity.Property(x => x.ExpectedCloseDate).HasColumnType("date");
            opportunity.Property(x => x.Description).HasMaxLength(4000);
            opportunity.Property(x => x.Notes).HasMaxLength(4000);
            opportunity.Property(x => x.LostReason).HasMaxLength(1000);
            opportunity.Property(x => x.CreatedAt).HasDefaultValueSql("SYSUTCDATETIME()");
            opportunity.Property(x => x.UpdatedAt).HasDefaultValueSql("SYSUTCDATETIME()");
            opportunity.HasIndex(x => x.OpportunityCode).IsUnique();
            opportunity.HasIndex(x => x.CodeSequence).IsUnique();
            opportunity.HasIndex(x => new { x.CustomerId, x.Status });
            opportunity.HasIndex(x => new { x.Status, x.Stage });
            opportunity.HasIndex(x => x.SalesOwnerUserId);
            opportunity.HasIndex(x => x.ExpectedCloseDate);
            opportunity.HasIndex(x => x.CreatedAt);
            opportunity.HasOne(x => x.Customer).WithMany().HasForeignKey(x => x.CustomerId).OnDelete(DeleteBehavior.Restrict);
            opportunity.HasOne(x => x.PrimaryContact).WithMany().HasForeignKey(x => x.PrimaryContactId).OnDelete(DeleteBehavior.Restrict);
            opportunity.HasOne(x => x.SalesOwnerUser).WithMany().HasForeignKey(x => x.SalesOwnerUserId).OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<CompanySalesOpportunityItem>(item =>
        {
            item.HasKey(x => x.Id);
            item.Property(x => x.Notes).HasMaxLength(500);
            item.HasIndex(x => new { x.SalesOpportunityId, x.CatalogItemId }).IsUnique();
            item.HasIndex(x => x.CatalogItemId);
            item.HasOne(x => x.SalesOpportunity).WithMany(x => x.InterestedItems).HasForeignKey(x => x.SalesOpportunityId).OnDelete(DeleteBehavior.Restrict);
            item.HasOne(x => x.CatalogItem).WithMany().HasForeignKey(x => x.CatalogItemId).OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<CompanyQuotation>(quotation =>
        {
            quotation.HasKey(x => x.Id);
            quotation.Property(x => x.QuotationNumber).HasMaxLength(32).IsRequired();
            quotation.Property(x => x.CustomerCodeSnapshot).HasMaxLength(32).IsRequired();
            quotation.Property(x => x.CustomerNameSnapshot).HasMaxLength(200).IsRequired();
            quotation.Property(x => x.ContactNameSnapshot).HasMaxLength(160);
            quotation.Property(x => x.ContactEmailSnapshot).HasMaxLength(160);
            quotation.Property(x => x.ContactPhoneSnapshot).HasMaxLength(40);
            quotation.Property(x => x.Status).HasConversion<string>().HasMaxLength(32).IsRequired();
            quotation.Property(x => x.IssueDate).HasColumnType("date");
            quotation.Property(x => x.ValidUntil).HasColumnType("date");
            quotation.Property(x => x.Currency).HasMaxLength(3).IsRequired();
            quotation.Property(x => x.Subtotal).HasColumnType("decimal(18,2)");
            quotation.Property(x => x.DiscountTotal).HasColumnType("decimal(18,2)");
            quotation.Property(x => x.TaxTotal).HasColumnType("decimal(18,2)");
            quotation.Property(x => x.GrandTotal).HasColumnType("decimal(18,2)");
            quotation.Property(x => x.PaymentTerms).HasMaxLength(4000);
            quotation.Property(x => x.CommercialTerms).HasMaxLength(4000);
            quotation.Property(x => x.Notes).HasMaxLength(4000);
            quotation.Property(x => x.RejectionReason).HasMaxLength(1000);
            quotation.Property(x => x.CreatedAt).HasDefaultValueSql("SYSUTCDATETIME()");
            quotation.Property(x => x.UpdatedAt).HasDefaultValueSql("SYSUTCDATETIME()");
            quotation.HasIndex(x => x.QuotationNumber).IsUnique();
            quotation.HasIndex(x => x.NumberSequence).IsUnique();
            quotation.HasIndex(x => x.CustomerId);
            quotation.HasIndex(x => x.SalesOpportunityId);
            quotation.HasIndex(x => x.Status);
            quotation.HasIndex(x => x.IssueDate);
            quotation.HasIndex(x => x.ValidUntil);
            quotation.HasIndex(x => x.CreatedAt);
            quotation.HasOne(x => x.Customer).WithMany().HasForeignKey(x => x.CustomerId).OnDelete(DeleteBehavior.Restrict);
            quotation.HasOne(x => x.SalesOpportunity).WithMany().HasForeignKey(x => x.SalesOpportunityId).OnDelete(DeleteBehavior.Restrict);
            quotation.HasOne(x => x.Contact).WithMany().HasForeignKey(x => x.ContactId).OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<CompanyQuotationLine>(line =>
        {
            line.HasKey(x => x.Id);
            line.Property(x => x.ItemCodeSnapshot).HasMaxLength(32);
            line.Property(x => x.ItemNameSnapshot).HasMaxLength(200).IsRequired();
            line.Property(x => x.Description).HasMaxLength(4000).IsRequired();
            line.Property(x => x.Unit).HasMaxLength(32).IsRequired();
            line.Property(x => x.Quantity).HasColumnType("decimal(18,4)");
            line.Property(x => x.UnitPrice).HasColumnType("decimal(18,2)");
            line.Property(x => x.DiscountType).HasConversion<string>().HasMaxLength(32).IsRequired();
            line.Property(x => x.DiscountValue).HasColumnType("decimal(18,4)");
            line.Property(x => x.DiscountAmount).HasColumnType("decimal(18,2)");
            line.Property(x => x.TaxRate).HasColumnType("decimal(5,2)");
            line.Property(x => x.TaxAmount).HasColumnType("decimal(18,2)");
            line.Property(x => x.LineSubtotal).HasColumnType("decimal(18,2)");
            line.Property(x => x.LineTotal).HasColumnType("decimal(18,2)");
            line.HasIndex(x => x.QuotationId);
            line.HasIndex(x => x.CatalogItemId);
            line.HasOne(x => x.Quotation).WithMany(x => x.Lines).HasForeignKey(x => x.QuotationId).OnDelete(DeleteBehavior.Cascade);
            line.HasOne(x => x.CatalogItem).WithMany().HasForeignKey(x => x.CatalogItemId).OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<CompanyContract>(contract =>
        {
            contract.HasKey(x => x.Id);
            contract.Property(x => x.ContractNumber).HasMaxLength(32).IsRequired();
            contract.Property(x => x.CustomerCodeSnapshot).HasMaxLength(32).IsRequired();
            contract.Property(x => x.CustomerNameSnapshot).HasMaxLength(200).IsRequired();
            contract.Property(x => x.CustomerLegalNameSnapshot).HasMaxLength(200);
            contract.Property(x => x.ContactNameSnapshot).HasMaxLength(160);
            contract.Property(x => x.ContactEmailSnapshot).HasMaxLength(160);
            contract.Property(x => x.ContactPhoneSnapshot).HasMaxLength(40);
            contract.Property(x => x.Status).HasConversion<string>().HasMaxLength(32).IsRequired();
            contract.Property(x => x.Currency).HasMaxLength(3).IsRequired();
            contract.Property(x => x.EffectiveDate).HasColumnType("date");
            contract.Property(x => x.StartDate).HasColumnType("date");
            contract.Property(x => x.EndDate).HasColumnType("date");
            contract.Property(x => x.SignedDate).HasColumnType("date");
            contract.Property(x => x.Subtotal).HasColumnType("decimal(18,2)");
            contract.Property(x => x.DiscountTotal).HasColumnType("decimal(18,2)");
            contract.Property(x => x.TaxTotal).HasColumnType("decimal(18,2)");
            contract.Property(x => x.GrandTotal).HasColumnType("decimal(18,2)");
            contract.Property(x => x.PaymentTerms).HasMaxLength(4000);
            contract.Property(x => x.CommercialTerms).HasMaxLength(4000);
            contract.Property(x => x.Notes).HasMaxLength(4000);
            contract.Property(x => x.TerminationReason).HasMaxLength(1000);
            contract.Property(x => x.CreatedAt).HasDefaultValueSql("SYSUTCDATETIME()");
            contract.Property(x => x.UpdatedAt).HasDefaultValueSql("SYSUTCDATETIME()");
            contract.HasIndex(x => x.ContractNumber).IsUnique();
            contract.HasIndex(x => x.NumberSequence).IsUnique();
            contract.HasIndex(x => x.SourceQuotationId).IsUnique();
            contract.HasIndex(x => x.CustomerId);
            contract.HasIndex(x => x.SalesOpportunityId);
            contract.HasIndex(x => x.Status);
            contract.HasIndex(x => x.EffectiveDate);
            contract.HasIndex(x => x.StartDate);
            contract.HasIndex(x => x.EndDate);
            contract.HasIndex(x => x.CreatedAt);
            contract.HasOne(x => x.Customer).WithMany().HasForeignKey(x => x.CustomerId).OnDelete(DeleteBehavior.Restrict);
            contract.HasOne(x => x.SourceQuotation).WithOne(x => x.Contract).HasForeignKey<CompanyContract>(x => x.SourceQuotationId).OnDelete(DeleteBehavior.Restrict);
            contract.HasOne(x => x.SalesOpportunity).WithMany().HasForeignKey(x => x.SalesOpportunityId).OnDelete(DeleteBehavior.Restrict);
            contract.HasOne(x => x.Contact).WithMany().HasForeignKey(x => x.ContactId).OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<CompanyContractLine>(line =>
        {
            line.HasKey(x => x.Id);
            line.Property(x => x.ItemCodeSnapshot).HasMaxLength(32);
            line.Property(x => x.ItemNameSnapshot).HasMaxLength(200).IsRequired();
            line.Property(x => x.Description).HasMaxLength(4000).IsRequired();
            line.Property(x => x.Unit).HasMaxLength(32).IsRequired();
            line.Property(x => x.Quantity).HasColumnType("decimal(18,4)");
            line.Property(x => x.UnitPrice).HasColumnType("decimal(18,2)");
            line.Property(x => x.DiscountType).HasConversion<string>().HasMaxLength(32).IsRequired();
            line.Property(x => x.DiscountValue).HasColumnType("decimal(18,4)");
            line.Property(x => x.DiscountAmount).HasColumnType("decimal(18,2)");
            line.Property(x => x.TaxRate).HasColumnType("decimal(5,2)");
            line.Property(x => x.TaxAmount).HasColumnType("decimal(18,2)");
            line.Property(x => x.LineSubtotal).HasColumnType("decimal(18,2)");
            line.Property(x => x.LineTotal).HasColumnType("decimal(18,2)");
            line.HasIndex(x => x.ContractId);
            line.HasIndex(x => x.SourceQuotationLineId);
            line.HasIndex(x => x.CatalogItemId);
            line.HasOne(x => x.Contract).WithMany(x => x.Lines).HasForeignKey(x => x.ContractId).OnDelete(DeleteBehavior.Cascade);
            line.HasOne(x => x.SourceQuotationLine).WithMany().HasForeignKey(x => x.SourceQuotationLineId).OnDelete(DeleteBehavior.Restrict);
            line.HasOne(x => x.CatalogItem).WithMany().HasForeignKey(x => x.CatalogItemId).OnDelete(DeleteBehavior.Restrict);
        });



        // Configure decimal precision

        // (WalletBalance precision is configured in AuthUser entity mapping below)



        modelBuilder.Entity<Investment>()

            .Property(i => i.InitialCapital)

            .HasPrecision(18, 2);



        // Configure new Investment equity crowdfunding fields

        modelBuilder.Entity<Investment>()

            .Property(i => i.SharePrice)

            .HasPrecision(18, 2);



        modelBuilder.Entity<Investment>()

            .Property(i => i.MinInvestment)

            .HasPrecision(18, 2);



        modelBuilder.Entity<Investment>()

            .Property(i => i.MaxInvestment)

            .HasPrecision(18, 2);



        modelBuilder.Entity<Investment>()

            .Property(i => i.ValuationCap)

            .HasPrecision(18, 2);



        modelBuilder.Entity<Investment>()

            .Property(i => i.ExpectedROI)

            .HasPrecision(5, 2);



        modelBuilder.Entity<Investment>()

            .Property(i => i.Status)

            .HasDefaultValue("Draft");



        // Configure Investment navigation properties

        modelBuilder.Entity<Investment>()

            .HasOne(i => i.Founder)

            .WithMany(u => u.Investments)

            .HasForeignKey(i => i.FounderId)

            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Investment>()
            .HasOne<ProjectCategory>()
            .WithMany()
            .HasForeignKey(i => i.ProjectCategoryId)
            .OnDelete(DeleteBehavior.Restrict)
            .IsRequired(false);



        modelBuilder.Entity<Investment>()

            .HasOne(i => i.Opportunity)

            .WithMany()

            .HasForeignKey(i => i.OpportunityId)

            .OnDelete(DeleteBehavior.SetNull);



        modelBuilder.Entity<Investment>()

            .HasIndex(i => i.OpportunityId);



        modelBuilder.Entity<Investment>()

            .HasMany(i => i.Participants)

            .WithOne(p => p.Investment)

            .HasForeignKey(p => p.InvestmentId)

            .OnDelete(DeleteBehavior.Cascade);



        // Configure InvestmentParticipant entity

        modelBuilder.Entity<InvestmentParticipant>()

            .Property(p => p.AmountInvested)

            .HasPrecision(18, 2);



        modelBuilder.Entity<InvestmentParticipant>()

            .Property(p => p.Status)

            .HasDefaultValue(ParticipationLifecycle.Interested);



        modelBuilder.Entity<InvestmentParticipant>()

            .Property(p => p.CreatedAt)

            .HasDefaultValueSql("GETDATE()");



        modelBuilder.Entity<InvestmentParticipant>()

            .Property(p => p.InvestmentDate)

            .HasDefaultValueSql("GETDATE()");



        modelBuilder.Entity<InvestmentParticipant>()

            .HasOne(p => p.Investor)

            .WithMany()

            .HasForeignKey(p => p.InvestorId)

            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<PricingRule>(entity =>
        {
            entity.Property(p => p.Action).HasConversion<string>().HasMaxLength(100);
            entity.Property(p => p.ActionCode).HasMaxLength(100).IsRequired();
            entity.Property(p => p.DisplayName).HasMaxLength(200).IsRequired();
            entity.Property(p => p.Description).HasMaxLength(500);
            entity.Property(p => p.CreditCost).HasPrecision(18, 2);
            entity.Property(p => p.CreatedAt).HasDefaultValueSql("GETDATE()");
            entity.Property(p => p.UpdatedAt).HasDefaultValueSql("GETDATE()");
            entity.HasIndex(p => p.ActionCode).IsUnique();

            var seedDate = new DateTime(2026, 7, 9, 0, 0, 0, DateTimeKind.Utc);
            entity.HasData(
                new PricingRule { Id = 1, Action = PricingAction.SendConversationRequest, ActionCode = nameof(PricingAction.SendConversationRequest), DisplayName = "Send Conversation Request", Description = "Fixed CREDIT fee to send a negotiation conversation request.", CreditCost = 5m, IsActive = true, CreatedAt = seedDate, UpdatedAt = seedDate },
                new PricingRule { Id = 2, Action = PricingAction.SendFirstOffer, ActionCode = nameof(PricingAction.SendFirstOffer), DisplayName = "Send First Offer", Description = "Fixed CREDIT fee to send the first negotiation offer.", CreditCost = 5m, IsActive = true, CreatedAt = seedDate, UpdatedAt = seedDate },
                new PricingRule { Id = 3, Action = PricingAction.SendOfferReplacement, ActionCode = nameof(PricingAction.SendOfferReplacement), DisplayName = "Send Offer Replacement", Description = "Fixed CREDIT fee to send a full replacement offer.", CreditCost = 2m, IsActive = true, CreatedAt = seedDate, UpdatedAt = seedDate },
                new PricingRule { Id = 4, Action = PricingAction.SubmitParticipationRequest, ActionCode = nameof(PricingAction.SubmitParticipationRequest), DisplayName = "Submit Participation Request", Description = "Fixed CREDIT fee to submit an opportunity participation request.", CreditCost = 10m, IsActive = true, CreatedAt = seedDate, UpdatedAt = seedDate },
                new PricingRule { Id = 5, Action = PricingAction.PublishOpportunity, ActionCode = nameof(PricingAction.PublishOpportunity), DisplayName = "Publish Opportunity", Description = "Fixed CREDIT fee to publish an opportunity.", CreditCost = 15m, IsActive = true, CreatedAt = seedDate, UpdatedAt = seedDate });
        });



        // Investment team member configuration

        // Team members must be registered users (Founder or Both ClientType)

        modelBuilder.Entity<InvestmentTeamMember>(tm =>

        {

            tm.HasKey(x => x.Id);

            tm.Property(x => x.Role).HasMaxLength(100).IsRequired();

            tm.Property(x => x.IsActive).HasDefaultValue(true);

            tm.Property(x => x.CreatedAt).HasDefaultValueSql("GETDATE()");



            tm.HasIndex(x => x.InvestmentId);

            tm.HasIndex(x => x.UserId);

            tm.HasIndex(x => new { x.InvestmentId, x.SortOrder });

            // Ensure one user can only be added once per investment

            tm.HasIndex(x => new { x.InvestmentId, x.UserId }).IsUnique();



            tm.HasOne(x => x.Investment)

                .WithMany(i => i.TeamMembers)

                .HasForeignKey(x => x.InvestmentId)

                .OnDelete(DeleteBehavior.Cascade);



            // UserId is required - team members must be registered users

            tm.HasOne(x => x.User)

                .WithMany()

                .HasForeignKey(x => x.UserId)

                .OnDelete(DeleteBehavior.Restrict)

                .IsRequired();

        });



        // Investment event store mapping (append-only audit for investments)

        modelBuilder.Entity<InvestmentEvent>(ev =>

        {

            ev.HasKey(x => x.Id);

            ev.Property(x => x.EventType).HasMaxLength(100).IsRequired();

            ev.Property(x => x.Payload).HasColumnType("nvarchar(max)").IsRequired(false);

            ev.Property(x => x.Metadata).HasColumnType("nvarchar(max)").IsRequired(false);

            ev.Property(x => x.OccurredAt).HasDefaultValueSql("SYSUTCDATETIME()");

            ev.HasIndex(x => x.InvestmentId);

            ev.HasIndex(x => new { x.InvestmentId, x.Version }).IsUnique();

            ev.HasIndex(x => new { x.InvestmentId, x.OccurredAt });

            ev.HasOne(x => x.Investment).WithMany().HasForeignKey(x => x.InvestmentId).OnDelete(DeleteBehavior.Cascade);

        });



        // Investment images mapping (gallery)

        modelBuilder.Entity<InvestmentImage>(img =>

        {

            img.HasKey(x => x.Id);

            img.Property(x => x.Url).HasMaxLength(500).IsRequired();

            img.Property(x => x.Caption).HasMaxLength(250).IsRequired(false);

            img.Property(x => x.SortOrder).HasDefaultValue(0);

            img.Property(x => x.IsPrimary).HasDefaultValue(false);

            img.Property(x => x.CreatedAt).HasDefaultValueSql("GETDATE()");



            img.HasIndex(x => x.InvestmentId);

            img.HasOne(x => x.Investment)

               .WithMany(i => i.Images)

               .HasForeignKey(x => x.InvestmentId)

               .OnDelete(DeleteBehavior.Cascade);

        });



        // Investment favorites/watchlist mapping

        modelBuilder.Entity<InvestmentFavorite>(fav =>

        {

            fav.HasKey(x => x.Id);

            fav.Property(x => x.CreatedAt).HasDefaultValueSql("SYSUTCDATETIME()");

            fav.HasIndex(x => new { x.InvestorId, x.InvestmentId }).IsUnique();

            fav.HasIndex(x => x.InvestmentId);

            fav.HasIndex(x => new { x.InvestorId, x.OpportunityId })
               .IsUnique()
               .HasFilter("[OpportunityId] IS NOT NULL");

            fav.HasIndex(x => x.OpportunityId);

            fav.HasOne(x => x.Investor)

               .WithMany()

               .HasForeignKey(x => x.InvestorId)

               .OnDelete(DeleteBehavior.Cascade);

            fav.HasOne(x => x.Opportunity)

               .WithMany()

               .HasForeignKey(x => x.OpportunityId)

               .OnDelete(DeleteBehavior.NoAction);

            fav.HasOne(x => x.Investment)

               .WithMany()

               .HasForeignKey(x => x.InvestmentId)

               .OnDelete(DeleteBehavior.Cascade);

        });



        // Investment views tracking for analytics

        modelBuilder.Entity<InvestmentView>(iv =>

        {

            iv.HasKey(x => x.Id);

            iv.Property(x => x.ViewedAt).HasDefaultValueSql("GETUTCDATE()");

            iv.HasIndex(x => x.InvestmentId);

            iv.HasIndex(x => x.ViewedAt);

            iv.HasIndex(x => x.UserId);

            iv.HasOne(x => x.Investment)

               .WithMany()

               .HasForeignKey(x => x.InvestmentId)

               .OnDelete(DeleteBehavior.Cascade);

        });



        // Investment learn more tracking for analytics

        modelBuilder.Entity<InvestmentLearnMore>(ilm =>

        {

            ilm.HasKey(x => x.Id);

            ilm.Property(x => x.OpenedAt).HasDefaultValueSql("GETUTCDATE()");

            ilm.HasIndex(x => x.InvestmentId);

            ilm.HasIndex(x => x.OpenedAt);

            ilm.HasIndex(x => x.UserId);

            ilm.HasOne(x => x.Investment)

               .WithMany()

               .HasForeignKey(x => x.InvestmentId)

               .OnDelete(DeleteBehavior.Cascade);

        });



        // Notification templates (admin-configurable)

        modelBuilder.Entity<NotificationTemplate>(nt =>

        {

            nt.HasKey(x => x.Id);

            nt.Property(x => x.Key).HasMaxLength(100).IsRequired();

            nt.Property(x => x.Name).HasMaxLength(200).IsRequired();

            nt.Property(x => x.TitleTemplate).HasMaxLength(500).IsRequired();

            nt.Property(x => x.BodyTemplate).HasMaxLength(2000).IsRequired();

            nt.Property(x => x.Type).HasMaxLength(20).IsRequired().HasDefaultValue("info");

            nt.Property(x => x.Icon).HasMaxLength(100);

            nt.Property(x => x.Category).HasMaxLength(100);

            nt.Property(x => x.PlaceholderDocs).HasMaxLength(500);

            nt.Property(x => x.CreatedByUserId).HasMaxLength(450);

            nt.Property(x => x.CreatedAt).HasDefaultValueSql("SYSUTCDATETIME()");

            nt.Property(x => x.UpdatedAt).HasDefaultValueSql("SYSUTCDATETIME()");

            nt.HasIndex(x => x.Key).IsUnique();

            nt.HasIndex(x => x.Category);

            nt.HasIndex(x => x.IsActive);

        });



        // Notification Center broadcasts

        modelBuilder.Entity<Notification>(n =>

        {

            n.HasKey(x => x.Id);

            n.Property(x => x.Title).HasMaxLength(500).IsRequired();

            n.Property(x => x.Body).HasMaxLength(2000).IsRequired();

            n.Property(x => x.Type).HasMaxLength(20).IsRequired().HasDefaultValue("info");

            n.Property(x => x.Icon).HasMaxLength(100);

            n.Property(x => x.ActionUrl).HasMaxLength(500);

            n.Property(x => x.Audience).HasConversion<string>().HasMaxLength(30).IsRequired();

            n.Property(x => x.CreatedAt).HasDefaultValueSql("SYSUTCDATETIME()");

            n.HasIndex(x => x.CreatedAt);

            n.HasIndex(x => x.Audience);

        });



        // Per-user in-app notifications

        modelBuilder.Entity<UserNotification>(un =>

        {

            un.HasKey(x => x.Id);

            un.Property(x => x.UserId).HasMaxLength(450).IsRequired();

            un.Property(x => x.NotificationId).IsRequired(false);

            un.Property(x => x.Title).HasMaxLength(500).IsRequired();

            un.Property(x => x.Body).HasMaxLength(2000).IsRequired();

            un.Property(x => x.Type).HasMaxLength(20).IsRequired().HasDefaultValue("info");

            un.Property(x => x.Icon).HasMaxLength(100);

            un.Property(x => x.ActionUrl).HasMaxLength(500);
            un.Property(x => x.EventType).HasMaxLength(100);
            un.Property(x => x.RelatedEntityId).HasMaxLength(100);
            un.Property(x => x.IdempotencyKey).HasMaxLength(300);

            un.Property(x => x.IsRead).HasDefaultValue(false);

            un.Property(x => x.CreatedAt).HasDefaultValueSql("SYSUTCDATETIME()");

            un.HasIndex(x => x.UserId);

            un.HasIndex(x => x.NotificationId);

            un.HasIndex(x => new { x.UserId, x.CreatedAt });

            un.HasIndex(x => new { x.UserId, x.IsRead });
            un.HasIndex(x => x.IdempotencyKey)
              .IsUnique()
              .HasFilter("[IdempotencyKey] IS NOT NULL");

            un.HasOne(x => x.Template)

              .WithMany()

              .HasForeignKey(x => x.TemplateId)

              .OnDelete(DeleteBehavior.SetNull)

              .IsRequired(false);

            un.HasOne(x => x.Notification)

              .WithMany(x => x.UserNotifications)

              .HasForeignKey(x => x.NotificationId)

              .OnDelete(DeleteBehavior.Cascade)

              .IsRequired(false);

        });

        // Multi-device push notification tokens
        modelBuilder.Entity<DeviceToken>(dt =>
        {
            dt.HasKey(x => x.Id);
            dt.Property(x => x.UserId).HasMaxLength(450).IsRequired();
            dt.Property(x => x.Token).HasMaxLength(500).IsRequired();
            dt.Property(x => x.DeviceId).HasMaxLength(200);
            dt.Property(x => x.Browser).HasMaxLength(100);
            dt.Property(x => x.Platform).HasMaxLength(50);
            dt.Property(x => x.IsActive).HasDefaultValue(true);
            dt.Property(x => x.CreatedAt).HasDefaultValueSql("SYSUTCDATETIME()");
            dt.Property(x => x.UpdatedAt).HasDefaultValueSql("SYSUTCDATETIME()");
            dt.HasIndex(x => new { x.Token, x.UserId }).IsUnique();
            dt.HasIndex(x => x.UserId);
            dt.HasIndex(x => x.IsActive);
        });



        modelBuilder.Entity<Transaction>()

            .Property(t => t.Amount)

            .HasPrecision(18, 2);



        // Seed ClientStatus lookup (ar/en)

        modelBuilder.Entity<ClientStatus>().HasData(

            new ClientStatus { Id = 1, NameEn = "Active", NameAr = "نشط" },

            new ClientStatus { Id = 2, NameEn = "Diactive", NameAr = "غير نشط" },

            new ClientStatus { Id = 3, NameEn = "Suspended", NameAr = "معلق" }

        );



            // CreditTransaction configuration for credibility score audit trail

            modelBuilder.Entity<CreditTransaction>(ctb =>

            {

                ctb.HasKey(c => c.Id);

                ctb.Property(c => c.Amount).HasPrecision(18, 2).IsRequired();

                ctb.Property(c => c.JustificationAr).HasMaxLength(500).IsRequired();

                ctb.Property(c => c.JustificationEn).HasMaxLength(500).IsRequired();

                ctb.Property(c => c.CreatedAt).HasDefaultValueSql("GETDATE()").IsRequired();



                // Relationship to AuthUser (whose score is affected)

                ctb.HasOne(c => c.User)

                         .WithMany(u => u.CreditTransactions)

                   .HasForeignKey(c => c.UserId)

                   .OnDelete(DeleteBehavior.Restrict);



                // Relationship to Admin AuthUser (who triggered the transaction, if manual)

                ctb.HasOne(c => c.Admin)

                   .WithMany()

                   .HasForeignKey(c => c.AdminId)

                   .OnDelete(DeleteBehavior.Restrict)

                   .IsRequired(false);

            });



            // ScoreTransaction mapping

            modelBuilder.Entity<ScoreTransaction>(st =>

            {

                st.HasKey(s => s.Id);

                st.Property(s => s.Score).HasColumnType("numeric(5,2)");

                st.Property(s => s.CreatedAt).HasDefaultValueSql("GETDATE()");



                st.HasOne(s => s.User)

                  .WithMany(u => u.ScoreTransactions)

                  .HasForeignKey(s => s.UserId)

                  .OnDelete(DeleteBehavior.Restrict);



                st.HasOne(s => s.TransactionType)

                  .WithMany()

                  .HasForeignKey(s => s.TransactionTypeId)

                  .OnDelete(DeleteBehavior.Restrict);

            });

            // ReputationRule mapping
            modelBuilder.Entity<ReputationRule>(rr =>
            {
                rr.HasKey(r => r.Id);
                rr.Property(r => r.RuleCode).HasMaxLength(50).IsRequired();
                rr.Property(r => r.ActivityCode).HasMaxLength(100);
                rr.Property(r => r.Description).HasMaxLength(200).IsRequired();
                rr.Property(r => r.Points).IsRequired();
                rr.Property(r => r.RoleScope).HasMaxLength(50).HasDefaultValue("Any").IsRequired();
                rr.Property(r => r.IsActive).HasDefaultValue(true);
                rr.Property(r => r.IsEnabled).HasDefaultValue(true);
                rr.Property(r => r.IsSystem).HasDefaultValue(true);
                rr.Property(r => r.IsAutomatic).HasDefaultValue(true);
                rr.Property(r => r.CanRepeat).HasDefaultValue(false);
                rr.Property(r => r.MaximumOccurrences).HasDefaultValue(1);
                rr.Property(r => r.CreatedAt).HasDefaultValueSql("GETDATE()");
                rr.Property(r => r.UpdatedAt).HasDefaultValueSql("GETDATE()");
                rr.HasIndex(r => r.RuleCode).IsUnique();
                rr.HasIndex(r => r.ActivityCode)
                    .IsUnique()
                    .HasFilter("[ActivityCode] IS NOT NULL");
                rr.HasOne(r => r.CreatedBy)
                    .WithMany()
                    .HasForeignKey(r => r.CreatedByUserId)
                    .OnDelete(DeleteBehavior.SetNull);
            });

            // ReputationTransaction mapping
            modelBuilder.Entity<ReputationTransaction>(rt =>
            {
                rt.HasKey(t => t.Id);
                rt.Property(t => t.ActivityCode).HasMaxLength(100).IsRequired();
                rt.Property(t => t.Points).IsRequired();
                rt.Property(t => t.ReferenceId).HasMaxLength(100);
                rt.Property(t => t.ReferenceType).HasMaxLength(100);
                rt.Property(t => t.OccurredAt).HasDefaultValueSql("GETDATE()");
                rt.Property(t => t.CreatedAt).HasDefaultValueSql("GETDATE()");
                rt.HasIndex(t => new { t.UserId, t.ActivityCode, t.ReferenceType, t.ReferenceId })
                    .IsUnique()
                    .HasFilter("[ReferenceType] IS NOT NULL AND [ReferenceId] IS NOT NULL");
                rt.HasOne(t => t.User)
                    .WithMany()
                    .HasForeignKey(t => t.UserId)
                    .OnDelete(DeleteBehavior.Restrict);
                rt.HasOne(t => t.Rule)
                    .WithMany()
                    .HasForeignKey(t => t.ReputationRuleId)
                    .OnDelete(DeleteBehavior.Restrict);
                rt.HasOne(t => t.CreatedBy)
                    .WithMany()
                    .HasForeignKey(t => t.CreatedByUserId)
                    .OnDelete(DeleteBehavior.SetNull);
            });

            modelBuilder.Entity<Report>(r =>
            {
                r.HasKey(x => x.Id);
                r.Property(x => x.TargetType).HasConversion<string>().HasMaxLength(40).IsRequired();
                r.Property(x => x.TargetId).HasMaxLength(100).IsRequired();
                r.Property(x => x.ReasonCode).HasConversion<string>().HasMaxLength(60).IsRequired();
                r.Property(x => x.Description).HasMaxLength(2000);
                r.Property(x => x.Status).HasConversion<string>().HasMaxLength(40).HasDefaultValue(ReportStatus.Pending).IsRequired();
                r.Property(x => x.ResolutionNote).HasMaxLength(2000);
                r.Property(x => x.CreatedAt).HasDefaultValueSql("GETDATE()");
                r.HasOne(x => x.ReporterUser)
                    .WithMany()
                    .HasForeignKey(x => x.ReporterUserId)
                    .OnDelete(DeleteBehavior.Restrict);
                r.HasOne(x => x.ReviewedByUser)
                    .WithMany()
                    .HasForeignKey(x => x.ReviewedByUserId)
                    .OnDelete(DeleteBehavior.SetNull);
                r.HasIndex(x => new { x.ReporterUserId, x.TargetType, x.TargetId, x.Status });
                r.HasIndex(x => new { x.Status, x.CreatedAt });
                r.HasIndex(x => new { x.ReporterUserId, x.TargetType, x.TargetId })
                    .IsUnique()
                    .HasFilter("[Status] = 'Pending'");
            });

        // Configure User entity

        // (ApplicationUsers table removed - User entity merged into AuthUsers)



        // Configure UserProfile entity - One-to-One relationship with AuthUser

        modelBuilder.Entity<UserProfile>()

            .HasOne(up => up.AuthUser)

            .WithOne(u => u.Profile)

            .HasForeignKey<UserProfile>(up => up.UserId)

            .OnDelete(DeleteBehavior.Cascade);



        // Configure VerificationStatus enum

        modelBuilder.Entity<UserProfile>()

            .Property(up => up.VerificationStatus)

            .HasConversion<int>();

modelBuilder.Entity<UserProfile>()
            .Property(up => up.PreferredCurrency)
            .HasMaxLength(3)
            .IsRequired()
            .HasDefaultValue(CurrencyMasterDefaults.DefaultCurrency);



        // Configure CurrentCredibilityScore with default value

        modelBuilder.Entity<UserProfile>()

            .Property(up => up.CurrentCredibilityScore)

            .HasPrecision(18, 2)

            .HasDefaultValue(0);



        // Configure UserProfile timestamps

        modelBuilder.Entity<UserProfile>()

            .Property(up => up.CreatedAt)

            .HasDefaultValueSql("GETDATE()");



        modelBuilder.Entity<UserProfile>()

            .Property(up => up.UpdatedAt)

            .HasDefaultValueSql("GETDATE()");



        // AuthUser mapping — master user table (replaces ApplicationUsers + Employees)

        modelBuilder.Entity<AuthUser>(eb =>

        {

            eb.HasKey(a => a.Id);

            eb.Property(a => a.Name).HasMaxLength(100).IsRequired();

            eb.Property(a => a.Email).HasMaxLength(256);

            eb.Property(a => a.PasswordHash).HasMaxLength(512).IsRequired();

            eb.Property(a => a.UserType).HasConversion<string>().HasMaxLength(20).IsRequired();

            eb.Property(a => a.ClientType).HasConversion<int>().HasDefaultValue(ClientType.Investor);

            eb.Property(a => a.Status).HasDefaultValue(true);

            eb.Property(a => a.FirebaseUid).HasMaxLength(128).IsRequired(false);

            eb.Property(a => a.SuspendedUntil).HasColumnType("datetime2").IsRequired(false);

            eb.Property(a => a.CreatedAt).HasDefaultValueSql("GETDATE()");

            eb.Property(a => a.WalletBalance).HasPrecision(18, 2).HasDefaultValue(0m);

            eb.Property(a => a.CredibilityScore).HasDefaultValue(0);

            eb.Property(a => a.ReputationLevel).HasMaxLength(80).IsRequired();

            eb.HasIndex(a => a.Email).IsUnique().HasFilter("\"Email\" IS NOT NULL");
            eb.HasIndex(a => a.FirebaseUid).IsUnique(false).HasFilter("\"FirebaseUid\" IS NOT NULL");
        });
        // ── Wallet Engine mapping (Sprint 1) ─────────────────────────
        // One AuthUser has exactly one Wallet (1:1, unique FK).
        // Wallet owns many immutable WalletTransaction rows (1:N, cascade delete).
        modelBuilder.Entity<Wallet>(w =>
        {
            w.HasKey(x => x.Id);
            w.Property(x => x.CurrentBalance).HasPrecision(18, 2).HasDefaultValue(0m);
            w.Property(x => x.TotalPurchasedCredits).HasPrecision(18, 2).HasDefaultValue(0m);
            w.Property(x => x.TotalBonusCredits).HasPrecision(18, 2).HasDefaultValue(0m);
            w.Property(x => x.TotalRefundCredits).HasPrecision(18, 2).HasDefaultValue(0m);
            w.Property(x => x.CreatedAt).HasDefaultValueSql("GETDATE()");
            w.Property(x => x.UpdatedAt).HasDefaultValueSql("GETDATE()");
            w.HasIndex(x => x.UserId).IsUnique();
            w.HasOne(x => x.User)
             .WithOne(u => u.Wallet)
             .HasForeignKey<Wallet>(x => x.UserId)
             .OnDelete(DeleteBehavior.Cascade);
            w.HasMany(x => x.Transactions)
             .WithOne(t => t.Wallet)
             .HasForeignKey(t => t.WalletId)
             .OnDelete(DeleteBehavior.Cascade);
        });
        // Immutable transaction log. No update / delete paths are exposed.
        modelBuilder.Entity<WalletTransaction>(t =>
        {
            t.HasKey(x => x.Id);
            t.Property(x => x.CreditAmount).HasPrecision(18, 2).IsRequired();
            t.Property(x => x.BalanceBefore).HasPrecision(18, 2).IsRequired();
            t.Property(x => x.BalanceAfter).HasPrecision(18, 2).IsRequired();
            t.Property(x => x.Direction).HasConversion<string>().HasMaxLength(10).IsRequired();
            t.Property(x => x.Reason).HasConversion<string>().HasMaxLength(40).IsRequired();
            t.Property(x => x.ActionCode).HasMaxLength(100);
            t.Property(x => x.ReferenceType).HasConversion<string>().HasMaxLength(40).HasDefaultValue(ReferenceType.None);
            t.Property(x => x.ReferenceId).HasMaxLength(100);
            t.Property(x => x.Description).HasMaxLength(500);
            t.Property(x => x.CreatedAt).HasDefaultValueSql("GETDATE()");
            t.HasIndex(x => x.WalletId);
            t.HasIndex(x => new { x.WalletId, x.CreatedAt });
            t.HasIndex(x => x.ReferenceId);
            t.HasIndex(x => x.ExchangeRateSnapshotId);
            t.HasOne(x => x.ExchangeRateSnapshot).WithMany().HasForeignKey(x => x.ExchangeRateSnapshotId).OnDelete(DeleteBehavior.Restrict);
            t.HasIndex(x => new { x.WalletId, x.ActionCode, x.ReferenceType, x.ReferenceId })
                .IsUnique()
                .HasFilter("[ActionCode] IS NOT NULL AND [ReferenceId] IS NOT NULL");
        });
        // Pricing Engine mapping (Sprint 2)
        modelBuilder.Entity<ServicePrice>(sp =>
        {
            sp.HasKey(x => x.Id);
            sp.Property(x => x.ServiceCode).HasMaxLength(100).IsRequired();
            sp.Property(x => x.ServiceName).HasMaxLength(200).IsRequired();
            sp.Property(x => x.Description).HasMaxLength(500);
            sp.Property(x => x.Price).HasPrecision(18, 2).IsRequired();
            sp.Property(x => x.Currency).HasMaxLength(10).IsRequired();
            sp.Property(x => x.IsActive).HasDefaultValue(true);
            sp.Property(x => x.CreatedAt).HasDefaultValueSql("GETDATE()");
            sp.Property(x => x.UpdatedAt).HasDefaultValueSql("GETDATE()");
            sp.HasIndex(x => x.ServiceCode).IsUnique();
        });

        // Durable Project foundation. Opportunity remains the public/funding
        // aggregate in Phase 1 and is linked as a required child.
        modelBuilder.Entity<Project>(p =>
        {
            p.HasKey(x => x.Id);
            p.Property(x => x.FounderId).IsRequired();
            p.Property(x => x.DefaultCurrency).HasMaxLength(3).IsRequired().HasDefaultValue(CurrencyMasterDefaults.DefaultCurrency);
            p.Property(x => x.DisplayName).HasMaxLength(200).IsRequired();
            p.Property(x => x.LegalName).HasMaxLength(250);
            p.Property(x => x.Slug).HasMaxLength(220).IsRequired();
            p.Property(x => x.Summary).HasMaxLength(500).IsRequired();
            p.Property(x => x.Description).HasMaxLength(4000).IsRequired();
            p.Property(x => x.Industry).HasMaxLength(150);
            p.Property(x => x.ProjectStage).HasConversion<string>().HasMaxLength(40).IsRequired();
            p.Property(x => x.Geography).HasMaxLength(200);
            p.Property(x => x.TagsSnapshotJson).HasColumnType("nvarchar(max)").HasDefaultValue("[]").IsRequired();
            p.Property(x => x.WebsiteUrl).HasMaxLength(500);
            p.Property(x => x.LogoUrl).HasMaxLength(1000);
            p.Property(x => x.TeamDescription).HasMaxLength(2000);
            p.Property(x => x.BusinessModel).HasMaxLength(2000);
            // RiskLevel stores the normalized immutable RiskLevel master Code.
            p.Property(x => x.RiskLevel).HasMaxLength(80);
            p.Property(x => x.RiskDisclosure).HasMaxLength(4000);
            p.Property(x => x.Status).HasConversion<string>().HasMaxLength(30).IsRequired();
            p.Property(x => x.ArchiveReason).HasMaxLength(1000);
            p.Property(x => x.CreatedAt).HasDefaultValueSql("SYSUTCDATETIME()");
            p.Property(x => x.UpdatedAt).HasDefaultValueSql("SYSUTCDATETIME()");
            p.Property(x => x.RowVersion).IsRowVersion();
            p.HasAlternateKey(x => new { x.Id, x.FounderId });
            p.HasIndex(x => x.FounderId);
            p.HasIndex(x => x.CategoryId);
            p.HasIndex(x => x.Slug).IsUnique();
            p.HasOne(x => x.Founder)
             .WithMany()
             .HasForeignKey(x => x.FounderId)
             .OnDelete(DeleteBehavior.Restrict);
            p.HasOne(x => x.Category)
             .WithMany()
             .HasForeignKey(x => x.CategoryId)
             .OnDelete(DeleteBehavior.Restrict)
             .IsRequired(false);
            p.HasMany(x => x.Opportunities)
             .WithOne(x => x.Project)
             .HasForeignKey(x => new { x.ProjectId, x.FounderId })
             .HasPrincipalKey(x => new { x.Id, x.FounderId })
             .OnDelete(DeleteBehavior.Restrict);
        });

        // Investment Opportunity Lifecycle foundation mapping
        modelBuilder.Entity<Opportunity>(o =>
        {
            o.HasKey(x => x.Id);
            o.Property(x => x.ProjectId).IsRequired();
            o.Property(x => x.SequenceNumber).IsRequired();
            o.Property(x => x.Type).HasMaxLength(80).IsRequired().HasDefaultValue("Opportunity");
            o.Property(x => x.FounderId).IsRequired();
            o.Property(x => x.Title).HasMaxLength(200).IsRequired();
            o.Property(x => x.Description).HasMaxLength(4000);
            o.Property(x => x.ShortDescription).HasMaxLength(300).IsRequired().HasDefaultValue("");
            o.Property(x => x.UseOfFunds).HasMaxLength(2000).IsRequired().HasDefaultValue("");
            o.Property(x => x.FundingTarget).HasPrecision(18, 2).IsRequired();
            o.Property(x => x.MinimumInvestmentAmount).HasPrecision(18, 2);
            o.Property(x => x.MaximumInvestmentAmount).HasPrecision(18, 2);
            o.Property(x => x.EquityOfferedPercentage).HasPrecision(5, 2);
            o.Property(x => x.FundingCurrency).HasMaxLength(3).IsRequired().HasDefaultValue(CurrencyMasterDefaults.DefaultCurrency);
            o.Property(x => x.SharePrice).HasPrecision(18, 2);
            o.Property(x => x.ProfitSharePercentage).HasPrecision(5, 2);
            o.Property(x => x.ProfitSharingPayoutFrequency).HasMaxLength(50);
            o.Property(x => x.InvestmentModel).HasConversion<string>().HasMaxLength(60).IsRequired();
            o.Property(x => x.ProjectStage).HasConversion<string>().HasMaxLength(40).IsRequired();
            o.Property(x => x.ProjectStageCustomName).HasMaxLength(120);
            o.Property(x => x.ProjectStageCustomNameNormalized).HasMaxLength(120);
            o.Property(x => x.Status).HasConversion<string>().HasMaxLength(40).IsRequired();
            o.Property(x => x.ModerationStatus).HasConversion<string>().HasMaxLength(40).IsRequired();
            o.Property(x => x.FundingStatus).HasConversion<string>().HasMaxLength(40).IsRequired();
            o.Property(x => x.ClosureReason).HasConversion<string>().HasMaxLength(40);
            o.Property(x => x.ObligationCompletionStatus).HasConversion<string>().HasMaxLength(40).IsRequired();
            o.Property(x => x.CoverImageUrl).HasMaxLength(1000);
            o.Property(x => x.IsLockedForEditing).HasDefaultValue(false);
            o.Property(x => x.InterestRate).HasPrecision(5, 2);
            o.Property(x => x.RepaymentFrequency).HasMaxLength(50);
            o.Property(x => x.FinalRepaymentDate);
            o.Property(x => x.CreatedAt).HasDefaultValueSql("SYSUTCDATETIME()");
            o.Property(x => x.UpdatedAt).HasDefaultValueSql("SYSUTCDATETIME()");
            o.Property(x => x.RowVersion).IsRowVersion();
            o.HasIndex(x => x.FounderId);
            o.HasIndex(x => x.ProjectId);
            o.HasIndex(x => new { x.ProjectId, x.SequenceNumber }).IsUnique();
            o.HasIndex(x => new { x.ProjectId, x.ProjectStage })
             .IsUnique()
             .HasDatabaseName("UX_Opportunities_Project_StandardStage")
             .HasFilter("[ProjectStage] <> 'Other'");
            o.HasIndex(x => new { x.ProjectId, x.ProjectStageCustomNameNormalized })
             .IsUnique()
             .HasDatabaseName("UX_Opportunities_Project_OtherStage")
             .HasFilter("[ProjectStage] = 'Other' AND [ProjectStageCustomNameNormalized] IS NOT NULL");
            o.ToTable(table => table.HasCheckConstraint(
                "CK_Opportunities_ProjectStageCustomName",
                "([ProjectStage] <> 'Other' AND [ProjectStageCustomName] IS NULL AND [ProjectStageCustomNameNormalized] IS NULL) OR ([ProjectStage] = 'Other' AND [ProjectStageCustomName] IS NOT NULL AND [ProjectStageCustomNameNormalized] IS NOT NULL)"));
            o.HasIndex(x => x.Status);
            o.HasIndex(x => x.ModerationStatus);
            o.HasIndex(x => x.FundingStatus);
            o.HasIndex(x => x.CreatedAt);
            o.HasIndex(x => x.UpdatedAt);
            o.HasIndex(x => x.FundingClosesAt);
            o.HasIndex(x => x.FundingGoalId);
            o.HasIndex(x => x.InvestmentModel);
            o.HasIndex(x => x.ProjectStage);
            o.HasOne<AuthUser>()
             .WithMany()
             .HasForeignKey(x => x.FounderId)
             .OnDelete(DeleteBehavior.Restrict);
            o.HasOne(x => x.FundingGoal)
             .WithMany(x => x.Opportunities)
             .HasForeignKey(x => x.FundingGoalId)
             .OnDelete(DeleteBehavior.Restrict)
             .IsRequired(false);
            o.HasMany(x => x.Media)
             .WithOne(x => x.Opportunity)
             .HasForeignKey(x => x.OpportunityId)
             .OnDelete(DeleteBehavior.Cascade);
            o.HasMany(x => x.Documents)
             .WithOne(x => x.Opportunity)
             .HasForeignKey(x => x.OpportunityId)
             .OnDelete(DeleteBehavior.Cascade);
            o.HasMany(x => x.Events)
             .WithOne(x => x.Opportunity)
             .HasForeignKey(x => x.OpportunityId)
             .OnDelete(DeleteBehavior.Cascade);
            o.HasMany(x => x.JoinRequests)
             .WithOne(x => x.Opportunity)
             .HasForeignKey(x => x.OpportunityId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<OpportunityJoinRequest>(j =>
        {
            j.HasKey(x => x.Id);
            j.Property(x => x.RequestType)
             .HasConversion<string>()
             .HasMaxLength(40)
             .HasDefaultValue(OpportunityJoinRequestType.GeneralParticipation)
             .IsRequired();
            j.Property(x => x.ParticipationSequence).IsRequired();
            j.Property(x => x.IdempotencyKey).HasMaxLength(100);
            j.Property(x => x.RequestedAmount).HasPrecision(18, 2);
            j.Property(x => x.EnteredAmount).HasPrecision(18, 2);
            j.Property(x => x.EnteredCurrency).HasMaxLength(3);
            j.Property(x => x.FundingAmount).HasPrecision(18, 2);
            j.Property(x => x.FundingCurrency).HasMaxLength(3);
            j.Property(x => x.CalculatedTotalAmount).HasPrecision(18, 2);
            j.Property(x => x.Message).HasMaxLength(1000);
            j.Property(x => x.TermsSnapshotJson).HasColumnType("nvarchar(max)");
            j.Property(x => x.Status).HasConversion<string>().HasMaxLength(30).IsRequired();
            j.Property(x => x.RejectionReason).HasMaxLength(1000);
            j.Property(x => x.CreatedAt).HasDefaultValueSql("SYSUTCDATETIME()");
            j.Property(x => x.UpdatedAt).HasDefaultValueSql("SYSUTCDATETIME()");
            j.Property(x => x.IsVisibleToFounder).HasDefaultValue(true);
            j.Property(x => x.IsVisibleToInvestor).HasDefaultValue(true);
            j.Property(x => x.RowVersion).IsRowVersion();
            j.Property<int>("ActiveRequestSlot")
             .HasComputedColumnSql("CASE WHEN [Status] = 'Pending' THEN 0 ELSE [Id] END", stored: true);
            j.HasIndex(x => x.OpportunityId);
            j.HasIndex(x => x.InvestorId);
            j.HasIndex(x => x.SourceConversationId);
            j.HasIndex(x => x.ExchangeRateSnapshotId);
            j.HasIndex(x => new { x.OpportunityId, x.InvestorId, x.Status });
            j.HasIndex(x => new { x.OpportunityId, x.InvestorId, x.IdempotencyKey }).IsUnique().HasFilter("[IdempotencyKey] IS NOT NULL");
            j.HasIndex(x => new { x.OpportunityId, x.InvestorId, x.ParticipationSequence }).IsUnique().HasFilter("[ParticipationSequence] > 0");
            j.HasIndex("OpportunityId", "InvestorId", "ActiveRequestSlot")
             .IsUnique();
            j.HasOne(x => x.Investor)
             .WithMany()
             .HasForeignKey(x => x.InvestorId)
             .OnDelete(DeleteBehavior.Restrict);
            j.HasOne(x => x.ReviewedByFounder)
             .WithMany()
             .HasForeignKey(x => x.ReviewedByFounderId)
             .OnDelete(DeleteBehavior.Restrict)
             .IsRequired(false);
            j.HasOne(x => x.ExchangeRateSnapshot)
             .WithMany()
             .HasForeignKey(x => x.ExchangeRateSnapshotId)
             .OnDelete(DeleteBehavior.Restrict)
             .IsRequired(false);
        });

        modelBuilder.Entity<FundingDeclaration>(d =>
        {
            d.HasKey(x => x.Id);
            d.Property(x => x.Amount).HasPrecision(18, 2).IsRequired();
            d.Property(x => x.CurrencyCode).HasMaxLength(3).IsRequired();
            d.Property(x => x.PaymentMethod).HasConversion<string>().HasMaxLength(30).IsRequired();
            d.Property(x => x.ExternalReference).HasMaxLength(200);
            d.Property(x => x.Notes).HasMaxLength(2000);
            d.Property(x => x.ConfirmationComment).HasMaxLength(2000);
            d.Property(x => x.DisputeReason).HasMaxLength(2000);
            d.Property(x => x.ProofFileId).HasMaxLength(64);
            d.Property(x => x.Status).HasConversion<string>().HasMaxLength(30).IsRequired();
            d.Property(x => x.IdempotencyKey).HasMaxLength(100);
            d.Property(x => x.DeclaredAt).HasDefaultValueSql("SYSUTCDATETIME()");
            d.Property(x => x.RowVersion).IsRowVersion();
            d.HasIndex(x => new { x.ParticipationId, x.DeclaredAt });
            d.HasIndex(x => new { x.OpportunityId, x.Status });
            d.HasIndex(x => new { x.ParticipationId, x.IdempotencyKey }).IsUnique().HasFilter("[IdempotencyKey] IS NOT NULL");
            d.HasIndex(x => x.ProofFileId);
            d.HasOne(x => x.Participation)
                .WithMany()
                .HasForeignKey(x => x.ParticipationId)
                .OnDelete(DeleteBehavior.Restrict);
            d.HasOne(x => x.Opportunity)
                .WithMany()
                .HasForeignKey(x => x.OpportunityId)
                .OnDelete(DeleteBehavior.Restrict);
            d.HasOne(x => x.ProofFile)
                .WithMany()
                .HasPrincipalKey(x => x.FileId)
                .HasForeignKey(x => x.ProofFileId)
                .OnDelete(DeleteBehavior.Restrict)
                .IsRequired(false);
            d.HasOne<AuthUser>()
                .WithMany()
                .HasForeignKey(x => x.ConfirmedByInvestorId)
                .OnDelete(DeleteBehavior.Restrict)
                .IsRequired(false);
            d.HasOne<AuthUser>()
                .WithMany()
                .HasForeignKey(x => x.DisputedByInvestorId)
                .OnDelete(DeleteBehavior.Restrict)
                .IsRequired(false);
        });

        modelBuilder.Entity<FundingDeclarationLegAllocation>(a =>
        {
            a.HasKey(x => x.Id);
            a.Property(x => x.AllocatedAmount).HasPrecision(18, 2).IsRequired();
            a.Property(x => x.CurrencyCode).HasMaxLength(3).IsRequired();
            a.Property(x => x.CreatedAt).HasDefaultValueSql("SYSUTCDATETIME()");
            a.HasIndex(x => new { x.FundingDeclarationId, x.OfferLegId }).IsUnique();
            a.HasIndex(x => new { x.ParticipationId, x.OfferLegId });
            a.HasOne(x => x.FundingDeclaration).WithMany(x => x.LegAllocations).HasForeignKey(x => x.FundingDeclarationId).OnDelete(DeleteBehavior.Cascade);
            a.HasOne(x => x.Participation).WithMany().HasForeignKey(x => x.ParticipationId).OnDelete(DeleteBehavior.Restrict);
            a.HasOne(x => x.Contract).WithMany().HasForeignKey(x => x.ContractId).OnDelete(DeleteBehavior.Restrict).IsRequired(false);
            a.HasOne(x => x.OfferLeg).WithMany().HasForeignKey(x => x.OfferLegId).OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<ParticipationObligationConfirmation>(c =>
        {
            c.HasKey(x => x.Id);
            c.Property(x => x.PartyRole).HasConversion<string>().HasMaxLength(20).IsRequired();
            c.Property(x => x.Status).HasConversion<string>().HasMaxLength(20).IsRequired();
            c.Property(x => x.ConfirmationStatement).HasMaxLength(1000);
            c.Property(x => x.IdempotencyKey).HasMaxLength(100);
            c.Property(x => x.CreatedAt).HasDefaultValueSql("SYSUTCDATETIME()");
            c.Property(x => x.UpdatedAt).HasDefaultValueSql("SYSUTCDATETIME()");
            c.Property(x => x.RowVersion).IsRowVersion();
            c.HasIndex(x => new { x.ParticipationRequestId, x.PartyRole }).IsUnique();
            c.HasIndex(x => new { x.RequiredUserId, x.Status });
            c.HasIndex(x => new { x.RequiredUserId, x.IdempotencyKey }).IsUnique().HasFilter("[IdempotencyKey] IS NOT NULL");
            c.HasIndex(x => x.OpportunityId);
            c.HasOne(x => x.ParticipationRequest).WithMany().HasForeignKey(x => x.ParticipationRequestId).OnDelete(DeleteBehavior.Restrict);
            c.HasOne(x => x.Opportunity).WithMany().HasForeignKey(x => x.OpportunityId).OnDelete(DeleteBehavior.Restrict);
            c.HasOne(x => x.RequiredUser).WithMany().HasForeignKey(x => x.RequiredUserId).OnDelete(DeleteBehavior.Restrict);
            c.HasOne(x => x.ConfirmedByUser).WithMany().HasForeignKey(x => x.ConfirmedByUserId).OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<ProjectRoomEntry>(e =>
        {
            e.HasKey(x=>x.Id);e.Property(x=>x.EntryType).HasConversion<string>().HasMaxLength(30).IsRequired();
            e.Property(x=>x.Title).HasMaxLength(200).IsRequired();e.Property(x=>x.Description).HasMaxLength(4000);
            e.Property(x=>x.CreatedAt).HasDefaultValueSql("SYSUTCDATETIME()");e.Property(x=>x.RowVersion).IsRowVersion();
            e.HasIndex(x=>new{x.ProjectId,x.CreatedAt});e.HasOne(x=>x.Project).WithMany(x=>x.RoomEntries).HasForeignKey(x=>x.ProjectId).OnDelete(DeleteBehavior.Restrict);
            e.HasOne(x=>x.CreatedByUser).WithMany().HasForeignKey(x=>x.CreatedByUserId).OnDelete(DeleteBehavior.Restrict);
        });
        modelBuilder.Entity<ProjectRoomDocument>(d =>
        {
            d.HasKey(x=>x.Id);d.Property(x=>x.FileKey).HasMaxLength(500).IsRequired();d.Property(x=>x.FileName).HasMaxLength(200).IsRequired();
            d.Property(x=>x.DocumentType).HasMaxLength(100).IsRequired();d.Property(x=>x.Visibility).HasConversion<string>().HasMaxLength(30).IsRequired();
            d.Property(x=>x.CreatedAt).HasDefaultValueSql("SYSUTCDATETIME()");d.Property(x=>x.RowVersion).IsRowVersion();
            d.HasIndex(x=>new{x.ProjectId,x.CreatedAt});d.HasOne(x=>x.Project).WithMany(x=>x.RoomDocuments).HasForeignKey(x=>x.ProjectId).OnDelete(DeleteBehavior.Restrict);
            d.HasOne(x=>x.CreatedByUser).WithMany().HasForeignKey(x=>x.CreatedByUserId).OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<ExchangeRateSnapshot>(x =>
        {
            x.HasKey(s => s.Id);
            x.Property(s => s.SourceCurrency).HasMaxLength(3).IsRequired();
            x.Property(s => s.TargetCurrency).HasMaxLength(3).IsRequired();
            x.Property(s => s.ExchangeRate).HasPrecision(28, 12).IsRequired();
            x.Property(s => s.Provider).HasMaxLength(100).IsRequired();
            x.Property(s => s.ProviderQuoteId).HasMaxLength(200);
            x.Property(s => s.CreatedAt).HasDefaultValueSql("SYSUTCDATETIME()");
            x.HasIndex(s => new { s.SourceCurrency, s.TargetCurrency, s.RateTimestamp });
            x.HasIndex(s => s.ProviderQuoteId);
            x.ToTable("ExchangeRateSnapshots");
        });

        modelBuilder.Entity<Currency>(c =>
        {
            c.HasKey(x => x.ISOCode);
            c.Property(x => x.ISOCode).HasMaxLength(3);
            c.Property(x => x.EnglishName).HasMaxLength(100).IsRequired();
            c.Property(x => x.ArabicName).HasMaxLength(100).IsRequired();
            c.Property(x => x.Symbol).HasMaxLength(10).IsRequired();
            c.Property(x => x.CreatedAt).HasDefaultValueSql("SYSUTCDATETIME()");
            c.Property(x => x.UpdatedAt);
            c.HasIndex(x => x.IsActive);
            var currencySeedCreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc);
            c.HasData(
                new Currency { ISOCode = "EGP", EnglishName = "Egyptian Pound", ArabicName = "الجنيه المصري", Symbol = "E£", DecimalDigits = 2, IsActive = true, SupportsFunding = true, SupportsSettlement = true, SupportsWallet = true, CreatedAt = currencySeedCreatedAt },
                new Currency { ISOCode = "USD", EnglishName = "US Dollar", ArabicName = "الدولار الأمريكي", Symbol = "$", DecimalDigits = 2, IsActive = true, SupportsFunding = true, SupportsSettlement = true, SupportsWallet = true, CreatedAt = currencySeedCreatedAt },
                new Currency { ISOCode = "EUR", EnglishName = "Euro", ArabicName = "اليورو", Symbol = "€", DecimalDigits = 2, IsActive = true, SupportsFunding = true, SupportsSettlement = true, SupportsWallet = false, CreatedAt = currencySeedCreatedAt },
                new Currency { ISOCode = "GBP", EnglishName = "British Pound", ArabicName = "الجنيه الإسترليني", Symbol = "£", DecimalDigits = 2, IsActive = true, SupportsFunding = true, SupportsSettlement = true, SupportsWallet = false, CreatedAt = currencySeedCreatedAt },
                new Currency { ISOCode = "SAR", EnglishName = "Saudi Riyal", ArabicName = "الريال السعودي", Symbol = "﷼", DecimalDigits = 2, IsActive = true, SupportsFunding = true, SupportsSettlement = true, SupportsWallet = true, CreatedAt = currencySeedCreatedAt },
                new Currency { ISOCode = "AED", EnglishName = "UAE Dirham", ArabicName = "الدرهم الإماراتي", Symbol = "د.إ", DecimalDigits = 2, IsActive = true, SupportsFunding = true, SupportsSettlement = true, SupportsWallet = true, CreatedAt = currencySeedCreatedAt },
                new Currency { ISOCode = "JPY", EnglishName = "Japanese Yen", ArabicName = "الين الياباني", Symbol = "¥", DecimalDigits = 0, IsActive = true, SupportsFunding = false, SupportsSettlement = true, SupportsWallet = false, CreatedAt = currencySeedCreatedAt },
                new Currency { ISOCode = "KWD", EnglishName = "Kuwaiti Dinar", ArabicName = "الدينار الكويتي", Symbol = "د.ك", DecimalDigits = 3, IsActive = true, SupportsFunding = true, SupportsSettlement = true, SupportsWallet = true, CreatedAt = currencySeedCreatedAt });
        });

        modelBuilder.Entity<LoanObligation>(o =>
        {
            o.HasKey(x => x.Id);
            o.Property(x => x.Principal).HasPrecision(18, 2).IsRequired();
            o.Property(x => x.Currency).HasMaxLength(10).IsRequired();
            o.Property(x => x.InterestRate).HasPrecision(5, 2).IsRequired();
            o.Property(x => x.RepaymentModel).HasMaxLength(30).IsRequired();
            o.Property(x => x.PrincipalRepaymentMethod).HasConversion<string>().HasMaxLength(30).IsRequired();
            o.Property(x => x.Status).HasConversion<string>().HasMaxLength(20).IsRequired();
            o.Property(x => x.CreatedAt).HasDefaultValueSql("SYSUTCDATETIME()");
            o.Property(x => x.ActivatedAt).HasDefaultValueSql("SYSUTCDATETIME()");
            o.Property(x => x.RepaymentLedgerVersion).IsRequired();
            o.Property(x => x.DefaultReason).HasMaxLength(2000);
            o.Property(x => x.ClosureReason).HasMaxLength(2000);
            o.Property(x => x.DefaultOutstandingPrincipal).HasPrecision(18, 2);
            o.Property(x => x.DefaultOutstandingInterest).HasPrecision(18, 2);
            o.Property(x => x.DefaultOutstandingTotal).HasPrecision(18, 2);
            o.Property(x => x.ClosedFinalPrincipalOutstanding).HasPrecision(18, 2);
            o.Property(x => x.ClosedFinalInterestOutstanding).HasPrecision(18, 2);
            o.Property(x => x.ClosedFinalTotalOutstanding).HasPrecision(18, 2);
            o.Property(x => x.RowVersion).IsRowVersion();
            o.HasIndex(x => new { x.ParticipationRequestId, x.OfferLegId }).IsUnique();
            o.HasIndex(x => new { x.ContractId, x.OfferLegId }).IsUnique();
            o.HasIndex(x => new { x.InvestorUserId, x.Status });
            o.HasOne(x => x.ParticipationRequest).WithMany().HasForeignKey(x => x.ParticipationRequestId).OnDelete(DeleteBehavior.Restrict);
            o.HasOne(x => x.Contract).WithMany().HasForeignKey(x => x.ContractId).OnDelete(DeleteBehavior.Restrict);
            o.HasOne(x => x.ContractVersion).WithMany().HasForeignKey(x => x.ContractVersionId).OnDelete(DeleteBehavior.Restrict);
            o.HasOne(x => x.AcceptedOffer).WithMany().HasForeignKey(x => x.AcceptedOfferId).OnDelete(DeleteBehavior.Restrict);
            o.HasOne(x => x.OfferLeg).WithMany().HasForeignKey(x => x.OfferLegId).OnDelete(DeleteBehavior.Restrict);
            o.HasOne(x => x.FounderUser).WithMany().HasForeignKey(x => x.FounderUserId).OnDelete(DeleteBehavior.Restrict);
            o.HasOne(x => x.InvestorUser).WithMany().HasForeignKey(x => x.InvestorUserId).OnDelete(DeleteBehavior.Restrict);
            o.HasMany(x => x.Installments).WithOne(x => x.LoanObligation).HasForeignKey(x => x.LoanObligationId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<LoanRepaymentInstallment>(i =>
        {
            i.HasKey(x => x.Id);
            i.Property(x => x.PrincipalDue).HasPrecision(18, 2).IsRequired();
            i.Property(x => x.InterestDue).HasPrecision(18, 2).IsRequired();
            i.Property(x => x.TotalDue).HasPrecision(18, 2).IsRequired();
            i.Property(x => x.Currency).HasMaxLength(10).IsRequired();
            i.Property(x => x.Status).HasConversion<string>().HasMaxLength(20).IsRequired();
            i.Property(x => x.CreatedAt).HasDefaultValueSql("SYSUTCDATETIME()");
            i.Property(x => x.RowVersion).IsRowVersion();
            i.HasIndex(x => new { x.LoanObligationId, x.InstallmentNumber }).IsUnique();
        });

        modelBuilder.Entity<LoanRepaymentDeclaration>(d =>
        {
            d.HasKey(x => x.Id);
            d.Property(x => x.Amount).HasPrecision(18, 2).IsRequired();
            d.Property(x => x.Currency).HasMaxLength(10).IsRequired();
            d.Property(x => x.ExternalReference).HasMaxLength(200);
            d.Property(x => x.ProofFileId).HasMaxLength(64);
            d.Property(x => x.Status).HasConversion<string>().HasMaxLength(30).IsRequired();
            d.Property(x => x.ConfirmationComment).HasMaxLength(2000);
            d.Property(x => x.DisputeReason).HasMaxLength(2000);
            d.Property(x => x.IdempotencyKey).HasMaxLength(100);
            d.Property(x => x.DeclaredAt).HasDefaultValueSql("SYSUTCDATETIME()");
            d.Property(x => x.RowVersion).IsRowVersion();
            d.HasIndex(x => new { x.LoanObligationId, x.DeclaredAt });
            d.HasIndex(x => new { x.LoanObligationId, x.IdempotencyKey }).IsUnique().HasFilter("[IdempotencyKey] IS NOT NULL");
            d.HasOne(x => x.LoanObligation).WithMany(x => x.RepaymentDeclarations).HasForeignKey(x => x.LoanObligationId).OnDelete(DeleteBehavior.Restrict);
            d.HasOne(x => x.Participation).WithMany().HasForeignKey(x => x.ParticipationId).OnDelete(DeleteBehavior.Restrict);
            d.HasOne(x => x.Contract).WithMany().HasForeignKey(x => x.ContractId).OnDelete(DeleteBehavior.Restrict);
            d.HasOne(x => x.ContractVersion).WithMany().HasForeignKey(x => x.ContractVersionId).OnDelete(DeleteBehavior.Restrict);
            d.HasOne(x => x.AcceptedOffer).WithMany().HasForeignKey(x => x.AcceptedOfferId).OnDelete(DeleteBehavior.Restrict);
            d.HasOne(x => x.OfferLeg).WithMany().HasForeignKey(x => x.OfferLegId).OnDelete(DeleteBehavior.Restrict);
            d.HasOne(x => x.ProofFile).WithMany().HasPrincipalKey(x => x.FileId).HasForeignKey(x => x.ProofFileId).OnDelete(DeleteBehavior.Restrict).IsRequired(false);
        });

        modelBuilder.Entity<LoanRepaymentDeclarationInstallment>(d =>
        {
            d.HasKey(x => new { x.LoanRepaymentDeclarationId, x.LoanRepaymentInstallmentId });
            d.HasOne(x => x.Declaration).WithMany(x => x.Installments).HasForeignKey(x => x.LoanRepaymentDeclarationId).OnDelete(DeleteBehavior.Cascade);
            d.HasOne(x => x.Installment).WithMany().HasForeignKey(x => x.LoanRepaymentInstallmentId).OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<LoanRepaymentAllocation>(a =>
        {
            a.HasKey(x => x.Id);
            a.Property(x => x.InterestAllocated).HasPrecision(18, 2).IsRequired();
            a.Property(x => x.PrincipalAllocated).HasPrecision(18, 2).IsRequired();
            a.Property(x => x.TotalAllocated).HasPrecision(18, 2).IsRequired();
            a.Property(x => x.CreatedAt).HasDefaultValueSql("SYSUTCDATETIME()");
            a.HasIndex(x => new { x.LoanRepaymentDeclarationId, x.LoanRepaymentInstallmentId }).IsUnique();
            a.HasOne(x => x.Declaration).WithMany(x => x.Allocations).HasForeignKey(x => x.LoanRepaymentDeclarationId).OnDelete(DeleteBehavior.Cascade);
            a.HasOne(x => x.LoanObligation).WithMany(x => x.RepaymentAllocations).HasForeignKey(x => x.LoanObligationId).OnDelete(DeleteBehavior.Restrict);
            a.HasOne(x => x.Installment).WithMany().HasForeignKey(x => x.LoanRepaymentInstallmentId).OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<ProfitSharingObligation>(o =>
        {
            o.HasKey(x => x.Id);
            o.Property(x => x.ContributionAmount).HasPrecision(18, 2).IsRequired();
            o.Property(x => x.Currency).HasMaxLength(10).IsRequired();
            o.Property(x => x.ProfitSharePercentage).HasPrecision(5, 2).IsRequired();
            o.Property(x => x.ReportingFrequency).HasMaxLength(30).IsRequired();
            o.Property(x => x.CalculationBasis).HasConversion<string>().HasMaxLength(20).IsRequired();
            o.Property(x => x.Status).HasConversion<string>().HasMaxLength(20).IsRequired();
            o.Property(x => x.CreatedAt).HasDefaultValueSql("SYSUTCDATETIME()");
            o.Property(x => x.ClosureReason).HasMaxLength(2000);
            o.Property(x => x.ClosureSnapshotJson).HasColumnType("nvarchar(max)");
            o.Property(x => x.ClosureSnapshotHash).HasMaxLength(64);
            o.Property(x => x.ClosureSnapshotVersion).HasMaxLength(30);
            o.HasIndex(x => new { x.ParticipationRequestId, x.OfferLegId }).IsUnique();
            o.HasIndex(x => new { x.ContractId, x.OfferLegId }).IsUnique();
            o.HasIndex(x => new { x.InvestorUserId, x.Status });
            o.HasOne(x => x.ParticipationRequest).WithMany().HasForeignKey(x => x.ParticipationRequestId).OnDelete(DeleteBehavior.Restrict);
            o.HasOne(x => x.Contract).WithMany().HasForeignKey(x => x.ContractId).OnDelete(DeleteBehavior.Restrict);
            o.HasOne(x => x.ContractVersion).WithMany().HasForeignKey(x => x.ContractVersionId).OnDelete(DeleteBehavior.Restrict);
            o.HasOne(x => x.AcceptedOffer).WithMany().HasForeignKey(x => x.AcceptedOfferId).OnDelete(DeleteBehavior.Restrict);
            o.HasOne(x => x.OfferLeg).WithMany().HasForeignKey(x => x.OfferLegId).OnDelete(DeleteBehavior.Restrict);
            o.HasOne(x => x.FounderUser).WithMany().HasForeignKey(x => x.FounderUserId).OnDelete(DeleteBehavior.Restrict);
            o.HasOne(x => x.InvestorUser).WithMany().HasForeignKey(x => x.InvestorUserId).OnDelete(DeleteBehavior.Restrict);
            o.HasMany(x => x.ReportingPeriods).WithOne(x => x.Obligation).HasForeignKey(x => x.ProfitSharingObligationId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<ProfitSharingReportingPeriod>(p =>
        {
            p.HasKey(x => x.Id);
            p.Property(x => x.Currency).HasMaxLength(10).IsRequired();
            p.Property(x => x.Status).HasConversion<string>().HasMaxLength(30).IsRequired();
            p.Property(x => x.CreatedAt).HasDefaultValueSql("SYSUTCDATETIME()");
            p.Property(x => x.IsFinalPeriod).HasDefaultValue(false);
            p.HasIndex(x => new { x.ProfitSharingObligationId, x.PeriodNumber }).IsUnique();
            p.HasOne(x => x.Declaration).WithOne(x => x.ReportingPeriod).HasForeignKey<ProfitSharingPeriodDeclaration>(x => x.ReportingPeriodId).OnDelete(DeleteBehavior.Restrict);
            p.HasOne(x => x.Entitlement).WithOne(x => x.ReportingPeriod).HasForeignKey<ProfitSharingEntitlement>(x => x.ReportingPeriodId).OnDelete(DeleteBehavior.Restrict);
            p.HasMany(x => x.DistributionDeclarations).WithOne(x => x.ReportingPeriod).HasForeignKey(x => x.ReportingPeriodId).OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<ProfitSharingPeriodDeclaration>(d =>
        {
            d.HasKey(x => x.Id);
            d.Property(x => x.CalculationBasis).HasConversion<string>().HasMaxLength(20).IsRequired();
            d.Property(x => x.DeclaredBasisAmount).HasPrecision(18, 2).IsRequired();
            d.Property(x => x.DeclaredResultAmount).HasPrecision(18, 2).IsRequired();
            d.Property(x => x.Currency).HasMaxLength(10).IsRequired();
            d.Property(x => x.ExternalReference).HasMaxLength(200);
            d.Property(x => x.Notes).HasMaxLength(2000);
            d.Property(x => x.SupportingEvidenceFileId).HasMaxLength(64);
            d.Property(x => x.Status).HasConversion<string>().HasMaxLength(20).IsRequired();
            d.Property(x => x.IdempotencyKey).HasMaxLength(100);
            d.Property(x => x.CalculationError).HasMaxLength(500);
            d.Property(x => x.DeclaredAt).HasDefaultValueSql("SYSUTCDATETIME()");
            d.Property(x => x.RowVersion).IsRowVersion();
            d.HasIndex(x => x.ReportingPeriodId).IsUnique();
            d.HasIndex(x => new { x.ProfitSharingObligationId, x.IdempotencyKey }).IsUnique().HasFilter("[IdempotencyKey] IS NOT NULL");
            d.HasOne(x => x.Obligation).WithMany().HasForeignKey(x => x.ProfitSharingObligationId).OnDelete(DeleteBehavior.Restrict);
            d.HasOne(x => x.Participation).WithMany().HasForeignKey(x => x.ParticipationId).OnDelete(DeleteBehavior.Restrict);
            d.HasOne(x => x.Contract).WithMany().HasForeignKey(x => x.ContractId).OnDelete(DeleteBehavior.Restrict);
            d.HasOne(x => x.ContractVersion).WithMany().HasForeignKey(x => x.ContractVersionId).OnDelete(DeleteBehavior.Restrict);
            d.HasOne(x => x.SupportingEvidenceFile).WithMany().HasPrincipalKey(x => x.FileId).HasForeignKey(x => x.SupportingEvidenceFileId).OnDelete(DeleteBehavior.Restrict).IsRequired(false);
        });

        modelBuilder.Entity<ProfitSharingEntitlement>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.CalculationBasis).HasConversion<string>().HasMaxLength(20).IsRequired();
            e.Property(x => x.BasisAmount).HasPrecision(18, 2).IsRequired();
            e.Property(x => x.ProfitSharePercentage).HasPrecision(5, 2).IsRequired();
            e.Property(x => x.EntitlementAmount).HasPrecision(18, 2).IsRequired();
            e.Property(x => x.DistributionOutstanding).HasPrecision(18, 2).IsRequired();
            e.Property(x => x.Currency).HasMaxLength(10).IsRequired();
            e.Property(x => x.CalculationVersion).HasMaxLength(30).IsRequired();
            e.Property(x => x.CalculatedAt).HasDefaultValueSql("SYSUTCDATETIME()");
            e.Property(x => x.PendingDistributionAmount).HasPrecision(18, 2).IsRequired();
            e.Property(x => x.RowVersion).IsRowVersion();
            e.HasIndex(x => x.ReportingPeriodId).IsUnique();
            e.HasIndex(x => x.DeclarationId).IsUnique();
            e.HasOne(x => x.Obligation).WithMany().HasForeignKey(x => x.ProfitSharingObligationId).OnDelete(DeleteBehavior.Restrict);
            e.HasOne(x => x.Declaration).WithOne(x => x.Entitlement).HasForeignKey<ProfitSharingEntitlement>(x => x.DeclarationId).OnDelete(DeleteBehavior.Restrict);
            e.HasMany(x => x.DistributionAllocations).WithOne(x => x.Entitlement).HasForeignKey(x => x.EntitlementId).OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<ProfitSharingDistributionDeclaration>(d =>
        {
            d.HasKey(x => x.Id);
            d.Property(x => x.DeclaredAmount).HasPrecision(18, 2).IsRequired();
            d.Property(x => x.Currency).HasMaxLength(10).IsRequired();
            d.Property(x => x.ExternalReference).HasMaxLength(200);
            d.Property(x => x.Notes).HasMaxLength(2000);
            d.Property(x => x.SupportingEvidenceFileId).HasMaxLength(64);
            d.Property(x => x.Status).HasConversion<string>().HasMaxLength(30).IsRequired();
            d.Property(x => x.IdempotencyKey).HasMaxLength(100);
            d.Property(x => x.ConfirmationComment).HasMaxLength(2000);
            d.Property(x => x.DisputeReason).HasMaxLength(2000);
            d.Property(x => x.DeclaredAt).HasDefaultValueSql("SYSUTCDATETIME()");
            d.Property(x => x.RowVersion).IsRowVersion();
            d.HasIndex(x => new { x.ProfitSharingObligationId, x.IdempotencyKey }).IsUnique().HasFilter("[IdempotencyKey] IS NOT NULL");
            d.HasIndex(x => new { x.ReportingPeriodId, x.Status });
            d.HasOne(x => x.Obligation).WithMany(x => x.DistributionDeclarations).HasForeignKey(x => x.ProfitSharingObligationId).OnDelete(DeleteBehavior.Restrict);
            d.HasOne(x => x.ReportingPeriod).WithMany(x => x.DistributionDeclarations).HasForeignKey(x => x.ReportingPeriodId).OnDelete(DeleteBehavior.Restrict);
            d.HasOne(x => x.Entitlement).WithMany().HasForeignKey(x => x.EntitlementId).OnDelete(DeleteBehavior.Restrict);
            d.HasOne(x => x.Participation).WithMany().HasForeignKey(x => x.ParticipationId).OnDelete(DeleteBehavior.Restrict);
            d.HasOne(x => x.Contract).WithMany().HasForeignKey(x => x.ContractId).OnDelete(DeleteBehavior.Restrict);
            d.HasOne(x => x.ContractVersion).WithMany().HasForeignKey(x => x.ContractVersionId).OnDelete(DeleteBehavior.Restrict);
            d.HasOne(x => x.AcceptedOffer).WithMany().HasForeignKey(x => x.AcceptedOfferId).OnDelete(DeleteBehavior.Restrict);
            d.HasOne(x => x.OfferLeg).WithMany().HasForeignKey(x => x.OfferLegId).OnDelete(DeleteBehavior.Restrict);
            d.HasOne(x => x.FounderUser).WithMany().HasForeignKey(x => x.FounderUserId).OnDelete(DeleteBehavior.Restrict);
            d.HasOne(x => x.InvestorUser).WithMany().HasForeignKey(x => x.InvestorUserId).OnDelete(DeleteBehavior.Restrict);
            d.HasOne(x => x.SupportingEvidenceFile).WithMany().HasPrincipalKey(x => x.FileId).HasForeignKey(x => x.SupportingEvidenceFileId).OnDelete(DeleteBehavior.Restrict).IsRequired(false);
        });

        modelBuilder.Entity<ProfitSharingDistributionAllocation>(a =>
        {
            a.HasKey(x => x.Id);
            a.Property(x => x.Amount).HasPrecision(18, 2).IsRequired();
            a.Property(x => x.Currency).HasMaxLength(10).IsRequired();
            a.Property(x => x.ConfirmedAt).HasDefaultValueSql("SYSUTCDATETIME()");
            a.HasIndex(x => x.ProfitSharingDistributionDeclarationId).IsUnique();
            a.HasIndex(x => new { x.ProfitSharingObligationId, x.ReportingPeriodId });
            a.HasOne(x => x.Declaration).WithOne(x => x.Allocation).HasForeignKey<ProfitSharingDistributionAllocation>(x => x.ProfitSharingDistributionDeclarationId).OnDelete(DeleteBehavior.Restrict);
            a.HasOne(x => x.Obligation).WithMany(x => x.DistributionAllocations).HasForeignKey(x => x.ProfitSharingObligationId).OnDelete(DeleteBehavior.Restrict);
            a.HasOne(x => x.ReportingPeriod).WithMany().HasForeignKey(x => x.ReportingPeriodId).OnDelete(DeleteBehavior.Restrict);
            a.HasOne(x => x.Entitlement).WithMany(x => x.DistributionAllocations).HasForeignKey(x => x.EntitlementId).OnDelete(DeleteBehavior.Restrict);
            a.HasOne(x => x.InvestorUser).WithMany().HasForeignKey(x => x.InvestorUserId).OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<EquityPosition>(o =>
        {
            o.HasKey(x => x.Id);
            o.Property(x => x.InvestmentAmount).HasPrecision(18, 2).IsRequired();
            o.Property(x => x.Currency).HasMaxLength(10).IsRequired();
            o.Property(x => x.OwnershipModel).HasConversion<string>().HasMaxLength(30).IsRequired();
            o.Property(x => x.Status).HasConversion<string>().HasMaxLength(30).IsRequired();
            o.Property(x => x.ContractualOwnershipPercentage).HasPrecision(9, 6);
            o.Property(x => x.InvestorShareCount).HasPrecision(18, 6);
            o.Property(x => x.TotalIssuedShares).HasPrecision(18, 6);
            o.Property(x => x.PricePerShare).HasPrecision(18, 6);
            o.Property(x => x.PreMoneyValuation).HasPrecision(18, 2);
            o.Property(x => x.PostMoneyValuation).HasPrecision(18, 2);
            o.Property(x => x.ShareClass).HasMaxLength(100);
            o.Property(x => x.RowVersion).IsRowVersion();
            o.Property(x => x.CreatedAt).HasDefaultValueSql("SYSUTCDATETIME()");
            // A transfer can create a second holder for the same contractual
            // offer leg. Uniqueness is therefore per investor, while the
            // contract/offer linkage remains unchanged for lineage purposes.
            o.HasIndex(x => new { x.ParticipationRequestId, x.OfferLegId, x.InvestorUserId }).IsUnique();
            o.HasIndex(x => new { x.ContractId, x.OfferLegId, x.InvestorUserId }).IsUnique();
            o.HasIndex(x => new { x.OpportunityId, x.Status });
            o.HasIndex(x => new { x.InvestorUserId, x.Status });
            o.HasOne(x => x.ParticipationRequest).WithMany().HasForeignKey(x => x.ParticipationRequestId).OnDelete(DeleteBehavior.Restrict);
            o.HasOne(x => x.Contract).WithMany().HasForeignKey(x => x.ContractId).OnDelete(DeleteBehavior.Restrict);
            o.HasOne(x => x.ContractVersion).WithMany().HasForeignKey(x => x.ContractVersionId).OnDelete(DeleteBehavior.Restrict);
            o.HasOne(x => x.AcceptedOffer).WithMany().HasForeignKey(x => x.AcceptedOfferId).OnDelete(DeleteBehavior.Restrict);
            o.HasOne(x => x.OfferLeg).WithMany().HasForeignKey(x => x.OfferLegId).OnDelete(DeleteBehavior.Restrict);
            o.HasOne(x => x.Opportunity).WithMany().HasForeignKey(x => x.OpportunityId).OnDelete(DeleteBehavior.Restrict);
            o.HasOne(x => x.Project).WithMany().HasForeignKey(x => x.ProjectId).OnDelete(DeleteBehavior.Restrict).IsRequired(false);
            o.HasOne(x => x.FounderUser).WithMany().HasForeignKey(x => x.FounderUserId).OnDelete(DeleteBehavior.Restrict);
            o.HasOne(x => x.InvestorUser).WithMany().HasForeignKey(x => x.InvestorUserId).OnDelete(DeleteBehavior.Restrict);
            o.HasOne(x => x.InitialHoldingSnapshot).WithOne(x => x.EquityPosition).HasForeignKey<EquityHoldingSnapshot>(x => x.EquityPositionId).OnDelete(DeleteBehavior.Cascade);
            o.HasMany(x => x.LedgerEntries).WithOne(x => x.EquityPosition).HasForeignKey(x => x.EquityPositionId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<EquityHoldingSnapshot>(s =>
        {
            s.HasKey(x => x.Id);
            s.Property(x => x.OwnershipModel).HasConversion<string>().HasMaxLength(30).IsRequired();
            s.Property(x => x.ContractualOwnershipPercentage).HasPrecision(9, 6);
            s.Property(x => x.InvestorShareCount).HasPrecision(18, 6);
            s.Property(x => x.TotalIssuedShares).HasPrecision(18, 6);
            s.Property(x => x.DerivedOwnershipPercentage).HasPrecision(9, 6);
            s.Property(x => x.PricePerShare).HasPrecision(18, 6);
            s.Property(x => x.PreMoneyValuation).HasPrecision(18, 2);
            s.Property(x => x.PostMoneyValuation).HasPrecision(18, 2);
            s.Property(x => x.ShareClass).HasMaxLength(100);
            s.Property(x => x.CreatedAt).HasDefaultValueSql("SYSUTCDATETIME()");
            s.HasIndex(x => x.EquityPositionId).IsUnique();
        });

        modelBuilder.Entity<EquityHoldingLedgerEntry>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.EventType).HasConversion<string>().HasMaxLength(40).IsRequired();
            e.Property(x => x.ShareDelta).HasPrecision(18, 6);
            e.Property(x => x.ResultingInvestorShares).HasPrecision(18, 6);
            e.Property(x => x.ResultingTotalIssuedShares).HasPrecision(18, 6);
            e.Property(x => x.ResultingOwnershipPercentage).HasPrecision(9, 6);
            e.Property(x => x.ContractualOwnershipPercentage).HasPrecision(9, 6);
            e.Property(x => x.PreviousInvestorShares).HasPrecision(18, 6);
            e.Property(x => x.PreviousTotalIssuedShares).HasPrecision(18, 6);
            e.Property(x => x.PreviousOwnershipPercentage).HasPrecision(9, 6);
            e.Property(x => x.ShareClass).HasMaxLength(100);
            e.Property(x => x.ActorType).HasMaxLength(30).IsRequired();
            e.Property(x => x.CorrelationId).HasMaxLength(100);
            e.Property(x => x.CreatedAt).HasDefaultValueSql("SYSUTCDATETIME()");
            e.HasIndex(x => new { x.EquityPositionId, x.EventType, x.CorporateEventId }).IsUnique();
            e.HasIndex(x => new { x.EquityPositionId, x.EffectiveDate, x.Id });
            e.HasIndex(x => x.CorporateEventId);
            e.HasOne(x => x.EquityPosition).WithMany(x => x.LedgerEntries).HasForeignKey(x => x.EquityPositionId).OnDelete(DeleteBehavior.Cascade);
            e.HasOne(x => x.CorporateEvent).WithMany(x => x.LedgerEntries).HasForeignKey(x => x.CorporateEventId).OnDelete(DeleteBehavior.Restrict).IsRequired(false);
        });

        modelBuilder.Entity<EquityCorporateEvent>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.EventType).HasConversion<string>().HasMaxLength(40).IsRequired();
            e.Property(x => x.Status).HasConversion<string>().HasMaxLength(40).IsRequired();
            e.Property(x => x.Reason).HasMaxLength(2000).IsRequired();
            e.Property(x => x.Notes).HasMaxLength(4000);
            e.Property(x => x.CorrelationId).HasMaxLength(100);
            e.Property(x => x.ShareClass).HasMaxLength(100);
            e.Property(x => x.Currency).HasMaxLength(10);
            e.Property(x => x.SharesIssued).HasPrecision(18, 6);
            e.Property(x => x.ResultingTotalIssuedShares).HasPrecision(18, 6);
            e.Property(x => x.SplitNumerator).HasPrecision(18, 6);
            e.Property(x => x.SplitDenominator).HasPrecision(18, 6);
            e.Property(x => x.PreMoneyValuation).HasPrecision(18, 2);
            e.Property(x => x.PostMoneyValuation).HasPrecision(18, 2);
            e.Property(x => x.PricePerShare).HasPrecision(18, 6);
            e.Property(x => x.ExpectedTotalIssuedShares).HasPrecision(18, 6);
            e.HasIndex(x => new { x.ProjectId, x.Status, x.EffectiveDate });
            e.Property(x => x.CreatedAt).HasDefaultValueSql("SYSUTCDATETIME()");
            e.Property(x => x.RowVersion).IsRowVersion();
            e.HasIndex(x => new { x.OpportunityId, x.Status, x.EffectiveDate });
            e.HasIndex(x => x.CorrelationId).IsUnique();
            e.HasOne(x => x.Project).WithMany().HasForeignKey(x => x.ProjectId).OnDelete(DeleteBehavior.Restrict);
            e.HasOne(x => x.Opportunity).WithMany().HasForeignKey(x => x.OpportunityId).OnDelete(DeleteBehavior.Restrict).IsRequired(false);
        });

        modelBuilder.Entity<EquityCorporateEventPosition>(e =>
        {
            e.HasKey(x => new { x.EquityCorporateEventId, x.EquityPositionId });
            e.HasOne(x => x.CorporateEvent).WithMany(x => x.Positions).HasForeignKey(x => x.EquityCorporateEventId).OnDelete(DeleteBehavior.Cascade);
            e.HasOne(x => x.EquityPosition).WithMany().HasForeignKey(x => x.EquityPositionId).OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<EquityCapitalizationSnapshot>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.TotalIssuedShares).HasPrecision(18, 6);
            e.Property(x => x.Currency).HasMaxLength(10);
            e.Property(x => x.SnapshotHash).HasMaxLength(128);
            e.Property(x => x.CapturedAt).HasDefaultValueSql("SYSUTCDATETIME()");
            e.HasIndex(x => new { x.EquityCorporateEventId, x.IsBefore }).IsUnique();
            e.HasOne(x => x.CorporateEvent).WithMany(x => x.CapitalizationSnapshots).HasForeignKey(x => x.EquityCorporateEventId).OnDelete(DeleteBehavior.Cascade);
            e.HasMany(x => x.Holders).WithOne(x => x.Snapshot).HasForeignKey(x => x.EquityCapitalizationSnapshotId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<EquityCapitalizationSnapshotHolder>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.InvestorShares).HasPrecision(18, 6);
            e.Property(x => x.OwnershipPercentage).HasPrecision(9, 6);
            e.Property(x => x.ShareClass).HasMaxLength(100);
            e.HasIndex(x => new { x.EquityCapitalizationSnapshotId, x.EquityPositionId }).IsUnique();
            e.HasOne(x => x.EquityPosition).WithMany().HasForeignKey(x => x.EquityPositionId).OnDelete(DeleteBehavior.Restrict);
        });

        // ===== PHASE 3: DIVIDENDS =====

        modelBuilder.Entity<EquityDividendDeclaration>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Status).HasConversion<string>().HasMaxLength(30).IsRequired();
            e.Property(x => x.Currency).HasMaxLength(10).IsRequired();
            e.Property(x => x.DistributionBasis).HasMaxLength(200).IsRequired();
            e.Property(x => x.DividendPerShare).HasPrecision(18, 6);
            e.Property(x => x.TotalDeclaredAmount).HasPrecision(18, 2);
            e.Property(x => x.Reason).HasMaxLength(2000).IsRequired();
            e.Property(x => x.Notes).HasMaxLength(4000);
            e.Property(x => x.CreatedAt).HasDefaultValueSql("SYSUTCDATETIME()");
            e.Property(x => x.RowVersion).IsRowVersion();
            e.HasIndex(x => new { x.ProjectId, x.Status, x.DeclarationDate });
            e.HasIndex(x => new { x.OpportunityId, x.Status });
            e.HasOne(x => x.Project).WithMany().HasForeignKey(x => x.ProjectId).OnDelete(DeleteBehavior.Restrict);
            e.HasOne(x => x.Opportunity).WithMany().HasForeignKey(x => x.OpportunityId).OnDelete(DeleteBehavior.Restrict);
            e.HasOne(x => x.DeclaredByUser).WithMany().HasForeignKey(x => x.DeclaredByUserId).OnDelete(DeleteBehavior.Restrict);
            e.HasMany(x => x.Entitlements).WithOne(x => x.DividendDeclaration).HasForeignKey(x => x.DividendDeclarationId).OnDelete(DeleteBehavior.Cascade);
            e.HasMany(x => x.Distributions).WithOne(x => x.DividendDeclaration).HasForeignKey(x => x.DividendDeclarationId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<EquityDividendEntitlement>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.EligibleShares).HasPrecision(18, 6);
            e.Property(x => x.EligibleOwnershipPercentage).HasPrecision(9, 6);
            e.Property(x => x.TotalIssuedSharesAtRecordDate).HasPrecision(18, 6);
            e.Property(x => x.EntitlementAmount).HasPrecision(18, 2);
            e.Property(x => x.Currency).HasMaxLength(10).IsRequired();
            e.Property(x => x.CreatedAt).HasDefaultValueSql("SYSUTCDATETIME()");
            e.HasIndex(x => new { x.DividendDeclarationId, x.EquityPositionId }).IsUnique();
            e.HasIndex(x => new { x.EquityPositionId, x.DividendDeclarationId });
            e.HasOne(x => x.DividendDeclaration).WithMany(x => x.Entitlements).HasForeignKey(x => x.DividendDeclarationId).OnDelete(DeleteBehavior.Cascade);
            e.HasOne(x => x.EquityPosition).WithMany().HasForeignKey(x => x.EquityPositionId).OnDelete(DeleteBehavior.Restrict);
            e.HasOne(x => x.InvestorUser).WithMany().HasForeignKey(x => x.InvestorUserId).OnDelete(DeleteBehavior.Restrict);
            e.HasMany(x => x.Distributions).WithOne(x => x.DividendEntitlement).HasForeignKey(x => x.DividendEntitlementId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<EquityDividendDistributionDeclaration>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Amount).HasPrecision(18, 2);
            e.Property(x => x.Currency).HasMaxLength(10).IsRequired();
            e.Property(x => x.Notes).HasMaxLength(2000);
            e.Property(x => x.Status).HasConversion<string>().HasMaxLength(30).IsRequired();
            e.Property(x => x.DeclaredAt).HasDefaultValueSql("SYSUTCDATETIME()");
            e.HasIndex(x => new { x.DividendDeclarationId, x.DividendEntitlementId });
            e.HasOne(x => x.DividendDeclaration).WithMany(x => x.Distributions).HasForeignKey(x => x.DividendDeclarationId).OnDelete(DeleteBehavior.Cascade);
            e.HasOne(x => x.DividendEntitlement).WithMany(x => x.Distributions).HasForeignKey(x => x.DividendEntitlementId).OnDelete(DeleteBehavior.Restrict);
            e.HasOne(x => x.DeclaredByUser).WithMany().HasForeignKey(x => x.DeclaredByUserId).OnDelete(DeleteBehavior.Restrict);
            e.HasMany(x => x.Confirmations).WithOne(x => x.DistributionDeclaration).HasForeignKey(x => x.DistributionDeclarationId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<EquityDividendDistributionConfirmation>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Reason).HasMaxLength(2000);
            e.Property(x => x.ConfirmedAt).HasDefaultValueSql("SYSUTCDATETIME()");
            e.HasIndex(x => new { x.DistributionDeclarationId, x.ConfirmedByUserId }).IsUnique();
            e.HasOne(x => x.DistributionDeclaration).WithMany(x => x.Confirmations).HasForeignKey(x => x.DistributionDeclarationId).OnDelete(DeleteBehavior.Cascade);
            e.HasOne(x => x.ConfirmedByUser).WithMany().HasForeignKey(x => x.ConfirmedByUserId).OnDelete(DeleteBehavior.Restrict);
        });

        // ===== PHASE 3: TRANSFERS =====

        modelBuilder.Entity<EquityTransfer>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.TransferType).HasConversion<string>().HasMaxLength(30).IsRequired();
            e.Property(x => x.Status).HasConversion<string>().HasMaxLength(30).IsRequired();
            e.Property(x => x.Quantity).HasPrecision(18, 6);
            e.Property(x => x.Reason).HasMaxLength(2000).IsRequired();
            e.Property(x => x.Notes).HasMaxLength(4000);
            e.Property(x => x.ExternalReference).HasMaxLength(200);
            e.Property(x => x.SourceSharesBefore).HasPrecision(18, 6);
            e.Property(x => x.SourceSharesAfter).HasPrecision(18, 6);
            e.Property(x => x.DestinationSharesAfter).HasPrecision(18, 6);
            e.Property(x => x.SourceOwnershipBefore).HasPrecision(9, 6);
            e.Property(x => x.SourceOwnershipAfter).HasPrecision(9, 6);
            e.Property(x => x.DestinationOwnershipAfter).HasPrecision(9, 6);
            e.Property(x => x.CreatedAt).HasDefaultValueSql("SYSUTCDATETIME()");
            e.Property(x => x.RowVersion).IsRowVersion();
            e.HasIndex(x => new { x.ProjectId, x.Status, x.EffectiveDate });
            e.HasIndex(x => new { x.OpportunityId, x.Status });
            e.HasIndex(x => new { x.SourcePositionId, x.Status });
            e.HasIndex(x => new { x.DestinationInvestorUserId, x.Status });
            e.HasOne(x => x.Project).WithMany().HasForeignKey(x => x.ProjectId).OnDelete(DeleteBehavior.Restrict);
            e.HasOne(x => x.Opportunity).WithMany().HasForeignKey(x => x.OpportunityId).OnDelete(DeleteBehavior.Restrict);
            e.HasOne(x => x.SourcePosition).WithMany().HasForeignKey(x => x.SourcePositionId).OnDelete(DeleteBehavior.Restrict);
            e.HasOne(x => x.DestinationPosition).WithMany().HasForeignKey(x => x.DestinationPositionId).OnDelete(DeleteBehavior.Restrict).IsRequired(false);
            e.HasOne(x => x.SourceInvestor).WithMany().HasForeignKey(x => x.SourceInvestorUserId).OnDelete(DeleteBehavior.Restrict);
            e.HasOne(x => x.DestinationInvestor).WithMany().HasForeignKey(x => x.DestinationInvestorUserId).OnDelete(DeleteBehavior.Restrict).IsRequired(false);
        });

        // ===== PHASE 3: CLOSURE =====

        modelBuilder.Entity<EquityClosureSnapshot>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.InitialOwnershipPercentage).HasPrecision(9, 6);
            e.Property(x => x.FinalOwnershipPercentage).HasPrecision(9, 6);
            e.Property(x => x.InitialInvestorShares).HasPrecision(18, 6);
            e.Property(x => x.FinalInvestorShares).HasPrecision(18, 6);
            e.Property(x => x.TotalIssuedSharesAtClosure).HasPrecision(18, 6);
            e.Property(x => x.TotalDistributionsConfirmed).HasPrecision(18, 2);
            e.Property(x => x.ClosureReason).HasMaxLength(2000).IsRequired();
            e.Property(x => x.SnapshotHash).HasMaxLength(128);
            e.Property(x => x.ClosedAt).HasDefaultValueSql("SYSUTCDATETIME()");
            e.HasIndex(x => new { x.EquityPositionId, x.ClosedAt }).IsUnique();
            e.HasIndex(x => new { x.InvestorUserId, x.ProjectId });
            e.HasOne(x => x.EquityPosition).WithMany().HasForeignKey(x => x.EquityPositionId).OnDelete(DeleteBehavior.Restrict);
            e.HasOne(x => x.ClosedByUser).WithMany().HasForeignKey(x => x.ClosedByUserId).OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Country>(c =>
        {
            c.HasKey(x => x.Id);
            c.Property(x => x.Code).HasMaxLength(80).IsRequired();
            c.Property(x => x.IsoAlpha2).HasMaxLength(2).IsRequired();
            c.Property(x => x.IsoAlpha3).HasMaxLength(3);
            c.Property(x => x.NameEn).HasMaxLength(120).IsRequired();
            c.Property(x => x.NameAr).HasMaxLength(120).IsRequired();
            c.Property(x => x.PhoneCode).HasMaxLength(20);
            c.Property(x => x.IsActive).HasDefaultValue(true);
            c.Property(x => x.SortOrder).HasDefaultValue(0);
            c.Property(x => x.CreatedAt).HasDefaultValueSql("SYSUTCDATETIME()");
            c.Property(x => x.UpdatedAt).HasDefaultValueSql("SYSUTCDATETIME()");
            c.HasIndex(x => x.Code).IsUnique();
            c.HasIndex(x => x.IsoAlpha2).IsUnique();
            c.HasIndex(x => new { x.IsActive, x.SortOrder });
            var countrySeedDate = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc);
            c.HasData(
                new Country { Id = 1, Code = "EGYPT", IsoAlpha2 = "EG", IsoAlpha3 = "EGY", NameEn = "Egypt", NameAr = "مصر", PhoneCode = "+20", SortOrder = 10, IsActive = true, CreatedAt = countrySeedDate, UpdatedAt = countrySeedDate },
                new Country { Id = 2, Code = "SAUDIARABIA", IsoAlpha2 = "SA", IsoAlpha3 = "SAU", NameEn = "Saudi Arabia", NameAr = "المملكة العربية السعودية", PhoneCode = "+966", SortOrder = 20, IsActive = true, CreatedAt = countrySeedDate, UpdatedAt = countrySeedDate },
                new Country { Id = 3, Code = "UNITEDARABEMIRATES", IsoAlpha2 = "AE", IsoAlpha3 = "ARE", NameEn = "United Arab Emirates", NameAr = "الإمارات العربية المتحدة", PhoneCode = "+971", SortOrder = 30, IsActive = true, CreatedAt = countrySeedDate, UpdatedAt = countrySeedDate },
                new Country { Id = 4, Code = "JORDAN", IsoAlpha2 = "JO", IsoAlpha3 = "JOR", NameEn = "Jordan", NameAr = "الأردن", PhoneCode = "+962", SortOrder = 40, IsActive = true, CreatedAt = countrySeedDate, UpdatedAt = countrySeedDate },
                new Country { Id = 5, Code = "LEBANON", IsoAlpha2 = "LB", IsoAlpha3 = "LBN", NameEn = "Lebanon", NameAr = "لبنان", PhoneCode = "+961", SortOrder = 50, IsActive = true, CreatedAt = countrySeedDate, UpdatedAt = countrySeedDate },
                new Country { Id = 6, Code = "UNITEDSTATES", IsoAlpha2 = "US", IsoAlpha3 = "USA", NameEn = "United States", NameAr = "الولايات المتحدة", PhoneCode = "+1", SortOrder = 60, IsActive = true, CreatedAt = countrySeedDate, UpdatedAt = countrySeedDate },
                new Country { Id = 7, Code = "UNITEDKINGDOM", IsoAlpha2 = "GB", IsoAlpha3 = "GBR", NameEn = "United Kingdom", NameAr = "المملكة المتحدة", PhoneCode = "+44", SortOrder = 70, IsActive = true, CreatedAt = countrySeedDate, UpdatedAt = countrySeedDate },
                new Country { Id = 8, Code = "INDIA", IsoAlpha2 = "IN", IsoAlpha3 = "IND", NameEn = "India", NameAr = "الهند", PhoneCode = "+91", SortOrder = 80, IsActive = true, CreatedAt = countrySeedDate, UpdatedAt = countrySeedDate },
                new Country { Id = 9, Code = "CANADA", IsoAlpha2 = "CA", IsoAlpha3 = "CAN", NameEn = "Canada", NameAr = "كندا", PhoneCode = "+1", SortOrder = 90, IsActive = true, CreatedAt = countrySeedDate, UpdatedAt = countrySeedDate },
                new Country { Id = 10, Code = "AUSTRALIA", IsoAlpha2 = "AU", IsoAlpha3 = "AUS", NameEn = "Australia", NameAr = "أستراليا", PhoneCode = "+61", SortOrder = 100, IsActive = true, CreatedAt = countrySeedDate, UpdatedAt = countrySeedDate },
                new Country { Id = 11, Code = "JAPAN", IsoAlpha2 = "JP", IsoAlpha3 = "JPN", NameEn = "Japan", NameAr = "اليابان", PhoneCode = "+81", SortOrder = 110, IsActive = true, CreatedAt = countrySeedDate, UpdatedAt = countrySeedDate },
                new Country { Id = 12, Code = "GERMANY", IsoAlpha2 = "DE", IsoAlpha3 = "DEU", NameEn = "Germany", NameAr = "ألمانيا", PhoneCode = "+49", SortOrder = 120, IsActive = true, CreatedAt = countrySeedDate, UpdatedAt = countrySeedDate });
        });

        modelBuilder.Entity<InvestmentContract>(c =>
        {
            c.HasKey(x => x.Id);
            c.Property(x => x.ContractNumber).HasMaxLength(80).IsRequired();
            c.Property(x => x.OpportunityTitleSnapshot).HasMaxLength(200).IsRequired();
            c.Property(x => x.FounderNameSnapshot).HasMaxLength(100).IsRequired();
            c.Property(x => x.InvestorNameSnapshot).HasMaxLength(100).IsRequired();
            c.Property(x => x.AcceptedCurrency).HasMaxLength(10).IsRequired();
            c.Property(x => x.AcceptedAmount).HasPrecision(18, 2).IsRequired();
            c.Property(x => x.InvestmentModel).HasConversion<string>().HasMaxLength(50).IsRequired();
            c.Property(x => x.Status).HasConversion<string>().HasMaxLength(30).IsRequired();
            c.Property(x => x.CreatedAt).HasDefaultValueSql("SYSUTCDATETIME()");
            c.Property(x => x.UpdatedAt).HasDefaultValueSql("SYSUTCDATETIME()");
            c.HasIndex(x => x.ContractNumber).IsUnique();
            c.HasIndex(x => new { x.OpportunityId, x.FounderUserId, x.InvestorUserId, x.InvestmentModel });
            c.HasIndex(x => x.AcceptedOfferId).IsUnique().HasFilter("[AcceptedOfferId] IS NOT NULL");
            c.HasIndex(x => x.ParticipationRequestId).IsUnique().HasFilter("[ParticipationRequestId] IS NOT NULL");
            c.HasOne(x => x.Opportunity).WithMany().HasForeignKey(x => x.OpportunityId).OnDelete(DeleteBehavior.Restrict);
            c.HasOne(x => x.AcceptedOffer).WithMany().HasForeignKey(x => x.AcceptedOfferId).OnDelete(DeleteBehavior.Restrict).IsRequired(false);
            c.HasOne(x => x.ParticipationRequest).WithMany().HasForeignKey(x => x.ParticipationRequestId).OnDelete(DeleteBehavior.Restrict).IsRequired(false);
            c.HasOne(x => x.FounderUser).WithMany().HasForeignKey(x => x.FounderUserId).OnDelete(DeleteBehavior.Restrict);
            c.HasOne(x => x.InvestorUser).WithMany().HasForeignKey(x => x.InvestorUserId).OnDelete(DeleteBehavior.Restrict);
            c.HasMany(x => x.Versions).WithOne(x => x.Contract).HasForeignKey(x => x.ContractId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<InvestmentContractVersion>(v =>
        {
            v.HasKey(x => x.Id);
            v.Property(x => x.VersionType).HasConversion<string>().HasMaxLength(50).IsRequired();
            v.Property(x => x.Status).HasConversion<string>().HasMaxLength(30).IsRequired();
            v.Property(x => x.TermsSnapshotJson).HasColumnType("nvarchar(max)").IsRequired();
            v.Property(x => x.PreviousTermsSnapshotJson).HasColumnType("nvarchar(max)");
            v.Property(x => x.ChangesSnapshotJson).HasColumnType("nvarchar(max)");
            v.Property(x => x.DocumentUrl).HasMaxLength(1000);
            v.Property(x => x.DocumentHash).HasMaxLength(64).IsRequired();
            v.Property(x => x.DocumentContent).HasColumnType("nvarchar(max)").IsRequired();
            v.Property(x => x.PdfDocumentUrl).HasMaxLength(1000);
            v.Property(x => x.PdfDocumentHash).HasMaxLength(64);
            v.Property(x => x.PdfGenerationStatus).HasConversion<string>().HasMaxLength(30).HasDefaultValue(PdfGenerationStatus.NotGenerated).IsRequired();
            v.Property(x => x.PdfGenerationError).HasMaxLength(1000);
            v.Property(x => x.PdfMimeType).HasMaxLength(100).HasDefaultValue("application/pdf").IsRequired();
            v.Property(x => x.PdfRendererVersion).HasMaxLength(50).HasDefaultValue("playwright-chromium-v1").IsRequired();
            v.Property(x => x.RowVersion).IsRowVersion();
            v.Property(x => x.CreatedAt).HasDefaultValueSql("SYSUTCDATETIME()");
            v.HasIndex(x => new { x.ContractId, x.VersionNumber }).IsUnique();
            v.HasIndex(x => x.SourceParticipationRequestId).IsUnique();
            v.HasIndex(x => x.ContractId).IsUnique().HasFilter("[Status] = 'Active'");
            v.HasOne(x => x.PreviousVersion).WithMany().HasForeignKey(x => x.PreviousVersionId).OnDelete(DeleteBehavior.Restrict);
            v.HasOne(x => x.SourceParticipationRequest).WithMany().HasForeignKey(x => x.SourceParticipationRequestId).OnDelete(DeleteBehavior.Restrict);
            v.HasOne(x => x.SourceNegotiationOffer).WithMany().HasForeignKey(x => x.SourceNegotiationOfferId).OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<ContractEvent>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.EventType).HasConversion<string>().HasMaxLength(30).IsRequired();
            e.Property(x => x.Description).HasMaxLength(500).IsRequired();
            e.Property(x => x.MetadataJson).HasColumnType("nvarchar(max)");
            e.Property(x => x.CreatedAt).HasDefaultValueSql("SYSUTCDATETIME()");
            e.HasIndex(x => new { x.ContractVersionId, x.CreatedAt });
            e.HasOne(x => x.ContractVersion).WithMany(x => x.Events).HasForeignKey(x => x.ContractVersionId).OnDelete(DeleteBehavior.Cascade);
            e.HasOne(x => x.PerformedByUser).WithMany().HasForeignKey(x => x.PerformedByUserId).OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<ProjectCategory>(c =>
        {
            c.HasKey(x => x.Id);
            c.Property(x => x.Code).HasMaxLength(80).IsRequired();
            c.Property(x => x.NameEn).HasMaxLength(120).IsRequired();
            c.Property(x => x.NameAr).HasMaxLength(120).IsRequired();
            c.Property(x => x.DescriptionEn).HasMaxLength(500);
            c.Property(x => x.DescriptionAr).HasMaxLength(500);
            c.Property(x => x.IsActive).HasDefaultValue(true);
            c.Property(x => x.SortOrder).HasDefaultValue(0);
            c.Property(x => x.CreatedAt).HasDefaultValueSql("SYSUTCDATETIME()");
            c.Property(x => x.UpdatedAt).HasDefaultValueSql("SYSUTCDATETIME()");
            c.HasIndex(x => x.Code).IsUnique();
            c.HasIndex(x => new { x.IsActive, x.SortOrder });
        });

        modelBuilder.Entity<OpportunityTag>(t =>
        {
            t.HasKey(x => x.Id);
            t.Property(x => x.Code).HasMaxLength(80).IsRequired();
            t.Property(x => x.NameEn).HasMaxLength(120).IsRequired();
            t.Property(x => x.NameAr).HasMaxLength(120).IsRequired();
            t.Property(x => x.DescriptionEn).HasMaxLength(500);
            t.Property(x => x.DescriptionAr).HasMaxLength(500);
            t.Property(x => x.IsActive).HasDefaultValue(true);
            t.Property(x => x.SortOrder).HasDefaultValue(0);
            t.Property(x => x.CreatedAt).HasDefaultValueSql("SYSUTCDATETIME()");
            t.Property(x => x.UpdatedAt).HasDefaultValueSql("SYSUTCDATETIME()");
            t.HasIndex(x => x.Code).IsUnique();
            t.HasIndex(x => new { x.IsActive, x.SortOrder });
        });

        modelBuilder.Entity<FundingGoal>(g =>
        {
            g.HasKey(x => x.Id);
            g.Property(x => x.Code).HasMaxLength(80).IsRequired();
            g.Property(x => x.NameEn).HasMaxLength(120).IsRequired();
            g.Property(x => x.NameAr).HasMaxLength(120).IsRequired();
            g.Property(x => x.DescriptionEn).HasMaxLength(500);
            g.Property(x => x.DescriptionAr).HasMaxLength(500);
            g.Property(x => x.IsActive).HasDefaultValue(true);
            g.Property(x => x.SortOrder).HasDefaultValue(0);
            g.Property(x => x.CreatedAt).HasDefaultValueSql("SYSUTCDATETIME()");
            g.Property(x => x.UpdatedAt).HasDefaultValueSql("SYSUTCDATETIME()");
            g.HasIndex(x => x.Code).IsUnique();
            g.HasIndex(x => new { x.IsActive, x.SortOrder });
        });

        modelBuilder.Entity<RiskLevel>(r =>
        {
            r.HasKey(x => x.Id);
            r.Property(x => x.Code).HasMaxLength(80).IsRequired();
            r.Property(x => x.NameEn).HasMaxLength(120).IsRequired();
            r.Property(x => x.NameAr).HasMaxLength(120).IsRequired();
            r.Property(x => x.DescriptionEn).HasMaxLength(500);
            r.Property(x => x.DescriptionAr).HasMaxLength(500);
            r.Property(x => x.IsActive).HasDefaultValue(true);
            r.Property(x => x.SortOrder).HasDefaultValue(0);
            r.Property(x => x.CreatedAt).HasDefaultValueSql("SYSUTCDATETIME()");
            r.Property(x => x.UpdatedAt).HasDefaultValueSql("SYSUTCDATETIME()");
            r.HasIndex(x => x.Code).IsUnique();
            r.HasIndex(x => new { x.IsActive, x.SortOrder });
        });

        modelBuilder.Entity<OpportunityTagAssignment>(ot =>
        {
            ot.HasKey(x => new { x.OpportunityId, x.OpportunityTagId });
            ot.HasOne(x => x.Opportunity)
              .WithMany(x => x.OpportunityTags)
              .HasForeignKey(x => x.OpportunityId)
              .OnDelete(DeleteBehavior.Cascade);
            ot.HasOne(x => x.OpportunityTag)
              .WithMany(x => x.OpportunityTags)
              .HasForeignKey(x => x.OpportunityTagId)
              .OnDelete(DeleteBehavior.Cascade);
            ot.HasIndex(x => x.OpportunityTagId);
        });

        modelBuilder.Entity<OpportunityMedia>(m =>
        {
            m.HasKey(x => x.Id);
            m.Property(x => x.FileKey).HasMaxLength(500).IsRequired();
            m.Property(x => x.FileId).HasMaxLength(100);
            m.Property(x => x.FileUrl).HasMaxLength(1000);
            m.Property(x => x.FileName).HasMaxLength(255).IsRequired();
            m.Property(x => x.FileType).HasMaxLength(100).IsRequired();
            m.Property(x => x.MimeType).HasMaxLength(150);
            m.Property(x => x.FileSize);
            m.Property(x => x.PreviewUrl).HasMaxLength(1000);
            m.Property(x => x.ThumbnailUrl).HasMaxLength(1000);
            m.Property(x => x.MediaType).HasMaxLength(50).IsRequired();
            m.Property(x => x.IsCover).HasDefaultValue(false);
            m.Property(x => x.IsPublic).HasDefaultValue(false);
            m.Property(x => x.Purpose).HasConversion<string>().HasMaxLength(40).HasDefaultValue(OpportunityFilePurpose.General).IsRequired();
            m.Property(x => x.SortOrder).HasDefaultValue(0);
            m.Property(x => x.CreatedAt).HasDefaultValueSql("SYSUTCDATETIME()");
            m.Property(x => x.ScanStatus).HasConversion<string>().HasMaxLength(20).HasDefaultValue(Domain.Entities.Enums.FileScanStatus.Pending).IsRequired();
            m.Property(x => x.ScanCompletedAt);
            m.HasIndex(x => x.OpportunityId);
            m.HasIndex(x => new { x.OpportunityId, x.SortOrder });
            m.HasIndex(x => x.FileId);
            m.HasIndex(x => x.FileKey);
        });

        modelBuilder.Entity<OpportunityDocument>(d =>
        {
            d.HasKey(x => x.Id);
            d.Property(x => x.FileKey).HasMaxLength(500).IsRequired();
            d.Property(x => x.FileId).HasMaxLength(100);
            d.Property(x => x.FileUrl).HasMaxLength(1000);
            d.Property(x => x.FileName).HasMaxLength(255).IsRequired();
            d.Property(x => x.FileExtension).HasMaxLength(20).IsRequired();
            d.Property(x => x.MimeType).HasMaxLength(150);
            d.Property(x => x.FileSize);
            d.Property(x => x.PreviewUrl).HasMaxLength(1000);
            d.Property(x => x.ThumbnailUrl).HasMaxLength(1000);
            d.Property(x => x.DocumentType).HasMaxLength(100).IsRequired();
            d.Property(x => x.Visibility).HasConversion<string>().HasMaxLength(20).IsRequired();
            d.Property(x => x.Purpose).HasConversion<string>().HasMaxLength(40).HasDefaultValue(OpportunityFilePurpose.General).IsRequired();
            d.Property(x => x.Category).HasMaxLength(100);
            d.Property(x => x.SearchTags).HasMaxLength(1000);
            d.Property(x => x.CreatedAt).HasDefaultValueSql("SYSUTCDATETIME()");
            d.Property(x => x.ScanStatus).HasConversion<string>().HasMaxLength(20).HasDefaultValue(Domain.Entities.Enums.FileScanStatus.Pending).IsRequired();
            d.Property(x => x.ScanCompletedAt);
            d.HasIndex(x => x.OpportunityId);
            d.HasIndex(x => new { x.OpportunityId, x.Visibility });
            d.HasIndex(x => x.Category);
            d.HasIndex(x => x.FileId);
            d.HasIndex(x => x.FileKey);
        });

        modelBuilder.Entity<OpportunityEvent>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.EventType).HasMaxLength(100).IsRequired();
            e.Property(x => x.Title).HasMaxLength(200).IsRequired();
            e.Property(x => x.Description).HasMaxLength(4000);
            e.Property(x => x.OldValue).HasMaxLength(4000);
            e.Property(x => x.NewValue).HasMaxLength(4000);
            e.Property(x => x.CreatedByUserId).IsRequired();
            e.Property(x => x.CreatedAt).HasDefaultValueSql("SYSUTCDATETIME()");
            e.Property(x => x.IsPublic).HasDefaultValue(false);
            e.Property(x => x.ActorType).HasMaxLength(30);
            e.Property(x => x.RelatedEntityType).HasMaxLength(100);
            e.Property(x => x.RelatedEntityId).HasMaxLength(100);
            e.Property(x => x.LocalizedMetadataJson).HasMaxLength(2000);
            e.Property(x => x.IdempotencyKey).HasMaxLength(200);
            e.Property(x => x.IsImmutableTimelineEntry).HasDefaultValue(false);
            e.HasIndex(x => x.OpportunityId);
            e.HasIndex(x => new { x.OpportunityId, x.CreatedAt });
            e.HasIndex(x => new { x.OpportunityId, x.IsPublic });
            e.HasIndex(x => x.IdempotencyKey).IsUnique().HasFilter("[IdempotencyKey] IS NOT NULL");
            e.HasOne<AuthUser>()
             .WithMany()
             .HasForeignKey(x => x.CreatedByUserId)
             .OnDelete(DeleteBehavior.Restrict);
        });
        // Conversation mapping (Status + Category support)

        modelBuilder.Entity<Investa.Domain.Entities.Chat.Conversation>(c =>

        {

            c.HasKey(x => x.Id);

            c.Property(x => x.UserMobile).HasMaxLength(50).IsRequired();

            c.Property(x => x.AdminEmail).HasMaxLength(256).IsRequired(false);

            c.Property(x => x.Category).HasMaxLength(200).IsRequired(false);

            c.Property(x => x.CreatedAt).HasDefaultValueSql("GETDATE()");

            c.Property(x => x.IsActive).HasDefaultValue(true);

            c.Property(x => x.Category).HasMaxLength(100).IsRequired(false);

            c.Property(x => x.Status).HasConversion<string>().HasDefaultValue(Investa.Domain.Entities.Enums.ConversationStatus.Pending);

        });



        // RefreshToken mapping

        modelBuilder.Entity<RefreshToken>(rt =>

        {

            rt.HasKey(r => r.Id);

            rt.Property(r => r.Token).HasMaxLength(512).IsRequired();

            rt.Property(r => r.ExpiresAt).IsRequired();

            rt.Property(r => r.Revoked).HasDefaultValue(false);

            rt.Property(r => r.CreatedAt).HasDefaultValueSql("GETDATE()");

            rt.HasOne(r => r.AuthUser)

              .WithMany()

              .HasForeignKey(r => r.AuthUserId)

              .OnDelete(DeleteBehavior.Cascade);

            rt.HasIndex(r => r.Token).IsUnique();

        });



        // Client mapping - one-to-one with AuthUser

        modelBuilder.Entity<Client>(cb =>

        {

            cb.HasKey(c => c.Id);

            cb.Property(c => c.FirstName).HasMaxLength(100);

            cb.Property(c => c.LastName).HasMaxLength(100);

            cb.Property(c => c.Gender).HasMaxLength(20);

            cb.Property(c => c.PersonalImageUrl).HasMaxLength(500);

            cb.Property(c => c.MobileNumber).HasMaxLength(20);

            cb.Property(c => c.Phone).HasMaxLength(20);

                cb.Property(c => c.Country).HasMaxLength(100);

                cb.Property(c => c.City).HasMaxLength(100);

                cb.Property(c => c.District).HasMaxLength(100);

                cb.Property(c => c.Address1).HasMaxLength(500);

                cb.Property(c => c.Address2).HasMaxLength(500);

            cb.Property(c => c.NationalId).HasMaxLength(50);

            cb.Property(c => c.NationalIdImageUrl).HasMaxLength(500);

            cb.Property(c => c.WebsiteUrl).HasMaxLength(500);

            cb.Property(c => c.LinkedInUrl).HasMaxLength(250);

            cb.Property(c => c.FacebookUrl).HasMaxLength(250);

            cb.Property(c => c.BusinessRole).HasMaxLength(200);

            cb.Property(c => c.Score).HasPrecision(5, 2).HasDefaultValue(0m);

            cb.Property(c => c.Credit).HasPrecision(18, 2).HasDefaultValue(0m);

            cb.Property(c => c.CreatedAt).HasDefaultValueSql("GETDATE()");

            cb.Property(c => c.UpdatedAt).HasDefaultValueSql("GETDATE()");



            cb.HasOne(c => c.User)

              .WithOne(u => u.Client)

              .HasForeignKey<Client>(c => c.UserId)

              .OnDelete(DeleteBehavior.Cascade);

            cb.HasIndex(c => c.UserId).IsUnique();

            cb.HasIndex(c => c.MobileNumber);

            cb.HasIndex(c => c.Phone);

                        cb.HasIndex(c => c.Email).IsUnique(false);

        });



                    // InvestmentRequest mapping

                    modelBuilder.Entity<InvestmentRequest>(ir =>

                    {

                        ir.HasKey(x => x.Id);

                        ir.Property(x => x.Amount).HasPrecision(18, 2).IsRequired();

                        ir.Property(x => x.Status).HasConversion<string>().HasMaxLength(20).IsRequired();

                        ir.Property(x => x.Direction).HasConversion<string>().HasMaxLength(20).IsRequired();

                        ir.Property(x => x.CreatedAt).HasDefaultValueSql("GETDATE()");

                        ir.Property(x => x.UpdatedAt).IsRequired(false);



                        // RequestMetadata JSON payload for request forms

                        ir.Property(x => x.RequestMetadata).HasColumnType("nvarchar(max)").IsRequired(false);



                        // RequestType logical kind

                        ir.Property(x => x.RequestType).HasColumnType("nvarchar(max)").IsRequired(false);



                        ir.HasIndex(x => x.InvestmentId);

                        ir.HasIndex(x => x.InvestorId);

                        ir.HasIndex(x => x.FounderId);

                    });



        // ClientStatusHistory mapping

        modelBuilder.Entity<ClientStatusHistory>(h =>

        {

            h.HasKey(x => x.Id);

            h.Property(x => x.Reason).HasMaxLength(1000);

            h.Property(x => x.ChangedAt).HasDefaultValueSql("GETDATE()");



            h.HasOne(x => x.Client)

             .WithMany()

             .HasForeignKey(x => x.ClientId)

             .OnDelete(DeleteBehavior.Cascade);

        });



        // ProfileChangeAudit mapping

        modelBuilder.Entity<ProfileChangeAudit>(a =>

        {

            a.HasKey(x => x.Id);

            a.Property(x => x.UserId).IsRequired();

            a.Property(x => x.FieldName).HasMaxLength(100).IsRequired();

            a.Property(x => x.OldValue).HasMaxLength(500);

            a.Property(x => x.NewValue).HasMaxLength(500);

            a.Property(x => x.Reason).HasMaxLength(500);

            a.Property(x => x.ChangedBy);

            a.Property(x => x.CreatedAt).HasDefaultValueSql("GETDATE()");



            a.HasIndex(x => x.UserId);

            a.ToTable("ProfileChangeAudits");

        });



        // Groups & Permissions mapping

        modelBuilder.Entity<Group>(g =>

        {

            g.HasKey(x => x.Id);

            g.Property(x => x.Name).HasMaxLength(200).IsRequired();

            g.Property(x => x.Description).HasMaxLength(1000).IsRequired(false);

            g.Property(x => x.CreatedAt).HasDefaultValueSql("GETDATE()");

            g.Property(x => x.MetadataJson).HasColumnType("nvarchar(max)").IsRequired(false);

            g.HasIndex(x => x.Name).IsUnique();

        });



        modelBuilder.Entity<Permission>(p =>

        {

            p.HasKey(x => x.Id);

            p.Property(x => x.Key).HasMaxLength(200).IsRequired();

            p.Property(x => x.Name).HasMaxLength(200).IsRequired();

            p.Property(x => x.Description).HasMaxLength(1000).IsRequired(false);

            p.Property(x => x.CreatedAt).HasDefaultValueSql("GETDATE()");

            p.HasIndex(x => x.Key).IsUnique();

        });



        modelBuilder.Entity<GroupPermission>(gp =>

        {

            gp.HasKey(x => x.Id);

            gp.HasIndex(x => new { x.GroupId, x.PermissionId }).IsUnique();

            gp.HasOne(x => x.Group).WithMany(g => g.GroupPermissions).HasForeignKey(x => x.GroupId).OnDelete(DeleteBehavior.Cascade);

            gp.HasOne(x => x.Permission).WithMany(p => p.GroupPermissions).HasForeignKey(x => x.PermissionId).OnDelete(DeleteBehavior.Cascade);

        });



        modelBuilder.Entity<UserGroup>(ug =>

        {

            ug.HasKey(x => x.Id);

            ug.Property(x => x.AssignedAt).HasDefaultValueSql("GETDATE()");

            ug.HasOne(x => x.Group).WithMany(g => g.UserGroups).HasForeignKey(x => x.GroupId).OnDelete(DeleteBehavior.Cascade);

            ug.HasOne(x => x.User).WithMany(u => u.UserGroups).HasForeignKey(x => x.UserId).OnDelete(DeleteBehavior.Cascade);

            ug.HasIndex(x => new { x.UserId, x.GroupId }).IsUnique();

        });



        // Role configuration (Group-Bound Role Architecture)

        modelBuilder.HasSequence<long>("RoleCodeSequence");

        modelBuilder.Entity<Investa.Domain.Entities.Security.Role>(r =>

        {

            r.HasKey(x => x.Id);

            r.Property(x => x.RoleNumber)
             .HasDefaultValueSql("NEXT VALUE FOR [RoleCodeSequence]")
             .ValueGeneratedOnAdd();

            r.Property(x => x.RoleCode)
             .HasMaxLength(32)
             .HasComputedColumnSql("'ROL-' + CASE WHEN LEN(CONVERT(varchar(20), [RoleNumber])) < 6 THEN REPLICATE('0', 6 - LEN(CONVERT(varchar(20), [RoleNumber]))) ELSE '' END + CONVERT(varchar(20), [RoleNumber])", stored: true);

            r.Property(x => x.NameEn).HasMaxLength(256).IsRequired();
            r.Property(x => x.NameAr).HasMaxLength(256).IsRequired();
            r.Property(x => x.DescriptionEn).HasMaxLength(500);
            r.Property(x => x.DescriptionAr).HasMaxLength(500);

            r.Property(x => x.Name).HasMaxLength(256).IsRequired();

            r.Property(x => x.NormalizedName).HasMaxLength(256).IsRequired();

            r.Property(x => x.Description).HasMaxLength(500);

            r.Property(x => x.CreatedAt).HasDefaultValueSql("GETDATE()");

            r.HasIndex(x => x.NormalizedName).IsUnique();

            r.HasIndex(x => x.RoleCode).IsUnique();

            r.HasIndex(x => new { x.GroupId, x.Name }).IsUnique(); // Unique role name per group



            // MANDATORY: Every role must belong to a group

            r.HasOne(x => x.Group)

             .WithMany(g => g.Roles)

             .HasForeignKey(x => x.GroupId)

             .OnDelete(DeleteBehavior.Restrict)

             .IsRequired();

        });



        // UserRole configuration — UserId now points to AuthUsers (master user table)

        modelBuilder.Entity<Investa.Domain.Entities.Security.UserRole>(ur =>

        {

            ur.HasKey(x => x.Id);

            ur.Property(x => x.AssignedAt).HasDefaultValueSql("GETDATE()");

            ur.HasIndex(x => new { x.UserId, x.RoleId }).IsUnique();



            ur.HasOne(x => x.User)

              .WithMany(u => u.UserRoles)

              .HasForeignKey(x => x.UserId)

              .OnDelete(DeleteBehavior.Cascade)

              .IsRequired();



            ur.HasOne(x => x.Role)

              .WithMany(r => r.UserRoles)

              .HasForeignKey(x => x.RoleId)

              .OnDelete(DeleteBehavior.Cascade)

              .IsRequired();

        });



        // RolePermission configuration

        modelBuilder.Entity<Investa.Domain.Entities.Security.RolePermission>(rp =>

        {

            rp.HasKey(x => x.Id);

            rp.Property(x => x.AssignedAt).HasDefaultValueSql("GETDATE()");

            rp.HasIndex(x => new { x.RoleId, x.PermissionId }).IsUnique();



            rp.HasOne(x => x.Role)

              .WithMany(r => r.RolePermissions)

              .HasForeignKey(x => x.RoleId)

              .OnDelete(DeleteBehavior.Cascade)

              .IsRequired();



            rp.HasOne(x => x.Permission)

              .WithMany(p => p.RolePermissions)

              .HasForeignKey(x => x.PermissionId)

              .OnDelete(DeleteBehavior.Cascade)

              .IsRequired();

        });



        // ApplicationPermission configuration

        modelBuilder.Entity<ApplicationPermission>(ap =>

        {

            ap.HasKey(x => x.Id);

            ap.Property(x => x.Key).IsRequired().HasMaxLength(100);

            ap.HasIndex(x => x.Key).IsUnique();

            ap.Property(x => x.Name).IsRequired().HasMaxLength(200);

            ap.Property(x => x.ResourceType).IsRequired().HasMaxLength(100);

            ap.Property(x => x.Action).IsRequired().HasMaxLength(50);

            ap.HasIndex(x => new { x.ResourceType, x.Action });

            ap.HasIndex(x => x.TenantId);



            // Self-referencing for hierarchical permissions

            ap.HasOne(x => x.ParentPermission)

                .WithMany(x => x.ChildPermissions)

                .HasForeignKey(x => x.ParentPermissionId)

                .OnDelete(DeleteBehavior.Restrict);

        });



        // UserSession configuration

        modelBuilder.Entity<UserSession>(us =>

        {

            us.HasKey(x => x.Id);

            us.HasIndex(x => x.UserId);

            us.HasIndex(x => x.RefreshTokenHash).IsUnique();

            us.HasIndex(x => new { x.UserId, x.ExpiresAt });

            us.Property(x => x.RefreshTokenHash).IsRequired().HasMaxLength(128);

            us.Property(x => x.IpAddress).IsRequired().HasMaxLength(45); // IPv6 support

            us.Property(x => x.DeviceFingerprint).HasMaxLength(256);

            us.Property(x => x.UserAgent).HasMaxLength(512);

            us.Property(x => x.Location).HasMaxLength(200);



            us.HasOne(x => x.User)

                .WithMany(u => u.UserSessions)

                .HasForeignKey(x => x.UserId)

                .OnDelete(DeleteBehavior.Cascade);

        });



        // AuditLog configuration

        modelBuilder.Entity<AuditLog>(al =>

        {

            al.HasKey(x => x.Id);

            al.HasIndex(x => x.UserId);

            al.HasIndex(x => x.EntityType);

            al.HasIndex(x => new { x.EntityType, x.EntityId });

            al.HasIndex(x => x.Timestamp);

            al.HasIndex(x => x.TenantId);

            al.Property(x => x.EntityType).IsRequired().HasMaxLength(100);

            al.Property(x => x.EntityId).IsRequired().HasMaxLength(100);

            al.Property(x => x.Action).IsRequired().HasMaxLength(50);

            al.Property(x => x.IpAddress).HasMaxLength(45);

            al.Property(x => x.UserAgent).HasMaxLength(512);

        });

        // PendingAdminChange configuration

        modelBuilder.Entity<PendingAdminChange>(pac =>

        {

            pac.HasKey(x => x.Id);

            pac.Property(x => x.TargetUserName).HasMaxLength(200);
            pac.Property(x => x.MakerName).HasMaxLength(200);
            pac.Property(x => x.CheckerName).HasMaxLength(200);
            pac.Property(x => x.Action).HasConversion<string>().HasMaxLength(50).IsRequired();
            pac.Property(x => x.Status).HasConversion<string>().HasMaxLength(20).IsRequired();
            pac.Property(x => x.Description).HasMaxLength(500);
            pac.Property(x => x.ReviewDecision).HasMaxLength(20);
            pac.Property(x => x.ReviewReason).HasMaxLength(500);
            pac.Property(x => x.IpAddress).HasMaxLength(45);

            pac.HasIndex(x => x.TargetUserId);
            pac.HasIndex(x => x.MakerId);
            pac.HasIndex(x => x.CheckerId);
            pac.HasIndex(x => x.Status);
            pac.HasIndex(x => new { x.Status, x.SubmittedAt });
            pac.HasIndex(x => new { x.MakerId, x.Status });
        });



                // Client <-> ProjectCategory many-to-many

                modelBuilder.Entity<ClientProjectCategory>(j =>

                {

                        j.HasKey(x => new { x.ClientId, x.ProjectCategoryId });

                        j.HasOne(x => x.Client).WithMany(c => c.ClientProjectCategories).HasForeignKey(x => x.ClientId).OnDelete(DeleteBehavior.Cascade);

                        j.HasOne(x => x.ProjectCategory).WithMany(bc => bc.ClientProjectCategories).HasForeignKey(x => x.ProjectCategoryId).OnDelete(DeleteBehavior.Restrict);

                });

        // Employee table dropped — staff are AuthUser records with UserType = OrgUser



        // Relationships

        modelBuilder.Entity<Investment>()

            .HasOne(i => i.Founder)

            .WithMany(u => u.Investments)

            .HasForeignKey(i => i.FounderId)

            .OnDelete(DeleteBehavior.Restrict);



        modelBuilder.Entity<Transaction>()

            .HasOne(t => t.Wallet)

            .WithMany(u => u.Transactions)

            .HasForeignKey(t => t.WalletId)

            .OnDelete(DeleteBehavior.Restrict);



        // Lookup entity

        modelBuilder.Entity<Lookup>()

            .Property(l => l.Type)

            .HasConversion<int>();



        // Seed Reputation rules (system-defined)

        modelBuilder.Entity<ReputationRule>().HasData(
            new ReputationRule { Id = 1, RuleCode = "profile_completed", Description = "Profile completed", Points = 50, IsEnabled = true, IsSystem = true, IsAutomatic = true, CanRepeat = false, MaximumOccurrences = 1, SortOrder = 1, CreatedAt = new DateTime(2025, 12, 29, 0, 0, 0, DateTimeKind.Utc) },
            new ReputationRule { Id = 2, RuleCode = "email_verified", Description = "Email verified", Points = 30, IsEnabled = true, IsSystem = true, IsAutomatic = true, CanRepeat = false, MaximumOccurrences = 1, SortOrder = 2, CreatedAt = new DateTime(2025, 12, 29, 0, 0, 0, DateTimeKind.Utc) },
            new ReputationRule { Id = 3, RuleCode = "phone_verified", Description = "Phone verified", Points = 30, IsEnabled = true, IsSystem = true, IsAutomatic = true, CanRepeat = false, MaximumOccurrences = 1, SortOrder = 3, CreatedAt = new DateTime(2025, 12, 29, 0, 0, 0, DateTimeKind.Utc) },
            new ReputationRule { Id = 4, RuleCode = "company_verified", Description = "Company verified", Points = 100, IsEnabled = true, IsSystem = true, IsAutomatic = true, CanRepeat = false, MaximumOccurrences = 1, SortOrder = 4, CreatedAt = new DateTime(2025, 12, 29, 0, 0, 0, DateTimeKind.Utc) },
            new ReputationRule { Id = 5, RuleCode = "investment_published", Description = "Investment published", Points = 200, IsEnabled = true, IsSystem = true, IsAutomatic = true, CanRepeat = true, MaximumOccurrences = 10, SortOrder = 5, CreatedAt = new DateTime(2025, 12, 29, 0, 0, 0, DateTimeKind.Utc) },
            new ReputationRule { Id = 6, RuleCode = "investment_approved", Description = "Investment approved", Points = 150, IsEnabled = true, IsSystem = true, IsAutomatic = true, CanRepeat = false, MaximumOccurrences = 1, SortOrder = 6, CreatedAt = new DateTime(2025, 12, 29, 0, 0, 0, DateTimeKind.Utc) },
            new ReputationRule { Id = 7, RuleCode = "first_investment", Description = "First investment", Points = 500, IsEnabled = true, IsSystem = true, IsAutomatic = true, CanRepeat = false, MaximumOccurrences = 1, SortOrder = 7, CreatedAt = new DateTime(2025, 12, 29, 0, 0, 0, DateTimeKind.Utc) },
            new ReputationRule { Id = 8, RuleCode = "repeat_investment", Description = "Repeat investment", Points = 200, IsEnabled = true, IsSystem = true, IsAutomatic = true, CanRepeat = true, MaximumOccurrences = 10, SortOrder = 8, CreatedAt = new DateTime(2025, 12, 29, 0, 0, 0, DateTimeKind.Utc) },
            new ReputationRule { Id = 9, RuleCode = "successful_investment", Description = "Successful investment", Points = 300, IsEnabled = true, IsSystem = true, IsAutomatic = true, CanRepeat = false, MaximumOccurrences = 1, SortOrder = 9, CreatedAt = new DateTime(2025, 12, 29, 0, 0, 0, DateTimeKind.Utc) },
            new ReputationRule { Id = 10, RuleCode = "policy_violation", Description = "Policy violation", Points = -500, IsEnabled = true, IsSystem = true, IsAutomatic = false, CanRepeat = false, MaximumOccurrences = 1, SortOrder = 10, CreatedAt = new DateTime(2025, 12, 29, 0, 0, 0, DateTimeKind.Utc) },
            new ReputationRule { Id = 11, RuleCode = "admin_penalty", Description = "Admin penalty", Points = -1000, IsEnabled = true, IsSystem = true, IsAutomatic = false, CanRepeat = false, MaximumOccurrences = 1, SortOrder = 11, CreatedAt = new DateTime(2025, 12, 29, 0, 0, 0, DateTimeKind.Utc) },

            new ReputationRule { Id = 12, RuleCode = "confirm_payment", ActivityCode = "ConfirmPayment", Description = "Payment confirmed by founder", Points = 5, IsEnabled = true, IsSystem = true, IsAutomatic = true, CanRepeat = true, MaximumOccurrences = 0, SortOrder = 12, CreatedAt = new DateTime(2025, 12, 29, 0, 0, 0, DateTimeKind.Utc) }
        );

        // Seed ScoreTransaction types

        modelBuilder.Entity<Lookup>().HasData(

            new Lookup { Id = 200, Type = LookupType.ScoreTransaction, Key = "Review", Value = "Review", ValueAr = "مراجعة", SortOrder = 1 },

            new Lookup { Id = 201, Type = LookupType.ScoreTransaction, Key = "Interactive", Value = "Interactive", ValueAr = "تفاعلي", SortOrder = 2 },

            new Lookup { Id = 202, Type = LookupType.ScoreTransaction, Key = "Deal", Value = "Deal", ValueAr = "صفقة", SortOrder = 3 }

        );



        // Seed categories

        var opportunityLookupSeedDate = new DateTime(2026, 6, 30, 0, 0, 0, DateTimeKind.Utc);
        modelBuilder.Entity<ProjectCategory>().HasData(
            new ProjectCategory { Id = 1, Code = "TECHNOLOGY", NameEn = "Technology", NameAr = "تكنولوجيا", DescriptionEn = "Technology products, platforms, and services.", IsActive = true, SortOrder = 1, CreatedAt = opportunityLookupSeedDate, UpdatedAt = opportunityLookupSeedDate },
            new ProjectCategory { Id = 2, Code = "FOODBEVERAGE", NameEn = "Food & Beverage", NameAr = "الأغذية والمشروبات", DescriptionEn = "Food production, restaurants, cafes, and beverage ventures.", IsActive = true, SortOrder = 2, CreatedAt = opportunityLookupSeedDate, UpdatedAt = opportunityLookupSeedDate },
            new ProjectCategory { Id = 3, Code = "HEALTHCARE", NameEn = "Healthcare", NameAr = "الرعاية الصحية", DescriptionEn = "Healthcare services, clinics, medical products, and wellness.", IsActive = true, SortOrder = 3, CreatedAt = opportunityLookupSeedDate, UpdatedAt = opportunityLookupSeedDate },
            new ProjectCategory { Id = 4, Code = "EDUCATION", NameEn = "Education", NameAr = "التعليم", DescriptionEn = "Education, training, and learning products.", IsActive = true, SortOrder = 4, CreatedAt = opportunityLookupSeedDate, UpdatedAt = opportunityLookupSeedDate },
            new ProjectCategory { Id = 5, Code = "RETAIL", NameEn = "Retail", NameAr = "التجزئة", DescriptionEn = "Retail stores, commerce operations, and consumer goods.", IsActive = true, SortOrder = 5, CreatedAt = opportunityLookupSeedDate, UpdatedAt = opportunityLookupSeedDate },
            new ProjectCategory { Id = 6, Code = "MANUFACTURING", NameEn = "Manufacturing", NameAr = "التصنيع", DescriptionEn = "Manufacturing, production lines, and industrial operations.", IsActive = true, SortOrder = 6, CreatedAt = opportunityLookupSeedDate, UpdatedAt = opportunityLookupSeedDate },
            new ProjectCategory { Id = 7, Code = "AGRICULTURE", NameEn = "Agriculture", NameAr = "الزراعة", DescriptionEn = "Agriculture, farms, food supply, and agri-tech.", IsActive = true, SortOrder = 7, CreatedAt = opportunityLookupSeedDate, UpdatedAt = opportunityLookupSeedDate },
            new ProjectCategory { Id = 8, Code = "REALESTATE", NameEn = "Real Estate", NameAr = "العقارات", DescriptionEn = "Real estate development, operations, and property services.", IsActive = true, SortOrder = 8, CreatedAt = opportunityLookupSeedDate, UpdatedAt = opportunityLookupSeedDate },
            new ProjectCategory { Id = 9, Code = "TOURISM", NameEn = "Tourism", NameAr = "السياحة", DescriptionEn = "Tourism, hospitality, and travel services.", IsActive = true, SortOrder = 9, CreatedAt = opportunityLookupSeedDate, UpdatedAt = opportunityLookupSeedDate },
            new ProjectCategory { Id = 10, Code = "TRANSPORTATION", NameEn = "Transportation", NameAr = "النقل", DescriptionEn = "Transportation, logistics, and mobility.", IsActive = true, SortOrder = 10, CreatedAt = opportunityLookupSeedDate, UpdatedAt = opportunityLookupSeedDate },
            new ProjectCategory { Id = 11, Code = "ENERGY", NameEn = "Energy", NameAr = "الطاقة", DescriptionEn = "Energy generation, services, and sustainability.", IsActive = true, SortOrder = 11, CreatedAt = opportunityLookupSeedDate, UpdatedAt = opportunityLookupSeedDate },
            new ProjectCategory { Id = 12, Code = "FASHION", NameEn = "Fashion", NameAr = "الأزياء", DescriptionEn = "Fashion, apparel, accessories, and design.", IsActive = true, SortOrder = 12, CreatedAt = opportunityLookupSeedDate, UpdatedAt = opportunityLookupSeedDate },
            new ProjectCategory { Id = 13, Code = "MEDIA", NameEn = "Media", NameAr = "الإعلام", DescriptionEn = "Media, content, publishing, and creative production.", IsActive = true, SortOrder = 13, CreatedAt = opportunityLookupSeedDate, UpdatedAt = opportunityLookupSeedDate },
            new ProjectCategory { Id = 14, Code = "GAMING", NameEn = "Gaming", NameAr = "الألعاب", DescriptionEn = "Games, interactive entertainment, and gaming platforms.", IsActive = true, SortOrder = 14, CreatedAt = opportunityLookupSeedDate, UpdatedAt = opportunityLookupSeedDate },
            new ProjectCategory { Id = 15, Code = "FINTECH", NameEn = "FinTech", NameAr = "التقنية المالية", DescriptionEn = "Financial technology, payments, lending, and finance tools.", IsActive = true, SortOrder = 15, CreatedAt = opportunityLookupSeedDate, UpdatedAt = opportunityLookupSeedDate },
            new ProjectCategory { Id = 16, Code = "AI", NameEn = "AI", NameAr = "الذكاء الاصطناعي", DescriptionEn = "Artificial intelligence products, services, and infrastructure.", IsActive = true, SortOrder = 16, CreatedAt = opportunityLookupSeedDate, UpdatedAt = opportunityLookupSeedDate },
            new ProjectCategory { Id = 17, Code = "INDUSTRY", NameEn = "Industry", NameAr = "الصناعة", IsActive = true, SortOrder = 17, CreatedAt = opportunityLookupSeedDate, UpdatedAt = opportunityLookupSeedDate },
            new ProjectCategory { Id = 18, Code = "TRADING", NameEn = "Trading", NameAr = "التجارة", IsActive = true, SortOrder = 18, CreatedAt = opportunityLookupSeedDate, UpdatedAt = opportunityLookupSeedDate }
        );

        modelBuilder.Entity<OpportunityTag>().HasData(
            new OpportunityTag { Id = 1, Code = "AI", NameEn = "AI", NameAr = "الذكاء الاصطناعي", DescriptionEn = "Uses or builds artificial intelligence.", IsActive = true, SortOrder = 1, CreatedAt = opportunityLookupSeedDate, UpdatedAt = opportunityLookupSeedDate },
            new OpportunityTag { Id = 2, Code = "EXPORT", NameEn = "Export", NameAr = "التصدير", DescriptionEn = "Export-oriented business.", IsActive = true, SortOrder = 2, CreatedAt = opportunityLookupSeedDate, UpdatedAt = opportunityLookupSeedDate },
            new OpportunityTag { Id = 3, Code = "GREEN", NameEn = "Green", NameAr = "مشاريع خضراء", DescriptionEn = "Sustainability or environmentally focused.", IsActive = true, SortOrder = 3, CreatedAt = opportunityLookupSeedDate, UpdatedAt = opportunityLookupSeedDate },
            new OpportunityTag { Id = 4, Code = "WOMENLED", NameEn = "Women-led", NameAr = "بقيادة نسائية", DescriptionEn = "Founded or led by women.", IsActive = true, SortOrder = 4, CreatedAt = opportunityLookupSeedDate, UpdatedAt = opportunityLookupSeedDate },
            new OpportunityTag { Id = 5, Code = "FRANCHISE", NameEn = "Franchise", NameAr = "امتياز تجاري", DescriptionEn = "Franchise or franchisable model.", IsActive = true, SortOrder = 5, CreatedAt = opportunityLookupSeedDate, UpdatedAt = opportunityLookupSeedDate },
            new OpportunityTag { Id = 6, Code = "B2B", NameEn = "B2B", NameAr = "أعمال موجهة للشركات", DescriptionEn = "Business-to-business model.", IsActive = true, SortOrder = 6, CreatedAt = opportunityLookupSeedDate, UpdatedAt = opportunityLookupSeedDate },
            new OpportunityTag { Id = 7, Code = "B2C", NameEn = "B2C", NameAr = "أعمال موجهة للمستهلكين", DescriptionEn = "Business-to-consumer model.", IsActive = true, SortOrder = 7, CreatedAt = opportunityLookupSeedDate, UpdatedAt = opportunityLookupSeedDate },
            new OpportunityTag { Id = 8, Code = "SAAS", NameEn = "SaaS", NameAr = "برمجيات كخدمة", DescriptionEn = "Software as a service.", IsActive = true, SortOrder = 8, CreatedAt = opportunityLookupSeedDate, UpdatedAt = opportunityLookupSeedDate },
            new OpportunityTag { Id = 9, Code = "MOBILEAPP", NameEn = "Mobile App", NameAr = "تطبيق جوال", DescriptionEn = "Mobile application product.", IsActive = true, SortOrder = 9, CreatedAt = opportunityLookupSeedDate, UpdatedAt = opportunityLookupSeedDate },
            new OpportunityTag { Id = 10, Code = "LOCALBIZ", NameEn = "Local Business", NameAr = "مشروع محلي", DescriptionEn = "Local market business.", IsActive = true, SortOrder = 10, CreatedAt = opportunityLookupSeedDate, UpdatedAt = opportunityLookupSeedDate },
            new OpportunityTag { Id = 11, Code = "HIGHGROWTH", NameEn = "High Growth", NameAr = "نمو مرتفع", DescriptionEn = "Designed for rapid growth.", IsActive = true, SortOrder = 11, CreatedAt = opportunityLookupSeedDate, UpdatedAt = opportunityLookupSeedDate },
            new OpportunityTag { Id = 12, Code = "LOWENTRY", NameEn = "Low Entry Ticket", NameAr = "حد أدنى منخفض للاستثمار", DescriptionEn = "Accessible minimum investment size.", IsActive = true, SortOrder = 12, CreatedAt = opportunityLookupSeedDate, UpdatedAt = opportunityLookupSeedDate }
        );

        modelBuilder.Entity<FundingGoal>().HasData(
            new FundingGoal { Id = 1, Code = "LAUNCHNEWBUSINESS", NameEn = "Launch New Business", NameAr = "إطلاق مشروع جديد", DescriptionEn = "Funding to start a new venture.", DescriptionAr = "تمويل لبدء مشروع جديد.", IsActive = true, SortOrder = 1, CreatedAt = opportunityLookupSeedDate, UpdatedAt = opportunityLookupSeedDate },
            new FundingGoal { Id = 2, Code = "EXPANDEXISTINGBUSINESS", NameEn = "Expand Existing Business", NameAr = "التوسع في الأعمال القائمة", DescriptionEn = "Funding to scale an operating business.", DescriptionAr = "تمويل لتوسيع نشاط قائم.", IsActive = true, SortOrder = 2, CreatedAt = opportunityLookupSeedDate, UpdatedAt = opportunityLookupSeedDate },
            new FundingGoal { Id = 3, Code = "BUYEQUIPMENT", NameEn = "Buy Equipment", NameAr = "شراء المعدات", DescriptionEn = "Funding to purchase equipment or machinery.", DescriptionAr = "تمويل لشراء المعدات أو الآلات.", IsActive = true, SortOrder = 3, CreatedAt = opportunityLookupSeedDate, UpdatedAt = opportunityLookupSeedDate },
            new FundingGoal { Id = 4, Code = "MARKETING", NameEn = "Marketing", NameAr = "التسويق", DescriptionEn = "Funding for marketing and customer acquisition.", DescriptionAr = "تمويل للتسويق واكتساب العملاء.", IsActive = true, SortOrder = 4, CreatedAt = opportunityLookupSeedDate, UpdatedAt = opportunityLookupSeedDate },
            new FundingGoal { Id = 5, Code = "WORKINGCAPITAL", NameEn = "Working Capital", NameAr = "رأس المال العامل", DescriptionEn = "Funding for operating cash flow.", DescriptionAr = "تمويل للتدفقات النقدية التشغيلية.", IsActive = true, SortOrder = 5, CreatedAt = opportunityLookupSeedDate, UpdatedAt = opportunityLookupSeedDate },
            new FundingGoal { Id = 6, Code = "OPENNEWBRANCH", NameEn = "Open New Branch", NameAr = "افتتاح فرع جديد", DescriptionEn = "Funding to open another location.", DescriptionAr = "تمويل لافتتاح موقع جديد.", IsActive = true, SortOrder = 6, CreatedAt = opportunityLookupSeedDate, UpdatedAt = opportunityLookupSeedDate },
            new FundingGoal { Id = 7, Code = "RESEARCHDEVELOPMENT", NameEn = "Research & Development", NameAr = "البحث والتطوير", DescriptionEn = "Funding for product or technical development.", DescriptionAr = "تمويل لتطوير المنتجات أو التقنية.", IsActive = true, SortOrder = 7, CreatedAt = opportunityLookupSeedDate, UpdatedAt = opportunityLookupSeedDate },
            new FundingGoal { Id = 8, Code = "INVENTORYPURCHASE", NameEn = "Inventory Purchase", NameAr = "شراء المخزون", DescriptionEn = "Funding to purchase inventory.", DescriptionAr = "تمويل لشراء المخزون.", IsActive = true, SortOrder = 8, CreatedAt = opportunityLookupSeedDate, UpdatedAt = opportunityLookupSeedDate },
            new FundingGoal { Id = 9, Code = "HIRING", NameEn = "Hiring", NameAr = "التوظيف", DescriptionEn = "Funding to recruit and grow the team.", DescriptionAr = "تمويل لاستقطاب الفريق وتنميته.", IsActive = true, SortOrder = 9, CreatedAt = opportunityLookupSeedDate, UpdatedAt = opportunityLookupSeedDate },
            new FundingGoal { Id = 10, Code = "ACQUISITION", NameEn = "Acquisition", NameAr = "الاستحواذ", DescriptionEn = "Funding for acquisition activity.", DescriptionAr = "تمويل لأنشطة الاستحواذ.", IsActive = true, SortOrder = 10, CreatedAt = opportunityLookupSeedDate, UpdatedAt = opportunityLookupSeedDate }
        );

        modelBuilder.Entity<RiskLevel>().HasData(
            new RiskLevel { Id = 1, Code = "LOW", NameEn = "Low", NameAr = "منخفض", DescriptionEn = "Lower relative risk.", DescriptionAr = "مستوى مخاطر نسبي منخفض.", IsActive = true, SortOrder = 1, CreatedAt = opportunityLookupSeedDate, UpdatedAt = opportunityLookupSeedDate },
            new RiskLevel { Id = 2, Code = "MEDIUM", NameEn = "Medium", NameAr = "متوسط", DescriptionEn = "Medium relative risk.", DescriptionAr = "مستوى مخاطر نسبي متوسط.", IsActive = true, SortOrder = 2, CreatedAt = opportunityLookupSeedDate, UpdatedAt = opportunityLookupSeedDate },
            new RiskLevel { Id = 3, Code = "HIGH", NameEn = "High", NameAr = "مرتفع", DescriptionEn = "Higher relative risk.", DescriptionAr = "مستوى مخاطر نسبي مرتفع.", IsActive = true, SortOrder = 3, CreatedAt = opportunityLookupSeedDate, UpdatedAt = opportunityLookupSeedDate }
        );

        modelBuilder.Entity<FileCategory>(c =>
        {
            c.HasKey(x => x.Id);
            c.Property(x => x.Code).HasMaxLength(80).IsRequired();
            c.Property(x => x.NameEn).HasMaxLength(120).IsRequired();
            c.Property(x => x.NameAr).HasMaxLength(120).IsRequired();
            c.Property(x => x.DescriptionEn).HasMaxLength(500);
            c.Property(x => x.DescriptionAr).HasMaxLength(500);
            c.Property(x => x.AllowedExtensions).HasMaxLength(2000).IsRequired();
            c.Property(x => x.AllowedMimeTypes).HasMaxLength(4000).IsRequired();
            c.HasIndex(x => x.Code).IsUnique();
            c.HasIndex(x => new { x.IsActive, x.SortOrder });
        });

        modelBuilder.Entity<FileStoragePolicy>(p =>
        {
            p.HasKey(x => x.Id);
            p.Property(x => x.GlobalMaxFileSizeBytes).IsRequired();
            p.Property(x => x.DefaultUserQuotaBytes).IsRequired();
            p.Property(x => x.DefaultProjectQuotaBytes).IsRequired();
        });

        modelBuilder.Entity<StoredFile>(f =>
        {
            f.HasKey(x => x.Id);
            f.Property(x => x.FileId).HasMaxLength(64).IsRequired();
            f.Property(x => x.FileKey).HasMaxLength(500).IsRequired();
            f.Property(x => x.CategoryCode).HasMaxLength(80).IsRequired();
            f.Property(x => x.OriginalFileName).HasMaxLength(255).IsRequired();
            f.Property(x => x.Extension).HasMaxLength(20).IsRequired();
            f.Property(x => x.MimeType).HasMaxLength(150).IsRequired();
            f.Property(x => x.EntityType).HasMaxLength(80);
            f.Property(x => x.EntityId).HasMaxLength(100);
            f.HasIndex(x => x.FileId).IsUnique();
            f.HasIndex(x => new { x.UploadedByUserId, x.IsDeleted });
            f.HasIndex(x => new { x.ProjectId, x.IsDeleted });
            f.HasIndex(x => new { x.CategoryCode, x.EntityType, x.EntityId, x.IsDeleted });
        });

        modelBuilder.Entity<FileStoragePolicy>().HasData(new FileStoragePolicy
        {
            Id = 1,
            GlobalMaxFileSizeBytes = 50L * 1024 * 1024,
            DefaultUserQuotaBytes = 500L * 1024 * 1024,
            DefaultProjectQuotaBytes = 2L * 1024 * 1024 * 1024,
            UpdatedAt = opportunityLookupSeedDate
        });

        var fileCategorySeedDate = opportunityLookupSeedDate;
        modelBuilder.Entity<FileCategory>().HasData(
            new FileCategory { Id = 1, Code = "OPPORTUNITYCOVER", NameEn = "Opportunity cover", NameAr = "غلاف الفرصة", SortOrder = 1, IsActive = true, MaxFileSizeBytes = 10L * 1024 * 1024, AllowedExtensions = ".jpg,.jpeg,.png,.webp", AllowedMimeTypes = "image/jpeg,image/png,image/webp", CreatedAt = fileCategorySeedDate, UpdatedAt = fileCategorySeedDate },
            new FileCategory { Id = 2, Code = "OPPORTUNITYGALLERY", NameEn = "Opportunity gallery", NameAr = "معرض الفرصة", SortOrder = 2, IsActive = true, MaxFileSizeBytes = 10L * 1024 * 1024, AllowedExtensions = ".jpg,.jpeg,.png,.webp,.gif", AllowedMimeTypes = "image/jpeg,image/png,image/webp,image/gif", CreatedAt = fileCategorySeedDate, UpdatedAt = fileCategorySeedDate },
            new FileCategory { Id = 3, Code = "OPPORTUNITYPUBLICDOCUMENT", NameEn = "Public opportunity document", NameAr = "مستند فرصة عام", SortOrder = 3, IsActive = true, MaxFileSizeBytes = 25L * 1024 * 1024, AllowedExtensions = ".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.csv", AllowedMimeTypes = "application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/plain,text/csv", CreatedAt = fileCategorySeedDate, UpdatedAt = fileCategorySeedDate },
            new FileCategory { Id = 4, Code = "OPPORTUNITYPRIVATEDOCUMENT", NameEn = "Private opportunity document", NameAr = "مستند فرصة خاص", SortOrder = 4, IsActive = true, MaxFileSizeBytes = 25L * 1024 * 1024, AllowedExtensions = ".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.csv", AllowedMimeTypes = "application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/plain,text/csv", CreatedAt = fileCategorySeedDate, UpdatedAt = fileCategorySeedDate },
            new FileCategory { Id = 5, Code = "PROJECTIMAGE", NameEn = "Project image", NameAr = "صورة المشروع", SortOrder = 5, IsActive = true, MaxFileSizeBytes = 10L * 1024 * 1024, AllowedExtensions = ".jpg,.jpeg,.png,.webp", AllowedMimeTypes = "image/jpeg,image/png,image/webp", CreatedAt = fileCategorySeedDate, UpdatedAt = fileCategorySeedDate },
            new FileCategory { Id = 6, Code = "PROJECTUPDATEMEDIA", NameEn = "Project update media", NameAr = "وسائط تحديث المشروع", SortOrder = 6, IsActive = true, MaxFileSizeBytes = 50L * 1024 * 1024, AllowedExtensions = ".jpg,.jpeg,.png,.webp,.gif,.mp4,.mov,.webm", AllowedMimeTypes = "image/jpeg,image/png,image/webp,image/gif,video/mp4,video/quicktime,video/webm", CreatedAt = fileCategorySeedDate, UpdatedAt = fileCategorySeedDate },
            new FileCategory { Id = 7, Code = "PITCHVIDEO", NameEn = "Pitch video", NameAr = "فيديو العرض", SortOrder = 7, IsActive = true, MaxFileSizeBytes = 50L * 1024 * 1024, AllowedExtensions = ".mp4,.mov,.webm", AllowedMimeTypes = "video/mp4,video/quicktime,video/webm", CreatedAt = fileCategorySeedDate, UpdatedAt = fileCategorySeedDate },
            new FileCategory { Id = 8, Code = "INVESTMENTIMAGE", NameEn = "Investment image", NameAr = "صورة الاستثمار", SortOrder = 8, IsActive = true, MaxFileSizeBytes = 10L * 1024 * 1024, AllowedExtensions = ".jpg,.jpeg,.png,.webp", AllowedMimeTypes = "image/jpeg,image/png,image/webp", CreatedAt = fileCategorySeedDate, UpdatedAt = fileCategorySeedDate },
            new FileCategory { Id = 9, Code = "INVESTMENTVIDEO", NameEn = "Investment video", NameAr = "فيديو الاستثمار", SortOrder = 9, IsActive = true, MaxFileSizeBytes = 50L * 1024 * 1024, AllowedExtensions = ".mp4,.mov,.webm", AllowedMimeTypes = "video/mp4,video/quicktime,video/webm", CreatedAt = fileCategorySeedDate, UpdatedAt = fileCategorySeedDate },
            new FileCategory { Id = 10, Code = "INVESTMENTDOCUMENT", NameEn = "Investment document", NameAr = "مستند الاستثمار", SortOrder = 10, IsActive = true, MaxFileSizeBytes = 25L * 1024 * 1024, AllowedExtensions = ".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.csv", AllowedMimeTypes = "application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/plain,text/csv", CreatedAt = fileCategorySeedDate, UpdatedAt = fileCategorySeedDate },
            new FileCategory { Id = 11, Code = "PROFILEAVATAR", NameEn = "Profile avatar", NameAr = "صورة الملف الشخصي", SortOrder = 11, IsActive = true, MaxFileSizeBytes = 5L * 1024 * 1024, AllowedExtensions = ".jpg,.jpeg,.png,.webp", AllowedMimeTypes = "image/jpeg,image/png,image/webp", MaxFilesPerEntity = 1, CreatedAt = fileCategorySeedDate, UpdatedAt = fileCategorySeedDate },
            new FileCategory { Id = 12, Code = "PROFILENATIONALID", NameEn = "National ID", NameAr = "الهوية الوطنية", SortOrder = 12, IsActive = true, MaxFileSizeBytes = 10L * 1024 * 1024, AllowedExtensions = ".jpg,.jpeg,.png,.webp,.pdf", AllowedMimeTypes = "image/jpeg,image/png,image/webp,application/pdf", MaxFilesPerEntity = 4, CreatedAt = fileCategorySeedDate, UpdatedAt = fileCategorySeedDate },
            new FileCategory { Id = 13, Code = "FINANCIALREPORT", NameEn = "Financial report", NameAr = "تقرير مالي", SortOrder = 13, IsActive = true, MaxFileSizeBytes = 25L * 1024 * 1024, AllowedExtensions = ".pdf,.xls,.xlsx,.csv", AllowedMimeTypes = "application/pdf,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv", CreatedAt = fileCategorySeedDate, UpdatedAt = fileCategorySeedDate },
            new FileCategory { Id = 14, Code = "CONTRACT", NameEn = "Contract", NameAr = "عقد", SortOrder = 14, IsActive = true, MaxFileSizeBytes = 25L * 1024 * 1024, AllowedExtensions = ".pdf", AllowedMimeTypes = "application/pdf", CreatedAt = fileCategorySeedDate, UpdatedAt = fileCategorySeedDate },
            new FileCategory { Id = 15, Code = "PRESENTATION", NameEn = "Presentation", NameAr = "عرض تقديمي", SortOrder = 15, IsActive = true, MaxFileSizeBytes = 25L * 1024 * 1024, AllowedExtensions = ".ppt,.pptx,.pdf", AllowedMimeTypes = "application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/pdf", CreatedAt = fileCategorySeedDate, UpdatedAt = fileCategorySeedDate },
            new FileCategory { Id = 16, Code = "SPREADSHEET", NameEn = "Spreadsheet", NameAr = "جدول بيانات", SortOrder = 16, IsActive = true, MaxFileSizeBytes = 25L * 1024 * 1024, AllowedExtensions = ".xls,.xlsx,.csv", AllowedMimeTypes = "application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv", CreatedAt = fileCategorySeedDate, UpdatedAt = fileCategorySeedDate },
            new FileCategory { Id = 17, Code = "LEGAL", NameEn = "Legal document", NameAr = "مستند قانوني", SortOrder = 17, IsActive = true, MaxFileSizeBytes = 25L * 1024 * 1024, AllowedExtensions = ".pdf,.doc,.docx", AllowedMimeTypes = "application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document", CreatedAt = fileCategorySeedDate, UpdatedAt = fileCategorySeedDate },
            new FileCategory { Id = 18, Code = "GENERAL", NameEn = "General business file", NameAr = "ملف أعمال عام", SortOrder = 18, IsActive = true, MaxFileSizeBytes = 25L * 1024 * 1024, AllowedExtensions = ".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.zip", AllowedMimeTypes = "application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,text/plain,text/csv,application/zip", CreatedAt = fileCategorySeedDate, UpdatedAt = fileCategorySeedDate },
            new FileCategory { Id = 19, Code = "FUNDING_PROOF", NameEn = "Funding payment proof", NameAr = "إثبات دفعة تمويل", SortOrder = 19, IsActive = true, MaxFileSizeBytes = 25L * 1024 * 1024, AllowedExtensions = ".pdf,.jpg,.jpeg,.png,.webp", AllowedMimeTypes = "application/pdf,image/jpeg,image/png,image/webp", CreatedAt = fileCategorySeedDate, UpdatedAt = fileCategorySeedDate },
            new FileCategory { Id = 20, Code = "PROFIT_SHARING_EVIDENCE", NameEn = "Profit Sharing evidence", NameAr = "إثبات مشاركة الأرباح", SortOrder = 20, IsActive = true, MaxFileSizeBytes = 25L * 1024 * 1024, AllowedExtensions = ".pdf,.jpg,.jpeg,.png,.webp", AllowedMimeTypes = "application/pdf,image/jpeg,image/png,image/webp", CreatedAt = fileCategorySeedDate, UpdatedAt = fileCategorySeedDate }
        );

        var pricingSeedDate = new DateTime(2026, 6, 29, 0, 0, 0, DateTimeKind.Utc);
        modelBuilder.Entity<ServicePrice>().HasData(
            new ServicePrice
            {
                Id = 1,
                ServiceCode = PricingService.PublishOpportunity.ToString(),
                ServiceName = "Publish Opportunity",
                Description = "Fee charged to publish an investment opportunity.",
                Price = 100m,
                Currency = "Credits",
                IsActive = true,
                CreatedAt = pricingSeedDate,
                UpdatedAt = pricingSeedDate
            },
            new ServicePrice
            {
                Id = 2,
                ServiceCode = PricingService.FeaturedOpportunity.ToString(),
                ServiceName = "Featured Opportunity",
                Description = "Fee charged to feature an investment opportunity.",
                Price = 300m,
                Currency = "Credits",
                IsActive = true,
                CreatedAt = pricingSeedDate,
                UpdatedAt = pricingSeedDate
            },
            new ServicePrice
            {
                Id = 3,
                ServiceCode = PricingService.InvestmentFee.ToString(),
                ServiceName = "Investment Fee",
                Description = "Platform fee for investment activity.",
                Price = 25m,
                Currency = "Credits",
                IsActive = true,
                CreatedAt = pricingSeedDate,
                UpdatedAt = pricingSeedDate
            },
            new ServicePrice
            {
                Id = 4,
                ServiceCode = PricingService.SubscriptionBasic.ToString(),
                ServiceName = "Subscription Basic",
                Description = "Basic subscription service price.",
                Price = 500m,
                Currency = "Credits",
                IsActive = true,
                CreatedAt = pricingSeedDate,
                UpdatedAt = pricingSeedDate
            },
            new ServicePrice
            {
                Id = 5,
                ServiceCode = PricingService.SubscriptionPremium.ToString(),
                ServiceName = "Subscription Premium",
                Description = "Premium subscription service price.",
                Price = 1000m,
                Currency = "Credits",
                IsActive = true,
                CreatedAt = pricingSeedDate,
                UpdatedAt = pricingSeedDate
            },
            new ServicePrice
            {
                Id = 6,
                ServiceCode = PricingService.AdminManualCharge.ToString(),
                ServiceName = "Admin Manual Charge",
                Description = "Manual administrative charge placeholder.",
                Price = 0m,
                Currency = "Credits",
                IsActive = true,
                CreatedAt = pricingSeedDate,
                UpdatedAt = pricingSeedDate
            }
        );

        // Investment precision for merged opportunity fields

        modelBuilder.Entity<Investment>()

            .Property(i => i.TargetFund)

            .HasPrecision(18, 2);



        // Configure Chat entities

        modelBuilder.Entity<Investa.Domain.Entities.Chat.Conversation>(c =>

        {

            c.HasKey(x => x.Id);

            c.Property(x => x.UserMobile).HasMaxLength(100).IsRequired();

            c.Property(x => x.AdminEmail).HasMaxLength(256).IsRequired(false);

            c.Property(x => x.CreatedAt).HasDefaultValueSql("GETDATE()");

            c.Property(x => x.IsActive).HasDefaultValue(true);

            c.Property(x => x.FounderReady).HasDefaultValue(false);

            c.Property(x => x.InvestorReady).HasDefaultValue(false);

            c.Property(x => x.IsVisibleToFounder).HasDefaultValue(true);

            c.Property(x => x.IsVisibleToInvestor).HasDefaultValue(true);

            c.Property(x => x.CloseReason).HasMaxLength(1000).IsRequired(false);

            c.HasIndex(x => x.OpportunityId);

            c.HasIndex(x => x.ConversationRequestId).IsUnique().HasFilter("[ConversationRequestId] IS NOT NULL");

            c.HasIndex(x => x.FounderId);

            c.HasIndex(x => x.InvestorId);

            c.HasIndex(x => new { x.OpportunityId, x.FounderId, x.InvestorId, x.IsActive });

            c.HasOne(x => x.Opportunity)

                .WithMany()

                .HasForeignKey(x => x.OpportunityId)

                .OnDelete(DeleteBehavior.Restrict)

                .IsRequired(false);

            c.HasOne(x => x.ConversationRequest)

                .WithOne()

                .HasForeignKey<Investa.Domain.Entities.Chat.Conversation>(x => x.ConversationRequestId)

                .OnDelete(DeleteBehavior.SetNull)

                .IsRequired(false);

            c.HasOne(x => x.Founder)

                .WithMany()

                .HasForeignKey(x => x.FounderId)

                .OnDelete(DeleteBehavior.Restrict)

                .IsRequired(false);

            c.HasOne(x => x.Investor)

                .WithMany()

                .HasForeignKey(x => x.InvestorId)

                .OnDelete(DeleteBehavior.Restrict)

                .IsRequired(false);

            c.HasOne(x => x.ParticipationRequest)

                .WithMany()

                .HasForeignKey(x => x.ParticipationRequestId)

                .OnDelete(DeleteBehavior.SetNull)

                .IsRequired(false);

            c.HasMany(x => x.Messages).WithOne(m => m.Conversation).HasForeignKey(m => m.ConversationId).OnDelete(DeleteBehavior.Cascade);



            // Conversation -> Messages relationship removed: messages are now linked to SupportSessions

            // c.HasMany(x => x.Messages).WithOne(m => m.Conversation).HasForeignKey(m => m.ConversationId).OnDelete(DeleteBehavior.Cascade);

        });

        modelBuilder.Entity<Investa.Domain.Entities.Chat.NegotiationOffer>(o =>
        {
            o.HasKey(x => x.Id);
            o.Property(x => x.Status).HasConversion<string>().HasMaxLength(30).IsRequired();
            o.Property(x => x.Note).HasMaxLength(1000).IsRequired(false);
            o.Property(x => x.Currency).HasMaxLength(10).IsRequired();
            o.Property(x => x.CreatedAt).HasDefaultValueSql("SYSUTCDATETIME()");
            // Preserve the existing database column name while exposing the domain's
            // replacement semantics as ReplacesOfferId.
            o.Property(x => x.ReplacesOfferId).HasColumnName("ParentOfferId");
            o.HasIndex(x => x.ConversationId);
            o.HasIndex(x => new { x.ConversationId, x.Status });
            o.HasIndex(x => new { x.ConversationId, x.Version }).IsUnique();
            o.HasIndex(x => x.OpportunityId);
            o.HasIndex(x => new { x.OpportunityId, x.CreatedByUserId, x.Status });
            o.HasOne(x => x.Conversation)
                .WithMany(x => x.Offers)
                .HasForeignKey(x => x.ConversationId)
                .OnDelete(DeleteBehavior.Cascade);
            o.HasOne(x => x.Opportunity)
                .WithMany()
                .HasForeignKey(x => x.OpportunityId)
                .OnDelete(DeleteBehavior.Restrict)
                .IsRequired(false);
            o.HasOne(x => x.CreatedByUser)
                .WithMany()
                .HasForeignKey(x => x.CreatedByUserId)
                .OnDelete(DeleteBehavior.Restrict);
            o.HasOne(x => x.ParentOffer)
                .WithMany()
                .HasForeignKey(x => x.ReplacesOfferId)
                .OnDelete(DeleteBehavior.Restrict)
                .IsRequired(false);
        });

        modelBuilder.Entity<Investa.Domain.Entities.Chat.NegotiationOfferLeg>(l =>
        {
            l.HasKey(x => x.Id);
            l.Property(x => x.LegType).HasConversion<string>().HasMaxLength(30).IsRequired();
            l.Property(x => x.Amount).HasPrecision(18, 2);
            l.Property(x => x.EquityPercentage).HasPrecision(5, 2);
            l.Property(x => x.SharesTerms).HasMaxLength(500).IsRequired(false);
            l.Property(x => x.ReturnRate).HasPrecision(5, 2);
            l.Property(x => x.RepaymentModel).HasMaxLength(100).IsRequired(false);
            l.Property(x => x.ProfitSharePercentage).HasPrecision(5, 2);
            l.Property(x => x.ProfitSharingPayoutFrequency).HasMaxLength(30).IsRequired(false);
            l.Property(x => x.ExitTerms).HasMaxLength(1000).IsRequired(false);
            l.HasIndex(x => x.OfferId);
            l.HasOne(x => x.Offer)
                .WithMany(x => x.Legs)
                .HasForeignKey(x => x.OfferId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Investa.Domain.Entities.Chat.ConversationRequest>(cr =>

        {

            cr.HasKey(x => x.Id);

            cr.Property(x => x.Status).HasConversion<string>().HasMaxLength(20).IsRequired();

            cr.Property(x => x.Message).HasMaxLength(1000).IsRequired(false);

            cr.Property(x => x.CreatedAt).HasDefaultValueSql("SYSUTCDATETIME()");

            cr.HasIndex(x => x.OpportunityId);

            cr.HasIndex(x => x.RequesterUserId);

            cr.HasIndex(x => x.RecipientUserId);

            cr.HasIndex(x => x.AcceptedConversationId).IsUnique().HasFilter("[AcceptedConversationId] IS NOT NULL");

            cr.HasIndex(x => new { x.OpportunityId, x.RequesterUserId, x.RecipientUserId, x.Status });

            cr.HasOne(x => x.Opportunity)

                .WithMany()

                .HasForeignKey(x => x.OpportunityId)

                .OnDelete(DeleteBehavior.Restrict);

            cr.HasOne(x => x.Requester)

                .WithMany()

                .HasForeignKey(x => x.RequesterUserId)

                .OnDelete(DeleteBehavior.Restrict);

            cr.HasOne(x => x.Recipient)

                .WithMany()

                .HasForeignKey(x => x.RecipientUserId)

                .OnDelete(DeleteBehavior.Restrict);

            cr.HasOne(x => x.AcceptedConversation)

                .WithOne()

                .HasForeignKey<Investa.Domain.Entities.Chat.ConversationRequest>(x => x.AcceptedConversationId)

                .OnDelete(DeleteBehavior.Restrict)

                .IsRequired(false);

        });



        modelBuilder.Entity<Investa.Domain.Entities.Chat.ChatMessage>(m =>

        {

            m.HasKey(x => x.Id);

            m.Property(x => x.SenderId).HasMaxLength(256).IsRequired();

            m.Property(x => x.MessageText).HasColumnType("nvarchar(max)").IsRequired();

            m.Property(x => x.Timestamp).HasDefaultValueSql("GETDATE()");

            m.Property(x => x.IsRead).HasDefaultValue(false);

            m.Property(x => x.IsEdited).HasDefaultValue(false);

            m.Property(x => x.IsDeleted).HasDefaultValue(false);

            m.Property(x => x.AttachmentsJson).HasColumnType("nvarchar(max)").IsRequired(false);

            m.HasOne(x => x.Sender)

                .WithMany()

                .HasForeignKey(x => x.SenderUserId)

                .OnDelete(DeleteBehavior.Restrict)

                .IsRequired(false);



            // FK to SupportSession (nullable to allow gradual migration)

            m.HasOne<SupportSession>()

                .WithMany()

                .HasForeignKey(x => x.SupportSessionId)

                .OnDelete(DeleteBehavior.Cascade);



            // Preserve existing ConversationId index and add SupportSessionId index

            // Removed ConversationId index - using SupportSessionId instead

            m.HasIndex(x => new { x.ConversationId, x.Timestamp });

            m.HasIndex(x => new { x.SupportSessionId, x.Timestamp });

        });



        modelBuilder.Entity<Investa.Domain.Entities.Chat.ConversationParticipant>(cp =>

        {

            cp.HasKey(x => new { x.ConversationId, x.UserId });

            cp.HasIndex(x => x.UserId);

            cp.Property(x => x.JoinedAt).HasDefaultValueSql("GETDATE()");

            cp.Property(x => x.IsMuted).HasDefaultValue(false);

        });



        modelBuilder.Entity<Investa.Domain.Entities.Chat.MessageAttachment>(a =>

        {

            a.HasKey(x => x.Id);

            a.Property(x => x.StoragePath).HasMaxLength(1024).IsRequired();

            a.Property(x => x.FileName).HasMaxLength(512).IsRequired();

        });



        modelBuilder.Entity<Investa.Domain.Entities.Chat.MessageReaction>(r =>

        {

            r.HasKey(x => new { x.MessageId, x.UserId });

            r.Property(x => x.Reaction).HasMaxLength(50).IsRequired();

        });



        // Configure SupportSession and Message entities

        modelBuilder.Entity<SupportSession>(ss =>

        {

            ss.HasKey(x => x.Id);

            ss.Property(x => x.UserMobile).HasMaxLength(50).IsRequired();

            ss.Property(x => x.Category).HasMaxLength(100).IsRequired();

            ss.Property(x => x.CreatedAt).HasDefaultValueSql("GETDATE()");

            ss.Property(x => x.Status).HasConversion<string>().HasDefaultValue(SupportSessionStatus.Open);

            ss.Property(x => x.UnreadCount).HasDefaultValue(0);

            ss.HasMany(x => x.Messages).WithOne(m => m.SupportSession).HasForeignKey(m => m.SupportSessionId).OnDelete(DeleteBehavior.Cascade);

        });



        modelBuilder.Entity<Message>(m =>

        {

            m.HasKey(x => x.Id);

            m.Property(x => x.SenderId).HasMaxLength(256).IsRequired();

            m.Property(x => x.MessageText).HasColumnType("nvarchar(max)").IsRequired();

            m.Property(x => x.Timestamp).HasDefaultValueSql("GETDATE()");

            m.Property(x => x.IsRead).HasDefaultValue(false);

            m.HasIndex(x => new { x.SupportSessionId, x.Timestamp });

        });



        // Seed default admin groups and permissions

        // Use a static timestamp for seeded data to avoid EF Core "pending model changes" warnings

        var seedCreatedAt = new DateTime(2025, 12, 29, 0, 0, 0, DateTimeKind.Utc);



        modelBuilder.Entity<Group>().HasData(

            new Group { Id = 1000, Name = "Org_Admin", Description = "Organization administrator - full access", CreatedAt = seedCreatedAt },

            new Group { Id = 1001, Name = "Admin", Description = "Admin with elevated privileges", CreatedAt = seedCreatedAt },

            new Group { Id = 1002, Name = "Manager", Description = "Manager with limited admin privileges", CreatedAt = seedCreatedAt },

            new Group { Id = 1003, Name = "Viewer", Description = "Read-only admin", CreatedAt = seedCreatedAt }

        );



        modelBuilder.Entity<Permission>().HasData(

            new Permission { Id = 2000, Key = "admin.clients.read", Name = "Read Clients", Description = "Read client records", CreatedAt = seedCreatedAt },

            new Permission { Id = 2001, Key = "admin.clients.manage", Name = "Manage Clients", Description = "Create/update/delete clients", CreatedAt = seedCreatedAt },

            new Permission { Id = 2003, Key = "admin.groups.manage", Name = "Manage Groups", Description = "Manage groups and assignments", CreatedAt = seedCreatedAt },

            new Permission { Id = 2005, Key = "admin.dev.manage", Name = "Dev Tools", Description = "Development utility endpoints", CreatedAt = seedCreatedAt },

            // RBAC management permissions (used by GroupsAdminController, RolesAdminController, PermissionsAdminController)

            new Permission { Id = 2006, Key = "RBAC.View", Name = "View RBAC", Description = "View groups, roles, and permission assignments", CreatedAt = seedCreatedAt },

            new Permission { Id = 2007, Key = "Group.Manage", Name = "Manage Groups", Description = "Create, update, delete groups and assign group permissions", CreatedAt = seedCreatedAt },

            new Permission { Id = 2008, Key = "Role.Manage", Name = "Manage Roles", Description = "Create, update, delete roles and assign role permissions/users", CreatedAt = seedCreatedAt }

        );



        // Assign all permissions to Org_Admin group by default

        modelBuilder.Entity<GroupPermission>().HasData(

            new GroupPermission { Id = 1, GroupId = 1000, PermissionId = 2000, AssignedAt = seedCreatedAt },

            new GroupPermission { Id = 2, GroupId = 1000, PermissionId = 2001, AssignedAt = seedCreatedAt },

            new GroupPermission { Id = 4, GroupId = 1000, PermissionId = 2003, AssignedAt = seedCreatedAt },

            new GroupPermission { Id = 6, GroupId = 1000, PermissionId = 2005, AssignedAt = seedCreatedAt },

            // RBAC permissions assigned to Org_Admin

            new GroupPermission { Id = 7, GroupId = 1000, PermissionId = 2006, AssignedAt = seedCreatedAt },

            new GroupPermission { Id = 8, GroupId = 1000, PermissionId = 2007, AssignedAt = seedCreatedAt },

            new GroupPermission { Id = 9, GroupId = 1000, PermissionId = 2008, AssignedAt = seedCreatedAt }

        );



        // Seed sample AuthUsers (founders and investors) for equity testing

        modelBuilder.Entity<AuthUser>().HasData(

            new AuthUser {

                Id = Guid.Parse("11111111-1111-1111-1111-111111111111"),

                Name = "Alice Founder",

                Email = "alice.founder@example.com",

                PasswordHash = "seeded",

                UserType = UserType.Client,

                ClientType = Investa.Domain.Entities.Enums.ClientType.Founder,

                CredibilityScore = 0,

                WalletBalance = 100000m,

                CreatedAt = seedCreatedAt

            },

            new AuthUser {

                Id = Guid.Parse("22222222-2222-2222-2222-222222222222"),

                Name = "Bob Investor",

                Email = "bob.investor@example.com",

                PasswordHash = "seeded",

                UserType = UserType.Client,

                ClientType = Investa.Domain.Entities.Enums.ClientType.Investor,

                CredibilityScore = 0,

                WalletBalance = 25000m,

                CreatedAt = seedCreatedAt

            },

            new AuthUser {

                Id = Guid.Parse("33333333-3333-3333-3333-333333333333"),

                Name = "Clara Investor",

                Email = "clara.investor@example.com",

                PasswordHash = "seeded",

                UserType = UserType.Client,

                ClientType = Investa.Domain.Entities.Enums.ClientType.Investor,

                CredibilityScore = 0,

                WalletBalance = 15000m,

                CreatedAt = seedCreatedAt

            }

        );



        // Seed sample investment opportunities for equity crowdfunding

        modelBuilder.Entity<Investment>().HasData(

            new Investment {

                Id = 1000,

                FounderId = Guid.Parse("11111111-1111-1111-1111-111111111111"),

                InitialCapital = 50000m,

                Date = seedCreatedAt,

                BusinessName = "SolarGrid Energy",

                Description = "Distributed solar microgrid for emerging markets.",

                SharePrice = 10.00m,

                TotalShares = 10000,

                AvailableShares = 8000,

                MinInvestment = 100m,

                MaxInvestment = 5000m,

                ValuationCap = 5000000m,

                ExpectedROI = 12.5m,

                InvestmentTypeId = InvestmentType.Equity,

                Status = "Active",

                TargetFund = 100000m,

                ProjectCategoryId = 1,

                RiskLevel = "MEDIUM",

                Currency = "USD",

                StartDate = seedCreatedAt.AddDays(-14),

                EndDate = seedCreatedAt.AddDays(30)

            },

            new Investment {

                Id = 1001,

                FounderId = Guid.Parse("11111111-1111-1111-1111-111111111111"),

                InitialCapital = 20000m,

                Date = seedCreatedAt,

                BusinessName = "AquaPure",

                Description = "Affordable water purification devices.",

                SharePrice = 5.00m,

                TotalShares = 5000,

                AvailableShares = 1200,

                MinInvestment = 50m,

                MaxInvestment = 2000m,

                ValuationCap = 2000000m,

                ExpectedROI = 10.0m,

                InvestmentTypeId = InvestmentType.Equity,

                Status = "Active",

                TargetFund = 25000m,

                ProjectCategoryId = 17,

                RiskLevel = "LOW",

                Currency = "USD",

                StartDate = seedCreatedAt.AddDays(-7),

                EndDate = seedCreatedAt.AddDays(14)

            }

        );



        modelBuilder.Entity<PaymentTransaction>(p =>
        {
            p.HasKey(x => x.Id);
            p.Property(x => x.Amount).HasPrecision(18, 2).IsRequired();
            p.Property(x => x.Reference).HasMaxLength(200);
            p.Property(x => x.IdempotencyKey).HasMaxLength(200).IsRequired();
            p.HasIndex(x => x.IdempotencyKey).IsUnique();
            p.HasIndex(x => x.Reference).IsUnique().HasFilter("[Reference] IS NOT NULL");
        });

        // PaymentAllocation configuration
        modelBuilder.Entity<PaymentAllocation>(a =>
        {
            a.HasKey(x => x.Id);
            a.Property(x => x.AllocatedAmount).HasPrecision(18, 2).IsRequired();
            a.Property(x => x.InstallmentConfirmationKey).HasMaxLength(250);
            a.HasIndex(x => new { x.PaymentTransactionId });
            a.HasIndex(x => new { x.PaymentTransactionId, x.ParticipationRequestId, x.InstallmentNumber }).IsUnique();
            a.HasIndex(x => x.InstallmentConfirmationKey).IsUnique().HasFilter("[InstallmentConfirmationKey] IS NOT NULL");
            a.HasOne(x => x.PaymentTransaction)
             .WithMany()
             .HasForeignKey(x => x.PaymentTransactionId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        // Seed participants (investor contributions)

        modelBuilder.Entity<InvestmentParticipant>().HasData(

            new InvestmentParticipant {

                Id = 5000,

                InvestmentId = 1000,

                InvestorId = Guid.Parse("22222222-2222-2222-2222-222222222222"),

                SharesPurchased = 300,

                AmountInvested = 300m * 10.00m,

                InvestmentDate = seedCreatedAt.AddDays(-5),

                Status = ParticipationLifecycle.Participated,

                IsAnonymous = false,

                CreatedAt = seedCreatedAt.AddDays(-5)

            },

            new InvestmentParticipant {

                Id = 5001,

                InvestmentId = 1000,

                InvestorId = Guid.Parse("33333333-3333-3333-3333-333333333333"),

                SharesPurchased = 200,

                AmountInvested = 200m * 10.00m,

                InvestmentDate = seedCreatedAt.AddDays(-3),

                Status = ParticipationLifecycle.Participated,

                IsAnonymous = false,

                CreatedAt = seedCreatedAt.AddDays(-3)

            },

            new InvestmentParticipant {

                Id = 5002,

                InvestmentId = 1001,

                InvestorId = Guid.Parse("22222222-2222-2222-2222-222222222222"),

                SharesPurchased = 100,

                AmountInvested = 100m * 5.00m,

                InvestmentDate = seedCreatedAt.AddDays(-2),

                Status = ParticipationLifecycle.Participated,

                IsAnonymous = false,

                CreatedAt = seedCreatedAt.AddDays(-2)

            }

        );

    }

}
