using FluentAssertions;
using Investa.Application.Common;
using Investa.Application.DTOs;
using Investa.Application.Services;
using Investa.Domain.Entities;
using Investa.Domain.Entities.Enums;
using Investa.Infrastructure.Persistence;
using Investa.Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Investa.UnitTests;

public sealed class OfferNativeParticipationEntryTests
{
    [Fact]
    public async Task Legacy_investment_join_request_is_rejected_without_creating_a_participation()
    {
        await using var db = new ApplicationDbContext(new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options);
        var founder = User(ClientType.Founder);
        var investor = User(ClientType.Investor);
        var opportunity = new Opportunity
        {
            Project = new Project
            {
                FounderId = founder.Id,
                DisplayName = "Offer-native project",
                Slug = $"offer-native-{Guid.NewGuid():N}",
                Summary = "Offer-native participation test",
                Description = "Offer-native participation test"
            },
            FounderId = founder.Id,
            SequenceNumber = 1,
            Type = "Growth",
            Title = "Offer-native opportunity",
            ShortDescription = "Offer-native participation test opportunity",
            UseOfFunds = "Product expansion, hiring, and verified customer acquisition",
            FundingTarget = 8_000_000m,
            FundingCurrency = "EGP",
            Status = OpportunityStatus.Published,
            FundingStatus = OpportunityFundingStatus.Open,
            InvestmentModel = InvestmentModel.Unspecified
        };
        db.AuthUsers.AddRange(founder, investor);
        db.Opportunities.Add(opportunity);
        await db.SaveChangesAsync();

        var service = new OpportunityService(
            new UnitOfWork(db), null!, null!, null!, null!, null!, null!, null!, null!, null!, null!);

        await FluentActions.Invoking(() => service.CreateJoinRequestAsync(investor.Id, opportunity.Id, new CreateOpportunityJoinRequest
        {
            RequestType = OpportunityJoinRequestType.InvestmentParticipation,
            RequestedAmount = 2_000_000m,
            EnteredCurrency = "EGP"
        }))
            .Should().ThrowAsync<BusinessValidationException>()
            .Where(exception => exception.Code == "OFFER_REQUIRED");

        (await db.OpportunityJoinRequests.CountAsync()).Should().Be(0);
    }

    private static AuthUser User(ClientType clientType) => new()
    {
        Id = Guid.NewGuid(),
        Email = $"{Guid.NewGuid():N}@test.local",
        UserType = UserType.Client,
        ClientType = clientType,
        Status = true
    };
}
