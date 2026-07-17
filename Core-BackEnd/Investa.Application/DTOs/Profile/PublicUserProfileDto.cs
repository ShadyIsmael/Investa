namespace Investa.Application.DTOs.Profile;

/// <summary>Public-safe profile projection. Never contains contact, wallet, or identity-document data.</summary>
public sealed class PublicUserProfileDto
{
    public Guid UserId { get; set; }
    public string? DisplayName { get; set; }
    public string? FullName { get; set; }
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? AvatarUrl { get; set; }
    public string? Bio { get; set; }
    public string? CompanyName { get; set; }
    public string? JobTitle { get; set; }
    public string? Country { get; set; }
    public string? City { get; set; }
    public string? Location { get; set; }
    public string? WebsiteUrl { get; set; }
    public string? LinkedInUrl { get; set; }
    public string? Role { get; set; }
    public string VerificationStatus { get; set; } = "None";
    public string AccountStatus { get; set; } = "Inactive";
    public int CredibilityScore { get; set; }
    public DateTime CreatedAt { get; set; }
}
