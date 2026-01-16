using System;
using Investa.Infrastructure.Persistence;
using Investa.Domain.Entities;
using Investa.Domain.Entities.Security;
using Investa.Domain.Entities.Enums;

namespace Investa.Api.IntegrationTests.Helpers;

public static class SeedHelpers
{
    public static void SeedSampleData(ApplicationDbContext db)
    {
        db.Database.EnsureDeleted();
        db.Database.EnsureCreated();

        var group = new Group { Id = 1, Name = "Finance" };
        db.Groups.Add(group);

        var role = new Investa.Domain.Entities.Security.Role { Id = Guid.NewGuid(), Name = "Account Editor", NormalizedName = "ACCOUNT EDITOR", GroupId = 1 };
        db.Roles.Add(role);

        var user1Id = Guid.NewGuid();
        var au1 = new AuthUser { Id = user1Id, Email = "jane.doe@example.com", UserType = UserType.OrgUser, Status = true, CreatedAt = DateTime.UtcNow.AddYears(-2) };
        db.AuthUsers.Add(au1);

        var profile1 = new UserProfile { UserId = user1Id, FirstName = "Jane", LastName = "Doe", FullName = "Jane Doe", AvatarUrl = "https://example.com/avatar.jpg", LastLoginDate = DateTime.UtcNow.AddDays(-1), CreatedAt = DateTime.UtcNow.AddYears(-2), UpdatedAt = DateTime.UtcNow.AddMonths(-1) };
        db.UserProfiles.Add(profile1);

        var userRole = new UserRole { UserId = user1Id, RoleId = role.Id };
        db.UserRoles.Add(userRole);

        var session = new UserSession { Id = Guid.NewGuid(), UserId = user1Id, CreatedAt = DateTime.UtcNow.AddDays(-10), ExpiresAt = DateTime.UtcNow.AddDays(20), LastUsedAt = DateTime.UtcNow.AddDays(-1) };
        db.UserSessions.Add(session);

        // second user
        var user2Id = Guid.NewGuid();
        var au2 = new AuthUser { Id = user2Id, Email = "john.smith@example.com", UserType = UserType.OrgUser, Status = false, CreatedAt = DateTime.UtcNow.AddYears(-1) };
        db.AuthUsers.Add(au2);
        var profile2 = new UserProfile { UserId = user2Id, FirstName = "John", LastName = "Smith", FullName = "John Smith", AvatarUrl = "https://example.com/avatar2.jpg", CreatedAt = DateTime.UtcNow.AddYears(-1), UpdatedAt = DateTime.UtcNow.AddMonths(-2) };
        db.UserProfiles.Add(profile2);

        db.SaveChanges();
    }
}