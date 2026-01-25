using Investa.Domain.Entities;
using Investa.Domain.Entities.Enums;
using Investa.Domain.Entities.Security;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace Investa.Infrastructure.Persistence;

/// <summary>
/// Application database context that combines business entities with ASP.NET Core Identity
/// Inherits from IdentityDbContext to support user authentication and authorization
/// </summary>
public class ApplicationDbContext : IdentityDbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    // Stores application business users (domain-level user records used by the app services)
    public DbSet<User> ApplicationUsers { get; set; }

    // Stores extended profile information for users (full name, contact, addresses, timestamps)
    public DbSet<UserProfile> UserProfiles { get; set; }

    // Legacy/central authentication records that mirror or complement Identity users
    public DbSet<AuthUser> AuthUsers { get; set; }

    // Client-specific records containing business/customer details
    public DbSet<Client> Clients { get; set; }

    // Lookup table for client statuses (Active, Suspended, etc.)
    public DbSet<ClientStatus> ClientStatuses { get; set; }

    // History of changes to a client's status over time
    public DbSet<ClientStatusHistory> ClientStatusHistories { get; set; }

    // Employee records linked to AuthUser for internal staff
    public DbSet<Employee> Employees { get; set; }

    // Investments made by users
    public DbSet<Investment> Investments { get; set; }
    
    // Tracks individual investor participation in investment opportunities
    public DbSet<InvestmentParticipant> InvestmentParticipants { get; set; }
    
    // Team members/founders associated with investment opportunities
    public DbSet<InvestmentTeamMember> InvestmentTeamMembers { get; set; }

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

    // Chat module entities (conversations, messages, attachments, reactions)
    public DbSet<Investa.Domain.Entities.Chat.Conversation> Conversations { get; set; }
    public DbSet<Investa.Domain.Entities.Chat.ChatMessage> ChatMessages { get; set; }
    public DbSet<Investa.Domain.Entities.Chat.ConversationParticipant> ConversationParticipants { get; set; }
    public DbSet<Investa.Domain.Entities.Chat.MessageAttachment> MessageAttachments { get; set; }
    public DbSet<Investa.Domain.Entities.Chat.MessageReaction> MessageReactions { get; set; }

    // Support Session entities (new support request handling)
    public DbSet<SupportSession> SupportSessions { get; set; }
    public DbSet<Message> Messages { get; set; }

    // Refresh tokens for long-lived authentication sessions
    public DbSet<RefreshToken> RefreshTokens { get; set; }

    // Records credit-related balance changes per user
    public DbSet<CreditTransaction> CreditTransactions { get; set; }

    // Configuration table for credit packages/options
    public DbSet<CreditConfiguration> CreditConfigurations { get; set; }

    // Records score/points transactions for users (e.g., reward points)
    public DbSet<ScoreTransaction> ScoreTransactions { get; set; }

    // Many-to-many join between Clients and BusinessCategories
    public DbSet<ClientBusinessCategory> ClientBusinessCategories { get; set; }

    // Firebase Cloud Messaging device tokens for push notifications (new keyword hides Identity's UserTokens)
    public new DbSet<UserToken> UserTokens { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configure decimal precision
        modelBuilder.Entity<User>()
            .Property(u => u.WalletBalance)
            .HasPrecision(18, 2);

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
            .HasDefaultValue("Confirmed");
            
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

                // Relationship to User (whose score is affected)
                ctb.HasOne(c => c.User)
                   .WithMany()
                   .HasForeignKey(c => c.UserId)
                   .OnDelete(DeleteBehavior.Restrict);

                // Relationship to Admin (who triggered the transaction, if manual)
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

            // CreditConfiguration mapping
            modelBuilder.Entity<CreditConfiguration>(cc =>
            {
                cc.HasKey(x => x.Id);
                cc.Property(x => x.Amount).HasColumnType("decimal(18,2)");
                cc.Property(x => x.FromDate).HasColumnType("datetime2");
                cc.Property(x => x.CreatedAt).HasDefaultValueSql("GETDATE()");
            });
        // Configure User entity
        modelBuilder.Entity<User>()
            .Property(u => u.CredibilityScore)
            .HasDefaultValue(3500);

        modelBuilder.Entity<User>()
            .Property(u => u.ClientType)
            .HasConversion<int>();

        // Configure UserProfile entity - One-to-One relationship with User
        modelBuilder.Entity<UserProfile>()
            .HasOne(up => up.User)
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

        // AuthUser mapping
        modelBuilder.Entity<AuthUser>(eb =>
        {
            eb.HasKey(a => a.Id);
            eb.Property(a => a.Email).HasMaxLength(256);
            eb.Property(a => a.PasswordHash).HasMaxLength(512).IsRequired();
            eb.Property(a => a.UserType).HasConversion<string>().HasMaxLength(20).IsRequired();
            eb.Property(a => a.Status).HasDefaultValue(true);
            eb.Property(a => a.FirebaseUid).HasMaxLength(128).IsRequired(false);
            eb.Property(a => a.SuspendedUntil).HasColumnType("datetime2").IsRequired(false);
            eb.Property(a => a.CreatedAt).HasDefaultValueSql("GETDATE()");
            eb.HasIndex(a => a.Email).IsUnique().HasFilter("\"Email\" IS NOT NULL");
            eb.HasIndex(a => a.FirebaseUid).IsUnique(false).HasFilter("\"FirebaseUid\" IS NOT NULL");
        });

        // Conversation mapping (Status + Category support)
        modelBuilder.Entity<Investa.Domain.Entities.Chat.Conversation>(c =>
        {
            c.HasKey(x => x.Id);
            c.Property(x => x.UserMobile).HasMaxLength(50).IsRequired();
            c.Property(x => x.AdminEmail).HasMaxLength(256).IsRequired(false);
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
        
        // UserRole configuration
        modelBuilder.Entity<Investa.Domain.Entities.Security.UserRole>(ur =>
        {
            ur.HasKey(x => x.Id);
            ur.Property(x => x.AssignedAt).HasDefaultValueSql("GETDATE()");
            ur.HasIndex(x => new { x.UserId, x.RoleId }).IsUnique();
            ur.Property(x => x.AuthUserId).IsRequired(false);
            
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
        // Employee mapping - one-to-one with AuthUser
        modelBuilder.Entity<Employee>(eb2 =>
        {
            eb2.HasKey(e => e.Id);
            eb2.Property(e => e.EmployeeNumber).HasMaxLength(50).IsRequired();
            eb2.Property(e => e.Department).HasMaxLength(100);
            eb2.Property(e => e.PermissionsLevel).HasDefaultValue((byte)1);
            eb2.Property(e => e.HireDate).HasColumnType("date");
            eb2.Property(e => e.CreatedAt).HasDefaultValueSql("GETDATE()");
            eb2.Property(e => e.UpdatedAt).HasDefaultValueSql("GETDATE()");

            eb2.HasOne(e => e.User)
               .WithOne(u => u.Employee)
               .HasForeignKey<Employee>(e => e.UserId)
               .OnDelete(DeleteBehavior.Cascade);
            eb2.HasIndex(e => e.UserId).IsUnique();
            eb2.HasIndex(e => e.EmployeeNumber).IsUnique();
        });

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
            c.Property(x => x.UserMobile).HasMaxLength(20).IsRequired();
            c.Property(x => x.AdminEmail).HasMaxLength(256).IsRequired(false);
            c.Property(x => x.CreatedAt).HasDefaultValueSql("GETDATE()");
            c.Property(x => x.IsActive).HasDefaultValue(true);

            // Conversation -> Messages relationship removed: messages are now linked to SupportSessions
            // c.HasMany(x => x.Messages).WithOne(m => m.Conversation).HasForeignKey(m => m.ConversationId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Investa.Domain.Entities.Chat.ChatMessage>(m =>
        {
            m.HasKey(x => x.Id);
            m.Property(x => x.SenderId).HasMaxLength(256).IsRequired();
            m.Property(x => x.MessageText).HasColumnType("nvarchar(max)").IsRequired();
            m.Property(x => x.Timestamp).HasDefaultValueSql("GETDATE()");
            m.Property(x => x.IsRead).HasDefaultValue(false);

            // FK to SupportSession (nullable to allow gradual migration)
            m.HasOne<SupportSession>()
                .WithMany()
                .HasForeignKey(x => x.SupportSessionId)
                .OnDelete(DeleteBehavior.Cascade);

            // Preserve existing ConversationId index and add SupportSessionId index
            // Removed ConversationId index - using SupportSessionId instead
            // m.HasIndex(x => new { x.ConversationId, x.Timestamp });
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
            new Permission { Id = 2005, Key = "admin.dev.manage", Name = "Dev Tools", Description = "Development utility endpoints", CreatedAt = seedCreatedAt }
        );

        // Assign all permissions to Org_Admin group by default
        modelBuilder.Entity<GroupPermission>().HasData(
            new GroupPermission { Id = 1, GroupId = 1000, PermissionId = 2000, AssignedAt = seedCreatedAt },
            new GroupPermission { Id = 2, GroupId = 1000, PermissionId = 2001, AssignedAt = seedCreatedAt },
            new GroupPermission { Id = 3, GroupId = 1000, PermissionId = 2002, AssignedAt = seedCreatedAt },
            new GroupPermission { Id = 4, GroupId = 1000, PermissionId = 2003, AssignedAt = seedCreatedAt },
            new GroupPermission { Id = 5, GroupId = 1000, PermissionId = 2004, AssignedAt = seedCreatedAt },
            new GroupPermission { Id = 6, GroupId = 1000, PermissionId = 2005, AssignedAt = seedCreatedAt }
        );

        // Seed sample users (founders and investors) for equity testing
        modelBuilder.Entity<User>().HasData(
            new User {
                Id = Guid.Parse("11111111-1111-1111-1111-111111111111"),
                Name = "Alice Founder",
                Email = "alice.founder@example.com",
                Role = "Client",
                ClientType = Investa.Domain.Entities.Enums.ClientType.Founder,
                CredibilityScore = 4200,
                WalletBalance = 100000m
            },
            new User {
                Id = Guid.Parse("22222222-2222-2222-2222-222222222222"),
                Name = "Bob Investor",
                Email = "bob.investor@example.com",
                Role = "Client",
                ClientType = Investa.Domain.Entities.Enums.ClientType.Investor,
                CredibilityScore = 3750,
                WalletBalance = 25000m
            },
            new User {
                Id = Guid.Parse("33333333-3333-3333-3333-333333333333"),
                Name = "Clara Investor",
                Email = "clara.investor@example.com",
                Role = "Client",
                ClientType = Investa.Domain.Entities.Enums.ClientType.Investor,
                CredibilityScore = 3600,
                WalletBalance = 15000m
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
                Status = "Confirmed",
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
                Status = "Confirmed",
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
                Status = "Confirmed",
                IsAnonymous = false,
                CreatedAt = seedCreatedAt.AddDays(-2)
            }
        );
    }
}