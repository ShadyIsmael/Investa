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
            Currency = investment.Currency,
            SharePrice = investment.SharePrice,
            TotalShares = investment.TotalShares,
            OfferedShares = investment.TotalShares.HasValue && investment.EquityOfferedPercentage.HasValue
                ? (int?)decimal.Round(investment.TotalShares.Value * investment.EquityOfferedPercentage.Value / 100m, 0)
                : investment.AvailableShares,
            ProfitSharePercentage = investment.ProfitPercentage ?? investment.RevenueSharePercentage,
            ProfitSharingPayoutFrequency = investment.PayoutFrequency ?? investment.RevenueDistributionFrequency,
            ProfitSharingContractStartDate = investment.ContractStartDate,
            ProfitSharingContractEndDate = investment.ContractEndDate,
            InterestRate = investment.InterestRate,
            RepaymentFrequency = investment.RepaymentFrequency,
            FinalRepaymentDate = investment.FinalRepaymentDate,
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
            EquityOfferedPercentage = dto.EquityOfferedPercentage,
            Description = dto.Description,
            TargetFund = dto.TargetFund,
            MinInvestment = dto.MinInvestment,
            MaxInvestment = dto.MaxInvestment,
            DurationMonths = dto.DurationMonths,
            ProfitPercentage = dto.ProfitPercentage,
            PayoutFrequency = dto.PayoutFrequency,
            ContractStartDate = dto.ContractStartDate,
            ContractEndDate = dto.ContractEndDate,
            InvestmentTypeId = dto.InvestmentTypeId ?? InvestmentType.Equity,
            BusinessStageId = dto.BusinessStageId,
            ImageUrl = dto.ImageUrl
        };

        return TryCreateRequest(
            investment,
            dto.ShortDescription,
            dto.UseOfFunds,
            dto.FundingGoalId,
            dto.TagIds,
            dto.EquityOfferedPercentage,
            out request,
            out skipReason);
    }

    public static bool TryUpdateRequest(Investment investment, out UpdateOpportunityRequest request, out string? skipReason)
        => TryUpdateRequest(investment, null, out request, out skipReason);

    public static bool TryUpdateRequest(Investment investment, UpdateInvestmentDto? dto, out UpdateOpportunityRequest request, out string? skipReason)
    {
        request = new UpdateOpportunityRequest();
        skipReason = null;

        if (!TryCreateRequest(
                investment,
                dto?.ShortDescription,
                dto?.UseOfFunds,
                dto?.FundingGoalId,
                dto?.TagIds,
                dto?.EquityOfferedPercentage,
                out var createRequest,
                out skipReason))
            return false;

        request = new UpdateOpportunityRequest
        {
            Title = createRequest.Title,
            Description = createRequest.Description,
            ShortDescription = createRequest.ShortDescription,
            UseOfFunds = createRequest.UseOfFunds,
            FundingTarget = createRequest.FundingTarget,
            FundingGoalId = createRequest.FundingGoalId,
            MinimumInvestmentAmount = createRequest.MinimumInvestmentAmount,
            MaximumInvestmentAmount = createRequest.MaximumInvestmentAmount,
            ExpectedDurationMonths = createRequest.ExpectedDurationMonths,
            Currency = createRequest.Currency,
            SharePrice = createRequest.SharePrice,
            TotalShares = createRequest.TotalShares,
            OfferedShares = createRequest.OfferedShares,
            EquityOfferedPercentage = createRequest.EquityOfferedPercentage,
            ProfitSharePercentage = createRequest.ProfitSharePercentage,
            ProfitSharingPayoutFrequency = createRequest.ProfitSharingPayoutFrequency,
            ProfitSharingContractStartDate = createRequest.ProfitSharingContractStartDate,
            ProfitSharingContractEndDate = createRequest.ProfitSharingContractEndDate,
            InterestRate = createRequest.InterestRate,
            RepaymentFrequency = createRequest.RepaymentFrequency,
            FinalRepaymentDate = createRequest.FinalRepaymentDate,
            TagIds = createRequest.TagIds,
            InvestmentModel = createRequest.InvestmentModel,
            ProjectStage = createRequest.ProjectStage,
            CoverImageUrl = createRequest.CoverImageUrl
        };

        return true;
    }

    private static bool TryCreateRequest(
        Investment investment,
        string? shortDescription,
        string? useOfFunds,
        int? fundingGoalId,
        IReadOnlyList<int>? tagIds,
        decimal? equityOfferedPercentage,
        out CreateOpportunityRequest request,
        out string? skipReason)
    {
        if (!TryCreateRequest(investment, out request, out skipReason))
            return false;

        request.ShortDescription = ToRequiredText(
            shortDescription,
            investment.Description,
            "ShortDescription",
            20,
            300,
            out skipReason);
        if (skipReason != null)
            return false;

        request.UseOfFunds = ToRequiredText(
            useOfFunds,
            investment.Milestone,
            investment.Description,
            "UseOfFunds",
            30,
            2000,
            out skipReason);
        if (skipReason != null)
            return false;

        request.FundingGoalId = fundingGoalId;
        request.TagIds = tagIds ?? Array.Empty<int>();
        request.EquityOfferedPercentage = equityOfferedPercentage ?? investment.EquityOfferedPercentage;

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

    private static string ToRequiredText(string? primary, string? fallback, string fieldName, int minLength, int maxLength, out string? skipReason)
        => ToRequiredText(primary, fallback, null, fieldName, minLength, maxLength, out skipReason);

    private static string ToRequiredText(string? primary, string? fallback, string? secondFallback, string fieldName, int minLength, int maxLength, out string? skipReason)
    {
        skipReason = null;
        var value = FirstUsable(primary, fallback, secondFallback);

        if (value == null)
        {
            skipReason = $"{fieldName} is required.";
            return string.Empty;
        }

        if (value.Length < minLength)
        {
            skipReason = $"{fieldName} must be at least {minLength} characters.";
            return string.Empty;
        }

        return value.Length <= maxLength ? value : value[..maxLength];
    }

    private static string? FirstUsable(params string?[] values)
    {
        foreach (var value in values)
        {
            if (!string.IsNullOrWhiteSpace(value))
                return value.Trim();
        }

        return null;
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
