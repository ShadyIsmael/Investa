using Investa.Domain.Entities;
using Investa.Domain.Entities.Enums;
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

    public DbSet<User> ApplicationUsers { get; set; }
    public DbSet<UserProfile> UserProfiles { get; set;}
    public DbSet<Project> Projects { get; set; }
    public DbSet<Investment> Investments { get; set; }
    public DbSet<Transaction> Transactions { get; set;}
    public DbSet<Lookup> Lookups { get; set; }
    public DbSet<Partner> Partners { get; set; }
    public DbSet<InvestmentOpportunity> InvestmentOpportunities { get; set; }
    public DbSet<InvestmentReview> InvestmentReviews { get; set; }
    public DbSet<InvestmentUser> InvestmentUsers { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configure decimal precision
        modelBuilder.Entity<User>()
            .Property(u => u.WalletBalance)
            .HasPrecision(18, 2);

        modelBuilder.Entity<Project>()
            .Property(p => p.TargetAmount)
            .HasPrecision(18, 2);

        modelBuilder.Entity<Project>()
            .Property(p => p.CurrentAmount)
            .HasPrecision(18, 2);

        modelBuilder.Entity<Investment>()
            .Property(i => i.Amount)
            .HasPrecision(18, 2);

        modelBuilder.Entity<Transaction>()
            .Property(t => t.Amount)
            .HasPrecision(18, 2);

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

        // Configure UserProfile timestamps
        modelBuilder.Entity<UserProfile>()
            .Property(up => up.CreatedAt)
            .HasDefaultValueSql("GETUTCDATE()");

        modelBuilder.Entity<UserProfile>()
            .Property(up => up.UpdatedAt)
            .HasDefaultValueSql("GETUTCDATE()");

        // Relationships
        modelBuilder.Entity<Investment>()
            .HasOne(i => i.Investor)
            .WithMany(u => u.Investments)
            .HasForeignKey(i => i.InvestorId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Investment>()
            .HasOne(i => i.Project)
            .WithMany(p => p.Investments)
            .HasForeignKey(i => i.ProjectId)
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

        // Seed project phases
        modelBuilder.Entity<Lookup>().HasData(
            new Lookup { Id = 1, Type = LookupType.BusinessStage, Key = "Initiation", Value = "Initiation", SortOrder = 1 },
            new Lookup { Id = 2, Type = LookupType.BusinessStage, Key = "Planning", Value = "Planning", SortOrder = 2 },
            new Lookup { Id = 3, Type = LookupType.BusinessStage, Key = "Execution", Value = "Execution", SortOrder = 3 },
            new Lookup { Id = 4, Type = LookupType.BusinessStage, Key = "Running", Value = "Running", SortOrder = 4 },
            new Lookup { Id = 5, Type = LookupType.BusinessStage, Key = "Expanding", Value = "Expanding", SortOrder = 5 }
        );

        // Seed categories
        modelBuilder.Entity<Lookup>().HasData(
            new Lookup { Id = 100, Type = LookupType.BusinessCategory, Key = "Technology", Value = "Technology", SortOrder = 1 },
            new Lookup { Id = 101, Type = LookupType.BusinessCategory, Key = "Industry", Value = "Industry", SortOrder = 2 },
            new Lookup { Id = 102, Type = LookupType.BusinessCategory, Key = "Trading", Value = "Trading", SortOrder = 3 }
        );

        // Partners - none seeded

        // InvestmentOpportunity configuration
        modelBuilder.Entity<InvestmentOpportunity>()
            .Property(io => io.TargetFund)
            .HasPrecision(18, 2);

        modelBuilder.Entity<InvestmentOpportunity>()
            .HasOne(io => io.Partner)
            .WithMany()
            .HasForeignKey(io => io.PartnerId)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<InvestmentReview>()
            .HasOne(r => r.InvestmentOpportunity)
            .WithMany(io => io.Reviews)
            .HasForeignKey(r => r.InvestmentOpportunityId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<InvestmentUser>()
            .HasOne(iu => iu.InvestmentOpportunity)
            .WithMany(io => io.InvestmentUsers)
            .HasForeignKey(iu => iu.InvestmentOpportunityId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}