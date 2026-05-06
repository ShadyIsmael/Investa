using FluentValidation;
using Investa.Application.DTOs;

namespace Investa.Application.DTOs.Validators;

public class CreateInvestmentDtoValidator : AbstractValidator<CreateInvestmentDto>
{
    public CreateInvestmentDtoValidator()
    {
        RuleFor(x => x.FounderId)
            .NotEmpty().WithMessage("Founder ID is required.");

        RuleFor(x => x.InitialCapital)
            .GreaterThan(0m).WithMessage("Initial capital must be greater than zero.");

        // Opportunity required fields
        RuleFor(x => x.BusinessName)
            .NotEmpty().WithMessage("Business name is required.");

        RuleFor(x => x.Description)
            .NotEmpty().WithMessage("Description is required.");

        RuleFor(x => x.StartDate)
            .NotEmpty().WithMessage("Start date is required.");

        RuleFor(x => x.BusinessStageId)
            .GreaterThan(0).WithMessage("Business stage is required.");

        RuleFor(x => x.BusinessCategoryId)
            .GreaterThan(0).WithMessage("Business category is required.");

        RuleFor(x => x.Milestone)
            .NotEmpty().WithMessage("Milestone is required.");

        RuleFor(x => x.RiskLevel)
            .NotEmpty().WithMessage("Risk level is required.");

        RuleFor(x => x.TargetFund)
            .GreaterThan(0m).WithMessage("Target fund must be greater than zero.");

        RuleFor(x => x.Currency)
            .NotEmpty().WithMessage("Currency is required.");

        // Type-specific validation: Equity investments require share fields
        RuleFor(x => x.SharePrice)
            .GreaterThan(0m)
            .When(x => x.InvestmentTypeId == Domain.Entities.Enums.InvestmentType.Equity)
            .WithMessage("Share price must be greater than zero for Equity investments.");

        RuleFor(x => x.TotalShares)
            .GreaterThan(0)
            .When(x => x.InvestmentTypeId == Domain.Entities.Enums.InvestmentType.Equity)
            .WithMessage("Total shares must be greater than zero for Equity investments.");

        RuleFor(x => x.ValuationCap)
            .GreaterThan(0m)
            .When(x => x.InvestmentTypeId == Domain.Entities.Enums.InvestmentType.Equity && x.ValuationCap.HasValue)
            .WithMessage("Valuation cap must be greater than zero for Equity investments.");

        // Type-specific validation: Founding investments require duration/profit fields
        RuleFor(x => x.DurationMonths)
            .GreaterThan(0)
            .When(x => x.InvestmentTypeId == Domain.Entities.Enums.InvestmentType.Founding)
            .WithMessage("Duration in months is required for Founding investments.");

        RuleFor(x => x.ProfitPercentage)
            .GreaterThan(0m)
            .When(x => x.InvestmentTypeId == Domain.Entities.Enums.InvestmentType.Founding)
            .WithMessage("Profit percentage is required for Founding investments.");

        RuleFor(x => x.PayoutFrequency)
            .NotEmpty()
            .When(x => x.InvestmentTypeId == Domain.Entities.Enums.InvestmentType.Founding)
            .WithMessage("Payout frequency is required for Founding investments.")
            .Must(x => x == null || new[] { "Monthly", "Quarterly", "Semi-Annually", "Annually", "At Maturity" }.Contains(x))
            .When(x => x.InvestmentTypeId == Domain.Entities.Enums.InvestmentType.Founding && !string.IsNullOrEmpty(x.PayoutFrequency))
            .WithMessage("Payout frequency must be one of: Monthly, Quarterly, Semi-Annually, Annually, At Maturity.");

        RuleFor(x => x.MinInvestment)
            .GreaterThan(0m)
            .When(x => x.MinInvestment.HasValue)
            .WithMessage("Minimum investment must be greater than zero.");

        RuleFor(x => x.MaxInvestment)
            .GreaterThan(x => x.MinInvestment ?? 0m)
            .When(x => x.MaxInvestment.HasValue && x.MinInvestment.HasValue)
            .WithMessage("Maximum investment must be greater than minimum investment.");

        RuleFor(x => x.ExpectedROI)
            .GreaterThanOrEqualTo(0m)
            .When(x => x.ExpectedROI.HasValue)
            .WithMessage("Expected ROI cannot be negative.");

        // InvestmentTypeId is enum-based, so no string validation needed
    }
}
