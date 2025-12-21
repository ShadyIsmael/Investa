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
}
