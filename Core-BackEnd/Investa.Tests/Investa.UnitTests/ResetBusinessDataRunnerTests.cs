using FluentAssertions;
using Investa.Domain.Entities;
using Investa.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using ResetBusinessDataRunner;
using Xunit;
using Xunit.Sdk;

namespace Investa.UnitTests;

public sealed class ResetBusinessDataRunnerTests
{
    [Fact]
    public void Catalog_preserves_identity_reference_finance_and_support_tables()
    {
        BusinessDataResetCatalog.PreservedTables.Should().Contain(new[]
        {
            "AspNetUsers", "AspNetRoles", "AspNetUserRoles", "AuthUsers", "Roles", "UserRoles", "Permissions",
            "Currencies", "Lookups", "OpportunityCategories", "OpportunityTags", "FundingGoals",
            "Wallets", "WalletTransactions", "FinanceTransactions", "SupportSessions"
        });

        BusinessDataResetCatalog.PreservedTables.Should().NotContain("Projects");
        BusinessDataResetCatalog.PreservedTables.Should().NotContain("Opportunities");
        BusinessDataResetCatalog.PreservedTables.Should().NotContain("NegotiationOffers");
    }

    [Fact]
    public void Catalog_resolves_only_existing_business_tables()
    {
        var resolved = BusinessDataResetCatalog.ResolveExistingTables(new[]
        {
            "Projects", "Currencies", "AspNetUsers", "OfferVersions", "UnknownFutureReferenceTable"
        });

        resolved.Should().BeEquivalentTo("Projects", "OfferVersions");
    }

    [Fact]
    public void Delete_order_places_children_before_parents()
    {
        var order = BusinessDataResetEngine.BuildDeleteOrder(
            new[] { "dbo.Projects", "dbo.Opportunities", "dbo.OpportunityJoinRequests", "dbo.PaymentTransactions" },
            new[]
            {
                ("dbo.Opportunities", "dbo.Projects"),
                ("dbo.OpportunityJoinRequests", "dbo.Opportunities"),
                ("dbo.PaymentTransactions", "dbo.OpportunityJoinRequests")
            });

        var ordered = order.ToList();
        ordered.IndexOf("dbo.PaymentTransactions").Should().BeLessThan(ordered.IndexOf("dbo.OpportunityJoinRequests"));
        ordered.IndexOf("dbo.OpportunityJoinRequests").Should().BeLessThan(ordered.IndexOf("dbo.Opportunities"));
        ordered.IndexOf("dbo.Opportunities").Should().BeLessThan(ordered.IndexOf("dbo.Projects"));
    }

    [Fact]
    public void Delete_order_rejects_unbreakable_cycles()
    {
        var action = () => BusinessDataResetEngine.BuildDeleteOrder(
            new[] { "dbo.A", "dbo.B" },
            new[] { ("dbo.A", "dbo.B"), ("dbo.B", "dbo.A") });

        action.Should().Throw<InvalidOperationException>().WithMessage("*foreign-key cycle*");
    }

    [Fact]
    public void Business_catalog_contains_legacy_and_canonical_offer_names()
    {
        BusinessDataResetCatalog.BusinessTables.Should().Contain(new[]
        {
            "NegotiationOffers", "NegotiationOfferLegs", "Offers", "OfferVersions", "OfferLegs",
            "Participations", "ParticipationLegs", "InvestmentRequests"
        });
    }

    [Fact]
    public async Task SqlServer_reset_removes_business_data_and_preserves_users_and_reference_data()
    {
        var connectionString = Environment.GetEnvironmentVariable("INVESTA_RESET_TEST_CONNECTION");
        if (string.IsNullOrWhiteSpace(connectionString))
            return;

        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseSqlServer(connectionString)
            .Options;
        await using var db = new ApplicationDbContext(options);
        await db.Database.EnsureCreatedAsync();

        if (!await db.Database.CanConnectAsync())
            throw new InvalidOperationException("The reset test database is not reachable.");

        var user = await db.AuthUsers.AsNoTracking().FirstOrDefaultAsync();
        if (user == null)
        {
            user = new AuthUser
            {
                Id = Guid.NewGuid(),
                Name = "Reset Test User",
                PasswordHash = "not-used",
                Email = $"reset-{Guid.NewGuid():N}@test.invalid"
            };
            db.AuthUsers.Add(user);
            await db.SaveChangesAsync();
        }

        var usersBefore = await db.AuthUsers.CountAsync();
        var rolesBefore = await db.Roles.CountAsync();
        var permissionsBefore = await db.Permissions.CountAsync();
        var currenciesBefore = await db.Currencies.CountAsync();
        var project = new Project
        {
            FounderId = user.Id,
            DisplayName = "Reset Test Project",
            Slug = $"reset-{Guid.NewGuid():N}",
            Summary = "Reset test summary",
            Description = "Reset test description",
            DefaultCurrency = "USD",
            BusinessStage = Investa.Domain.Entities.Enums.ProjectStage.Idea
        };
        db.Projects.Add(project);
        await db.SaveChangesAsync();
        db.Opportunities.Add(new Opportunity
        {
            ProjectId = project.Id,
            SequenceNumber = 1,
            FounderId = user.Id,
            Title = "Reset Test Opportunity",
            ShortDescription = "Reset test opportunity",
            UseOfFunds = "Reset test",
            FundingTarget = 1000,
            FundingCurrency = "USD",
            ProjectStage = Investa.Domain.Entities.Enums.ProjectStage.Idea
        });
        await db.SaveChangesAsync();

        var engine = new BusinessDataResetEngine();
        var first = await engine.ExecuteAsync(db.Database.GetDbConnection());
        var second = await engine.ExecuteAsync(db.Database.GetDbConnection());

        (await db.Projects.CountAsync()).Should().Be(0);
        (await db.Opportunities.CountAsync()).Should().Be(0);
        (await db.AuthUsers.CountAsync()).Should().Be(usersBefore);
        (await db.Roles.CountAsync()).Should().Be(rolesBefore);
        (await db.Permissions.CountAsync()).Should().Be(permissionsBefore);
        (await db.Currencies.CountAsync()).Should().Be(currenciesBefore);
        first.Tables.Should().OnlyContain(row => row.After == 0);
        second.Tables.Should().OnlyContain(row => row.Deleted == 0);
    }
}
