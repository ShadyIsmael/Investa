using Investa.API.Controllers;
using Investa.Application.DTOs;
using Investa.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Investa.API.Controllers;

[Authorize]
[Route("api/v1/firebase")]
public class FirebaseController : BaseApiController
{
    private readonly IFirebaseCustomTokenService _customTokenService;
    private readonly ICurrentUserContext _currentUser;
    private readonly ILogger<FirebaseController> _logger;

    public FirebaseController(
        IFirebaseCustomTokenService customTokenService,
        ICurrentUserContext currentUser,
        ILogger<FirebaseController> logger)
    {
        _customTokenService = customTokenService;
        _currentUser = currentUser;
        _logger = logger;
    }

    [HttpPost("custom-token")]
    public async Task<IActionResult> CreateCustomToken(CancellationToken cancellationToken)
    {
        var userId = _currentUser.UserId;
        if (userId == null)
            return ErrorResponse("User not authenticated", 401);

        try
        {
            var token = await _customTokenService.CreateTokenAsync(userId.Value, cancellationToken);

            _logger.LogInformation("Firebase custom token issued for user {UserId}", userId.Value);

            return SuccessResponse(new FirebaseCustomTokenResponse
            {
                CustomToken = token,
                ExpiresInSeconds = 3600
            });
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning("Firebase custom token request failed for user {UserId}: {Message}", userId.Value, ex.Message);
            return ErrorResponse("Firebase is not available. Please contact support.", 503);
        }
    }
}