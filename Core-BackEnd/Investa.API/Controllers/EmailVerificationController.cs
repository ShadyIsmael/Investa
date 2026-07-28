using Investa.Application.DTOs.Auth;
using Investa.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Investa.API.Controllers;

[Authorize]
[Route("api/v1/auth/email-verification")]
public sealed class EmailVerificationController : BaseApiController
{
    private readonly IEmailOtpService _otp;
    public EmailVerificationController(IEmailOtpService otp) => _otp = otp;

    [HttpPost("send-otp")]
    public async Task<IActionResult> Send([FromBody] EmailOtpSendRequest request, CancellationToken cancellationToken)
    {
        if (!TryGetUserId(out var userId)) return Unauthorized();
        return Map(await _otp.GenerateAsync(userId, request.Email, Request.Headers.AcceptLanguage.ToString(), cancellationToken));
    }

    [HttpPost("verify-otp")]
    public async Task<IActionResult> Verify([FromBody] EmailOtpVerifyRequest request, CancellationToken cancellationToken)
    {
        if (!TryGetUserId(out var userId)) return Unauthorized();
        return Map(await _otp.VerifyAsync(userId, request.Email, request.Otp, cancellationToken));
    }

    [HttpPost("resend-otp")]
    public async Task<IActionResult> Resend([FromBody] EmailOtpSendRequest request, CancellationToken cancellationToken)
    {
        if (!TryGetUserId(out var userId)) return Unauthorized();
        return Map(await _otp.ResendAsync(userId, request.Email, Request.Headers.AcceptLanguage.ToString(), cancellationToken));
    }

    private bool TryGetUserId(out Guid userId)
    {
        var value = User.FindFirst("sub")?.Value ?? User.FindFirst("id")?.Value;
        return Guid.TryParse(value, out userId);
    }

    private IActionResult Map(EmailOtpResult result) => result.Status switch
    {
        EmailOtpStatus.Success => SuccessResponse(),
        EmailOtpStatus.InvalidOtp => ErrorResponse("EMAIL_OTP_INVALID", 400),
        EmailOtpStatus.Expired => ErrorResponse("EMAIL_OTP_EXPIRED", 400),
        EmailOtpStatus.TooManyAttempts => ErrorResponse("EMAIL_OTP_TOO_MANY_ATTEMPTS", 429),
        EmailOtpStatus.Cooldown => ErrorResponse("EMAIL_OTP_COOLDOWN", 429, new { retryAfterSeconds = result.RetryAfterSeconds }),
        EmailOtpStatus.RateLimited => ErrorResponse("EMAIL_OTP_RATE_LIMITED", 429),
        EmailOtpStatus.EmailAlreadyUsed => ErrorResponse("EMAIL_ALREADY_USED", 409),
        _ => ErrorResponse("EMAIL_OTP_NOT_FOUND", 404)
    };
}
