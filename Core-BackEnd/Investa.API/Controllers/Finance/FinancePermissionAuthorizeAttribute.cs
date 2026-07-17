using Microsoft.AspNetCore.Authorization;

namespace Investa.API.Controllers.Finance;

/// <summary>Adapts finance declarations to the application's dynamic permission policy provider.</summary>
public sealed class AuthorizeAttribute : Microsoft.AspNetCore.Authorization.AuthorizeAttribute
{
    private string? _permissions;
    public string Permissions
    {
        get => _permissions ?? string.Empty;
        set
        {
            _permissions = value;
            Policy = $"RequirePermission:{value}";
        }
    }
}
