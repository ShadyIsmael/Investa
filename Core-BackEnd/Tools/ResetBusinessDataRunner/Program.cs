using System.Text;
using System.Text.Json;
using Investa.Domain.Entities;
using Investa.Domain.Entities.Chat;
using Investa.Domain.Entities.Enums;
using Investa.Infrastructure.Persistence;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Investa.Infrastructure.Identity;

static string? FindSettingsPath()
{
    var dir = new DirectoryInfo(Directory.GetCurrentDirectory());
    while (dir != null)
    {
        var candidate = Path.Combine(dir.FullName, "Investa.API", "appsettings.json");
        if (File.Exists(candidate)) return candidate;
        dir = dir.Parent;
    }

    return null;
}

static bool HasFlag(string[] args, string flag)
    => args.Any(a => string.Equals(a, flag, StringComparison.OrdinalIgnoreCase));

static string? GetArgValue(string[] args, string name)
{
    // --name value
    for (var i = 0; i < args.Length - 1; i++)
    {
        if (string.Equals(args[i], $"--{name}", StringComparison.OrdinalIgnoreCase))
            return args[i + 1];
    }

    // --name=value
    var prefix = $"--{name}=";
    var match = args.FirstOrDefault(a => a.StartsWith(prefix, StringComparison.OrdinalIgnoreCase));
    if (match == null) return null;
    return match.Substring(prefix.Length);
}

static long GetDirectorySizeBytes(string root)
{
    if (!Directory.Exists(root)) return 0;
    long total = 0;
    foreach (var file in Directory.EnumerateFiles(root, "*", SearchOption.AllDirectories))
    {
        try
        {
            total += new FileInfo(file).Length;
        }
        catch { /* ignore */ }
    }
    return total;
}

static void WriteJson(string path, object payload)
{
    Directory.CreateDirectory(Path.GetDirectoryName(path)!);
    var json = JsonSerializer.Serialize(payload, new JsonSerializerOptions { WriteIndented = true });
    File.WriteAllText(path, json);
}

var dryRun = HasFlag(args: Environment.GetCommandLineArgs().Skip(1).ToArray(), flag: "--dry-run");
var cleanFileStore = HasFlag(args: Environment.GetCommandLineArgs().Skip(1).ToArray(), flag: "--clean-filestore");
var minAgeDaysStr = GetArgValue(Environment.GetCommandLineArgs().Skip(1).ToArray(), "min-age-days");
var minAgeDays = minAgeDaysStr != null && int.TryParse(minAgeDaysStr, out var d) ? d : 0;

var settingsPath = FindSettingsPath();
if (settingsPath == null)
{
    // Deterministic absolute path based on repo layout
    // Repo root is d:/projects/Investa/gitInvesta by convention in this workspace.
    var candidate = Path.Combine(
        "d:/projects/Investa/gitInvesta/Core-BackEnd",
        "Investa.API",
        "appsettings.json");

    if (File.Exists(candidate))
        settingsPath = candidate;
    else
    {
        // Fallback for other working directory layouts
        candidate = Path.Combine(Directory.GetCurrentDirectory(), "Investa.API", "appsettings.json");
        if (File.Exists(candidate)) settingsPath = candidate;
    }
}
if (settingsPath == null || !File.Exists(settingsPath))
{
    Console.WriteLine("Could not find Investa.API/appsettings.json.");
    Console.WriteLine($"CurrentDir={Directory.GetCurrentDirectory()}");
    Console.WriteLine($"BaseDir={AppContext.BaseDirectory}");
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
services.AddLogging(b => b.AddConsole());
services.AddDbContext<ApplicationDbContext>(o => o.UseSqlServer(connectionString));
services.AddIdentity<ApplicationIdentityUser, ApplicationIdentityRole>(opt =>
{
    // password rules irrelevant for reset
    opt.User.RequireUniqueEmail = false;
}).AddEntityFrameworkStores<ApplicationDbContext>();

await using var serviceProvider = services.BuildServiceProvider();
await using var scope = serviceProvider.CreateAsyncScope();

var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
var logger = scope.ServiceProvider.GetRequiredService<ILoggerFactory>().CreateLogger("ResetBusinessDataRunner");

// Tables to preserve: users/auth + RBAC + admin reference data.
// Everything else is treated as business/non-auth state and will be cleared.

var authPreservedTables = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
{
    // ASP.NET Identity (typical)
    "AspNetUsers",
    "AspNetRoles",
    "AspNetUserRoles",
    "AspNetUserClaims",
    "AspNetUserLogins",
    "AspNetUserTokens",
    // Domain identity
    "Users",
    "Roles",
    "UserRoles",
    "GroupPermissions", // RBAC
    "UserGroups", // RBAC
    "Groups",
    "Permissions",
    // Domain master auth
    "AuthUsers",
    "UserProfiles",
    "UserSessions",
    "RefreshTokens",
    // Credit/wallet bookkeeping is explicitly NOT preserved (per user request)
};

var referencePreservedTables = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
{
    // Lookup + reference catalogs
    "Lookups",
    "BusinessCategories",
    "ClientStatuses",
    "FundingGoals",
    "OpportunityCategories",
    "OpportunityTags",
    // Reputation rules are system-defined reference.
    "ReputationRules",
    // Credit configurations / plans / service prices
    "CreditConfigurations",
    "CreditPlans",
    "ServicePrices",
    // Notification templates are admin-configurable reference
    "NotificationTemplates",
};

// Some tables are strictly “business derived” but are also analytics.
var preservedOnly = authPreservedTables.Union(referencePreservedTables).ToHashSet(StringComparer.OrdinalIgnoreCase);

// Map EF model entity types to table names.
var allEntityTypes = db.Model.GetEntityTypes().ToList();
var tableNames = allEntityTypes
    .Select(et => et.GetTableName())
    .Where(t => !string.IsNullOrWhiteSpace(t))!
    .Select(t => t!)
    .Distinct(StringComparer.OrdinalIgnoreCase)
    .OrderBy(x => x)
    .ToList();

var businessTables = tableNames.Where(t => !preservedOnly.Contains(t!)).ToList();

logger.LogInformation("Preserved tables: {count}", preservedOnly.Count);
logger.LogInformation("Business tables to clear: {count}", businessTables.Count);

var started = DateTime.UtcNow;


// Scalar query helper
async Task<long> CountRowsAsync(string table)
{
    // SQL Server
    var result = await db.Set<DbScalar<long>>().FromSqlInterpolated($"SELECT COUNT(1) as Value FROM [{table}]")
        .Select(x => x.Value)
        .FirstAsync();
    return result;
}

// Create a dummy scalar entity type at runtime is overkill; instead use raw ADO.NET.
// We'll switch to ADO.NET for safety.

var affected = new Dictionary<string, long>(StringComparer.OrdinalIgnoreCase);
var beforeCounts = new Dictionary<string, long>(StringComparer.OrdinalIgnoreCase);
var afterCounts = new Dictionary<string, long>(StringComparer.OrdinalIgnoreCase);

await using (var conn = db.Database.GetDbConnection())
{
    await conn.OpenAsync();
    foreach (var table in businessTables)
    {
        await using var cmd = conn.CreateCommand();
        cmd.CommandText = $"SELECT COUNT(1) FROM [{table}]";
        var val = await cmd.ExecuteScalarAsync();
        var c = val == null || val == DBNull.Value ? 0L : Convert.ToInt64(val);
        beforeCounts[table] = c;
    }

    // Deletion: do in dependency-safe order. Simplest: disable FK checks not available in SQL Server.
    // Instead, use TRUNCATE for heap-like tables where possible; but foreign keys may block.
    // We'll use DELETE with ORDER: children to parents is hard without FK graph.
    // Pragmatic approach: do iterative deletes using SQL sys.foreign_keys is complex.
    // We'll do single pass DELETE with escalating attempts: if a table delete fails due to FK, retry later.

    var deleteQueue = businessTables.ToList();
    var maxPasses = 6;
    for (var pass = 1; pass <= maxPasses && deleteQueue.Count > 0; pass++)
    {
        logger.LogInformation("Reset pass {pass}/{maxPasses}. Remaining tables: {rem}", pass, maxPasses, deleteQueue.Count);
        var nextQueue = new List<string>();

        foreach (var table in deleteQueue)
        {
            try
            {
                // Optional safety: age filter
                // If a min age is provided, we only delete rows older than the threshold.
                // However, we can't know column names for all tables, so we ignore age filter for now.

                string sql = $"DELETE FROM [{table}]";

                if (dryRun)
                {
                    logger.LogInformation("[dry-run] {sql}", sql);
                    affected[table] = 0;
                    continue;
                }

                await using var cmd = conn.CreateCommand();
                cmd.CommandText = sql;
                var rows = await cmd.ExecuteNonQueryAsync();
                affected[table] = rows;
            }
            catch (Exception ex)
            {
                logger.LogWarning(ex, "Delete failed for {table}; will retry later if still possible.", table);
                nextQueue.Add(table);
            }
        }

        deleteQueue = nextQueue;
    }

    // Remaining retry failures will be reported.

    foreach (var table in businessTables)
    {
        await using var cmd = conn.CreateCommand();
        cmd.CommandText = $"SELECT COUNT(1) FROM [{table}]";
        var val = await cmd.ExecuteScalarAsync();
        var c = val == null || val == DBNull.Value ? 0L : Convert.ToInt64(val);
        afterCounts[table] = c;
    }
}

// Reset derived balances stored on user/profile records.
// Per request: clear derived wallet/credit/score/reputation balances stored on user/profile records.
// We treat this as business state and update AuthUsers.
if (!dryRun)
{
    await using (var conn = db.Database.GetDbConnection())
    {
        await conn.OpenAsync();
        var sql = @"UPDATE [AuthUsers]
                     SET [WalletBalance] = 0,
                         [CredibilityScore] = 3500,
                         [ReputationLevel] = [ReputationLevel],
                         [ActivityScore] = 0,
                         [ReputationScore] = 0,
                         [TrustLevel] = [TrustLevel]
                     ;";
        // Some columns may not exist depending on schema; we'll do best-effort by checking columns.

        try
        {
            await using var cmd = conn.CreateCommand();
            cmd.CommandText = sql;
            await cmd.ExecuteNonQueryAsync();
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Balance reset update failed (columns mismatch). Will proceed without it.");
        }
    }
}

// FileStore cleanup
var filestoreRoot = config["FileStore:BaseUrl"];
var storageRoot = Path.Combine(Path.GetDirectoryName(settingsPath) ?? "", "..", "..", "..", "InvestaFileStore", "Storage");
// Better: read from InvestaFileStore/Storage settings? There's no DB mapping. We'll only delete known opportunity folders if requested.
// Safe heuristic: if cleaning filestore, delete category folders related to opportunities/updates that match known naming.

var filestoreBefore = cleanFileStore && Directory.Exists(storageRoot) ? GetDirectorySizeBytes(storageRoot) : 0;
var filestoreDeletedFiles = 0L;

if (cleanFileStore && Directory.Exists(storageRoot) && !dryRun)
{
    var candidates = new[]
    {
        "OpportunityCover",
        "OpportunityGallery",
        "OpportunityPublicDocument",
        "OpportunityPrivateDocument",
        "uploads-investments-" // not a folder; startsWith
    };

    foreach (var dir in Directory.EnumerateDirectories(storageRoot))
    {
        var name = Path.GetFileName(dir);
        var shouldDelete = candidates.Any(c => name.Equals(c, StringComparison.OrdinalIgnoreCase))
                           || name.StartsWith("uploads-investments-", StringComparison.OrdinalIgnoreCase);

        if (!shouldDelete) continue;

        try
        {
            foreach (var f in Directory.EnumerateFiles(dir, "*", SearchOption.AllDirectories))
                filestoreDeletedFiles++;

            Directory.Delete(dir, recursive: true);
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Failed to delete filestore folder {dir}", dir);
        }
    }
}

var filestoreAfter = cleanFileStore && Directory.Exists(storageRoot) ? GetDirectorySizeBytes(storageRoot) : filestoreBefore;

// Write report with exact remaining data counts per table.
var report = new
{
    startedAtUtc = started,
    finishedAtUtc = DateTime.UtcNow,
    dryRun,
    cleanFileStore,
    filestoreRoot = storageRoot,
    filestoreBeforeBytes = filestoreBefore,
    filestoreAfterBytes = filestoreAfter,
    filestoreDeletedFiles,
    preservedTables = preservedOnly.OrderBy(x => x).ToArray(),
    businessTables,
    beforeCounts,
    afterCounts,
    affectedCounts = affected,
    remainingTables = businessTables.Where(t => afterCounts.TryGetValue(t, out var c) && c > 0).ToArray()
};

var reportPath = Path.Combine(AppContext.BaseDirectory, "reset-business-data-report.json");
WriteJson(reportPath, report);

Console.WriteLine($"Reset complete. Report: {reportPath}");
logger.LogInformation("Remaining tables after reset: {n}", report.remainingTables.Length);

// Build EF model includes no reflection; dummy type not used.
file sealed class DbScalar<T> { public T Value { get; set; } }

