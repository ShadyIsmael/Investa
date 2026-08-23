using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Investa.Domain.Entities.Enums;

namespace Investa.Domain.Entities;

public class Project
{
    [Key]
    public int Id { get; set; }

    [Required]
    public Guid FounderId { get; set; }

    /// <summary>
    /// ISO 4217 code of the Project's default currency. Must reference an active
    /// Currency Master record. Project-level totals are displayed in this currency.
    /// </summary>
    [Required]
    [StringLength(3, MinimumLength = 3)]
    public string DefaultCurrency { get; set; } = CurrencyMasterDefaults.DefaultCurrency;

    [Required]
    [StringLength(200)]
    public string DisplayName { get; set; } = string.Empty;

    [StringLength(250)]
    public string? LegalName { get; set; }

    [Required]
    [StringLength(220)]
    public string Slug { get; set; } = string.Empty;

    [Required]
    [StringLength(500)]
    public string Summary { get; set; } = string.Empty;

    [Required]
    [StringLength(4000)]
    public string Description { get; set; } = string.Empty;

    public int? CategoryId { get; set; }

    [StringLength(150)]
    public string? Industry { get; set; }

    public ProjectStage BusinessStage { get; set; }

    [StringLength(200)]
    public string? Geography { get; set; }

    [StringLength(2000)]
    public string TagsSnapshotJson { get; set; } = "[]";

    public DateOnly? FoundedOn { get; set; }

    [StringLength(500)]
    public string? WebsiteUrl { get; set; }

    [StringLength(1000)]
    public string? LogoUrl { get; set; }

    [StringLength(2000)]
    public string? TeamDescription { get; set; }

    [StringLength(2000)]
    public string? BusinessModel { get; set; }

    [StringLength(50)]
    public string? RiskLevel { get; set; }

    [StringLength(4000)]
    public string? RiskDisclosure { get; set; }

    public ProjectStatus Status { get; set; } = ProjectStatus.Draft;

    [StringLength(1000)]
    public string? ArchiveReason { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    [Timestamp]
    public byte[] RowVersion { get; set; } = [];

    // Navigation properties
    [ForeignKey(nameof(FounderId))]
    public AuthUser? Founder { get; set; }

    public OpportunityCategory? Category { get; set; }

    public ICollection<Opportunity> Opportunities { get; set; } = new List<Opportunity>();
    public ICollection<ProjectRoomEntry> RoomEntries { get; set; } = new List<ProjectRoomEntry>();
    public ICollection<ProjectRoomDocument> RoomDocuments { get; set; } = new List<ProjectRoomDocument>();
}
