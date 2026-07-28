using System.ComponentModel.DataAnnotations;

namespace Investa.Domain.Entities;

public class EmailVerificationOtp
{
    public long Id { get; set; }
    public Guid UserId { get; set; }
    [MaxLength(256)] public string NormalizedEmail { get; set; } = string.Empty;
    [MaxLength(128)] public string OtpHash { get; set; } = string.Empty;
    [MaxLength(32)] public string Purpose { get; set; } = "EmailVerification";
    public DateTime CreatedAtUtc { get; set; }
    public DateTime ExpiresAtUtc { get; set; }
    public int AttemptCount { get; set; }
    public bool IsUsed { get; set; }
    public DateTime LastSentAtUtc { get; set; }
}
