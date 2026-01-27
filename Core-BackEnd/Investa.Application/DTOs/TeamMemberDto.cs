using System;

namespace Investa.Application.DTOs;

/// <summary>
/// Data transfer object for investment team members.
/// Used to return team/founder information for investment opportunities.
/// All user details (name, avatar, bio, LinkedIn) are retrieved from the linked User/UserProfile.
/// </summary>
public class TeamMemberDto
{
    /// <summary>
    /// Unique identifier for the team member record
    /// </summary>
    public int Id { get; set; }

    /// <summary>
    /// The registered user's ID. Required - team members must be registered Founder/Partner users.
    /// </summary>
    public string UserId { get; set; } = string.Empty;

    /// <summary>
    /// Display name of the team member (from User.Name or UserProfile.FullName)
    /// </summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Role/title within this investment's company (e.g., CEO, CTO, CFO)
    /// </summary>
    public string Role { get; set; } = string.Empty;

    /// <summary>
    /// URL to the member's avatar/profile picture (from UserProfile.AvatarUrl)
    /// </summary>
    public string? Avatar { get; set; }

    /// <summary>
    /// LinkedIn profile URL (from UserProfile.LinkedInUrl)
    /// </summary>
    public string? LinkedIn { get; set; }

    /// <summary>
    /// Brief biography or description (from UserProfile.Bio)
    /// </summary>
    public string? Bio { get; set; }

    /// <summary>
    /// The user's client type (Founder, Partner/Both)
    /// </summary>
    public string? ClientType { get; set; }
}
