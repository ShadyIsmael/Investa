using System.ComponentModel.DataAnnotations;
using Investa.Domain.Entities.Enums;

namespace Investa.Domain.Entities;

public class Report
{
    public int Id { get; set; }

    public Guid ReporterUserId { get; set; }

    public ReportTargetType TargetType { get; set; }

    [Required]
    [StringLength(100)]
    public string TargetId { get; set; } = string.Empty;

    public ReportReasonCode ReasonCode { get; set; }

    [StringLength(2000)]
    public string? Description { get; set; }

    public ReportStatus Status { get; set; } = ReportStatus.Pending;

    public Guid? ReviewedByUserId { get; set; }

    public DateTime? ReviewedAt { get; set; }

    [StringLength(2000)]
    public string? ResolutionNote { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public AuthUser? ReporterUser { get; set; }

    public AuthUser? ReviewedByUser { get; set; }
}
