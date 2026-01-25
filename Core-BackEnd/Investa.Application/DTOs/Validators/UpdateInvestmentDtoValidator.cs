using FluentValidation;
using Investa.Application.DTOs;

namespace Investa.Application.DTOs.Validators;

public class UpdateInvestmentDtoValidator : AbstractValidator<UpdateInvestmentDto>
{
    public UpdateInvestmentDtoValidator()
    {
        RuleFor(x => x.InitialCapital)
            .GreaterThan(0m)
            .When(x => x.InitialCapital.HasValue);

        RuleFor(x => x.BusinessName)
            .NotEmpty()
            .When(x => x.BusinessName != null);

        RuleFor(x => x.Description)
            .NotEmpty()
            .When(x => x.Description != null);

        RuleFor(x => x.StartDate)
            .NotEmpty()
            .When(x => x.StartDate.HasValue);

        RuleFor(x => x.BusinessStageId)
            .GreaterThan(0)
            .When(x => x.BusinessStageId.HasValue);

        RuleFor(x => x.BusinessCategoryId)
            .GreaterThan(0)
            .When(x => x.BusinessCategoryId.HasValue);

        RuleFor(x => x.TargetFund)
            .GreaterThan(0m)
            .When(x => x.TargetFund.HasValue);

        RuleFor(x => x.Milestone)
            .NotEmpty()
            .When(x => x.Milestone != null);

        RuleFor(x => x.RiskLevel)
            .NotEmpty()
            .When(x => x.RiskLevel != null);

        RuleFor(x => x.Currency)
            .NotEmpty()
            .When(x => x.Currency != null);

        // Equity crowdfunding validations
        RuleFor(x => x.SharePrice)
            .GreaterThan(0m)
            .When(x => x.SharePrice.HasValue)
            .WithMessage("Share price must be greater than zero.");

        RuleFor(x => x.TotalShares)
            .GreaterThan(0)
            .When(x => x.TotalShares.HasValue)
            .WithMessage("Total shares must be greater than zero.");

        RuleFor(x => x.MinInvestment)
            .GreaterThan(0m)
            .When(x => x.MinInvestment.HasValue)
            .WithMessage("Minimum investment must be greater than zero.");

        RuleFor(x => x.MaxInvestment)
            .GreaterThan(0m)
            .When(x => x.MaxInvestment.HasValue)
            .WithMessage("Maximum investment must be greater than zero.");

        RuleFor(x => x.ExpectedROI)
            .GreaterThanOrEqualTo(0m)
            .When(x => x.ExpectedROI.HasValue)
            .WithMessage("Expected ROI cannot be negative.");

        // InvestmentTypeId is enum-based, so no string validation needed

        RuleFor(x => x.Status)
            .Must(x => x == "Draft" || x == "Active" || x == "Funded" || x == "Closed")
            .When(x => x.Status != null)
            .WithMessage("Status must be Draft, Active, Funded, or Closed.");
    }
}
