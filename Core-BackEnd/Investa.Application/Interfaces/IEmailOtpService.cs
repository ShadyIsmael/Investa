namespace Investa.Application.Interfaces;

public enum EmailOtpStatus
{
    Success,
    InvalidOtp,
    Expired,
    TooManyAttempts,
    Cooldown,
    RateLimited,
    EmailAlreadyUsed,
    NotFound
}

public record EmailOtpResult(EmailOtpStatus Status, int? RetryAfterSeconds = null);

public interface IEmailOtpService
{
    Task<EmailOtpResult> GenerateAsync(Guid userId, string email, string language, CancellationToken cancellationToken = default);
    Task<EmailOtpResult> VerifyAsync(Guid userId, string email, string otp, CancellationToken cancellationToken = default);
    Task<EmailOtpResult> ResendAsync(Guid userId, string email, string language, CancellationToken cancellationToken = default);
}
