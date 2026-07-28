namespace Investa.Application.Interfaces;

public interface IFirebaseCustomTokenService
{
    Task<string> CreateTokenAsync(Guid userId, CancellationToken cancellationToken = default);
}