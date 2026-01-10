namespace Investa.Application.DTOs.Auth;

public class PasswordResetConfirmDto
{
    public string PhoneNumber { get; set; } = string.Empty;
    public string Token { get; set; } = string.Empty;
    public string NewPassword { get; set; } = string.Empty;
}