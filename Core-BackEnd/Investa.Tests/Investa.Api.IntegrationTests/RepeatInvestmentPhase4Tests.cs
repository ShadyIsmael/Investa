using System.Net;
using System.Net.Http.Json;
using System.Text.Json.Nodes;
using FluentAssertions;
using Investa.Application.DTOs;
using Investa.Application.Interfaces;
using Investa.Domain.Entities;
using Investa.Domain.Entities.Enums;
using Investa.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace Investa.Api.IntegrationTests;

public sealed class RepeatInvestmentPhase4Tests
{
    private static readonly Guid InvestorId = Guid.Parse("11111111-1111-1111-1111-111111111111");

    [Fact]
    public async Task Approved_investor_can_invest_again_with_independent_terms_and_contract()
    {
        using var factory = new CustomWebApplicationFactory();
        using var client = factory.CreateClient();
        var founderId = Guid.NewGuid();
        int opportunityId;
        using (var scope = factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            db.Database.EnsureDeleted(); db.Database.EnsureCreated();
            var investor = db.AuthUsers.Single(u => u.Id == InvestorId);
            investor.UserType = UserType.Client; investor.ClientType = ClientType.Investor; investor.Status = true;
            db.AuthUsers.Add(new AuthUser { Id=founderId, Name="Founder", PasswordHash="test", UserType=UserType.Client, ClientType=ClientType.Founder, Status=true });
            var project = new Project { FounderId=founderId, DisplayName="Repeat project", Slug=$"repeat-{Guid.NewGuid():N}", Summary="Repeat investment project summary", Description="Repeat investment project description", BusinessStage=ProjectStage.Scaling };
            var opportunity = new Opportunity { Project=project, FounderId=founderId, SequenceNumber=1, Purpose="Growth", Type="Growth", Title="Open repeat opportunity", ShortDescription="Open repeat investment opportunity", UseOfFunds="Working capital and verified expansion costs", FundingTarget=10000, FundingCurrency="EGP", MinimumInvestmentAmount=100, InvestmentModel=InvestmentModel.LoanInvestment, ProjectStage=ProjectStage.Scaling, InterestRate=10, RepaymentFrequency="Monthly", ExpectedDurationMonths=12, FinalRepaymentDate=DateTime.UtcNow.AddYears(1), Status=OpportunityStatus.Published };
            db.Opportunities.Add(opportunity); db.SaveChanges(); opportunityId=opportunity.Id;
        }

        var firstId = await Submit(client, opportunityId, "repeat-one", 1000);
        await Approve(factory, founderId, firstId);
        var replayId = await Submit(client, opportunityId, "repeat-one", 1000);
        replayId.Should().Be(firstId);
        var secondId = await Submit(client, opportunityId, "repeat-two", 1500);
        await Approve(factory, founderId, secondId);

        using var verify = factory.Services.CreateScope();
        var dbVerify = verify.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var summary = (await verify.ServiceProvider.GetRequiredService<IOpportunityService>().GetMyParticipationsAsync(InvestorId)).Single();
        summary.ProjectTotalInvestment.Should().Be(2500m);
        summary.OpportunityTotalInvestment.Should().Be(2500m);
        summary.Participations.Select(p => p.SequenceNumber).Should().Equal(1, 2);
        summary.Participations.Should().OnlyContain(p => p.ContractId.HasValue && !string.IsNullOrWhiteSpace(p.ContractDocumentHash));
        var participations = dbVerify.OpportunityJoinRequests.Where(r => r.OpportunityId == opportunityId && r.InvestorId == InvestorId).OrderBy(r => r.ParticipationSequence).ToList();
        participations.Should().HaveCount(2);
        participations.Select(r => r.ParticipationSequence).Should().Equal(1, 2);
        participations.Select(r => r.FundingAmount).Should().Equal(1000m, 1500m);
        participations.Should().OnlyContain(r => r.Status == OpportunityJoinRequestStatus.Approved);
        var contracts = dbVerify.InvestmentContracts.Include(c => c.Versions).Where(c => c.OpportunityId == opportunityId && c.InvestorUserId == InvestorId).ToList();
        contracts.Should().HaveCount(2);
        contracts.Should().OnlyContain(c => c.Versions.Count == 1 && c.Versions.Single().Status == InvestmentContractVersionStatus.Active);
        contracts.Select(c => c.Versions.Single().SourceParticipationRequestId).Should().BeEquivalentTo(new[] { firstId, secondId });
    }

    private static async Task<int> Submit(HttpClient client, int opportunityId, string key, decimal amount)
    {
        var response = await client.PostAsJsonAsync($"/api/v1/opportunities/{opportunityId}/join-requests", new { idempotencyKey=key, requestType=2, requestedAmount=amount, enteredCurrency="EGP" });
        response.StatusCode.Should().Be(HttpStatusCode.Created, await response.Content.ReadAsStringAsync());
        var json = await response.Content.ReadFromJsonAsync<JsonObject>();
        return json!["data"]!["id"]!.GetValue<int>();
    }

    private static async Task Approve(CustomWebApplicationFactory factory, Guid founderId, int requestId)
    {
        using var scope = factory.Services.CreateScope();
        await scope.ServiceProvider.GetRequiredService<IOpportunityService>().ApproveJoinRequestAsync(founderId, requestId);
    }
}
