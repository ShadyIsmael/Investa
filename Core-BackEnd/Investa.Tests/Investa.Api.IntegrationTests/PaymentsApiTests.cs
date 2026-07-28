using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using FluentAssertions;
using Investa.Domain.Entities;
using Investa.Domain.Entities.Enums;
using Investa.Infrastructure.Persistence;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace Investa.Api.IntegrationTests;

public class PaymentsApiTests : IClassFixture<CustomWebApplicationFactory>
{
    private static readonly Guid SeededUserId = Guid.Parse("11111111-1111-1111-1111-111111111111");
    private readonly CustomWebApplicationFactory _factory;

    public PaymentsApiTests(CustomWebApplicationFactory factory) => _factory = factory;

    private (HttpClient client, int opportunityId, int requestId) CreateClientAndSeed()
    {
        var client = _factory.CreateClient();
        int opportunityId;
        int requestId;
        using (var scope = _factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            db.Database.EnsureDeleted();
            db.AuthUsers.Add(new AuthUser { Id = SeededUserId, Name = "Payment Admin", PasswordHash = "test" });

            var opportunity = new Opportunity
            {
                FounderId = SeededUserId,
                Title = "Test Loan Opportunity",
                ShortDescription = "Integration test loan opportunity for payment recording.",
                UseOfFunds = "Integration testing",
                FundingTarget = 120000m,
                InvestmentModel = InvestmentModel.LoanInvestment,
                ProjectStage = ProjectStage.Scaling,
                Status = OpportunityStatus.InProgress,
                InterestRate = 12m,
                RepaymentFrequency = "Monthly",
                ExpectedDurationMonths = 12,
                FinalRepaymentDate = DateTime.UtcNow.AddYears(1),
                Currency = "USD",
                CreatedAt = DateTime.UtcNow.AddMonths(-2),
                UpdatedAt = DateTime.UtcNow.AddMonths(-2)
            };
            db.Opportunities.Add(opportunity);
            db.SaveChanges();
            opportunityId = opportunity.Id;

            var joinRequest = new OpportunityJoinRequest
            {
                OpportunityId = opportunityId,
                InvestorId = SeededUserId,
                RequestType = OpportunityJoinRequestType.InvestmentParticipation,
                RequestedAmount = 12000m,
                Status = OpportunityJoinRequestStatus.Approved,
                CreatedAt = DateTime.UtcNow.AddMonths(-1),
                UpdatedAt = DateTime.UtcNow.AddMonths(-1),
                ReviewedAt = DateTime.UtcNow.AddMonths(-1),
                IsVisibleToFounder = true,
                IsVisibleToInvestor = true
            };
            db.OpportunityJoinRequests.Add(joinRequest);
            db.SaveChanges();
            requestId = joinRequest.Id;
        }

        return (client, opportunityId, requestId);
    }

    private static StringContent ToJsonContent(object body) =>
        new(JsonSerializer.Serialize(body), System.Text.Encoding.UTF8, "application/json");

    private static async Task<JsonElement> ReadJsonElement(HttpResponseMessage response)
    {
        var json = await response.Content.ReadAsStringAsync();
        return JsonSerializer.Deserialize<JsonElement>(json);
    }

    [Fact]
    public async Task RecordPayment_WithValidLoanRequest_ReturnsCreatedAndPersistsAllocations()
    {
        var (client, opportunityId, requestId) = CreateClientAndSeed();

        var body = new
        {
            participationRequestId = requestId,
            amount = 1200m,
            paymentDate = DateTime.UtcNow.ToString("o"),
            reference = "PAY-LOAN-001",
            notes = "First monthly payment"
        };

        var response = await client.PostAsync($"/api/v1/opportunities/{opportunityId}/payments", ToJsonContent(body));
        response.StatusCode.Should().Be(HttpStatusCode.Created);

        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        var transactions = db.PaymentTransactions.ToList();
        transactions.Should().HaveCount(1);
        transactions[0].Amount.Should().Be(1200m);
        transactions[0].Reference.Should().Be("PAY-LOAN-001");
        transactions[0].Notes.Should().Be("First monthly payment");
        transactions[0].ParticipationRequestId.Should().Be(requestId);
        transactions[0].IsReversed.Should().BeFalse();

        var allocations = db.PaymentAllocations.Where(a => a.PaymentTransactionId == transactions[0].Id).ToList();
        allocations.Should().NotBeEmpty();
        allocations.Sum(a => a.AllocatedAmount).Should().Be(1200m);
    }

    [Fact]
    public async Task RecordPayment_WithValidRequest_ReturnsPaymentTransactionDetailDto()
    {
        var (client, opportunityId, requestId) = CreateClientAndSeed();

        var body = new
        {
            participationRequestId = requestId,
            amount = 600m,
            paymentDate = DateTime.UtcNow.ToString("o"),
            reference = "PAY-LOAN-002"
        };

        var response = await client.PostAsync($"/api/v1/opportunities/{opportunityId}/payments", ToJsonContent(body));
        response.StatusCode.Should().Be(HttpStatusCode.Created);

        var doc = await ReadJsonElement(response);
        var data = doc.GetProperty("data");
        data.TryGetProperty("id", out _).Should().BeTrue();
        data.TryGetProperty("amount", out var amountProp).Should().BeTrue();
        amountProp.GetDecimal().Should().Be(600m);
        data.TryGetProperty("reference", out var refProp).Should().BeTrue();
        refProp.GetString().Should().Be("PAY-LOAN-002");
        data.TryGetProperty("allocations", out var allocsProp).Should().BeTrue();
        allocsProp.GetArrayLength().Should().BeGreaterThan(0);
    }

    [Fact]
    public async Task RecordPayment_DuplicateReference_ReturnsConflict()
    {
        var (client, opportunityId, requestId) = CreateClientAndSeed();

        var body = new
        {
            participationRequestId = requestId,
            amount = 1200m,
            paymentDate = DateTime.UtcNow.ToString("o"),
            reference = "PAY-DUP-001"
        };

        var first = await client.PostAsync($"/api/v1/opportunities/{opportunityId}/payments", ToJsonContent(body));
        first.StatusCode.Should().Be(HttpStatusCode.Created);

        var second = await client.PostAsync($"/api/v1/opportunities/{opportunityId}/payments", ToJsonContent(body));
        second.StatusCode.Should().Be(HttpStatusCode.Conflict);
    }

    [Fact]
    public async Task RecordPayment_NonExistentParticipation_ReturnsBadRequest()
    {
        var (client, opportunityId, _) = CreateClientAndSeed();

        var body = new
        {
            participationRequestId = 99999,
            amount = 1000m,
            paymentDate = DateTime.UtcNow.ToString("o")
        };

        var response = await client.PostAsync($"/api/v1/opportunities/{opportunityId}/payments", ToJsonContent(body));
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task ReversePayment_WithValidRequest_ReturnsOkAndMarksReversed()
    {
        var (client, opportunityId, requestId) = CreateClientAndSeed();
        int transactionId;
        using (var scope = _factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var txn = new PaymentTransaction
            {
                ParticipationRequestId = requestId,
                Amount = 1200m,
                PaymentDate = DateTime.UtcNow,
                Reference = "PAY-REV-001",
                CreatedByUserId = SeededUserId,
                CreatedAt = DateTime.UtcNow
            };
            db.PaymentTransactions.Add(txn);
            db.SaveChanges();
            transactionId = txn.Id;
        }

        var body = new { paymentTransactionId = transactionId, reason = "Incorrect amount recorded" };
        var response = await client.PostAsync($"/api/v1/opportunities/{opportunityId}/payments/reverse", ToJsonContent(body));
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        using var scope2 = _factory.Services.CreateScope();
        var db2 = scope2.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var reversed = db2.PaymentTransactions.Find(transactionId);
        reversed.Should().NotBeNull();
        reversed!.IsReversed.Should().BeTrue();
        reversed.ReversalReason.Should().Be("Incorrect amount recorded");
        reversed.ReversedAt.Should().NotBeNull();
        reversed.ReversedByUserId.Should().Be(SeededUserId);
    }

    [Fact]
    public async Task ReversePayment_AlreadyReversed_ReturnsConflict()
    {
        var (client, opportunityId, requestId) = CreateClientAndSeed();
        int transactionId;
        using (var scope = _factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var txn = new PaymentTransaction
            {
                ParticipationRequestId = requestId,
                Amount = 1200m,
                PaymentDate = DateTime.UtcNow,
                Reference = "PAY-REV-002",
                CreatedByUserId = SeededUserId,
                CreatedAt = DateTime.UtcNow,
                IsReversed = true,
                ReversalReason = "Already reversed",
                ReversedAt = DateTime.UtcNow,
                ReversedByUserId = SeededUserId
            };
            db.PaymentTransactions.Add(txn);
            db.SaveChanges();
            transactionId = txn.Id;
        }

        var body = new { paymentTransactionId = transactionId, reason = "Try again" };
        var response = await client.PostAsync($"/api/v1/opportunities/{opportunityId}/payments/reverse", ToJsonContent(body));
        response.StatusCode.Should().Be(HttpStatusCode.Conflict);
    }

    [Fact]
    public async Task ReversePayment_MissingReason_ReturnsBadRequest()
    {
        var (client, opportunityId, requestId) = CreateClientAndSeed();
        int transactionId;
        using (var scope = _factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var txn = new PaymentTransaction
            {
                ParticipationRequestId = requestId,
                Amount = 1200m,
                PaymentDate = DateTime.UtcNow,
                Reference = "PAY-REV-003",
                CreatedByUserId = SeededUserId,
                CreatedAt = DateTime.UtcNow
            };
            db.PaymentTransactions.Add(txn);
            db.SaveChanges();
            transactionId = txn.Id;
        }

        var body = new { paymentTransactionId = transactionId, reason = "" };
        var response = await client.PostAsync($"/api/v1/opportunities/{opportunityId}/payments/reverse", ToJsonContent(body));
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task GetInvestorPaymentDetails_AfterRecord_IncludesTransaction()
    {
        var (client, opportunityId, requestId) = CreateClientAndSeed();
        int transactionId;
        using (var scope = _factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var txn = new PaymentTransaction
            {
                ParticipationRequestId = requestId,
                Amount = 2400m,
                PaymentDate = DateTime.UtcNow.AddDays(-5),
                Reference = "PAY-HIST-001",
                CreatedByUserId = SeededUserId,
                CreatedAt = DateTime.UtcNow.AddDays(-5)
            };
            db.PaymentTransactions.Add(txn);
            db.SaveChanges();
            transactionId = txn.Id;

            var allocs = new List<PaymentAllocation>();
            var remaining = txn.Amount;
            var installment = 1;
            while (remaining > 0)
            {
                var allocAmount = Math.Min(remaining, 1000m);
                allocs.Add(new PaymentAllocation
                {
                    PaymentTransactionId = txn.Id,
                    ParticipationRequestId = requestId,
                    AllocatedAmount = allocAmount,
                    InstallmentNumber = installment
                });
                remaining -= allocAmount;
                installment++;
            }
            db.PaymentAllocations.AddRange(allocs);
            db.SaveChanges();
        }

        var response = await client.GetAsync($"/api/v1/opportunities/{opportunityId}/payments/investors/{SeededUserId}");
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var doc = await ReadJsonElement(response);
        var data = doc.GetProperty("data");
        var transactions = data.GetProperty("paymentTransactions");
        transactions.GetArrayLength().Should().BeGreaterOrEqualTo(1);

        var found = transactions.EnumerateArray().FirstOrDefault(t => t.GetProperty("id").GetInt32() == transactionId);
        found.ValueKind.Should().NotBe(JsonValueKind.Undefined);
        found.GetProperty("amount").GetDecimal().Should().Be(2400m);
        found.GetProperty("reference").GetString().Should().Be("PAY-HIST-001");
        found.GetProperty("isReversed").GetBoolean().Should().BeFalse();

        var allocations = found.GetProperty("allocations");
        allocations.GetArrayLength().Should().BeGreaterThan(0);
    }
}
