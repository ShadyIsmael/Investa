using Investa.Domain.Entities;
using Investa.Domain.Entities.Enums;
using Investa.Infrastructure.Identity;
using Investa.Infrastructure.Persistence;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace Investa.Infrastructure.Seed;

public class DevIdentityReseedService
{
    private const string AdminRoleName = "Admin";
    private const string AdminPhoneNumber = "+201000000000";

    private readonly ApplicationDbContext _context;
    private readonly RoleManager<ApplicationIdentityRole> _roleManager;
    private readonly UserManager<ApplicationIdentityUser> _userManager;
    private readonly IHostEnvironment _environment;
    private readonly ILogger<DevIdentityReseedService> _logger;

    public DevIdentityReseedService(
        ApplicationDbContext context,
        RoleManager<ApplicationIdentityRole> roleManager,
        UserManager<ApplicationIdentityUser> userManager,
        IHostEnvironment environment,
        ILogger<DevIdentityReseedService> logger)
    {
        _context = context;
        _roleManager = roleManager;
        _userManager = userManager;
        _environment = environment;
        _logger = logger;
    }

    public async Task RepairDevelopmentIdentityDataAsync(IConfiguration configuration)
    {
        if (!_environment.IsDevelopment())
        {
            _logger.LogInformation("[DEV-ADMIN-RESET] Skipped because environment is {Environment}.", _environment.EnvironmentName);
            return;
        }

        var adminEmail = (configuration["Admin:Email"] ?? "admin@investa.com").Trim().ToLowerInvariant();
        var adminPassword = configuration["Admin:Password"] ?? "P@ssw0rd";
        var adminDisplayName = configuration["Admin:Name"] ?? "Platform Admin";
        var normalizedEmail = adminEmail.ToUpperInvariant();
        var normalizedUserName = adminEmail.Replace("@", "_").Replace(".", "_").ToUpperInvariant();

        var identityIds = await _context.Users
            .Where(u => u.NormalizedEmail == normalizedEmail || u.Email == adminEmail)
            .Select(u => u.Id)
            .ToListAsync();

        var domainIds = await _context.AuthUsers
            .Where(u => u.Email == adminEmail && u.UserType == UserType.OrgUser)
            .Select(u => u.Id)
            .ToListAsync();

        var idsToClean = identityIds.Concat(domainIds).Distinct().ToList();

        var removedUserRoles = 0;
        var removedUserClaims = 0;
        var removedUserLogins = 0;
        var removedUserTokens = 0;
        var removedIdentityUsers = 0;
        var removedDomainUserRoles = 0;
        var removedDomainUserGroups = 0;
        var removedDomainUserSessions = 0;
        var removedRefreshTokens = 0;
        var removedDomainUserTokens = 0;
        var removedAuthUsers = 0;

        var executionStrategy = _context.Database.CreateExecutionStrategy();
        await executionStrategy.ExecuteAsync(async () =>
        {
            await using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
            foreach (var userId in idsToClean)
            {
                removedUserRoles += await _context.Database.ExecuteSqlInterpolatedAsync(
                    $"DELETE FROM [AspNetUserRoles] WHERE [UserId] = {userId}");
                removedUserClaims += await _context.Database.ExecuteSqlInterpolatedAsync(
                    $"DELETE FROM [AspNetUserClaims] WHERE [UserId] = {userId}");
                removedUserLogins += await _context.Database.ExecuteSqlInterpolatedAsync(
                    $"DELETE FROM [AspNetUserLogins] WHERE [UserId] = {userId}");
                removedUserTokens += await _context.Database.ExecuteSqlInterpolatedAsync(
                    $"DELETE FROM [AspNetUserTokens] WHERE [UserId] = {userId}");
                removedIdentityUsers += await _context.Database.ExecuteSqlInterpolatedAsync(
                    $"DELETE FROM [AspNetUsers] WHERE [Id] = {userId} AND ([NormalizedEmail] = {normalizedEmail} OR [Email] = {adminEmail})");

                removedDomainUserRoles += await _context.Database.ExecuteSqlInterpolatedAsync(
                    $"DELETE FROM [UserRoles] WHERE [UserId] = {userId}");
                removedDomainUserGroups += await _context.Database.ExecuteSqlInterpolatedAsync(
                    $"DELETE FROM [UserGroups] WHERE [UserId] = {userId}");
                removedDomainUserSessions += await _context.Database.ExecuteSqlInterpolatedAsync(
                    $"DELETE FROM [UserSessions] WHERE [UserId] = {userId}");
                removedRefreshTokens += await _context.Database.ExecuteSqlInterpolatedAsync(
                    $"DELETE FROM [RefreshTokens] WHERE [AuthUserId] = {userId}");
                removedDomainUserTokens += await _context.Database.ExecuteSqlInterpolatedAsync(
                    $"DELETE FROM [UserTokens] WHERE [UserId] = {userId}");
            }

            foreach (var domainId in domainIds)
            {
                try
                {
                    removedAuthUsers += await _context.Database.ExecuteSqlInterpolatedAsync(
                        $"DELETE FROM [AuthUsers] WHERE [Id] = {domainId} AND [Email] = {adminEmail} AND [UserType] = {nameof(UserType.OrgUser)}");
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "[DEV-ADMIN-RESET] Skipped AuthUser delete for {UserId}; unexpected related data may exist.", domainId);
                }
            }

            if (!await _roleManager.RoleExistsAsync(AdminRoleName))
            {
                var roleResult = await _roleManager.CreateAsync(new ApplicationIdentityRole
                {
                    Name = AdminRoleName,
                    NormalizedName = AdminRoleName.ToUpperInvariant()
                });

                if (!roleResult.Succeeded)
                    throw new InvalidOperationException($"Failed to create Admin role: {string.Join("; ", roleResult.Errors.Select(e => e.Description))}");
            }

            var identityUser = new ApplicationIdentityUser
            {
                Id = Guid.NewGuid(),
                UserName = adminEmail.Replace("@", "_").Replace(".", "_"),
                NormalizedUserName = normalizedUserName,
                Email = adminEmail,
                NormalizedEmail = normalizedEmail,
                EmailConfirmed = true,
                PhoneNumber = AdminPhoneNumber,
                PhoneNumberConfirmed = true,
                SecurityStamp = Guid.NewGuid().ToString("N"),
                ConcurrencyStamp = Guid.NewGuid().ToString("N"),
                LockoutEnabled = false,
                AccessFailedCount = 0
            };

            var createUserResult = await _userManager.CreateAsync(identityUser, adminPassword);
            if (!createUserResult.Succeeded)
                throw new InvalidOperationException($"Failed to recreate admin Identity user: {string.Join("; ", createUserResult.Errors.Select(e => e.Description))}");

            var addRoleResult = await _userManager.AddToRoleAsync(identityUser, AdminRoleName);
            if (!addRoleResult.Succeeded)
                throw new InvalidOperationException($"Failed to assign Admin role: {string.Join("; ", addRoleResult.Errors.Select(e => e.Description))}");

            var authUser = new AuthUser
            {
                Id = identityUser.Id,
                Name = adminDisplayName,
                Email = adminEmail,
                UserType = UserType.OrgUser,
                Status = true,
                IsEmailVerified = true,
                IsPhoneVerified = true,
                CreatedAt = DateTime.UtcNow,
                TrustLevel = TrustLevel.TrustedActive,
                VerificationTrustScore = 100,
                ProfileCompletionPercentage = 100
            };
            authUser.PasswordHash = new PasswordHasher<AuthUser>().HashPassword(authUser, adminPassword);

            _context.AuthUsers.Add(authUser);
            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            _logger.LogInformation(
                "[DEV-ADMIN-RESET] Removed AspNetUserRoles={AspNetUserRoles}, AspNetUserClaims={AspNetUserClaims}, AspNetUserLogins={AspNetUserLogins}, AspNetUserTokens={AspNetUserTokens}, AspNetUsers={AspNetUsers}, UserRoles={UserRoles}, UserGroups={UserGroups}, UserSessions={UserSessions}, RefreshTokens={RefreshTokens}, UserTokens={UserTokens}, AuthUsers={AuthUsers}. Recreated AdminRole=1 AspNetUsers=1 AspNetUserRoles=1 AuthUsers=1 Email={Email} Phone={Phone} UserId={UserId}",
                removedUserRoles,
                removedUserClaims,
                removedUserLogins,
                removedUserTokens,
                removedIdentityUsers,
                removedDomainUserRoles,
                removedDomainUserGroups,
                removedDomainUserSessions,
                removedRefreshTokens,
                removedDomainUserTokens,
                removedAuthUsers,
                adminEmail,
                AdminPhoneNumber,
                identityUser.Id);
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, "[DEV-ADMIN-RESET] Failed. Transaction rolled back.");
                throw;
            }
        });
    }
}
