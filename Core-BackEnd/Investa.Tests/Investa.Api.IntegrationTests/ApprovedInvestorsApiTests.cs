using System.Net;
using System.Net.Http.Json;
using System.Text.Json.Nodes;
using FluentAssertions;
using Investa.Domain.Entities;
using Investa.Domain.Entities.Enums;
using Investa.Infrastructure.Persistence;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace Investa.Api.IntegrationTests;

public class ApprovedInvestorsApiTests : IClassFixture<CustomWebApplicationFactory>
{
    private static readonly Guid OwnerId = Guid.Parse("11111111-1111-1111-1111-111111111111");
    private readonly CustomWebApplicationFactory _factory;

    public ApprovedInvestorsApiTests(CustomWebApplicationFactory factory) => _factory = factory;

    [Fact]
    public async Task Owner_receives_only_unique_approved_investment_participants()
    {
        var client = _factory.CreateClient();
        int opportunityId;
        var approvedIds = Enumerable.Range(1, 5)
            .Select(index => Guid.Parse($"20000000-0000-0000-0000-{index:D12}"))
            .ToArray();

        using (var scope = _factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            db.AuthUsers.Add(new AuthUser { Id = OwnerId, Name = "Owner", PasswordHash = "test" });
            foreach (var (investorId, index) in approvedIds.Select((id, index) => (id, index)))
            {
                var user = new AuthUser { Id = investorId, Name = $"Investor {index + 1}", PasswordHash = "test" };
                db.AuthUsers.Add(user);
                db.UserProfiles.Add(new UserProfile
                {
                    UserId = investorId,
                    FullName = $"Approved Investor {index + 1}",
                    AvatarUrl = index == 0 ? null : $"avatars/{index + 1}.png"
                });
            }

            var opportunity = new Opportunity
            {
                FounderId = OwnerId,
                Title = "Approved investor test",
                ShortDescription = "Test",
                UseOfFunds = "Test",
                FundingTarget = 1000,
                InvestmentModel = InvestmentModel.LoanInvestment,
                ProjectStage = ProjectStage.Scaling,
                Status = OpportunityStatus.Published
            };
            db.Opportunities.Add(opportunity);
            db.SaveChanges();
            opportunityId = opportunity.Id;

            var approvedAt = DateTime.UtcNow.AddDays(-1);
            db.OpportunityJoinRequests.AddRange(approvedIds.Select((id, index) => new OpportunityJoinRequest
            {
                OpportunityId = opportunityId,
                InvestorId = id,
                RequestType = OpportunityJoinRequestType.InvestmentParticipation,
                Status = OpportunityJoinRequestStatus.Approved,
                RequestedAmount = 100 + index,
                TermsSnapshotJson = index == 0 ? """{"legTypeName":"ProfitSharing","currencySnapshot":"USD"}""" : null,
                ReviewedAt = approvedAt,
                UpdatedAt = approvedAt
            }));
            db.OpportunityJoinRequests.Add(new OpportunityJoinRequest
            {
                OpportunityId = opportunityId,
                InvestorId = approvedIds[0],
                RequestType = OpportunityJoinRequestType.InvestmentParticipation,
                Status = OpportunityJoinRequestStatus.Approved,
                RequestedAmount = 250,
                ReviewedAt = approvedAt.AddHours(1),
                UpdatedAt = approvedAt.AddHours(1)
            });
            db.OpportunityJoinRequests.Add(new OpportunityJoinRequest
            {
                OpportunityId = opportunityId,
                InvestorId = Guid.NewGuid(),
                RequestType = OpportunityJoinRequestType.InvestmentParticipation,
                Status = OpportunityJoinRequestStatus.Pending
            });
            db.OpportunityJoinRequests.Add(new OpportunityJoinRequest
            {
                OpportunityId = opportunityId,
                InvestorId = Guid.NewGuid(),
                RequestType = OpportunityJoinRequestType.GeneralParticipation,
                Status = OpportunityJoinRequestStatus.Approved
            });
            db.SaveChanges();
        }

        var response = await client.GetAsync($"/api/v1/opportunities/{opportunityId}/approved-investors");
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var json = await response.Content.ReadFromJsonAsync<JsonObject>();
        var items = json!["data"]!.AsArray();
        items.Should().HaveCount(5);
        items.Select(item => item!["userId"]!.ToString()).Should().OnlyHaveUniqueItems();
        items.Select(item => item!.AsObject().Select(property => property.Key))
            .Should().OnlyContain(keys => keys.Order().SequenceEqual(new[]
            {
                "approvedAt", "avatarUrl", "displayName", "participations", "totalApprovedContribution", "userId"
            }));
        items[0]!["avatarUrl"].Should().BeNull();
        items[0]!["totalApprovedContribution"]!.GetValue<decimal>().Should().Be(350);
        var participations = items[0]!["participations"]!.AsArray();
        participations.Should().HaveCount(2);
        participations.Select(item => item!["investmentModel"]!.ToString())
            .Should().BeEquivalentTo(new[] { "Profit Sharing", "Loan" });
    }

    [Fact]
    public async Task Non_owner_is_rejected()
    {
        var client = _factory.CreateClient();
        int opportunityId;
        using (var scope = _factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var opportunity = new Opportunity
            {
                FounderId = Guid.NewGuid(), Title = "Not owned", ShortDescription = "Test", UseOfFunds = "Test",
                FundingTarget = 1000, InvestmentModel = InvestmentModel.LoanInvestment,
                ProjectStage = ProjectStage.Scaling, Status = OpportunityStatus.Published
            };
            db.Opportunities.Add(opportunity);
            db.SaveChanges();
            opportunityId = opportunity.Id;
        }

        var response = await client.GetAsync($"/api/v1/opportunities/{opportunityId}/approved-investors");
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }
}
