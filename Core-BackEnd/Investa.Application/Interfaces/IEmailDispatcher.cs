namespace Investa.Application.Interfaces;

public interface IEmailDispatcher
{
    Task DispatchAsync(CancellationToken cancellationToken = default);
}
