namespace Investa.Application.DTOs.Profile;

/// <summary>
/// Section 1: Basic information about the user
/// </summary>
public class BasicInfoDto
{
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? FullName { get; set; }
    public string? Gender { get; set; }
    public string? Nationality { get; set; }
    // Birth date to support age verification
    public DateTime? DateOfBirth { get; set; }
    // Country selection (dropdown) separate from nationality
    public string? Country { get; set; }
    public string? CompanyName { get; set; }
    public string? Bio { get; set; }
    public string? AvatarUrl { get; set; }
    public decimal Score { get; set; }
    public decimal Credit { get; set; }
}
