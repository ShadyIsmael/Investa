using System.Security.Claims;
using Investa.Application.DTOs;
using Investa.Domain.Entities;
using Investa.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Investa.API.Controllers;

[Route("api/v1/notifications/devices")]
[Authorize]
public class DeviceTokensController : BaseApiController
{
    private readonly ApplicationDbContext _db;
    private readonly ILogger<DeviceTokensController> _logger;

    public DeviceTokensController(ApplicationDbContext db, ILogger<DeviceTokensController> logger)
    {
        _db = db;
        _logger = logger;
    }

    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<DeviceTokenResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Register([FromBody] RegisterDeviceTokenRequestDto request, CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid)
            return ErrorResponse("Invalid request", 400);

        var userId = ResolveUserId();
        if (userId == null)
            return ErrorResponse("Unable to resolve authenticated user", 401);

        var existing = await _db.DeviceTokens
            .FirstOrDefaultAsync(dt => dt.Token == request.Token && dt.UserId == userId, cancellationToken);

        if (existing != null)
        {
            existing.IsActive = true;
            existing.Browser = request.Browser ?? existing.Browser;
            existing.Platform = request.Platform ?? existing.Platform;
            existing.DeviceId = request.DeviceId ?? existing.DeviceId;
            existing.UpdatedAt = DateTime.UtcNow;
            existing.LastUsedAt = DateTime.UtcNow;

            await _db.SaveChangesAsync(cancellationToken);

            return SuccessResponse(new DeviceTokenResponseDto
            {
                Id = existing.Id,
                Token = existing.Token,
                DeviceId = existing.DeviceId,
                Browser = existing.Browser,
                Platform = existing.Platform,
                IsActive = existing.IsActive,
                CreatedAt = existing.CreatedAt,
                LastUsedAt = existing.LastUsedAt
            }, "Device token updated");
        }

        var deviceToken = new DeviceToken
        {
            UserId = userId,
            Token = request.Token,
            DeviceId = request.DeviceId,
            Browser = request.Browser,
            Platform = request.Platform,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            LastUsedAt = DateTime.UtcNow
        };

        _db.DeviceTokens.Add(deviceToken);
        await _db.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Device token registered for user {UserId}, id {DeviceTokenId}", userId, deviceToken.Id);

        return SuccessResponse(new DeviceTokenResponseDto
        {
            Id = deviceToken.Id,
            Token = deviceToken.Token,
            DeviceId = deviceToken.DeviceId,
            Browser = deviceToken.Browser,
            Platform = deviceToken.Platform,
            IsActive = deviceToken.IsActive,
            CreatedAt = deviceToken.CreatedAt,
            LastUsedAt = deviceToken.LastUsedAt
        }, "Device token registered", 201);
    }

    [HttpDelete("{deviceId:long}")]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Deactivate(long deviceId, CancellationToken cancellationToken)
    {
        var userId = ResolveUserId();
        if (userId == null)
            return ErrorResponse("Unable to resolve authenticated user", 401);

        var deviceToken = await _db.DeviceTokens
            .FirstOrDefaultAsync(dt => dt.Id == deviceId && dt.UserId == userId, cancellationToken);

        if (deviceToken == null)
            return ErrorResponse("Device token not found", 404);

        deviceToken.IsActive = false;
        deviceToken.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Device token {DeviceTokenId} deactivated for user {UserId}", deviceId, userId);

        return SuccessResponse(message: "Device token deactivated");
    }

    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<IReadOnlyList<DeviceTokenResponseDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetMyDevices(CancellationToken cancellationToken)
    {
        var userId = ResolveUserId();
        if (userId == null)
            return ErrorResponse("Unable to resolve authenticated user", 401);

        var devices = await _db.DeviceTokens
            .AsNoTracking()
            .Where(dt => dt.UserId == userId)
            .OrderByDescending(dt => dt.LastUsedAt ?? dt.CreatedAt)
            .Select(dt => new DeviceTokenResponseDto
            {
                Id = dt.Id,
                Token = dt.Token,
                DeviceId = dt.DeviceId,
                Browser = dt.Browser,
                Platform = dt.Platform,
                IsActive = dt.IsActive,
                CreatedAt = dt.CreatedAt,
                LastUsedAt = dt.LastUsedAt
            })
            .ToListAsync(cancellationToken);

        return SuccessResponse<IReadOnlyList<DeviceTokenResponseDto>>(devices);
    }

    private string? ResolveUserId()
    {
        return User.FindFirst("sub")?.Value
               ?? User.FindFirst("id")?.Value
               ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
    }
}