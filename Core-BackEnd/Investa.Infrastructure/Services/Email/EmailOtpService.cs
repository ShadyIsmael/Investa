using System.Globalization;
using System.Security.Cryptography;
using System.Text;
using Investa.Application.DTOs;
using Investa.Application.Interfaces;
using Investa.Domain.Entities;
using Investa.Domain.Entities.Enums;
using Investa.Domain.Entities.Security;
using Investa.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace Investa.Infrastructure.Services.Email;

public sealed class EmailOtpService : IEmailOtpService
{
    private const string Purpose = "EmailVerification";
    private readonly ApplicationDbContext _db;
    private readonly IEmailService _email;
    private readonly IConfiguration _configuration;

    public EmailOtpService(ApplicationDbContext db, IEmailService email, IConfiguration configuration)
    {
        _db = db;
        _email = email;
        _configuration = configuration;
    }

    public Task<EmailOtpResult> GenerateAsync(Guid userId, string email, string language, CancellationToken cancellationToken = default) =>
        SendAsync(userId, email, language, false, cancellationToken);

    public Task<EmailOtpResult> ResendAsync(Guid userId, string email, string language, CancellationToken cancellationToken = default) =>
        SendAsync(userId, email, language, true, cancellationToken);

    public async Task<EmailOtpResult> VerifyAsync(Guid userId, string email, string otp, CancellationToken cancellationToken = default)
    {
        var normalized = Normalize(email);
        var user = await _db.AuthUsers.SingleOrDefaultAsync(x => x.Id == userId, cancellationToken);
        if (user is null) return new(EmailOtpStatus.NotFound);
        if (await EmailUsedByAnotherUser(userId, normalized, cancellationToken)) return new(EmailOtpStatus.EmailAlreadyUsed);

        var record = await _db.EmailVerificationOtps
            .Where(x => x.UserId == userId && x.NormalizedEmail == normalized && x.Purpose == Purpose && !x.IsUsed)
            .OrderByDescending(x => x.CreatedAtUtc)
            .FirstOrDefaultAsync(cancellationToken);
        if (record is null) return new(EmailOtpStatus.InvalidOtp);
        if (record.AttemptCount >= 5) return new(EmailOtpStatus.TooManyAttempts);
        if (record.ExpiresAtUtc <= DateTime.UtcNow)
        {
            record.IsUsed = true;
            await _db.SaveChangesAsync(cancellationToken);
            return new(EmailOtpStatus.Expired);
        }

        if (!VerifyHash(otp, record.OtpHash))
        {
            record.AttemptCount++;
            await _db.SaveChangesAsync(cancellationToken);
            return new(record.AttemptCount >= 5 ? EmailOtpStatus.TooManyAttempts : EmailOtpStatus.InvalidOtp);
        }

        var firstVerification = user.EmailVerifiedAtUtc is null;
        var oldEmail = user.Email;
        user.Email = email.Trim();
        user.IsEmailVerified = true;
        user.EmailVerifiedAtUtc = DateTime.UtcNow;
        record.IsUsed = true;
        await InvalidateActive(userId, cancellationToken);
        _db.AuditLogs.Add(new AuditLog
        {
            UserId = userId, UserName = user.Name, EntityType = nameof(AuthUser),
            EntityId = userId.ToString(), Action = "VerifyEmail", OldValues = oldEmail,
            NewValues = user.Email, Timestamp = DateTime.UtcNow
        });

        if (firstVerification && user.WelcomeEmailSentAtUtc is null)
        {
            await QueueWelcome(user, cancellationToken);
            user.WelcomeEmailSentAtUtc = DateTime.UtcNow;
        }
        await _db.SaveChangesAsync(cancellationToken);
        return new(EmailOtpStatus.Success);
    }

    private async Task<EmailOtpResult> SendAsync(Guid userId, string email, string language, bool resend, CancellationToken cancellationToken)
    {
        var normalized = Normalize(email);
        var user = await _db.AuthUsers.SingleOrDefaultAsync(x => x.Id == userId, cancellationToken);
        if (user is null) return new(EmailOtpStatus.NotFound);
        if (await EmailUsedByAnotherUser(userId, normalized, cancellationToken)) return new(EmailOtpStatus.EmailAlreadyUsed);

        var now = DateTime.UtcNow;
        var latest = await _db.EmailVerificationOtps
            .Where(x => x.UserId == userId && x.NormalizedEmail == normalized && x.Purpose == Purpose)
            .OrderByDescending(x => x.LastSentAtUtc).FirstOrDefaultAsync(cancellationToken);
        if (latest is not null && latest.LastSentAtUtc.AddSeconds(60) > now)
            return new(EmailOtpStatus.Cooldown, (int)Math.Ceiling((latest.LastSentAtUtc.AddSeconds(60) - now).TotalSeconds));
        var sendsLastHour = await _db.EmailVerificationOtps.CountAsync(
            x => x.UserId == userId && x.Purpose == Purpose && x.CreatedAtUtc > now.AddHours(-1), cancellationToken);
        if (sendsLastHour >= 5) return new(EmailOtpStatus.RateLimited);

        await InvalidateActive(userId, cancellationToken);
        var code = CreateCode();
        _db.EmailVerificationOtps.Add(new EmailVerificationOtp
        {
            UserId = userId, NormalizedEmail = normalized, OtpHash = Hash(code), Purpose = Purpose,
            CreatedAtUtc = now, ExpiresAtUtc = now.AddMinutes(10), LastSentAtUtc = now
        });
        if (!string.Equals(user.Email, email.Trim(), StringComparison.OrdinalIgnoreCase))
            user.IsEmailVerified = false;
        await _db.SaveChangesAsync(cancellationToken);
        await QueueOtp(user, email.Trim(), code, language, cancellationToken);
        return new(EmailOtpStatus.Success);
    }

    private Task<bool> EmailUsedByAnotherUser(Guid userId, string normalized, CancellationToken ct) =>
        _db.AuthUsers.AnyAsync(x => x.Id != userId && x.Email != null && x.Email.ToUpper() == normalized, ct);

    private async Task InvalidateActive(Guid userId, CancellationToken ct)
    {
        var active = await _db.EmailVerificationOtps
            .Where(x => x.UserId == userId && x.Purpose == Purpose && !x.IsUsed).ToListAsync(ct);
        foreach (var item in active) item.IsUsed = true;
    }

    private string CreateCode()
    {
        var configured = _configuration["EmailOtp:DevelopmentCode"];
        var environment = _configuration["ASPNETCORE_ENVIRONMENT"];
        if (environment == "Development" && configured?.Length == 6 && configured.All(char.IsDigit)) return configured;
        return RandomNumberGenerator.GetInt32(0, 1_000_000).ToString("D6", CultureInfo.InvariantCulture);
    }

    private async Task QueueOtp(AuthUser user, string recipient, string code, string language, CancellationToken ct)
    {
        var ar = language.StartsWith("ar", StringComparison.OrdinalIgnoreCase);
        await _email.SendTemplatedEmailAsync(new SendTemplatedEmailRequest
        {
            Recipient = recipient, TemplateName = "email-verification-otp", UserId = user.Id.ToString(),
            Category = EmailCategory.OTP, Priority = EmailPriority.High,
            Model = new EmailTemplateModel
            {
                RecipientDisplayName = user.Name,
                Language = ar ? "ar" : "en",
                Title = ar ? "تأكيد بريدك الإلكتروني في FOPX One" : "Verify your FOPX One email",
                Description = ar ? "استخدم الرمز التالي لتأكيد بريدك. تنتهي صلاحيته خلال 10 دقائق. تجاهل هذه الرسالة إذا لم تطلبها."
                    : "Use the code below to verify your email. It expires in 10 minutes. Ignore this email if you did not request it.",
                StatusLabel = ar ? "تأكيد البريد" : "Email verification", CardLabel = ar ? "رمز التأكيد" : "Verification code",
                CardValue = code, CtaText = ar ? "الرمز صالح لمرة واحدة" : "This code can be used once",
                PlainTextFallback = ar ? "استخدم قسم رمز التأكيد أعلاه لإكمال التأكيد." : "Use the verification-code section above to complete verification.",
                Preheader = ar ? "تأكيد بريدك الإلكتروني" : "Verify your email"
            }
        }, ct);
    }

    private Task QueueWelcome(AuthUser user, CancellationToken ct) =>
        _email.SendTemplatedEmailAsync(new SendTemplatedEmailRequest
        {
            Recipient = user.Email!, TemplateName = "welcome", UserId = user.Id.ToString(), Category = EmailCategory.System,
            Model = new EmailTemplateModel
            {
                RecipientDisplayName = user.Name,
                Title = "Welcome to FOPX One", Description = "Your email is now verified.",
                StatusLabel = "Welcome", CardLabel = "Account", CardValue = "Verified",
                CtaText = "Get started", PlainTextFallback = $"Welcome to FOPX One, {user.Name}."
            }
        }, ct);

    private static string Normalize(string email) => email.Trim().ToUpperInvariant();
    private static string Hash(string otp)
    {
        var salt = RandomNumberGenerator.GetBytes(16);
        var hash = SHA256.HashData(salt.Concat(Encoding.UTF8.GetBytes(otp)).ToArray());
        return $"{Convert.ToBase64String(salt)}:{Convert.ToBase64String(hash)}";
    }
    private static bool VerifyHash(string otp, string stored)
    {
        var parts = stored.Split(':');
        if (parts.Length != 2) return false;
        var salt = Convert.FromBase64String(parts[0]);
        var expected = Convert.FromBase64String(parts[1]);
        var actual = SHA256.HashData(salt.Concat(Encoding.UTF8.GetBytes(otp)).ToArray());
        return CryptographicOperations.FixedTimeEquals(actual, expected);
    }
}
