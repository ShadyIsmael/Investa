namespace Investa.Application.DTOs.Auth;

/// <summary>
/// DTO for authentication response containing JWT token
/// </summary>
public class AuthResponseDto
{
    /// <summary>
    /// JWT Access Token
    /// </summary>
    public string Token { get; set; } = string.Empty;

    /// <summary>
    /// Token expiration time in UTC
    /// </summary>
    public DateTime ExpiresAt { get; set; }

    /// <summary>
    /// User's phone number
    /// </summary>
    public string PhoneNumber { get; set; } = string.Empty;

    /// <summary>
    /// Message (success or error)
    /// </summary>
    public string Message { get; set; } = "Registration successful";
}
