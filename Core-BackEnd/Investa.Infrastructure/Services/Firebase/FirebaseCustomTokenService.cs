using FirebaseAdmin.Auth;
using Investa.Application.Interfaces;
using Microsoft.Extensions.Logging;

namespace Investa.Infrastructure.Services.Firebase;

public sealed class FirebaseCustomTokenService : IFirebaseCustomTokenService
{
    private readonly ILogger<FirebaseCustomTokenService> _logger;

    public FirebaseCustomTokenService(ILogger<FirebaseCustomTokenService> logger)
    {
        _logger = logger;
    }

    public async Task<string> CreateTokenAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var uid = userId.ToString("D");
        var token = await FirebaseAuth.DefaultInstance.CreateCustomTokenAsync(uid, cancellationToken);
        _logger.LogInformation("Firebase custom token created for user {UserId}", userId);
        return token;
    }
}