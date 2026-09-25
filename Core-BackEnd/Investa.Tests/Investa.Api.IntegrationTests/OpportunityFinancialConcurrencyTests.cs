using FluentAssertions;
using Investa.Domain.Entities;
using Investa.Domain.Entities.Enums;
using Investa.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Investa.Api.IntegrationTests;

public sealed class OpportunityFinancialConcurrencyTests
{
    private static readonly string ConnectionString =
        $"Server=localhost;Database=InvestaOpportunityConcurrency_{Guid.NewGuid():N};Trusted_Connection=True;TrustServerCertificate=True;Encrypt=False";

    private static ApplicationDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseSqlServer(ConnectionString)
            .Options;
        return new ApplicationDbContext(options);
    }

    [Fact]
    public async Task Simultaneous_duplicate_join_requests_are_database_idempotent()
    {
        await WithDatabase(async seed =>
        {
            var (opportunityId, investorId, _) = await SeedParticipationGraph(seed);
            await using var first = CreateContext();
            await using var second = CreateContext();
            first.OpportunityJoinRequests.Add(NewJoin(opportunityId, investorId));
            second.OpportunityJoinRequests.Add(NewJoin(opportunityId, investorId));

            var results = await Task.WhenAll(Capture(first.SaveChangesAsync()), Capture(second.SaveChangesAsync()));

            results.Count(e => e == null).Should().Be(1);
            results.Count(e => e is DbUpdateException).Should().Be(1);
        });
    }

    [Fact]
    public async Task Simultaneous_approval_of_same_participation_has_one_winner()
    {
        await WithDatabase(async seed =>
        {
            var (_, _, requestId) = await SeedParticipationGraph(seed, addJoin: true);
            await using var first = CreateContext();
            await using var second = CreateContext();
            var a = await first.OpportunityJoinRequests.SingleAsync(x => x.Id == requestId);
            var b = await second.OpportunityJoinRequests.SingleAsync(x => x.Id == requestId);
            a.Status = OpportunityJoinRequestStatus.Approved;
            b.Status = OpportunityJoinRequestStatus.Approved;

            await first.SaveChangesAsync();
            var conflict = await Capture(second.SaveChangesAsync());

            conflict.Should().BeOfType<DbUpdateConcurrencyException>();
        });
    }

    [Fact]
    public async Task Simultaneous_funding_updates_cannot_both_commit()
    {
        await WithDatabase(async seed =>
        {
            var (opportunityId, _, _) = await SeedParticipationGraph(seed);
            await using var first = CreateContext();
            await using var second = CreateContext();
            var a = await first.Opportunities.SingleAsync(x => x.Id == opportunityId);
            var b = await second.Opportunities.SingleAsync(x => x.Id == opportunityId);
            a.UpdatedAt = DateTime.UtcNow.AddSeconds(1);
            b.UpdatedAt = DateTime.UtcNow.AddSeconds(2);

            await first.SaveChangesAsync();
            (await Capture(second.SaveChangesAsync())).Should().BeOfType<DbUpdateConcurrencyException>();
        });
    }

    [Fact]
    public async Task Repeated_payment_idempotency_key_is_unique()
    {
        await WithDatabase(async seed =>
        {
            var (_, _, requestId) = await SeedParticipationGraph(seed, addJoin: true, approved: true);
            seed.PaymentTransactions.Add(NewPayment(requestId, "same-payment"));
            seed.PaymentTransactions.Add(NewPayment(requestId, "same-payment"));

            (await Capture(seed.SaveChangesAsync())).Should().BeOfType<DbUpdateException>();
        });
    }

    [Fact]
    public async Task Parallel_payment_confirmation_creates_one_payment()
    {
        await WithDatabase(async seed =>
        {
            var (_, _, requestId) = await SeedParticipationGraph(seed, addJoin: true, approved: true);
            await using var first = CreateContext();
            await using var second = CreateContext();
            first.PaymentTransactions.Add(NewPayment(requestId, "parallel-payment"));
            second.PaymentTransactions.Add(NewPayment(requestId, "parallel-payment"));

            var results = await Task.WhenAll(Capture(first.SaveChangesAsync()), Capture(second.SaveChangesAsync()));

            results.Count(e => e == null).Should().Be(1);
            results.Count(e => e is DbUpdateException).Should().Be(1);
        });
    }

    [Fact]
    public async Task Repeated_bulk_installment_confirmation_is_unique()
    {
        await WithDatabase(async seed =>
        {
            var (_, _, requestId) = await SeedParticipationGraph(seed, addJoin: true, approved: true);
            var firstPayment = NewPayment(requestId, "bulk-payment-1");
            var secondPayment = NewPayment(requestId, "bulk-payment-2");
            seed.PaymentTransactions.AddRange(firstPayment, secondPayment);
            await seed.SaveChangesAsync();
            seed.PaymentAllocations.Add(NewAllocation(firstPayment.Id, requestId, "bulk:installment:1"));
            seed.PaymentAllocations.Add(NewAllocation(secondPayment.Id, requestId, "bulk:installment:1"));

            (await Capture(seed.SaveChangesAsync())).Should().BeOfType<DbUpdateException>();
        });
    }

    [Fact]
    public async Task Scoped_financial_write_rolls_back_when_an_allocation_fails()
    {
        await WithDatabase(async seed =>
        {
            var (_, _, requestId) = await SeedParticipationGraph(seed, addJoin: true, approved: true);
            await using var transaction = await seed.Database.BeginTransactionAsync();
            var payment = NewPayment(requestId, "rollback-payment");
            seed.PaymentTransactions.Add(payment);
            await seed.SaveChangesAsync();
            seed.PaymentAllocations.Add(NewAllocation(payment.Id, requestId, "rollback-key"));
            seed.PaymentAllocations.Add(NewAllocation(payment.Id, requestId, "rollback-key"));
            (await Capture(seed.SaveChangesAsync())).Should().BeOfType<DbUpdateException>();
            await transaction.RollbackAsync();

            await using var verification = CreateContext();
            (await verification.PaymentTransactions.CountAsync(x => x.IdempotencyKey == "rollback-payment")).Should().Be(0);
        });
    }

    private static async Task WithDatabase(Func<ApplicationDbContext, Task> test)
    {
        await using var context = CreateContext();
        await context.Database.EnsureDeletedAsync();
        await context.Database.MigrateAsync();
        try
        {
            await test(context);
        }
        finally
        {
            await context.Database.EnsureDeletedAsync();
        }
    }

    private static async Task<(int OpportunityId, Guid InvestorId, int RequestId)> SeedParticipationGraph(
        ApplicationDbContext context, bool addJoin = false, bool approved = false)
    {
        var founder = NewUser("founder");
        var investor = NewUser("investor");
        context.AuthUsers.AddRange(founder, investor);
        var project = new Project
        {
            FounderId = founder.Id,
            DisplayName = "Concurrency project",
            Slug = $"concurrency-project-{Guid.NewGuid():N}",
            Summary = "Relational concurrency test",
            Description = "Seed data for concurrency tests",
            BusinessStage = ProjectStage.Startup,
            Status = ProjectStatus.Active,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        context.Projects.Add(project);
        await context.SaveChangesAsync();
        var opportunity = new Opportunity
        {
            ProjectId = project.Id,
            FounderId = founder.Id,
            Title = "Concurrency opportunity",
            Description = "Relational concurrency test",
            FundingCurrency = "EGP",
            Currency = "EGP",
            Status = OpportunityStatus.Funding,
            InvestmentModel = InvestmentModel.Equity,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        context.Opportunities.Add(opportunity);
        await context.SaveChangesAsync();

        var requestId = 0;
        if (addJoin)
        {
            var join = NewJoin(opportunity.Id, investor.Id);
            join.Status = approved ? OpportunityJoinRequestStatus.Approved : OpportunityJoinRequestStatus.Pending;
            context.OpportunityJoinRequests.Add(join);
            await context.SaveChangesAsync();
            requestId = join.Id;
        }

        return (opportunity.Id, investor.Id, requestId);
    }

    private static AuthUser NewUser(string name) => new()
    {
        Id = Guid.NewGuid(),
        Email = $"{name}-{Guid.NewGuid():N}@example.test",
        Name = name,
        UserType = UserType.Client,
        ClientType = name == "founder" ? ClientType.Founder : ClientType.Investor,
        Status = true
    };

    private static OpportunityJoinRequest NewJoin(int opportunityId, Guid investorId) => new()
    {
        OpportunityId = opportunityId,
        InvestorId = investorId,
        Status = OpportunityJoinRequestStatus.Pending,
        RequestType = OpportunityJoinRequestType.InvestmentParticipation,
        FundingCurrency = "EGP",
        EnteredCurrency = "EGP",
        CreatedAt = DateTime.UtcNow,
        UpdatedAt = DateTime.UtcNow
    };

    private static PaymentTransaction NewPayment(int requestId, string key) => new()
    {
        ParticipationRequestId = requestId,
        Amount = 100,
        PaymentDate = DateTime.UtcNow.Date,
        IdempotencyKey = key,
        CreatedByUserId = Guid.NewGuid(),
        CreatedAt = DateTime.UtcNow
    };

    private static PaymentAllocation NewAllocation(int paymentId, int requestId, string key) => new()
    {
        PaymentTransactionId = paymentId,
        ParticipationRequestId = requestId,
        InstallmentNumber = 1,
        AllocatedAmount = 100,
        InstallmentConfirmationKey = key
    };

    private static async Task<Exception?> Capture(Task action)
    {
        try
        {
            await action;
            return null;
        }
        catch (Exception ex)
        {
            return ex;
        }
    }
}
