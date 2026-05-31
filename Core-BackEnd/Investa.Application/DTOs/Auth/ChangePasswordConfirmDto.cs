namespace Investa.Application.DTOs.Auth;

public class ChangePasswordConfirmDto
{
    public string Token { get; set; } = string.Empty;
    public string NewPassword { get; set; } = string.Empty;
}
