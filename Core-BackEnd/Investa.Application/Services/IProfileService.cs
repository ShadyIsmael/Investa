using Investa.Application.DTOs.Profile;

namespace Investa.Application.Services;

/// <summary>
/// Service interface for user profile operations.
/// </summary>
public interface IProfileService
{
    /// <summary>
    /// Retrieves the complete user profile with all 4 sections (Basic Info, Contact Info, Identity & Compliance, Audit & Usage).
    /// </summary>
    /// <param name="userId">The user ID</param>
    /// <returns>The complete UserProfileDto, or null if profile not found</returns>
    Task<UserProfileDto?> GetUserProfileAsync(int userId);

    /// <summary>
    /// Gets or creates a user profile. If it doesn't exist, creates a new one with the user's ID.
    /// </summary>
    /// <param name="userId">The user ID</param>
    /// <returns>The UserProfileDto</returns>
    Task<UserProfileDto> GetOrCreateUserProfileAsync(int userId);

    /// <summary>
    /// Updates the user's profile with new information.
    /// </summary>
    /// <param name="userId">The user ID</param>
    /// <param name="profileDto">The updated profile data</param>
    /// <returns>The updated UserProfileDto</returns>
    Task<UserProfileDto> UpdateUserProfileAsync(int userId, UserProfileDto profileDto);

    /// <summary>
    /// Updates the user's last login information (IP, device, timestamp).
    /// </summary>
    /// <param name="userId">The user ID</param>
    /// <param name="ipAddress">The login IP address</param>
    /// <param name="deviceInfo">The device information (User-Agent)</param>
    /// <returns>The updated UserProfileDto</returns>
    Task<UserProfileDto> UpdateLastLoginAsync(int userId, string? ipAddress, string? deviceInfo);

    /// <summary>
    /// Records the registration IP address for a new user.
    /// </summary>
    /// <param name="userId">The user ID</param>
    /// <param name="ipAddress">The registration IP address</param>
    /// <returns>The updated UserProfileDto</returns>
    Task<UserProfileDto> SetRegistrationIpAsync(int userId, string? ipAddress);
}
