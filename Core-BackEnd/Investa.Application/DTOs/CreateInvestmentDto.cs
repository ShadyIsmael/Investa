namespace Investa.Application.DTOs;

public class CreateInvestmentDto
{
    public int InvestorId { get; set; }
    public int ProjectId { get; set; }
    public decimal Amount { get; set; }
}