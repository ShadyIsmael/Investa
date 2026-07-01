using Investa.Application.DTOs;
using Investa.Domain.Entities;
using Investa.Domain.Entities.Enums;

namespace Investa.Application.Services;

public static class InvestmentOpportunityCompatibilityMapper
{
    public static bool TryCreateRequest(Investment investment, out CreateOpportunityRequest request, out string? skipReason)
    {
        request = new CreateOpportunityRequest();
        skipReason = null;

        if (investment.FounderId == Guid.Empty)
        {
            skipReason = "FounderId is empty.";
            return false;
        }

        var fundingTarget = ToFundingTarget(investment.TargetFund, investment.InitialCapital);
        if (!fundingTarget.HasValue)
        {
            skipReason = "Funding target and initial capital are not positive.";
            return false;
        }

        if (!ValidateInvestmentBounds(investment.MinInvestment, investment.MaxInvestment, out skipReason))
            return false;

        request = new CreateOpportunityRequest
        {
            Title = ToOpportunityTitle(investment.BusinessName, investment.Id),
            Description = investment.Description,
            FundingTarget = fundingTarget.Value,
            MinimumInvestmentAmount = investment.MinInvestment,
            MaximumInvestmentAmount = investment.MaxInvestment,
            ExpectedDurationMonths = investment.DurationMonths,
            InvestmentModel = ToOpportunityInvestmentModel(investment.InvestmentTypeId),
            ProjectStage = ToOpportunityProjectStage(investment.BusinessStageId),
            CoverImageUrl = investment.ImageUrl
        };

        return true;
    }

    public static bool TryCreateRequest(CreateInvestmentDto dto, int investmentId, out CreateOpportunityRequest request, out string? skipReason)
    {
        var investment = new Investment
        {
            Id = investmentId,
            FounderId = dto.FounderId,
            InitialCapital = dto.InitialCapital,
            BusinessName = dto.BusinessName,
            Description = dto.Description,
            TargetFund = dto.TargetFund,
            MinInvestment = dto.MinInvestment,
            MaxInvestment = dto.MaxInvestment,
            DurationMonths = dto.DurationMonths,
            InvestmentTypeId = dto.InvestmentTypeId ?? InvestmentType.Equity,
            BusinessStageId = dto.BusinessStageId,
            ImageUrl = dto.ImageUrl
        };

        return TryCreateRequest(investment, out request, out skipReason);
    }

    public static bool TryUpdateRequest(Investment investment, out UpdateOpportunityRequest request, out string? skipReason)
    {
        request = new UpdateOpportunityRequest();
        skipReason = null;

        if (!TryCreateRequest(investment, out var createRequest, out skipReason))
            return false;

        request = new UpdateOpportunityRequest
        {
            Title = createRequest.Title,
            Description = createRequest.Description,
            FundingTarget = createRequest.FundingTarget,
            MinimumInvestmentAmount = createRequest.MinimumInvestmentAmount,
            MaximumInvestmentAmount = createRequest.MaximumInvestmentAmount,
            ExpectedDurationMonths = createRequest.ExpectedDurationMonths,
            InvestmentModel = createRequest.InvestmentModel,
            ProjectStage = createRequest.ProjectStage,
            CoverImageUrl = createRequest.CoverImageUrl
        };

        return true;
    }

    public static string ToOpportunityTitle(string? businessName, int investmentId)
    {
        return string.IsNullOrWhiteSpace(businessName)
            ? $"Investment {investmentId}"
            : businessName.Trim();
    }

    private static decimal? ToFundingTarget(decimal? targetFund, decimal initialCapital)
    {
        if (targetFund.HasValue && targetFund.Value > 0)
            return targetFund.Value;

        return initialCapital > 0 ? initialCapital : null;
    }

    private static bool ValidateInvestmentBounds(decimal? minInvestment, decimal? maxInvestment, out string? skipReason)
    {
        skipReason = null;

        if (minInvestment.HasValue && minInvestment.Value <= 0)
        {
            skipReason = "Minimum investment is not positive.";
            return false;
        }

        if (maxInvestment.HasValue && maxInvestment.Value <= 0)
        {
            skipReason = "Maximum investment is not positive.";
            return false;
        }

        if (minInvestment.HasValue && maxInvestment.HasValue && maxInvestment.Value < minInvestment.Value)
        {
            skipReason = "Maximum investment is less than minimum investment.";
            return false;
        }

        return true;
    }

    private static InvestmentModel ToOpportunityInvestmentModel(InvestmentType investmentType)
    {
        return investmentType switch
        {
            InvestmentType.Equity => InvestmentModel.Equity,
            InvestmentType.Loan => InvestmentModel.LoanInvestment,
            _ => InvestmentModel.CapitalContributionProfitSharing
        };
    }

    private static ProjectStage ToOpportunityProjectStage(int? businessStageId)
    {
        return businessStageId switch
        {
            1 => ProjectStage.Idea,
            2 => ProjectStage.MVP,
            3 => ProjectStage.Startup,
            4 => ProjectStage.Scaling,
            5 => ProjectStage.Established,
            _ => ProjectStage.Idea
        };
    }
}
