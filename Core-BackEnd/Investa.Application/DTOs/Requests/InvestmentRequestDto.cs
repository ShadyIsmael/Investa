using System;

namespace Investa.Application.DTOs.Requests;

public class InvestmentRequestDto
{
    public int Id { get; set; }
    public int InvestmentId { get; set; }
    public Guid InvestorId { get; set; }
    public Guid FounderId { get; set; }
    public decimal Amount { get; set; }
    public int? Shares { get; set; }
    public string Status { get; set; } = string.Empty;
    public string Direction { get; set; } = string.Empty;

    // RequestType logical kind (contact_founder | investment_interest)
    public string? Type { get; set; }

    // Type-specific payload stored as JSON
    public string? RequestMetadata { get; set; }

    // Additional display fields
    public string? InvestmentTitle { get; set; }
    public string? InvestmentDescription { get; set; }
    public string? BusinessName { get; set; }
    public string? FounderDisplayName { get; set; }
    public string? InvestorDisplayName { get; set; }

    public DateTime CreatedAt { get; set; }
}
