namespace Investa.Domain.Entities.Enums;

public enum EmailCategory
{
    Security = 0,
    Authentication = 1,
    OTP = 2,
    PasswordReset = 3,
    VerifyEmail = 4,
    Conversation = 5,
    Participation = 6,
    Project = 7,
    Finance = 8,
    Marketing = 9,
    System = 10
}

public static class EmailCategoryMetadata
{
    private static readonly HashSet<EmailCategory> _mandatory = new()
    {
        EmailCategory.Security,
        EmailCategory.Authentication,
        EmailCategory.OTP,
        EmailCategory.PasswordReset,
        EmailCategory.VerifyEmail
    };

    public static bool IsMandatory(EmailCategory category) => _mandatory.Contains(category);

    public static bool IsOptional(EmailCategory category) => !_mandatory.Contains(category);
}