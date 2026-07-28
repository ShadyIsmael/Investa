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
        var normalizedUserName = AdminPhoneNumber;

        var existingIdentityUser = await _userManager.FindByEmailAsync(adminEmail);
        var existingAuthUser = await _context.AuthUsers
            .FirstOrDefaultAsync(u => u.Email == adminEmail && u.UserType == UserType.OrgUser);

        var resetOccurred = false;
        var resetMessageParts = new List<string>();

        var executionStrategy = _context.Database.CreateExecutionStrategy();
        await executionStrategy.ExecuteAsync(async () =>
        {
            await using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                if (existingIdentityUser == null && existingAuthUser != null)
                {
                    existingIdentityUser = new ApplicationIdentityUser
                    {
                        Id = existingAuthUser.Id,
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

                    var createIdentityResult = await _userManager.CreateAsync(existingIdentityUser, adminPassword);
                    if (!createIdentityResult.Succeeded)
                        throw new InvalidOperationException($"Failed to create missing admin Identity user: {string.Join("; ", createIdentityResult.Errors.Select(e => e.Description))}");

                    resetOccurred = true;
                    resetMessageParts.Add("IdentityRecordCreatedWithExistingId");
                }

                if (existingAuthUser == null && existingIdentityUser != null)
                {
                    existingAuthUser = new AuthUser
                    {
                        Id = existingIdentityUser.Id,
                        Name = adminDisplayName,
                        Email = adminEmail,
                        UserType = UserType.OrgUser,
                        Status = true,
                        IsEmailVerified = true,
                        IsPhoneVerified = true,
                        CreatedAt = DateTime.UtcNow,
                        TrustLevel = TrustLevel.TrustedActive,
                        VerificationTrustScore = 100,
                        ProfileCompletionPercentage = 100,
                        FirebaseUid = AdminPhoneNumber
                    };
                    existingAuthUser.PasswordHash = new PasswordHasher<AuthUser>().HashPassword(existingAuthUser, adminPassword);
                    _context.AuthUsers.Add(existingAuthUser);
                    resetOccurred = true;
                    resetMessageParts.Add("AuthRecordCreatedWithExistingId");
                }

                if (existingIdentityUser == null && existingAuthUser == null)
                {
                    resetOccurred = true;
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

                    existingIdentityUser = new ApplicationIdentityUser
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

                    var createUserResult = await _userManager.CreateAsync(existingIdentityUser, adminPassword);
                    if (!createUserResult.Succeeded)
                        throw new InvalidOperationException($"Failed to create admin Identity user: {string.Join("; ", createUserResult.Errors.Select(e => e.Description))}");

                    var addRoleResult = await _userManager.AddToRoleAsync(existingIdentityUser, AdminRoleName);
                    if (!addRoleResult.Succeeded)
                        throw new InvalidOperationException($"Failed to assign Admin role: {string.Join("; ", addRoleResult.Errors.Select(e => e.Description))}");

                    existingAuthUser = new AuthUser
                    {
                        Id = existingIdentityUser.Id,
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
                    existingAuthUser.PasswordHash = new PasswordHasher<AuthUser>().HashPassword(existingAuthUser, adminPassword);

                    _context.AuthUsers.Add(existingAuthUser);
                }
                else
                {
                    var passwordHash = new PasswordHasher<AuthUser>().HashPassword(existingAuthUser, adminPassword);
                    if (existingAuthUser.PasswordHash != passwordHash)
                    {
                        existingAuthUser.PasswordHash = passwordHash;
                        resetOccurred = true;
                        resetMessageParts.Add("PasswordChanged");
                    }
                    if (existingAuthUser.Name != adminDisplayName)
                    {
                        existingAuthUser.Name = adminDisplayName;
                        resetOccurred = true;
                        resetMessageParts.Add("NameUpdated");
                    }
                    if (string.IsNullOrEmpty(existingAuthUser.FirebaseUid))
                    {
                        existingAuthUser.FirebaseUid = AdminPhoneNumber;
                        resetOccurred = true;
                        resetMessageParts.Add("FirebaseUidSet");
                    }
                    if (existingIdentityUser.UserName != AdminPhoneNumber)
                    {
                        existingIdentityUser.UserName = AdminPhoneNumber;
                        existingIdentityUser.NormalizedUserName = AdminPhoneNumber;
                        existingIdentityUser.PhoneNumber = AdminPhoneNumber;
                        existingIdentityUser.PhoneNumberConfirmed = true;
                        resetOccurred = true;
                        resetMessageParts.Add("UserNameSetToPhone");
                    }
                    if (!await _userManager.IsInRoleAsync(existingIdentityUser, AdminRoleName))
                    {
                        resetOccurred = true;
                        resetMessageParts.Add("RoleRestored");
                    }
                }

                if (!await _userManager.IsInRoleAsync(existingIdentityUser, AdminRoleName))
                {
                    var addRoleResult = await _userManager.AddToRoleAsync(existingIdentityUser, AdminRoleName);
                    if (!addRoleResult.Succeeded)
                        throw new InvalidOperationException($"Failed to assign Admin role: {string.Join("; ", addRoleResult.Errors.Select(e => e.Description))}");
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                if (resetOccurred || resetMessageParts.Any())
                {
                    _logger.LogInformation(
                        "[DEV-ADMIN-RESET] Admin user ({AdminEmail}) {Details} - UserId: {UserId}",
                        adminEmail,
                        string.Join(", ", resetMessageParts),
                        existingAuthUser.Id);
                }
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
