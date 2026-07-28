using Investa.Domain.Entities.Enums;

namespace Investa.Application.DTOs;

public class PendingAdminChangeDto
{
    public long Id { get; set; }
    public Guid TargetUserId { get; set; }
    public string? TargetUserName { get; set; }
    public Guid MakerId { get; set; }
    public string? MakerName { get; set; }
    public Guid? CheckerId { get; set; }
    public string? CheckerName { get; set; }
    public string Action { get; set; } = string.Empty;
    public string Status { get; set; } = "Pending";
    public string? BeforeSnapshot { get; set; }
    public string? AfterSnapshot { get; set; }
    public string? Description { get; set; }
    public DateTime SubmittedAt { get; set; }
    public DateTime? ReviewedAt { get; set; }
    public string? ReviewDecision { get; set; }
    public string? ReviewReason { get; set; }
    public bool IsApplied { get; set; }
    public DateTime? AppliedAt { get; set; }

    public bool CanApprove { get; set; }
    public bool CanReject { get; set; }
    public bool CanCancel { get; set; }
}

public class SubmitAdminChangeDto
{
    public Guid TargetUserId { get; set; }
    public string Action { get; set; } = string.Empty;
    public string? AfterSnapshot { get; set; }
    public string? Description { get; set; }
}

public class ApproveAdminChangeDto
{
    public string? ApprovalNotes { get; set; }
}

public class RejectAdminChangeDto
{
    public string RejectionReason { get; set; } = string.Empty;
}
