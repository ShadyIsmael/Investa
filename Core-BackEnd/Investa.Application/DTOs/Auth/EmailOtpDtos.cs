using System.ComponentModel.DataAnnotations;

namespace Investa.Application.DTOs.Auth;

public class EmailOtpSendRequest
{
    [Required, EmailAddress, MaxLength(256)]
    public string Email { get; set; } = string.Empty;
}

public sealed class EmailOtpVerifyRequest : EmailOtpSendRequest
{
    [Required, RegularExpression(@"^\d{6}$")]
    public string Otp { get; set; } = string.Empty;
}
