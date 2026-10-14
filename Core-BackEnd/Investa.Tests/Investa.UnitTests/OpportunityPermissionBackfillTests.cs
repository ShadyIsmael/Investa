using FluentAssertions;
using Investa.Domain.Entities;
using Investa.Domain.Entities.Security;
using Investa.Infrastructure.Persistence;
using Investa.Infrastructure.Seed;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Investa.UnitTests;

public sealed class OpportunityPermissionBackfillTests
{
    [Fact]
    public async Task Backfill_migrates_reviewer_roles_and_is_idempotent()
    {
        await using var db = new ApplicationDbContext(new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options);

        await db.Database.EnsureCreatedAsync();

        var reviewerRoleId = Guid.NewGuid();
        var reviewerRole = new Role
        {
            Id = reviewerRoleId,
            Name = "Reviewer",
            NameEn = "Reviewer",
            NameAr = "مراجع",
            NormalizedName = "REVIEWER",
            GroupId = 5010,
            IsActive = true
        };
        typeof(Role).GetProperty(nameof(Role.RoleCode))!.SetValue(reviewerRole, "ROL-TEST-REVIEWER");

        db.Groups.Add(new Group
        {
            Id = 5010,
            Name = "Opportunity Reviewers",
            IsActive = true
        });
        db.Roles.Add(reviewerRole);
        db.Permissions.Add(new Permission
        {
            Id = 3100,
            Key = "Opportunity.Manage",
            Name = "Legacy Opportunity Manage",
            CreatedAt = DateTime.UtcNow
        });
        await db.SaveChangesAsync();

        db.RolePermissions.Add(new RolePermission
        {
            Id = 3100,
            RoleId = reviewerRoleId,
            PermissionId = 3100,
            AssignedAt = DateTime.UtcNow
        });
        await db.SaveChangesAsync();

        var service = new OpportunityPermissionBackfillService(db);

        var first = await service.BackfillAsync();

        first.AddedPermissionKeys.Should().BeEquivalentTo(new[]
        {
            SystemPermissions.FopxOpportunitiesView,
            SystemPermissions.FopxOpportunitiesReview,
            SystemPermissions.FopxOpportunitiesManage
        });
        first.ReviewerRolesProcessed.Should().Be(1);
        first.ReviewerAssignmentsAdded.Should().Be(2);
        first.LegacyManageAssignmentsRemoved.Should().Be(1);

        db.ChangeTracker.Clear();
        var migratedKeys = await db.RolePermissions
            .AsNoTracking()
            .Where(rolePermission => rolePermission.RoleId == reviewerRoleId)
            .Join(db.Permissions, rolePermission => rolePermission.PermissionId, permission => permission.Id, (_, permission) => permission.Key)
            .ToListAsync();

        migratedKeys.Should().BeEquivalentTo(new[]
        {
            SystemPermissions.FopxOpportunitiesView,
            SystemPermissions.FopxOpportunitiesReview
        });

        var second = await service.BackfillAsync();

        second.AddedPermissionKeys.Should().BeEmpty();
        second.ReviewerRolesProcessed.Should().Be(1);
        second.ReviewerAssignmentsAdded.Should().Be(0);
        second.LegacyManageAssignmentsRemoved.Should().Be(0);
        (await db.RolePermissions.CountAsync(rolePermission => rolePermission.RoleId == reviewerRoleId)).Should().Be(2);
    }
}
