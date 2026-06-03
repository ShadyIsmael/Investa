namespace Investa.Domain.Entities.Enums;

/// <summary>
/// Represents the verification status for user verifications (email, phone, LinkedIn, etc.).
/// </summary>
public enum VerificationStatus
{
    None = 0,
    Pending = 1,
    Verified = 2
}
