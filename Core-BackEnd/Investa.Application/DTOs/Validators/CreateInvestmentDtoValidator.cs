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

        // Equity crowdfunding fields
        RuleFor(x => x.SharePrice)
            .GreaterThan(0m).WithMessage("Share price must be greater than zero.");

        RuleFor(x => x.TotalShares)
            .GreaterThan(0).WithMessage("Total shares must be greater than zero.");

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
