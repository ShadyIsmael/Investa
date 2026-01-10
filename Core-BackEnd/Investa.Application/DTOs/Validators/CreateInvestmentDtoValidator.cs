using FluentValidation;
using Investa.Application.DTOs;

namespace Investa.Application.DTOs.Validators;

public class CreateInvestmentDtoValidator : AbstractValidator<CreateInvestmentDto>
{
    public CreateInvestmentDtoValidator()
    {
        // InvestorId will be taken from the authenticated user token; do not require it in payload

        // ProjectId removed; not required in payload

        RuleFor(x => x.Amount)
            .GreaterThan(0m);

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
    }
}
