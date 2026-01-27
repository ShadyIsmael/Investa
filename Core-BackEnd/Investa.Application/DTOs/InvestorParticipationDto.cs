using System;

namespace Investa.Application.DTOs;

/// <summary>
/// Represents an individual investor's participation in an investment opportunity
/// </summary>
public class InvestorParticipationDto
{
    public int Id { get; set; }
    public int InvestmentId { get; set; }
    public Guid InvestorId { get; set; }
    public string InvestorName { get; set; } = string.Empty;
    public string? InvestorAvatar { get; set; }
    public int SharesPurchased { get; set; }
    public decimal AmountInvested { get; set; }
    public DateTime InvestmentDate { get; set; }
    public string Status { get; set; } = "Confirmed";
    public bool IsAnonymous { get; set; }
}
