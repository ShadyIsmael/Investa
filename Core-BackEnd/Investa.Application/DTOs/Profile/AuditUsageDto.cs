namespace Investa.Application.DTOs.Profile;

/// <summary>
/// Section 4: Audit and usage tracking information
/// </summary>
public class AuditUsageDto
{
    public string? LastLoginIP { get; set; }
    public string? RegistrationIP { get; set; }
    public string? DeviceInfo { get; set; }
    public DateTime? LastLoginDate { get; set; }
}
