using Investa.Domain.Entities;
using Investa.Infrastructure.Identity;
using Investa.Infrastructure.Persistence;
using Investa.Infrastructure.Seed;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.DependencyInjection;

namespace Investa.Infrastructure.Seed;

/// <summary>
/// Extension methods for IServiceCollection to register database seeding services.
/// </summary>
public static class ServiceCollectionExtensions
{
    /// <summary>
    /// Registers the DatabaseSeeder service.
    /// Add this method call in Program.cs after other service registrations.
    /// </summary>
    /// <param name="services">The service collection.</param>
    /// <returns>The service collection for chaining.</returns>
    public static IServiceCollection AddDatabaseSeeder(this IServiceCollection services)
    {
        services.AddScoped<DatabaseSeeder>(sp => new DatabaseSeeder(
            sp.GetRequiredService<ApplicationDbContext>(),
            sp.GetRequiredService<IPasswordHasher<AuthUser>>(),
            sp.GetRequiredService<UserManager<ApplicationIdentityUser>>(),
            sp.GetRequiredService<RoleManager<ApplicationIdentityRole>>()
        ));
        return services;
    }

    /// <summary>
    /// Registers the development reseed service (repair-only) for identity roles and seeded users.
    /// </summary>
    public static IServiceCollection AddDevIdentityReseed(this IServiceCollection services)
    {
        services.AddScoped<DevIdentityReseedService>();
        return services;
    }

    /// <summary>
    /// Seeds the database with initial demo data.
    /// Call this method in Program.cs after app.Build().
    /// Example usage:
    /// using (var scope = app.Services.CreateScope())
    /// {
    ///     var seeder = scope.ServiceProvider.GetRequiredService<DatabaseSeeder>();
    ///     await seeder.SeedAsync();
    /// }
    /// </summary>
    /// <param name="serviceProvider">The service provider.</param>
    public static async Task SeedDatabaseAsync(this IServiceProvider serviceProvider)
    {
        using var scope = serviceProvider.CreateScope();
        var seeder = scope.ServiceProvider.GetRequiredService<DatabaseSeeder>();
        await seeder.SeedAsync();
    }
}

