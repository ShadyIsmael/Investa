using Investa.Domain.Entities.Enums;

namespace Investa.Domain.Entities.Security;

public class PendingAdminChange
{
    public long Id { get; set; }

    public Guid TargetUserId { get; set; }
    public string? TargetUserName { get; set; }

    public Guid MakerId { get; set; }
    public string? MakerName { get; set; }

    public Guid? CheckerId { get; set; }
    public string? CheckerName { get; set; }

    public AdminChangeAction Action { get; set; }

    public AdminChangeStatus Status { get; set; } = AdminChangeStatus.Pending;

    public string? BeforeSnapshot { get; set; }

    public string? AfterSnapshot { get; set; }

    public string? Description { get; set; }

    public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;

    public DateTime? ReviewedAt { get; set; }
    public string? ReviewDecision { get; set; }
    public string? ReviewReason { get; set; }

    public bool IsApplied { get; set; }
    public DateTime? AppliedAt { get; set; }

    public string? IpAddress { get; set; }
}
