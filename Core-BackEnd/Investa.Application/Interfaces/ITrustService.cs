using Investa.Application.DTOs.Trust;

namespace Investa.Application.Interfaces;

/// <summary>
/// Manages the Progressive Trust lifecycle: computing levels, recalculating scores,
/// and surfacing permission sets to all platform layers.
/// Reputation-related operations are handled by ReputationService.
/// </summary>
public interface ITrustService
{
    /// <summary>Returns the full trust profile for a user (level + permissions + requirements).</summary>
    Task<TrustProfileDto> GetTrustProfileAsync(Guid userId);

    /// <summary>
    /// Recalculates trust level and verification metrics for a user.
    /// Call after any profile update, verification approval, or activity event.
    /// </summary>
    Task RecalculateTrustAsync(Guid userId);

    /// <summary>Submits a verification document/request for the user.</summary>
    Task<UserVerificationDto> SubmitVerificationAsync(Guid userId, SubmitVerificationRequest request);

    /// <summary>Admin: Approves or rejects a pending verification.</summary>
    Task<UserVerificationDto> ReviewVerificationAsync(Guid adminUserId, ReviewVerificationRequest request);

    /// <summary>Returns all pending verifications (for admin review queue).</summary>
    Task<List<UserVerificationDto>> GetPendingVerificationsAsync();

    /// <summary>Adds a risk flag to a user's account.</summary>
    Task AddRiskFlagAsync(Guid userId, string flag);

    /// <summary>Removes a risk flag from a user's account.</summary>
    Task RemoveRiskFlagAsync(Guid userId, string flag);
}
