using Microsoft.AspNetCore.Authorization;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Investa.Application.Interfaces;
using System;

namespace Investa.API.Authorization;

/// <summary>
/// Handles permission-based authorization by validating JWT claims and, when absent,
/// resolving permissions from the database via roles and group permissions.
/// </summary>
public class PermissionAuthorizationHandler : AuthorizationHandler<PermissionRequirement>
{
    private static readonly IReadOnlyDictionary<string, string[]> PermissionAliases =
        new Dictionary<string, string[]>(StringComparer.OrdinalIgnoreCase)
        {
            ["FOPX.Opportunities.View"] = ["Opportunity.View", "Opportunity.Manage"],
            ["FOPX.Opportunities.Review"] = ["Opportunity.Review", "Opportunity.Manage"],
            ["FOPX.Opportunities.Manage"] = ["Opportunity.Manage"],
            ["Company.Customers.View"] = ["Customer.View", "Customer.Manage"],
            ["Company.Customers.Create"] = ["Customer.Create", "Customer.Manage"],
            ["Company.Customers.Edit"] = ["Customer.Edit", "Customer.Manage"],
            ["Company.Customers.Manage"] = ["Customer.Manage"],
            ["Company.Products.View"] = ["Product.View", "Product.Manage"],
            ["Company.Products.Create"] = ["Product.Create", "Product.Manage"],
            ["Company.Products.Edit"] = ["Product.Edit", "Product.Manage"],
            ["Company.Products.Manage"] = ["Product.Manage"],
            ["Company.Sales.Opportunities.View"] = ["SalesOpportunity.View", "SalesOpportunity.Manage"],
            ["Company.Sales.Opportunities.Create"] = ["SalesOpportunity.Create", "SalesOpportunity.Manage"],
            ["Company.Sales.Opportunities.Edit"] = ["SalesOpportunity.Edit", "SalesOpportunity.Manage"],
            ["Company.Sales.Opportunities.Manage"] = ["SalesOpportunity.Manage"],
            ["Company.Sales.Quotations.View"] = ["SalesQuotation.View", "SalesQuotation.Manage"],
            ["Company.Sales.Quotations.Create"] = ["SalesQuotation.Create", "SalesQuotation.Manage"],
            ["Company.Sales.Quotations.Edit"] = ["SalesQuotation.Edit", "SalesQuotation.Manage"],
            ["Company.Sales.Quotations.Manage"] = ["SalesQuotation.Manage"],
            ["Company.Sales.Contracts.View"] = ["SalesContract.View", "SalesContract.Manage"],
            ["Company.Sales.Contracts.Create"] = ["SalesContract.Create", "SalesContract.Manage"],
            ["Company.Sales.Contracts.Edit"] = ["SalesContract.Edit", "SalesContract.Manage"],
            ["Company.Sales.Contracts.Manage"] = ["SalesContract.Manage"]
        };

    private readonly IEffectivePermissionService _effectivePermissionService;

    public PermissionAuthorizationHandler(IEffectivePermissionService effectivePermissionService)
    {
        _effectivePermissionService = effectivePermissionService;
    }

    protected override async Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        PermissionRequirement requirement)
    {
        // 1) Try permission claims from token first (fast path)
        var userPermissions = context.User
            .FindAll(c => c.Type == "permission")
            .Select(c => c.Value)
            .ToHashSet(StringComparer.OrdinalIgnoreCase);

        if (PermissionMatches(userPermissions, requirement.Permission))
        {
            context.Succeed(requirement);
            return;
        }

        // Preserve the existing Identity Admin role's authoritative wildcard access,
        // including when evaluating a token issued before permission claims were added.
        if (context.User.IsInRole("Admin"))
        {
            context.Succeed(requirement);
            return;
        }

        // 2) Fallback: resolve permissions from DB using user's id
        var userIdClaim = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                          ?? context.User.FindFirst("id")?.Value;

        if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out Guid userId))
        {
            // No user id available to query DB -> cannot resolve further
            return;
        }

        var effectivePermissions = await _effectivePermissionService.ResolveAsync(userId);
        if (PermissionMatches(
                effectivePermissions.PermissionKeys.ToHashSet(StringComparer.OrdinalIgnoreCase),
                requirement.Permission))
        {
            context.Succeed(requirement);
        }
    }

    private static bool PermissionMatches(ISet<string> userPermissions, string required)
    {
        var candidates = new[] { required }
            .Concat(PermissionAliases.TryGetValue(required, out var aliases) ? aliases : Array.Empty<string>());

        if (candidates.Any(userPermissions.Contains)) return true;

        foreach (var candidate in candidates)
        {
            var parts = candidate.Split('.');
            if (parts.Length == 2)
            {
                var wildcard = $"{parts[0]}.*";
                if (userPermissions.Contains(wildcard)) return true;
            }
        }

        if (userPermissions.Contains("*.*") || userPermissions.Contains("admin.*")) return true;

        return false;
    }
}
