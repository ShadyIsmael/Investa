using Investa.Domain.Entities.Enums;

namespace Investa.Application.DTOs.Auth;

/// <summary>
/// DTO for user registration with phone number as unique identifier
/// </summary>
public class RegisterDto
{
    /// <summary>
    /// Phone number (used as UserName in IdentityUser)
    /// Format: Egyptian phone number (e.g., +20XXXXXXXXXX or 01XXXXXXXXX)
    /// </summary>
    public string PhoneNumber { get; set; } = string.Empty;

    /// <summary>
    /// Password for the user account
    /// </summary>
    public string Password { get; set; } = string.Empty;

    /// <summary>
    /// User's first name
    /// </summary>
    public string FirstName { get; set; } = string.Empty;

    /// <summary>
    /// User's last name
    /// </summary>
    public string LastName { get; set; } = string.Empty;

    /// <summary>
    /// Optional Firebase user id provided after OTP verification on client.
    /// When present the backend will mark the phone as verified and store
    /// the firebase uid as a claim on the Identity user.
    /// </summary>
    public string FirebaseUid { get; set; } = string.Empty;
}
