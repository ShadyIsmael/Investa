using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Investa.Domain.Entities.Enums;

namespace Investa.Domain.Entities;

public class Opportunity
{
    public int Id { get; set; }

    [Required]
    public Guid FounderId { get; set; }

    [Required]
    [StringLength(200)]
    public string Title { get; set; } = string.Empty;

    [StringLength(4000)]
    public string? Description { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    [Range(0.01, double.MaxValue)]
    public decimal FundingTarget { get; set; }

    public int? CategoryId { get; set; }

    public int? FundingGoalId { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal? MinimumInvestmentAmount { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal? MaximumInvestmentAmount { get; set; }

    public int? ExpectedDurationMonths { get; set; }

    [Required]
    public InvestmentModel InvestmentModel { get; set; }

    [Required]
    public ProjectStage ProjectStage { get; set; }

    [Required]
    public OpportunityStatus Status { get; set; } = OpportunityStatus.Draft;

    [StringLength(1000)]
    public string? CoverImageUrl { get; set; }

    public bool IsLockedForEditing { get; set; }

    public DateTime? FirstInvestorJoinedAt { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<OpportunityMedia> Media { get; set; } = new List<OpportunityMedia>();

    public ICollection<OpportunityDocument> Documents { get; set; } = new List<OpportunityDocument>();

    public ICollection<OpportunityEvent> Events { get; set; } = new List<OpportunityEvent>();

    public ICollection<OpportunityJoinRequest> JoinRequests { get; set; } = new List<OpportunityJoinRequest>();

    public OpportunityCategory? Category { get; set; }

    public FundingGoal? FundingGoal { get; set; }

    public ICollection<OpportunityTagAssignment> OpportunityTags { get; set; } = new List<OpportunityTagAssignment>();
}
