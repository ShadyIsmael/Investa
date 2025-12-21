namespace Investa.Application.DTOs.Profile;

/// <summary>
/// Section 3: Identity and compliance information for KYC/AML purposes.
/// All fields are nullable to allow gradual profile completion.
/// </summary>
public class IdentityComplianceDto
{
    public string? DocumentNumber { get; set; }
    public DateTime? DocumentExpiryDate { get; set; }
    public string? VerificationStatus { get; set; } // None, Pending, Verified
    public string? DocumentFrontImageUrl { get; set; }
    public string? DocumentBackImageUrl { get; set; }
}
