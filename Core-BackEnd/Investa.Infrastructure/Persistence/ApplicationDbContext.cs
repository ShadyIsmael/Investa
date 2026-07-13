using Investa.Domain.Entities;

using Investa.Domain.Entities.Enums;

using Investa.Domain.Entities.Security;

using Microsoft.AspNetCore.Identity.EntityFrameworkCore;

using Investa.Infrastructure.Identity;

using Microsoft.EntityFrameworkCore;



namespace Investa.Infrastructure.Persistence;



/// <summary>

/// Application database context that combines business entities with ASP.NET Core Identity

/// Inherits from IdentityDbContext to support user authentication and authorization

/// </summary>

public class ApplicationDbContext : IdentityDbContext<ApplicationIdentityUser, ApplicationIdentityRole, Guid>

{

    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)

        : base(options)

    {

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



    // Business category taxonomy used for client classification

    public DbSet<BusinessCategory> BusinessCategories { get; set; }



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



    // Configuration table for credit packages/options

    public DbSet<CreditConfiguration> CreditConfigurations { get; set; }



    // Admin-defined credit plans available for purchase

    public DbSet<CreditPlan> CreditPlans { get; set; }



    // Records every credit-plan purchase by a user

    public DbSet<CreditPlanPurchase> CreditPlanPurchases { get; set; }



    // Pricing engine source of truth for platform service prices
    public DbSet<ServicePrice> ServicePrices { get; set; }
    public DbSet<PricingRule> PricingRules { get; set; }

    // Investment Opportunity Lifecycle foundation
    public DbSet<Opportunity> Opportunities { get; set; }
    public DbSet<OpportunityMedia> OpportunityMedia { get; set; }
    public DbSet<OpportunityDocument> OpportunityDocuments { get; set; }
    public DbSet<OpportunityEvent> OpportunityEvents { get; set; }
    public DbSet<OpportunityJoinRequest> OpportunityJoinRequests { get; set; }
    public DbSet<InvestmentContract> InvestmentContracts { get; set; }
    public DbSet<InvestmentContractVersion> InvestmentContractVersions { get; set; }
    public DbSet<ContractEvent> ContractEvents { get; set; }
    public DbSet<OpportunityCategory> OpportunityCategories { get; set; }
    public DbSet<OpportunityTag> OpportunityTags { get; set; }
    public DbSet<OpportunityTagAssignment> OpportunityTagAssignments { get; set; }
    public DbSet<FundingGoal> FundingGoals { get; set; }



    // Records score/points transactions for users (e.g., reward points)

    public DbSet<ScoreTransaction> ScoreTransactions { get; set; }

    // Reputation rules for system and admin-defined reputation adjustments

    public DbSet<ReputationRule> ReputationRules { get; set; }

    // All reputation changes are stored in ReputationTransaction

    public DbSet<ReputationTransaction> ReputationTransactions { get; set; }

    public DbSet<Report> Reports { get; set; }


    // Investment requests between investors and founders

    public DbSet<InvestmentRequest> InvestmentRequests { get; set; }



    // Many-to-many join between Clients and BusinessCategories

    public DbSet<ClientBusinessCategory> ClientBusinessCategories { get; set; }



    // Firebase Cloud Messaging device tokens for push notifications (new keyword hides Identity's UserTokens)

    public new DbSet<UserToken> UserTokens { get; set; }



    // Images associated with investments (gallery)

    public DbSet<InvestmentImage> InvestmentImages { get; set; }



    // In-app notification system

    public DbSet<NotificationTemplate> NotificationTemplates { get; set; }

    public DbSet<Notification> Notifications { get; set; }

    public DbSet<UserNotification> UserNotifications { get; set; }



    // Analytics tracking entities

    public DbSet<InvestmentView> InvestmentViews { get; set; }

    public DbSet<InvestmentLearnMore> InvestmentLearnMores { get; set; }



    protected override void OnModelCreating(ModelBuilder modelBuilder)

    {

        base.OnModelCreating(modelBuilder);



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
                new PricingRule { Id = 3, Action = PricingAction.SendCounterOffer, ActionCode = nameof(PricingAction.SendCounterOffer), DisplayName = "Send Counter Offer", Description = "Fixed CREDIT fee to send a counter offer.", CreditCost = 2m, IsActive = true, CreatedAt = seedDate, UpdatedAt = seedDate },
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

            fav.HasOne(x => x.Investor)

               .WithMany()

               .HasForeignKey(x => x.InvestorId)

               .OnDelete(DeleteBehavior.Cascade);

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

            un.Property(x => x.IsRead).HasDefaultValue(false);

            un.Property(x => x.CreatedAt).HasDefaultValueSql("SYSUTCDATETIME()");

            un.HasIndex(x => x.UserId);

            un.HasIndex(x => x.NotificationId);

            un.HasIndex(x => new { x.UserId, x.CreatedAt });

            un.HasIndex(x => new { x.UserId, x.IsRead });

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
                rr.Property(r => r.ActivityCode).HasMaxLength(100).IsRequired();
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
                rr.HasIndex(r => r.ActivityCode).IsUnique();
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

            // CreditConfiguration mapping

            modelBuilder.Entity<CreditConfiguration>(cc =>

            {

                cc.HasKey(x => x.Id);

                cc.Property(x => x.Amount).HasColumnType("decimal(18,2)");

                cc.Property(x => x.FromDate).HasColumnType("datetime2");

                cc.Property(x => x.CreatedAt).HasDefaultValueSql("GETDATE()");

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

            eb.Property(a => a.CredibilityScore).HasDefaultValue(3500);

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

        // Investment Opportunity Lifecycle foundation mapping
        modelBuilder.Entity<Opportunity>(o =>
        {
            o.HasKey(x => x.Id);
            o.Property(x => x.FounderId).IsRequired();
            o.Property(x => x.Title).HasMaxLength(200).IsRequired();
            o.Property(x => x.Description).HasMaxLength(4000);
            o.Property(x => x.ShortDescription).HasMaxLength(300).IsRequired().HasDefaultValue("");
            o.Property(x => x.UseOfFunds).HasMaxLength(2000).IsRequired().HasDefaultValue("");
            o.Property(x => x.FundingTarget).HasPrecision(18, 2).IsRequired();
            o.Property(x => x.MinimumInvestmentAmount).HasPrecision(18, 2);
            o.Property(x => x.MaximumInvestmentAmount).HasPrecision(18, 2);
            o.Property(x => x.EquityOfferedPercentage).HasPrecision(5, 2);
            o.Property(x => x.Currency).HasMaxLength(10);
            o.Property(x => x.SharePrice).HasPrecision(18, 2);
            o.Property(x => x.ProfitSharePercentage).HasPrecision(5, 2);
            o.Property(x => x.ProfitSharingPayoutFrequency).HasMaxLength(50);
            o.Property(x => x.InvestmentModel).HasConversion<string>().HasMaxLength(60).IsRequired();
            o.Property(x => x.ProjectStage).HasConversion<string>().HasMaxLength(40).IsRequired();
            o.Property(x => x.Status).HasConversion<string>().HasMaxLength(40).IsRequired();
            o.Property(x => x.CoverImageUrl).HasMaxLength(1000);
            o.Property(x => x.IsLockedForEditing).HasDefaultValue(false);
            o.Property(x => x.InterestRate).HasPrecision(5, 2);
            o.Property(x => x.RepaymentFrequency).HasMaxLength(50);
            o.Property(x => x.FinalRepaymentDate);
            o.Property(x => x.CreatedAt).HasDefaultValueSql("SYSUTCDATETIME()");
            o.Property(x => x.UpdatedAt).HasDefaultValueSql("SYSUTCDATETIME()");
            o.HasIndex(x => x.FounderId);
            o.HasIndex(x => x.Status);
            o.HasIndex(x => x.CategoryId);
            o.HasIndex(x => x.FundingGoalId);
            o.HasIndex(x => x.InvestmentModel);
            o.HasIndex(x => x.ProjectStage);
            o.HasOne<AuthUser>()
             .WithMany()
             .HasForeignKey(x => x.FounderId)
             .OnDelete(DeleteBehavior.Restrict);
            o.HasOne(x => x.Category)
             .WithMany(x => x.Opportunities)
             .HasForeignKey(x => x.CategoryId)
             .OnDelete(DeleteBehavior.Restrict)
             .IsRequired(false);
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
            j.Property(x => x.RequestedAmount).HasPrecision(18, 2);
            j.Property(x => x.CalculatedTotalAmount).HasPrecision(18, 2);
            j.Property(x => x.Message).HasMaxLength(1000);
            j.Property(x => x.TermsSnapshotJson).HasColumnType("nvarchar(max)");
            j.Property(x => x.Status).HasConversion<string>().HasMaxLength(30).IsRequired();
            j.Property(x => x.RejectionReason).HasMaxLength(1000);
            j.Property(x => x.CreatedAt).HasDefaultValueSql("SYSUTCDATETIME()");
            j.Property(x => x.UpdatedAt).HasDefaultValueSql("SYSUTCDATETIME()");
            j.Property(x => x.IsVisibleToFounder).HasDefaultValue(true);
            j.Property(x => x.IsVisibleToInvestor).HasDefaultValue(true);
            j.HasIndex(x => x.OpportunityId);
            j.HasIndex(x => x.InvestorId);
            j.HasIndex(x => x.SourceConversationId);
            j.HasIndex(x => new { x.OpportunityId, x.InvestorId, x.Status });
            j.HasOne(x => x.Investor)
             .WithMany()
             .HasForeignKey(x => x.InvestorId)
             .OnDelete(DeleteBehavior.Restrict);
            j.HasOne(x => x.ReviewedByFounder)
             .WithMany()
             .HasForeignKey(x => x.ReviewedByFounderId)
             .OnDelete(DeleteBehavior.Restrict)
             .IsRequired(false);
        });

        modelBuilder.Entity<InvestmentContract>(c =>
        {
            c.HasKey(x => x.Id);
            c.Property(x => x.ContractNumber).HasMaxLength(80).IsRequired();
            c.Property(x => x.InvestmentModel).HasConversion<string>().HasMaxLength(50).IsRequired();
            c.Property(x => x.Status).HasConversion<string>().HasMaxLength(30).IsRequired();
            c.Property(x => x.CreatedAt).HasDefaultValueSql("SYSUTCDATETIME()");
            c.Property(x => x.UpdatedAt).HasDefaultValueSql("SYSUTCDATETIME()");
            c.HasIndex(x => x.ContractNumber).IsUnique();
            c.HasIndex(x => new { x.OpportunityId, x.FounderUserId, x.InvestorUserId, x.InvestmentModel }).IsUnique();
            c.HasOne(x => x.Opportunity).WithMany().HasForeignKey(x => x.OpportunityId).OnDelete(DeleteBehavior.Restrict);
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

        modelBuilder.Entity<OpportunityCategory>(c =>
        {
            c.HasKey(x => x.Id);
            c.Property(x => x.Name).HasMaxLength(120).IsRequired();
            c.Property(x => x.Description).HasMaxLength(500);
            c.Property(x => x.IsActive).HasDefaultValue(true);
            c.Property(x => x.SortOrder).HasDefaultValue(0);
            c.Property(x => x.CreatedAt).HasDefaultValueSql("SYSUTCDATETIME()");
            c.Property(x => x.UpdatedAt).HasDefaultValueSql("SYSUTCDATETIME()");
            c.HasIndex(x => x.Name).IsUnique();
            c.HasIndex(x => new { x.IsActive, x.SortOrder });
        });

        modelBuilder.Entity<OpportunityTag>(t =>
        {
            t.HasKey(x => x.Id);
            t.Property(x => x.Name).HasMaxLength(120).IsRequired();
            t.Property(x => x.Description).HasMaxLength(500);
            t.Property(x => x.IsActive).HasDefaultValue(true);
            t.Property(x => x.SortOrder).HasDefaultValue(0);
            t.Property(x => x.CreatedAt).HasDefaultValueSql("SYSUTCDATETIME()");
            t.HasIndex(x => x.Name).IsUnique();
            t.HasIndex(x => new { x.IsActive, x.SortOrder });
        });

        modelBuilder.Entity<FundingGoal>(g =>
        {
            g.HasKey(x => x.Id);
            g.Property(x => x.Name).HasMaxLength(120).IsRequired();
            g.Property(x => x.Description).HasMaxLength(500);
            g.Property(x => x.IsActive).HasDefaultValue(true);
            g.Property(x => x.SortOrder).HasDefaultValue(0);
            g.Property(x => x.CreatedAt).HasDefaultValueSql("SYSUTCDATETIME()");
            g.Property(x => x.UpdatedAt).HasDefaultValueSql("SYSUTCDATETIME()");
            g.HasIndex(x => x.Name).IsUnique();
            g.HasIndex(x => new { x.IsActive, x.SortOrder });
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
            m.Property(x => x.FileUrl).HasMaxLength(1000).IsRequired();
            m.Property(x => x.FileId).HasMaxLength(100);
            m.Property(x => x.FileKey).HasMaxLength(500);
            m.Property(x => x.FileName).HasMaxLength(255).IsRequired();
            m.Property(x => x.FileType).HasMaxLength(100).IsRequired();
            m.Property(x => x.MimeType).HasMaxLength(150);
            m.Property(x => x.PreviewUrl).HasMaxLength(1000);
            m.Property(x => x.ThumbnailUrl).HasMaxLength(1000);
            m.Property(x => x.MediaType).HasMaxLength(50).IsRequired();
            m.Property(x => x.IsCover).HasDefaultValue(false);
            m.Property(x => x.IsPublic).HasDefaultValue(false);
            m.Property(x => x.Purpose).HasConversion<string>().HasMaxLength(40).HasDefaultValue(OpportunityFilePurpose.General).IsRequired();
            m.Property(x => x.SortOrder).HasDefaultValue(0);
            m.Property(x => x.CreatedAt).HasDefaultValueSql("SYSUTCDATETIME()");
            m.HasIndex(x => x.OpportunityId);
            m.HasIndex(x => new { x.OpportunityId, x.SortOrder });
            m.HasIndex(x => x.FileId);
            m.HasIndex(x => x.FileKey);
        });

        modelBuilder.Entity<OpportunityDocument>(d =>
        {
            d.HasKey(x => x.Id);
            d.Property(x => x.FileUrl).HasMaxLength(1000).IsRequired();
            d.Property(x => x.FileId).HasMaxLength(100);
            d.Property(x => x.FileKey).HasMaxLength(500);
            d.Property(x => x.FileName).HasMaxLength(255).IsRequired();
            d.Property(x => x.FileExtension).HasMaxLength(20).IsRequired();
            d.Property(x => x.MimeType).HasMaxLength(150);
            d.Property(x => x.PreviewUrl).HasMaxLength(1000);
            d.Property(x => x.ThumbnailUrl).HasMaxLength(1000);
            d.Property(x => x.DocumentType).HasMaxLength(100).IsRequired();
            d.Property(x => x.Visibility).HasConversion<string>().HasMaxLength(20).IsRequired();
            d.Property(x => x.Purpose).HasConversion<string>().HasMaxLength(40).HasDefaultValue(OpportunityFilePurpose.General).IsRequired();
            d.Property(x => x.Category).HasMaxLength(100);
            d.Property(x => x.SearchTags).HasMaxLength(1000);
            d.Property(x => x.CreatedAt).HasDefaultValueSql("SYSUTCDATETIME()");
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
            e.HasIndex(x => x.OpportunityId);
            e.HasIndex(x => new { x.OpportunityId, x.CreatedAt });
            e.HasIndex(x => new { x.OpportunityId, x.IsPublic });
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

        modelBuilder.Entity<Investa.Domain.Entities.Security.Role>(r =>

        {

            r.HasKey(x => x.Id);

            r.Property(x => x.Name).HasMaxLength(256).IsRequired();

            r.Property(x => x.NormalizedName).HasMaxLength(256).IsRequired();

            r.Property(x => x.Description).HasMaxLength(500);

            r.Property(x => x.CreatedAt).HasDefaultValueSql("GETDATE()");

            r.HasIndex(x => x.NormalizedName).IsUnique();

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



                // Client <-> BusinessCategory many-to-many

                modelBuilder.Entity<ClientBusinessCategory>(j =>

                {

                        j.HasKey(x => new { x.ClientId, x.BusinessCategoryId });

                        j.HasOne(x => x.Client).WithMany(c => c.ClientBusinessCategories).HasForeignKey(x => x.ClientId).OnDelete(DeleteBehavior.Cascade);

                        j.HasOne(x => x.BusinessCategory).WithMany(bc => bc.ClientBusinessCategories).HasForeignKey(x => x.BusinessCategoryId).OnDelete(DeleteBehavior.Cascade);

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



        // Seed BusinessStage (multilingual)

        modelBuilder.Entity<Lookup>().HasData(

            new Lookup { Id = 1, Type = LookupType.BusinessStage, Key = "Idea", Value = "Idea", ValueAr = "فكرة", SortOrder = 1 },

            new Lookup { Id = 2, Type = LookupType.BusinessStage, Key = "MVP", Value = "MVP", ValueAr = "المنتج الأولي", SortOrder = 2 },

            new Lookup { Id = 3, Type = LookupType.BusinessStage, Key = "Startup", Value = "Startup", ValueAr = "شركة ناشئة", SortOrder = 3 },

            new Lookup { Id = 4, Type = LookupType.BusinessStage, Key = "Running", Value = "Running", ValueAr = "قيد التشغيل", SortOrder = 4 },

            new Lookup { Id = 5, Type = LookupType.BusinessStage, Key = "Expanding", Value = "Expanding", ValueAr = "توسع", SortOrder = 5 }

        );



        // Seed ProjectPhase (multilingual)

        modelBuilder.Entity<Lookup>().HasData(

            new Lookup { Id = 6, Type = LookupType.ProjectPhase, Key = "Initiation", Value = "Initiation", ValueAr = "البدء", SortOrder = 1 },

            new Lookup { Id = 7, Type = LookupType.ProjectPhase, Key = "Planning", Value = "Planning", ValueAr = "التخطيط", SortOrder = 2 },

            new Lookup { Id = 8, Type = LookupType.ProjectPhase, Key = "Execution", Value = "Execution", ValueAr = "التنفيذ", SortOrder = 3 },

            new Lookup { Id = 9, Type = LookupType.ProjectPhase, Key = "Testing", Value = "Testing", ValueAr = "الاختبار", SortOrder = 4 },

            new Lookup { Id = 10, Type = LookupType.ProjectPhase, Key = "Launching", Value = "Launching", ValueAr = "الإطلاق", SortOrder = 5 }

        );



        // Seed RiskLevel (multilingual)

        modelBuilder.Entity<Lookup>().HasData(

            new Lookup { Id = 11, Type = LookupType.RiskLevel, Key = "Low", Value = "Low", ValueAr = "منخفض", SortOrder = 1 },

            new Lookup { Id = 12, Type = LookupType.RiskLevel, Key = "Medium", Value = "Medium", ValueAr = "متوسط", SortOrder = 2 },

            new Lookup { Id = 13, Type = LookupType.RiskLevel, Key = "High", Value = "High", ValueAr = "مرتفع", SortOrder = 3 }

        );


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
            new ReputationRule { Id = 11, RuleCode = "admin_penalty", Description = "Admin penalty", Points = -1000, IsEnabled = true, IsSystem = true, IsAutomatic = false, CanRepeat = false, MaximumOccurrences = 1, SortOrder = 11, CreatedAt = new DateTime(2025, 12, 29, 0, 0, 0, DateTimeKind.Utc) }
        );

        // Seed ScoreTransaction types

        modelBuilder.Entity<Lookup>().HasData(

            new Lookup { Id = 200, Type = LookupType.ScoreTransaction, Key = "Review", Value = "Review", ValueAr = "مراجعة", SortOrder = 1 },

            new Lookup { Id = 201, Type = LookupType.ScoreTransaction, Key = "Interactive", Value = "Interactive", ValueAr = "تفاعلي", SortOrder = 2 },

            new Lookup { Id = 202, Type = LookupType.ScoreTransaction, Key = "Deal", Value = "Deal", ValueAr = "صفقة", SortOrder = 3 }

        );



        // Seed categories

        modelBuilder.Entity<Lookup>().HasData(

            new Lookup { Id = 100, Type = LookupType.BusinessCategory, Key = "Technology", Value = "Technology", ValueAr = "تكنولوجيا", SortOrder = 1 },

            new Lookup { Id = 101, Type = LookupType.BusinessCategory, Key = "Industry", Value = "Industry", ValueAr = "صناعة", SortOrder = 2 },

            new Lookup { Id = 102, Type = LookupType.BusinessCategory, Key = "Trading", Value = "Trading", ValueAr = "تجارة", SortOrder = 3 }

        );



        // Seed BusinessCategory table with initial categories (mirror of lookup categories)

        modelBuilder.Entity<BusinessCategory>().HasData(

            new BusinessCategory { Id = 100, Key = "Technology", Value = "Technology", ValueAr = "تكنولوجيا", SortOrder = 1 },

            new BusinessCategory { Id = 101, Key = "Industry", Value = "Industry", ValueAr = "صناعة", SortOrder = 2 },

            new BusinessCategory { Id = 102, Key = "Trading", Value = "Trading", ValueAr = "تجارة", SortOrder = 3 }

        );



        var opportunityLookupSeedDate = new DateTime(2026, 6, 30, 0, 0, 0, DateTimeKind.Utc);
        modelBuilder.Entity<OpportunityCategory>().HasData(
            new OpportunityCategory { Id = 1, Name = "Technology", Description = "Technology products, platforms, and services.", IsActive = true, SortOrder = 1, CreatedAt = opportunityLookupSeedDate, UpdatedAt = opportunityLookupSeedDate },
            new OpportunityCategory { Id = 2, Name = "Food & Beverage", Description = "Food production, restaurants, cafes, and beverage ventures.", IsActive = true, SortOrder = 2, CreatedAt = opportunityLookupSeedDate, UpdatedAt = opportunityLookupSeedDate },
            new OpportunityCategory { Id = 3, Name = "Healthcare", Description = "Healthcare services, clinics, medical products, and wellness.", IsActive = true, SortOrder = 3, CreatedAt = opportunityLookupSeedDate, UpdatedAt = opportunityLookupSeedDate },
            new OpportunityCategory { Id = 4, Name = "Education", Description = "Education, training, and learning products.", IsActive = true, SortOrder = 4, CreatedAt = opportunityLookupSeedDate, UpdatedAt = opportunityLookupSeedDate },
            new OpportunityCategory { Id = 5, Name = "Retail", Description = "Retail stores, commerce operations, and consumer goods.", IsActive = true, SortOrder = 5, CreatedAt = opportunityLookupSeedDate, UpdatedAt = opportunityLookupSeedDate },
            new OpportunityCategory { Id = 6, Name = "Manufacturing", Description = "Manufacturing, production lines, and industrial operations.", IsActive = true, SortOrder = 6, CreatedAt = opportunityLookupSeedDate, UpdatedAt = opportunityLookupSeedDate },
            new OpportunityCategory { Id = 7, Name = "Agriculture", Description = "Agriculture, farms, food supply, and agri-tech.", IsActive = true, SortOrder = 7, CreatedAt = opportunityLookupSeedDate, UpdatedAt = opportunityLookupSeedDate },
            new OpportunityCategory { Id = 8, Name = "Real Estate", Description = "Real estate development, operations, and property services.", IsActive = true, SortOrder = 8, CreatedAt = opportunityLookupSeedDate, UpdatedAt = opportunityLookupSeedDate },
            new OpportunityCategory { Id = 9, Name = "Tourism", Description = "Tourism, hospitality, and travel services.", IsActive = true, SortOrder = 9, CreatedAt = opportunityLookupSeedDate, UpdatedAt = opportunityLookupSeedDate },
            new OpportunityCategory { Id = 10, Name = "Transportation", Description = "Transportation, logistics, and mobility.", IsActive = true, SortOrder = 10, CreatedAt = opportunityLookupSeedDate, UpdatedAt = opportunityLookupSeedDate },
            new OpportunityCategory { Id = 11, Name = "Energy", Description = "Energy generation, services, and sustainability.", IsActive = true, SortOrder = 11, CreatedAt = opportunityLookupSeedDate, UpdatedAt = opportunityLookupSeedDate },
            new OpportunityCategory { Id = 12, Name = "Fashion", Description = "Fashion, apparel, accessories, and design.", IsActive = true, SortOrder = 12, CreatedAt = opportunityLookupSeedDate, UpdatedAt = opportunityLookupSeedDate },
            new OpportunityCategory { Id = 13, Name = "Media", Description = "Media, content, publishing, and creative production.", IsActive = true, SortOrder = 13, CreatedAt = opportunityLookupSeedDate, UpdatedAt = opportunityLookupSeedDate },
            new OpportunityCategory { Id = 14, Name = "Gaming", Description = "Games, interactive entertainment, and gaming platforms.", IsActive = true, SortOrder = 14, CreatedAt = opportunityLookupSeedDate, UpdatedAt = opportunityLookupSeedDate },
            new OpportunityCategory { Id = 15, Name = "FinTech", Description = "Financial technology, payments, lending, and finance tools.", IsActive = true, SortOrder = 15, CreatedAt = opportunityLookupSeedDate, UpdatedAt = opportunityLookupSeedDate },
            new OpportunityCategory { Id = 16, Name = "AI", Description = "Artificial intelligence products, services, and infrastructure.", IsActive = true, SortOrder = 16, CreatedAt = opportunityLookupSeedDate, UpdatedAt = opportunityLookupSeedDate }
        );

        modelBuilder.Entity<OpportunityTag>().HasData(
            new OpportunityTag { Id = 1, Name = "AI", Description = "Uses or builds artificial intelligence.", IsActive = true, SortOrder = 1, CreatedAt = opportunityLookupSeedDate },
            new OpportunityTag { Id = 2, Name = "Export", Description = "Export-oriented business.", IsActive = true, SortOrder = 2, CreatedAt = opportunityLookupSeedDate },
            new OpportunityTag { Id = 3, Name = "Green", Description = "Sustainability or environmentally focused.", IsActive = true, SortOrder = 3, CreatedAt = opportunityLookupSeedDate },
            new OpportunityTag { Id = 4, Name = "Women-led", Description = "Founded or led by women.", IsActive = true, SortOrder = 4, CreatedAt = opportunityLookupSeedDate },
            new OpportunityTag { Id = 5, Name = "Franchise", Description = "Franchise or franchisable model.", IsActive = true, SortOrder = 5, CreatedAt = opportunityLookupSeedDate },
            new OpportunityTag { Id = 6, Name = "B2B", Description = "Business-to-business model.", IsActive = true, SortOrder = 6, CreatedAt = opportunityLookupSeedDate },
            new OpportunityTag { Id = 7, Name = "B2C", Description = "Business-to-consumer model.", IsActive = true, SortOrder = 7, CreatedAt = opportunityLookupSeedDate },
            new OpportunityTag { Id = 8, Name = "SaaS", Description = "Software as a service.", IsActive = true, SortOrder = 8, CreatedAt = opportunityLookupSeedDate },
            new OpportunityTag { Id = 9, Name = "Mobile App", Description = "Mobile application product.", IsActive = true, SortOrder = 9, CreatedAt = opportunityLookupSeedDate },
            new OpportunityTag { Id = 10, Name = "Local Business", Description = "Local market business.", IsActive = true, SortOrder = 10, CreatedAt = opportunityLookupSeedDate },
            new OpportunityTag { Id = 11, Name = "High Growth", Description = "Designed for rapid growth.", IsActive = true, SortOrder = 11, CreatedAt = opportunityLookupSeedDate },
            new OpportunityTag { Id = 12, Name = "Low Entry Ticket", Description = "Accessible minimum investment size.", IsActive = true, SortOrder = 12, CreatedAt = opportunityLookupSeedDate }
        );

        modelBuilder.Entity<FundingGoal>().HasData(
            new FundingGoal { Id = 1, Name = "Launch New Business", Description = "Funding to start a new venture.", IsActive = true, SortOrder = 1, CreatedAt = opportunityLookupSeedDate, UpdatedAt = opportunityLookupSeedDate },
            new FundingGoal { Id = 2, Name = "Expand Existing Business", Description = "Funding to scale an operating business.", IsActive = true, SortOrder = 2, CreatedAt = opportunityLookupSeedDate, UpdatedAt = opportunityLookupSeedDate },
            new FundingGoal { Id = 3, Name = "Buy Equipment", Description = "Funding to purchase equipment or machinery.", IsActive = true, SortOrder = 3, CreatedAt = opportunityLookupSeedDate, UpdatedAt = opportunityLookupSeedDate },
            new FundingGoal { Id = 4, Name = "Marketing", Description = "Funding for marketing and customer acquisition.", IsActive = true, SortOrder = 4, CreatedAt = opportunityLookupSeedDate, UpdatedAt = opportunityLookupSeedDate },
            new FundingGoal { Id = 5, Name = "Working Capital", Description = "Funding for operating cash flow.", IsActive = true, SortOrder = 5, CreatedAt = opportunityLookupSeedDate, UpdatedAt = opportunityLookupSeedDate },
            new FundingGoal { Id = 6, Name = "Open New Branch", Description = "Funding to open another location.", IsActive = true, SortOrder = 6, CreatedAt = opportunityLookupSeedDate, UpdatedAt = opportunityLookupSeedDate },
            new FundingGoal { Id = 7, Name = "Research & Development", Description = "Funding for product or technical development.", IsActive = true, SortOrder = 7, CreatedAt = opportunityLookupSeedDate, UpdatedAt = opportunityLookupSeedDate },
            new FundingGoal { Id = 8, Name = "Inventory Purchase", Description = "Funding to purchase inventory.", IsActive = true, SortOrder = 8, CreatedAt = opportunityLookupSeedDate, UpdatedAt = opportunityLookupSeedDate },
            new FundingGoal { Id = 9, Name = "Hiring", Description = "Funding to recruit and grow the team.", IsActive = true, SortOrder = 9, CreatedAt = opportunityLookupSeedDate, UpdatedAt = opportunityLookupSeedDate },
            new FundingGoal { Id = 10, Name = "Acquisition", Description = "Funding for acquisition activity.", IsActive = true, SortOrder = 10, CreatedAt = opportunityLookupSeedDate, UpdatedAt = opportunityLookupSeedDate }
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

        // BusinessCategory mapping

        modelBuilder.Entity<BusinessCategory>(bc =>

        {

            bc.HasKey(b => b.Id);

            bc.Property(b => b.Key).HasMaxLength(200);

            bc.Property(b => b.Value).HasMaxLength(200);

            bc.Property(b => b.ValueAr).HasMaxLength(200);

            bc.Property(b => b.CreatedAt).HasDefaultValueSql("GETDATE()");

        });



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
            o.HasIndex(x => x.ConversationId);
            o.HasIndex(x => new { x.ConversationId, x.Status });
            o.HasIndex(x => new { x.ConversationId, x.Version }).IsUnique();
            o.HasOne(x => x.Conversation)
                .WithMany(x => x.Offers)
                .HasForeignKey(x => x.ConversationId)
                .OnDelete(DeleteBehavior.Cascade);
            o.HasOne(x => x.CreatedByUser)
                .WithMany()
                .HasForeignKey(x => x.CreatedByUserId)
                .OnDelete(DeleteBehavior.Restrict);
            o.HasOne(x => x.ParentOffer)
                .WithMany()
                .HasForeignKey(x => x.ParentOfferId)
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

            new Permission { Id = 2002, Key = "admin.categories.manage", Name = "Manage Categories", Description = "CRUD categories", CreatedAt = seedCreatedAt },

            new Permission { Id = 2003, Key = "admin.groups.manage", Name = "Manage Groups", Description = "Manage groups and assignments", CreatedAt = seedCreatedAt },

            new Permission { Id = 2004, Key = "admin.lookups.manage", Name = "Manage Lookups", Description = "Manage lookup values", CreatedAt = seedCreatedAt },

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

            new GroupPermission { Id = 3, GroupId = 1000, PermissionId = 2002, AssignedAt = seedCreatedAt },

            new GroupPermission { Id = 4, GroupId = 1000, PermissionId = 2003, AssignedAt = seedCreatedAt },

            new GroupPermission { Id = 5, GroupId = 1000, PermissionId = 2004, AssignedAt = seedCreatedAt },

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

                CredibilityScore = 4200,

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

                CredibilityScore = 3750,

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

                CredibilityScore = 3600,

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

                BusinessCategoryId = 100,

                RiskLevel = "Medium",

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

                BusinessCategoryId = 101,

                RiskLevel = "Low",

                Currency = "USD",

                StartDate = seedCreatedAt.AddDays(-7),

                EndDate = seedCreatedAt.AddDays(14)

            }

        );



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
