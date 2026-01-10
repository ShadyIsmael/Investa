namespace Investa.Application.DTOs.Profile;

/// <summary>
/// Comprehensive user profile DTO with 4 organized sections:
/// 1. Basic Info
/// 2. Contact Info
/// 3. Identity & Compliance
/// 4. Audit & Usage
/// </summary>
public class UserProfileDto
{
    public Guid UserId { get; set; }
    
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
    /// Section 3: Identity and compliance (KYC/AML)
    /// </summary>
    public IdentityComplianceDto? IdentityCompliance { get; set; }

    /// <summary>
    /// Section 4: Audit and usage tracking
    /// </summary>
    public AuditUsageDto? AuditUsage { get; set; }

    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
