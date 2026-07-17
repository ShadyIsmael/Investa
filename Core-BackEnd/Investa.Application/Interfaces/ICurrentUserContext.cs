namespace Investa.Application.Interfaces;

public interface ICurrentUserContext
{
    Guid? UserId { get; }
    bool HasPermission(string permission);
}
