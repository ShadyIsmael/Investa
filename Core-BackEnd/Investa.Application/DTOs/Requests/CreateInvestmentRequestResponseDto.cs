namespace Investa.Application.DTOs.Requests;

public class CreateInvestmentRequestResponseDto
{
    // New single request returned
    public InvestmentRequestDto Request { get; set; } = new();

    // Backwards compatibility
    public InvestmentRequestDto OutgoingRequest { get; set; } = new();
    public InvestmentRequestDto IncomingRequest { get; set; } = new();

    public decimal UpdatedCreditBalance { get; set; }
}
