namespace Investa.Application.DTOs.Auth;

/// <summary>
/// DTO for user login using phone number and password
/// </summary>
public class LoginDto
{
    public string PhoneNumber { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}
