using Investa.Domain.Entities;
using Investa.Infrastructure.Identity;
using Investa.Infrastructure.Persistence;
using Investa.Infrastructure.Seed;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Data.SqlClient;

var environmentName = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT");
var destructiveResetConfirmed = args.Contains("--confirm-drop-and-reseed", StringComparer.Ordinal);
var requestedDatabase = args
    .FirstOrDefault(argument => argument.StartsWith("--target-database=", StringComparison.OrdinalIgnoreCase))?
    .Split('=', 2)
    .ElementAtOrDefault(1);
var requestedServer = args
    .FirstOrDefault(argument => argument.StartsWith("--target-server=", StringComparison.OrdinalIgnoreCase))?
    .Split('=', 2)
    .ElementAtOrDefault(1);

if (!string.Equals(environmentName, "Development", StringComparison.OrdinalIgnoreCase)
    || !destructiveResetConfirmed
    || string.IsNullOrWhiteSpace(requestedDatabase)
    || string.IsNullOrWhiteSpace(requestedServer))
{
    Console.Error.WriteLine(
        "Refusing destructive reset. Set ASPNETCORE_ENVIRONMENT=Development and pass " +
        "--target-server=<exact configured server> --target-database=<exact configured database> " +
        "--confirm-drop-and-reseed for a disposable Development database only.");
    Environment.ExitCode = 2;
    return;
}

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

var configuredConnection = new SqlConnectionStringBuilder(connectionString);
if (!string.Equals(requestedDatabase, configuredConnection.InitialCatalog, StringComparison.OrdinalIgnoreCase)
    || !string.Equals(requestedServer, configuredConnection.DataSource, StringComparison.OrdinalIgnoreCase))
{
    Console.Error.WriteLine("Refusing destructive reset because the explicit target does not match the configured server and database.");
    Environment.ExitCode = 2;
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
