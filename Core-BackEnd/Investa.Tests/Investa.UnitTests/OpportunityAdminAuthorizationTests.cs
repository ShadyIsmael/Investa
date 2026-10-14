using System.Reflection;
using System.Security.Claims;
using FluentAssertions;
using Investa.API.Authorization;
using Investa.API.Controllers.Admin;
using Investa.Application.Interfaces;
using Investa.Domain.Entities.Security;
using Microsoft.AspNetCore.Authorization;
using Moq;
using Xunit;

namespace Investa.UnitTests;

public sealed class OpportunityAdminAuthorizationTests
{
    [Fact]
    public async Task Opportunity_authorization_matrix_matches_canonical_permission_scope()
    {
        var cases = new[]
        {
            (Name: "no permissions", Permissions: Array.Empty<string>(), Roles: Array.Empty<string>(), Expected: new[] { false, false, false }),
            (Name: "view only", Permissions: new[] { SystemPermissions.FopxOpportunitiesView }, Roles: Array.Empty<string>(), Expected: new[] { true, false, false }),
            (Name: "view and review", Permissions: new[] { SystemPermissions.FopxOpportunitiesView, SystemPermissions.FopxOpportunitiesReview }, Roles: Array.Empty<string>(), Expected: new[] { true, true, false }),
            (Name: "view and manage without review", Permissions: new[] { SystemPermissions.FopxOpportunitiesView, SystemPermissions.FopxOpportunitiesManage }, Roles: Array.Empty<string>(), Expected: new[] { true, false, true }),
            (Name: "reviewer role without explicit permissions", Permissions: Array.Empty<string>(), Roles: new[] { "Reviewer" }, Expected: new[] { false, false, false }),
            (Name: "migrated reviewer role", Permissions: new[] { SystemPermissions.FopxOpportunitiesView, SystemPermissions.FopxOpportunitiesReview }, Roles: new[] { "Reviewer" }, Expected: new[] { true, true, false }),
            (Name: "admin role", Permissions: Array.Empty<string>(), Roles: new[] { "Admin" }, Expected: new[] { true, true, true })
        };

        var requiredPermissions = new[]
        {
            SystemPermissions.FopxOpportunitiesView,
            SystemPermissions.FopxOpportunitiesReview,
            SystemPermissions.FopxOpportunitiesManage
        };

        foreach (var testCase in cases)
        {
            var handler = new PermissionAuthorizationHandler(Mock.Of<IEffectivePermissionService>());
            for (var index = 0; index < requiredPermissions.Length; index++)
            {
                var authorized = await IsAuthorized(handler, requiredPermissions[index], testCase.Permissions, testCase.Roles);
                authorized.Should().Be(testCase.Expected[index], testCase.Name);
            }
        }
    }

    [Fact]
    public async Task Legacy_opportunity_manage_permission_remains_compatible_with_canonical_policies()
    {
        var handler = new PermissionAuthorizationHandler(Mock.Of<IEffectivePermissionService>());

        (await IsAuthorized(handler, SystemPermissions.FopxOpportunitiesView, new[] { "Opportunity.Manage" })).Should().BeTrue();
        (await IsAuthorized(handler, SystemPermissions.FopxOpportunitiesReview, new[] { "Opportunity.Manage" })).Should().BeTrue();
        (await IsAuthorized(handler, SystemPermissions.FopxOpportunitiesManage, new[] { "Opportunity.Manage" })).Should().BeTrue();
    }

    [Fact]
    public async Task Legacy_opportunity_view_and_review_permissions_remain_narrowly_compatible()
    {
        var handler = new PermissionAuthorizationHandler(Mock.Of<IEffectivePermissionService>());

        (await IsAuthorized(handler, SystemPermissions.FopxOpportunitiesView, new[] { "Opportunity.View" })).Should().BeTrue();
        (await IsAuthorized(handler, SystemPermissions.FopxOpportunitiesReview, new[] { "Opportunity.Review" })).Should().BeTrue();
        (await IsAuthorized(handler, SystemPermissions.FopxOpportunitiesReview, new[] { "Opportunity.View" })).Should().BeFalse();
        (await IsAuthorized(handler, SystemPermissions.FopxOpportunitiesManage, new[] { "Opportunity.Review" })).Should().BeFalse();
    }

    [Fact]
    public async Task Reviewer_role_without_explicit_permissions_is_denied_all_opportunity_policies()
    {
        var handler = new PermissionAuthorizationHandler(Mock.Of<IEffectivePermissionService>());

        foreach (var permission in new[]
        {
            SystemPermissions.FopxOpportunitiesView,
            SystemPermissions.FopxOpportunitiesReview,
            SystemPermissions.FopxOpportunitiesManage
        })
        {
            (await IsAuthorized(handler, permission, roles: new[] { "Reviewer" })).Should().BeFalse(permission);
        }
    }

    [Fact]
    public void Opportunity_admin_endpoints_declare_view_review_and_manage_policies()
    {
        Policy(nameof(OpportunitiesAdminController.GetAll)).Should().Be("RequirePermission:" + SystemPermissions.FopxOpportunitiesView);
        Policy(nameof(OpportunitiesAdminController.Get)).Should().Be("RequirePermission:" + SystemPermissions.FopxOpportunitiesView);
        Policy(nameof(OpportunitiesAdminController.Approve)).Should().Be("RequirePermission:" + SystemPermissions.FopxOpportunitiesReview);
        Policy(nameof(OpportunitiesAdminController.Reject)).Should().Be("RequirePermission:" + SystemPermissions.FopxOpportunitiesReview);
        Policy(nameof(OpportunitiesAdminController.TransitionFunding)).Should().Be("RequirePermission:" + SystemPermissions.FopxOpportunitiesManage);
    }

    private static async Task<bool> IsAuthorized(
        PermissionAuthorizationHandler handler,
        string required,
        IEnumerable<string>? permissions = null,
        IEnumerable<string>? roles = null)
    {
        var claims = (permissions ?? Array.Empty<string>())
            .Select(permission => new Claim("permission", permission))
            .Concat((roles ?? Array.Empty<string>()).Select(role => new Claim(ClaimTypes.Role, role)));
        var identity = new ClaimsIdentity(claims, "test");
        var context = new AuthorizationHandlerContext(
            new[] { new PermissionRequirement(required) },
            new ClaimsPrincipal(identity),
            null);

        await handler.HandleAsync(context);
        return context.HasSucceeded;
    }

    private static string? Policy(string methodName) => typeof(OpportunitiesAdminController)
        .GetMethod(methodName, BindingFlags.Instance | BindingFlags.Public)!
        .GetCustomAttribute<AuthorizeAttribute>()?.Policy;
}
