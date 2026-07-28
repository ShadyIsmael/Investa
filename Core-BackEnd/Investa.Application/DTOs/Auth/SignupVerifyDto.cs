namespace Investa.Application.DTOs.Auth;

public class SignupVerifyDto
{
    public string VerificationSessionId { get; set; } = string.Empty;
    public string OtpCode { get; set; } = string.Empty;
}
