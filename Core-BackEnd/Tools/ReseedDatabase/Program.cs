using Investa.Domain.Entities;
using Investa.Infrastructure.Identity;
using Investa.Infrastructure.Persistence;
using Investa.Infrastructure.Seed;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

static string? FindSettingsPath()
{
    var dir = new DirectoryInfo(Directory.GetCurrentDirectory());
    while (dir != null)
    {
        var candidate = Path.Combine(dir.FullName, "Investa.API", "appsettings.json");
        if (File.Exists(candidate))
        {
            return candidate;
        }

        dir = dir.Parent;
    }

    return null;
}

var settingsPath = FindSettingsPath();
if (settingsPath == null)
{
    Console.WriteLine("Could not find Investa.API/appsettings.json. Run from Core-BackEnd or a subfolder.");
    return;
}

var config = new ConfigurationBuilder()
    .AddJsonFile(settingsPath, optional: false, reloadOnChange: false)
    .Build();

var connectionString = config.GetConnectionString("DefaultConnection");
if (string.IsNullOrWhiteSpace(connectionString))
{
    Console.WriteLine("DefaultConnection not found in appsettings.json.");
    return;
}

var services = new ServiceCollection();
services.AddLogging(builder => builder.AddConsole());
services.AddDbContext<ApplicationDbContext>(options => options.UseSqlServer(connectionString));
services.AddIdentity<ApplicationIdentityUser, ApplicationIdentityRole>(options =>
    {
        options.Password.RequireDigit = true;
        options.Password.RequireLowercase = true;
        options.Password.RequireUppercase = true;
        options.Password.RequireNonAlphanumeric = true;
        options.Password.RequiredLength = 8;
        options.User.RequireUniqueEmail = false;
    })
    .AddEntityFrameworkStores<ApplicationDbContext>()
    .AddDefaultTokenProviders();
services.AddScoped<IPasswordHasher<AuthUser>, PasswordHasher<AuthUser>>();
services.AddDatabaseSeeder();

await using var serviceProvider = services.BuildServiceProvider();
await using var scope = serviceProvider.CreateAsyncScope();
var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
var seeder = scope.ServiceProvider.GetRequiredService<DatabaseSeeder>();

Console.WriteLine("Dropping database...");
await db.Database.EnsureDeletedAsync();
Console.WriteLine("Database dropped.");

Console.WriteLine("Applying migrations...");
await db.Database.MigrateAsync();
Console.WriteLine("Migrations applied.");

Console.WriteLine("Running current database seed...");
await seeder.SeedAsync();
Console.WriteLine("Reseed complete.");
