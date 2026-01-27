namespace Investa.Application.DTOs.Profile;

/// <summary>
/// DTO representing a single credibility score transaction for API responses
/// </summary>
public class CreditTransactionDto
{
    public int Id { get; set; }
    public Guid UserId { get; set; }
    public decimal Amount { get; set; }
    public string JustificationAr { get; set; } = string.Empty;
    public string JustificationEn { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public Guid? AdminId { get; set; }
    public string? AdminName { get; set; }
}
