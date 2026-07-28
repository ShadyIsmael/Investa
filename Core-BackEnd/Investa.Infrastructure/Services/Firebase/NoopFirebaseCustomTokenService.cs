using Investa.Application.Interfaces;

namespace Investa.Infrastructure.Services.Firebase;

public sealed class NoopFirebaseCustomTokenService : IFirebaseCustomTokenService
{
    public Task<string> CreateTokenAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        throw new InvalidOperationException("Firebase is disabled. Cannot create custom tokens.");
    }
}