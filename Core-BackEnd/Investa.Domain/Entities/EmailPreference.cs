using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Investa.Domain.Entities.Enums;

namespace Investa.Domain.Entities;

[Table("EmailPreference")]
public class EmailPreference
{
    [Key]
    public long Id { get; set; }

    [Required]
    [MaxLength(450)]
    public string UserId { get; set; } = string.Empty;

    [Required]
    [MaxLength(50)]
    public string Category { get; set; } = string.Empty;

    public bool Enabled { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

public static class EmailPreferenceDefaults
{
    public static IReadOnlyList<EmailCategory> AllCategories { get; } = new List<EmailCategory>
    {
        EmailCategory.Security,
        EmailCategory.Authentication,
        EmailCategory.OTP,
        EmailCategory.PasswordReset,
        EmailCategory.VerifyEmail,
        EmailCategory.Conversation,
        EmailCategory.Participation,
        EmailCategory.Project,
        EmailCategory.Finance,
        EmailCategory.Marketing,
        EmailCategory.System
    };

    public static bool IsEnabledByDefault(EmailCategory category) => EmailCategoryMetadata.IsMandatory(category);
}