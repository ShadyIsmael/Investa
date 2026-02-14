namespace Investa.Application.DTOs.Requests;

public class GetMyRequestsResponseDto
{
    public List<InvestmentRequestDto> Incoming { get; set; } = new();
    public List<InvestmentRequestDto> Outgoing { get; set; } = new();
}
