namespace Investa.Application.DTOs.Profile;

/// <summary>
/// User's core metrics and account information
/// </summary>
public class UserCoreMetricsDto
{
    public string? Email { get; set; }
    public string? Role { get; set; }
    public string? ClientType { get; set; } // Investor, Founder, Both
    public int CredibilityScore { get; set; }
    public decimal WalletBalance { get; set; }
    public decimal CurrentCredibilityScore { get; set; }
}
