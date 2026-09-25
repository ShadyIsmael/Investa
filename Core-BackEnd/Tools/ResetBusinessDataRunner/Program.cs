using System.Text.Json;
using Investa.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using ResetBusinessDataRunner;

static bool HasFlag(IReadOnlyList<string> args, string name)
    => args.Any(value => string.Equals(value, $"--{name}", StringComparison.OrdinalIgnoreCase));

static string? GetOption(IReadOnlyList<string> args, string name)
{
    var prefix = $"--{name}=";
    var inline = args.FirstOrDefault(value => value.StartsWith(prefix, StringComparison.OrdinalIgnoreCase));
    if (inline != null) return inline[prefix.Length..];

    for (var index = 0; index < args.Count - 1; index++)
        if (string.Equals(args[index], $"--{name}", StringComparison.OrdinalIgnoreCase))
            return args[index + 1];
    return null;
}

static string? FindSettingsPath()
{
    var startDirectories = new[]
    {
        new DirectoryInfo(Directory.GetCurrentDirectory()),
        new DirectoryInfo(AppContext.BaseDirectory)
    };

    foreach (var startDirectory in startDirectories)
    {
        var directory = startDirectory;
        while (directory != null)
        {
            var candidates = new[]
            {
                Path.Combine(directory.FullName, "Core-BackEnd", "Investa.API", "appsettings.json"),
                Path.Combine(directory.FullName, "Investa.API", "appsettings.json")
            };
            var candidate = candidates.FirstOrDefault(File.Exists);
            if (candidate != null) return candidate;
            directory = directory.Parent;
        }
    }

    return null;
}

var commandLineArgs = Environment.GetCommandLineArgs().Skip(1).ToArray();
var dryRun = HasFlag(commandLineArgs, "dry-run");
var yes = HasFlag(commandLineArgs, "yes") || HasFlag(commandLineArgs, "confirm");
var environment = GetOption(commandLineArgs, "environment")
    ?? Environment.GetEnvironmentVariable("DOTNET_ENVIRONMENT")
    ?? Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT");

if (string.IsNullOrWhiteSpace(environment))
{
    Console.Error.WriteLine("SAFETY GUARD: no environment was supplied.");
    Console.Error.WriteLine("Pass --environment Development or --environment UAT. Production is always refused.");
    return 2;
}

if (environment.Equals("Production", StringComparison.OrdinalIgnoreCase))
{
    Console.Error.WriteLine("SAFETY GUARD: Business Data Reset is permanently disabled in Production.");
    return 2;
}

if (!environment.Equals("Development", StringComparison.OrdinalIgnoreCase)
    && !environment.Equals("UAT", StringComparison.OrdinalIgnoreCase))
{
    Console.Error.WriteLine("SAFETY GUARD: only Development and UAT environments may be reset.");
    return 2;
}

var settingsPath = FindSettingsPath();
if (settingsPath == null)
{
    Console.Error.WriteLine("Could not find Investa.API/appsettings.json from the current repository.");
    return 2;
}

var settingsDirectory = Path.GetDirectoryName(settingsPath)!;
var configuration = new ConfigurationBuilder()
    .SetBasePath(settingsDirectory)
    .AddJsonFile("appsettings.json", optional: false, reloadOnChange: false)
    .AddJsonFile($"appsettings.{environment}.json", optional: true, reloadOnChange: false)
    .AddEnvironmentVariables()
    .Build();

var connectionString = configuration.GetConnectionString("DefaultConnection");
if (string.IsNullOrWhiteSpace(connectionString))
{
    Console.Error.WriteLine("ConnectionStrings:DefaultConnection is missing.");
    return 2;
}

if (!dryRun && !yes)
{
    Console.WriteLine($"Environment: {environment}");
    Console.WriteLine("This permanently deletes Project/Opportunity/Offer/Participation business data.");
    Console.WriteLine("Users, roles, permissions, currencies, lookups, finance, and security data are preserved.");
    Console.Write("Type RESET BUSINESS DATA to continue: ");
    if (!string.Equals(Console.ReadLine()?.Trim(), "RESET BUSINESS DATA", StringComparison.Ordinal))
    {
        Console.WriteLine("Reset cancelled.");
        return 1;
    }
}

var services = new ServiceCollection();
services.AddDbContext<ApplicationDbContext>(options => options.UseSqlServer(connectionString));
await using var provider = services.BuildServiceProvider();
await using var scope = provider.CreateAsyncScope();
var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
var connection = db.Database.GetDbConnection();

try
{
    var startedAt = DateTime.UtcNow;
    var engine = new BusinessDataResetEngine();
    var report = await engine.ExecuteAsync(connection, dryRun);

    Console.WriteLine(dryRun ? "Dry run complete." : "Business data reset committed.");
    Console.WriteLine("Delete order (child tables first):");
    foreach (var table in report.DeleteOrder) Console.WriteLine($"  {table}");

    Console.WriteLine("Major aggregate counts:");
    foreach (var table in report.Tables.Where(row => BusinessDataResetCatalog.MajorAggregates.Contains(row.Table, StringComparer.OrdinalIgnoreCase)))
        Console.WriteLine($"  {table.Table}: {table.Before} -> {table.After} (deleted {table.Deleted})");

    var remaining = report.Tables.Where(row => row.After > 0).Select(row => row.Schema + "." + row.Table).ToArray();
    if (remaining.Length > 0)
        Console.WriteLine("Remaining business tables with rows: " + string.Join(", ", remaining));

    var reportPath = Path.Combine(AppContext.BaseDirectory, "reset-business-data-report.json");
    await File.WriteAllTextAsync(reportPath, JsonSerializer.Serialize(new
    {
        startedAtUtc = startedAt,
        finishedAtUtc = DateTime.UtcNow,
        environment,
        dryRun,
        deleteOrder = report.DeleteOrder,
        preservedTables = report.PreservedTables,
        tables = report.Tables
    }, new JsonSerializerOptions { WriteIndented = true }));
    Console.WriteLine($"Report: {reportPath}");
    return 0;
}
catch (Exception exception)
{
    Console.Error.WriteLine("Business data reset failed; the transaction was rolled back.");
    Console.Error.WriteLine(exception);
    return 1;
}
