using System.ComponentModel.DataAnnotations;
using Investa.Domain;
using Investa.Domain.Entities.Enums;

namespace Investa.Application.DTOs;

public class CreateProjectRequest
{
    [Required, StringLength(200)] public string DisplayName { get; set; } = string.Empty;
    [StringLength(250)] public string? LegalName { get; set; }
    [Required, StringLength(500, MinimumLength = 20)] public string Summary { get; set; } = string.Empty;
    [Required, StringLength(4000, MinimumLength = 20)] public string Description { get; set; } = string.Empty;
    public int? CategoryId { get; set; }
    [StringLength(150)] public string? Industry { get; set; }
    public ProjectStage? BusinessStage { get; set; }
    [StringLength(200)] public string? Geography { get; set; }
    public DateOnly? FoundedOn { get; set; }
    [Url, StringLength(500)] public string? WebsiteUrl { get; set; }
    [Url, StringLength(1000)] public string? LogoUrl { get; set; }
    [StringLength(2000)] public string? TeamDescription { get; set; }
    [StringLength(2000)] public string? BusinessModel { get; set; }
    [StringLength(50)] public string? RiskLevel { get; set; }
    [StringLength(4000)] public string? RiskDisclosure { get; set; }

    /// <summary>Optional ISO 4217 code. When omitted the Founder's preferred currency is used.</summary>
    [StringLength(3, MinimumLength = 3)]
    public string? DefaultCurrency { get; set; }
}

public sealed class UpdateProjectRequest : CreateProjectRequest;

public sealed class ArchiveProjectRequest
{
    [Required, StringLength(1000, MinimumLength = 5)]
    public string Reason { get; set; } = string.Empty;
}
