namespace Investa.Application.Common;

/// <summary>
/// Application-wide constants to avoid magic numbers and hardcoded values.
/// </summary>
public static class ApplicationConstants
{
    /// <summary>
    /// Default pagination settings.
    /// </summary>
    public static class Pagination
    {
        /// <summary>Default page number.</summary>
        public const int DefaultPage = 1;
        
        /// <summary>Default number of items per page.</summary>
        public const int DefaultPageSize = 10;
        
        /// <summary>Maximum allowed page size to prevent performance issues.</summary>
        public const int MaxPageSize = 100;
    }

    /// <summary>
    /// Authentication and security settings.
    /// </summary>
    public static class Security
    {
        /// <summary>Maximum failed login attempts before lockout.</summary>
        public const int MaxFailedLoginAttempts = 3;
        
        /// <summary>Account lockout duration in minutes.</summary>
        public const int LockoutDurationMinutes = 15;
        
        /// <summary>Default JWT token expiration in days.</summary>
        public const int DefaultTokenExpirationDays = 7;
        
        /// <summary>Default refresh token expiration in days.</summary>
        public const int DefaultRefreshTokenExpirationDays = 30;
        
        /// <summary>Maximum retry count for resilient operations.</summary>
        public const int MaxRetryCount = 3;
        
        /// <summary>Retry delay in seconds.</summary>
        public const int RetryDelaySeconds = 5;
    }

    /// <summary>
    /// Investment-related constants.
    /// </summary>
    public static class Investment
    {
        /// <summary>Minimum investment amount in the base currency.</summary>
        public const decimal MinimumInvestmentAmount = 100m;
        
        /// <summary>Maximum single investment amount.</summary>
        public const decimal MaximumInvestmentAmount = 1_000_000m;
    }

    /// <summary>
    /// KYC and compliance constants.
    /// </summary>
    public static class Compliance
    {
        /// <summary>National ID pattern for validation (Saudi Arabia).</summary>
        public const string SaudiNationalIdPattern = @"^\d{10}$";
        
        /// <summary>Minimum age for investors.</summary>
        public const int MinimumInvestorAge = 18;
    }

    /// <summary>
    /// Email placeholder constants for system-generated accounts.
    /// </summary>
    public static class EmailPlaceholders
    {
        /// <summary>
        /// Domain used for phone-based registrations where email is not provided.
        /// This is a placeholder domain - emails to this domain will not be delivered.
        /// </summary>
        public const string PhoneUserDomain = "phone.investa.local";
        
        /// <summary>
        /// Generates a placeholder email for phone-based users.
        /// </summary>
        /// <param name="phone">The phone number.</param>
        /// <returns>A placeholder email address.</returns>
        public static string GenerateForPhone(string phone) => 
            $"{phone}@{PhoneUserDomain}";
    }

    /// <summary>
    /// Status strings used across the application.
    /// Consider using enums instead for new code.
    /// </summary>
    public static class Statuses
    {
        public const string Pending = "Pending";
        public const string Approved = "Approved";
        public const string Rejected = "Rejected";
        public const string Active = "Active";
        public const string Inactive = "Inactive";
        public const string Completed = "Completed";
        public const string Cancelled = "Cancelled";
    }

    /// <summary>
    /// Investment types supported by the platform.
    /// </summary>
    public static class InvestmentTypes
    {
        public const string Founding = "founding";
        public const string Equity = "equity";
    }

    /// <summary>
    /// User types/roles in the system.
    /// Two types only: OrgUser (internal staff/admins) and Client (external users).
    /// </summary>
    public static class UserTypes
    {
        /// <summary>
        /// Internal organization user (employees, admins, staff) - for Admin Portal
        /// </summary>
        public const string OrgUser = "OrgUser";
        
        /// <summary>
        /// External client user (investors, founders, partners) - for Client Portal and Mobile Apps
        /// </summary>
        public const string Client = "Client";
    }
}
