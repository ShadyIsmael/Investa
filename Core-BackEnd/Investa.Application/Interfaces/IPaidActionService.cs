using Investa.Domain.Entities.Enums;

namespace Investa.Application.Interfaces;

public interface IPaidActionService
{
    Task<PaidActionQuoteDto> GetQuoteAsync(
        Guid userId,
        PricingAction action,
        CancellationToken cancellationToken = default);

    Task ChargeAsync(
        Guid userId,
        PricingAction action,
        ReferenceType referenceType,
        string referenceId,
        CancellationToken cancellationToken = default);
}

public class PaidActionQuoteDto
{
    public string ActionCode { get; set; } = string.Empty;
    public decimal CreditCost { get; set; }
    public decimal CurrentBalance { get; set; }
    public decimal BalanceAfter { get; set; }
    public bool HasSufficientCredit { get; set; }
}
