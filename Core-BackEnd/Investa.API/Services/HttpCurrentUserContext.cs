using System.Security.Claims;
using Investa.Application.Interfaces;

namespace Investa.API.Services;

public sealed class HttpCurrentUserContext : ICurrentUserContext
{
    private readonly IHttpContextAccessor _accessor;
    public HttpCurrentUserContext(IHttpContextAccessor accessor) => _accessor = accessor;
    public Guid? UserId => Guid.TryParse(_accessor.HttpContext?.User.FindFirstValue("sub") ?? _accessor.HttpContext?.User.FindFirstValue("id") ?? _accessor.HttpContext?.User.FindFirstValue(ClaimTypes.NameIdentifier), out var id) ? id : null;
    public bool HasPermission(string permission)
    {
        var permissions = _accessor.HttpContext?.User.FindAll("permission")
            .Select(x => x.Value)
            .ToHashSet(StringComparer.OrdinalIgnoreCase);
        if (permissions == null)
            return false;

        var separator = permission.IndexOf('.');
        var resourceWildcard = separator > 0 ? $"{permission[..separator]}.*" : null;
        return permissions.Contains(permission)
               || permissions.Contains("*.*")
               || (resourceWildcard != null && permissions.Contains(resourceWildcard));
    }
}
