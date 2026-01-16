using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Options;
using System.Threading.Tasks;

namespace Investa.API.Authorization;

/// <summary>
/// Custom policy provider that dynamically creates policies for permission requirements
/// Enables usage: [Authorize(Policy = "RequirePermission:clients.read")]
/// </summary>
public class PermissionPolicyProvider : IAuthorizationPolicyProvider
{
    private const string POLICY_PREFIX = "RequirePermission:";
    private readonly DefaultAuthorizationPolicyProvider _fallbackPolicyProvider;

    public PermissionPolicyProvider(IOptions<AuthorizationOptions> options)
    {
        _fallbackPolicyProvider = new DefaultAuthorizationPolicyProvider(options);
    }

    public Task<AuthorizationPolicy> GetDefaultPolicyAsync()
    {
        return _fallbackPolicyProvider.GetDefaultPolicyAsync();
    }

    public Task<AuthorizationPolicy?> GetFallbackPolicyAsync()
    {
        return _fallbackPolicyProvider.GetFallbackPolicyAsync();
    }

    public Task<AuthorizationPolicy?> GetPolicyAsync(string policyName)
    {
        // Check if this is a permission-based policy
        if (policyName.StartsWith(POLICY_PREFIX, StringComparison.OrdinalIgnoreCase))
        {
            // Extract permission from policy name (e.g., "RequirePermission:clients.read" -> "clients.read")
            var permission = policyName.Substring(POLICY_PREFIX.Length);

            // Build policy with permission requirement
            var policy = new AuthorizationPolicyBuilder()
                .AddRequirements(new PermissionRequirement(permission))
                .Build();

            return Task.FromResult<AuthorizationPolicy?>(policy);
        }

        // Fall back to default provider for other policies
        return _fallbackPolicyProvider.GetPolicyAsync(policyName);
    }
}
