using FluentValidation;
using Investa.Application.DTOs;

namespace Investa.Application.DTOs.Validators;

public class UpdateInvestmentDtoValidator : AbstractValidator<UpdateInvestmentDto>
{
    public UpdateInvestmentDtoValidator()
    {
        RuleFor(x => x.Amount)
            .GreaterThan(0m)
            .When(x => x.Amount.HasValue);

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
    }
}
