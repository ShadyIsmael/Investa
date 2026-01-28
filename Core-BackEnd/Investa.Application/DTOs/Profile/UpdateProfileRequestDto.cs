namespace Investa.Application.DTOs.Profile;

/// <summary>
/// Minimal DTO accepted by the API when updating a user's profile.
/// Restricts updatable fields to BasicInfo and ContactInfo to avoid accidental changes to immutable or sensitive fields.
/// </summary>
public class UpdateProfileRequestDto
{
    public BasicInfoDto? BasicInfo { get; set; }
    public ContactInfoDto? ContactInfo { get; set; }

    /// <summary>
    /// Optional identity/compliance section for KYC (DocumentNumber etc.)
    /// </summary>
    public IdentityComplianceDto? IdentityCompliance { get; set; }
}
