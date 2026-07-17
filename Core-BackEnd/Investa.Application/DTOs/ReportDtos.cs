using System.ComponentModel.DataAnnotations;
using Investa.Domain.Entities.Enums;

namespace Investa.Application.DTOs;

public class CreateReportRequest
{
    [Required]
    public ReportTargetType TargetType { get; set; }

    [Required]
    [StringLength(100)]
    public string TargetId { get; set; } = string.Empty;

    [Required]
    public ReportReasonCode ReasonCode { get; set; }

    [StringLength(2000)]
    public string? Description { get; set; }
}

public class ResolveReportRequest
{
    [StringLength(2000)]
    public string? ResolutionNote { get; set; }
}

public class ReportDto
{
    public int Id { get; set; }
    public Guid ReporterUserId { get; set; }
    public ReportTargetType TargetType { get; set; }
    public string TargetId { get; set; } = string.Empty;
    public ReportReasonCode ReasonCode { get; set; }
    public string? Description { get; set; }
    public ReportStatus Status { get; set; }
    public Guid? ReviewedByUserId { get; set; }
    public DateTime? ReviewedAt { get; set; }
    public string? ResolutionNote { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class AdminReportQuery
{
    public ReportStatus? Status { get; set; }
    public ReportTargetType? TargetType { get; set; }
}
