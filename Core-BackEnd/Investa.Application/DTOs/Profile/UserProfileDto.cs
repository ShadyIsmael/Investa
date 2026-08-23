using Investa.Domain;
namespace Investa.Application.DTOs.Profile;

/// <summary>
/// Comprehensive user profile DTO with 3 organized sections:
/// 1. Basic Info
/// 2. Contact Info
/// 3. Audit & Usage
/// </summary>
public class UserProfileDto
{
    public Guid UserId { get; set; }
    public string PreferredCurrency { get; set; } = CurrencyMasterDefaults.DefaultCurrency;
    
    /// <summary>
    /// User's core credentials and metrics
    /// </summary>
    public UserCoreMetricsDto? CoreMetrics { get; set; }

    /// <summary>
    /// Section 1: Basic information
    /// </summary>
    public BasicInfoDto? BasicInfo { get; set; }

    /// <summary>
    /// Section 2: Contact information
    /// </summary>
    public ContactInfoDto? ContactInfo { get; set; }

    /// <summary>
    /// Section 3: Audit and usage tracking
    /// </summary>
    public AuditUsageDto? AuditUsage { get; set; }

    /// <summary>
    /// Profile completion percentage (0-100) calculated server-side
    /// based on required profile fields. Authoritative value used by
    /// trust system and dashboard.
    /// </summary>
    public int ProfileCompletionPercentage { get; set; }

    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
