using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Investa.Domain.Entities;

/// <summary>
/// Represents a team member or founder associated with an investment opportunity.
/// Team members must be registered platform users with ClientType of Founder or Both.
/// User profile data (name, avatar, bio, etc.) is retrieved from the linked User/UserProfile.
/// </summary>
public class InvestmentTeamMember
{
    [Key]
    public int Id { get; set; }

    /// <summary>
    /// The investment opportunity this team member belongs to
    /// </summary>
    [Required]
    public int InvestmentId { get; set; }

    /// <summary>
    /// Required link to a registered platform user (must be Founder or Both ClientType).
    /// User profile data (name, avatar, bio, LinkedIn) is retrieved via this relationship.
    /// </summary>
    [Required]
    public Guid UserId { get; set; }

    /// <summary>
    /// Role/title within this investment's company (e.g., CEO, CTO, CFO, Co-Founder).
    /// This is the team member's role for THIS specific investment, not their general platform role.
    /// </summary>
    [Required]
    [StringLength(100)]
    public string Role { get; set; } = string.Empty;

    /// <summary>
    /// Display order for sorting team members (lower = first)
    /// </summary>
    public int SortOrder { get; set; } = 0;

    /// <summary>
    /// Whether this team member is active/visible
    /// </summary>
    public bool IsActive { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAt { get; set; }

    // Navigation properties
    [ForeignKey(nameof(InvestmentId))]
    public Investment Investment { get; set; } = null!;

    [ForeignKey(nameof(UserId))]
    public User User { get; set; } = null!;
}
