using System;
using Investa.Domain.Entities.Enums;

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
    
    /// <summary>
    /// Lifecycle status of the participation
    /// </summary>
    public ParticipationLifecycle Status { get; set; } = ParticipationLifecycle.Interested;
    
    public bool IsAnonymous { get; set; }
}
