using FluentValidation;
using Investa.Application.DTOs;

namespace Investa.Application.DTOs.Validators;

public class CreateInvestmentDtoValidator : AbstractValidator<CreateInvestmentDto>
{
    public CreateInvestmentDtoValidator()
    {
        RuleFor(x => x.InvestorId)
            .GreaterThan(0);

        RuleFor(x => x.ProjectId)
            .GreaterThan(0);

        RuleFor(x => x.Amount)
            .GreaterThan(0m);
    }
}
