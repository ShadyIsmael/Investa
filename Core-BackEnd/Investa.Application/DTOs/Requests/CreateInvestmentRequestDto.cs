using System.ComponentModel.DataAnnotations;

namespace Investa.Application.DTOs.Requests;

public class CreateInvestmentRequestDto
{
    [Required]
    public int InvestmentId { get; set; }

    [Required]
    [Range(0.01, double.MaxValue)]
    public decimal Amount { get; set; }

    public int? Shares { get; set; }
}
