using Investa.Application.DTOs.Trust;
using Investa.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Investa.API.Controllers;

/// <summary>
/// Manages Progressive Trust profiles, verifications, and risk flags.
/// Reputation endpoints are handled by ReputationController.
/// </summary>
[Authorize]
[Route("api/v1/trust")]
[Route("trust")]
public class TrustController : BaseApiController
{
    private readonly ITrustService _trustService;
    private readonly IReputationService _reputationService;
    private readonly ILogger<TrustController> _logger;

    public TrustController(ITrustService trustService, IReputationService reputationService, ILogger<TrustController> logger)
    {
        _trustService = trustService;
        _reputationService = reputationService;
        _logger = logger;
    }

    private Guid CurrentUserId =>
        Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirstValue("sub")
            ?? throw new UnauthorizedAccessException("User identity not found"));

    // ── Own trust profile ────────────────────────────────────────────────────

    /// <summary>Returns the current user's full trust profile including permissions and requirements.</summary>
    [HttpGet("me")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(ApiResponse<TrustProfileDto>), 200)]
    public async Task<IActionResult> GetMyTrustProfile()
    {
        if (User.Identity?.IsAuthenticated != true)
        {
            // Return visitor-level permissions for unauthenticated users
            return Ok(new ApiResponse<TrustPermissionsDto>
            {
                Success = true,
                Data = new TrustPermissionsDto { CanBrowseOpportunities = true }
            });
        }

        try
        {
            var profile = await _trustService.GetTrustProfileAsync(CurrentUserId);
            return SuccessResponse(profile);
        }
        catch (UnauthorizedAccessException ex)
        {
            // User is authenticated but missing required claims - treat as visitor
            _logger.LogWarning(ex, "User authenticated but missing identity claims");
            return Ok(new ApiResponse<TrustPermissionsDto>
            {
                Success = true,
                Data = new TrustPermissionsDto { CanBrowseOpportunities = true }
            });
        }
    }

    /// <summary>Triggers a trust-level recalculation for the current user (call after profile updates).</summary>
    [HttpPost("me/recalculate")]
    [ProducesResponseType(typeof(ApiResponse<TrustProfileDto>), 200)]
    public async Task<IActionResult> RecalculateMyTrust()
    {
        await _trustService.RecalculateTrustAsync(CurrentUserId);
        var profile = await _trustService.GetTrustProfileAsync(CurrentUserId);
        return SuccessResponse(profile);
    }

    // ── Verifications ────────────────────────────────────────────────────────

    /// <summary>Submits a verification document/request (e.g., LinkedIn, address).</summary>
    [HttpPost("me/verifications")]
    [ProducesResponseType(typeof(ApiResponse<UserVerificationDto>), 201)]
    public async Task<IActionResult> SubmitVerification([FromBody] SubmitVerificationRequest request)
    {
        var result = await _trustService.SubmitVerificationAsync(CurrentUserId, request);
        return CreatedAtAction(nameof(GetMyTrustProfile), new ApiResponse<UserVerificationDto>
        {
            Success = true,
            Data = result
        });
    }

    // ── Admin endpoints ───────────────────────────────────────────────────────

    /// <summary>Admin: List all pending verification requests.</summary>
    [HttpGet("admin/verifications/pending")]
    [Authorize(Policy = "Permission:users.manage")]
    [ProducesResponseType(typeof(ApiResponse<List<UserVerificationDto>>), 200)]
    public async Task<IActionResult> GetPendingVerifications()
    {
        var pending = await _trustService.GetPendingVerificationsAsync();
        return SuccessResponse(pending);
    }

    /// <summary>Admin: Approve or reject a verification.</summary>
    [HttpPost("admin/verifications/review")]
    [Authorize(Policy = "Permission:users.manage")]
    [ProducesResponseType(typeof(ApiResponse<UserVerificationDto>), 200)]
    public async Task<IActionResult> ReviewVerification([FromBody] ReviewVerificationRequest request)
    {
        var result = await _trustService.ReviewVerificationAsync(CurrentUserId, request);
        return SuccessResponse(result);
    }

    /// <summary>Admin: Get trust profile for any user.</summary>
    [HttpGet("admin/users/{userId:guid}")]
    [Authorize(Policy = "Permission:users.manage")]
    [ProducesResponseType(typeof(ApiResponse<TrustProfileDto>), 200)]
    public async Task<IActionResult> GetUserTrustProfile(Guid userId)
    {
        var profile = await _trustService.GetTrustProfileAsync(userId);
        return SuccessResponse(profile);
    }

    /// <summary>Admin: Adjust reputation points for a user.</summary>
    [HttpPost("admin/users/{userId:guid}/reputation")]
    [Authorize(Policy = "Permission:users.manage")]
    [ProducesResponseType(typeof(ApiResponse<bool>), 200)]
    public async Task<IActionResult> AdjustReputation(Guid userId, [FromBody] AdjustReputationRequest request)
    {
        await _reputationService.AdjustReputationAsync(userId, request.Points, request.Reason, CurrentUserId);
        return SuccessResponse(true);
    }

    /// <summary>Admin: Add a risk flag to a user.</summary>
    [HttpPost("admin/users/{userId:guid}/risk-flags")]
    [Authorize(Policy = "Permission:users.manage")]
    [ProducesResponseType(typeof(ApiResponse<bool>), 200)]
    public async Task<IActionResult> AddRiskFlag(Guid userId, [FromBody] RiskFlagRequest request)
    {
        await _trustService.AddRiskFlagAsync(userId, request.Flag);
        return SuccessResponse(true);
    }

    /// <summary>Admin: Remove a risk flag from a user.</summary>
    [HttpDelete("admin/users/{userId:guid}/risk-flags/{flag}")]
    [Authorize(Policy = "Permission:users.manage")]
    [ProducesResponseType(typeof(ApiResponse<bool>), 200)]
    public async Task<IActionResult> RemoveRiskFlag(Guid userId, string flag)
    {
        await _trustService.RemoveRiskFlagAsync(userId, flag);
        return SuccessResponse(true);
    }
}

public record AdjustReputationRequest(int Points, string Reason);
public record RiskFlagRequest(string Flag);
