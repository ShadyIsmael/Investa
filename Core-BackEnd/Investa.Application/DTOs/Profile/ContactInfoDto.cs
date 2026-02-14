namespace Investa.Application.DTOs.Profile;

/// <summary>
/// Section 2: Contact information for the user
/// </summary>
public class ContactInfoDto
{
    public string? Email { get; set; }
    public string? Phone1 { get; set; }
    public string? Phone2 { get; set; }
    public string? Address { get; set; }
    public string? Country { get; set; }
    public string? City { get; set; }
    public string? CompanyAddress { get; set; }
    public string? CompanyEmail { get; set; }
    public string? LinkedInUrl { get; set; }
    public string? FacebookUrl { get; set; }
}
