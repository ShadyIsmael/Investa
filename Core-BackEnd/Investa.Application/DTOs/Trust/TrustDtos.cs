using Investa.Domain.Entities.Enums;

namespace Investa.Application.DTOs.Trust;

/// <summary>
/// Full trust snapshot returned to the client — used to drive UI gating on all platforms.
/// </summary>
public class TrustProfileDto
{
    public Guid UserId { get; set; }

    /// <summary>Current trust level (0–3).</summary>
    public TrustLevel TrustLevel { get; set; }

    /// <summary>Human-readable label for the level.</summary>
    public string TrustLevelLabel => TrustLevel switch
    {
        TrustLevel.Visitor => "Visitor",
        TrustLevel.Registered => "Registered",
        TrustLevel.Interactive => "Interactive",
        TrustLevel.TrustedActive => "Trusted Active",
        _ => "Unknown"
    };

    public int VerificationTrustScore { get; set; }
    public int ReputationScore { get; set; }
    public int ActivityScore { get; set; }
    public string ReputationLevel { get; set; } = "Rising Member";
    public string ReputationLabel => ReputationLevel;
    public List<string> RiskFlags { get; set; } = new();
    public int ProfileCompletionPercentage { get; set; }

    public bool IsPhoneVerified { get; set; }
    public bool IsEmailVerified { get; set; }

    /// <summary>Checklist of what's needed to reach the next trust level.</summary>
    public List<TrustRequirementDto> NextLevelRequirements { get; set; } = new();

    /// <summary>Resolved permission flags — frontend can check without recalculating.</summary>
    public TrustPermissionsDto Permissions { get; set; } = new();

    public List<UserVerificationDto> Verifications { get; set; } = new();
}

/// <summary>
/// One requirement item for the next trust-level upgrade.
/// </summary>
public class TrustRequirementDto
{
    public string Key { get; set; } = string.Empty;
    public string LabelEn { get; set; } = string.Empty;
    public string LabelAr { get; set; } = string.Empty;
    public bool IsMet { get; set; }
}

/// <summary>
/// Resolved boolean permissions derived from trust level + verification status.
/// Sent to all frontends so they can gate UI without recomputing.
/// </summary>
public class TrustPermissionsDto
{
    /// <summary>L0+ Browse public opportunity list.</summary>
    public bool CanBrowseOpportunities { get; set; } = true;

    /// <summary>L1+ View opportunity detail page.</summary>
    public bool CanViewOpportunityDetails { get; set; }

    /// <summary>L1+ Save/favorite opportunities.</summary>
    public bool CanSaveOpportunities { get; set; }

    /// <summary>L1+ Follow users.</summary>
    public bool CanFollowUsers { get; set; }

    /// <summary>L2+ Comment on opportunities.</summary>
    public bool CanComment { get; set; }

    /// <summary>L2+ Request joining an opportunity.</summary>
    public bool CanRequestJoinOpportunity { get; set; }

    /// <summary>L2+ Participate in discussions.</summary>
    public bool CanParticipateInDiscussions { get; set; }

    /// <summary>L3 Founder — Publish investment opportunities.</summary>
    public bool CanPublishOpportunity { get; set; }

    /// <summary>L3 Investor — Join verified deals.</summary>
    public bool CanJoinVerifiedDeals { get; set; }

    /// <summary>L3+ Direct messaging with founders/investors.</summary>
    public bool CanDirectMessage { get; set; }

    /// <summary>L3 Founder — Access analytics dashboard.</summary>
    public bool CanAccessAnalytics { get; set; }
}

/// <summary>
/// Summary of a single verification record.
/// </summary>
public class UserVerificationDto
{
    public int Id { get; set; }
    public VerificationType VerificationType { get; set; }
    public VerificationStatus Status { get; set; }
    public string? Provider { get; set; }
    public DateTime SubmittedAt { get; set; }
    public DateTime? VerifiedAt { get; set; }
    public string? Notes { get; set; }
}

/// <summary>Request to submit a verification document.</summary>
public class SubmitVerificationRequest
{
    public VerificationType VerificationType { get; set; }
    public string? DocumentUrl { get; set; }
    public string? Provider { get; set; }
    public string? ProviderReferenceId { get; set; }
}

/// <summary>Admin request to approve or reject a verification.</summary>
public class ReviewVerificationRequest
{
    public int VerificationId { get; set; }
    public bool Approved { get; set; }
    public string? Notes { get; set; }
}
