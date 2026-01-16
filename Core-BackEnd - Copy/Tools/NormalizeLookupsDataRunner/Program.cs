using System;
using System.IO;
using System.Linq;
using System.Text.Json;
using Npgsql;

const string solutionRoot = "..\\..\\..\\..\\.."; // relative from Tools/NormalizeLookupsDataRunner/bin/Debug/net8.0
string repoRoot = Path.GetFullPath(Path.Combine(AppContext.BaseDirectory, solutionRoot));
string appsettingsPath = Path.Combine(repoRoot, "Investa.API", "appsettings.json");
string sqlPath = Path.Combine(repoRoot, "scripts", "normalize_lookups_postgres.sql");

if (!File.Exists(appsettingsPath))
{
    Console.Error.WriteLine($"Could not find appsettings.json at: {appsettingsPath}");
    Environment.Exit(2);
}
if (!File.Exists(sqlPath))
{
    Console.Error.WriteLine($"Could not find SQL script at: {sqlPath}");
    Environment.Exit(2);
}

var json = JsonDocument.Parse(File.ReadAllText(appsettingsPath));
if (!json.RootElement.TryGetProperty("ConnectionStrings", out JsonElement connSection))
{
    Console.Error.WriteLine("ConnectionStrings section not found in appsettings.json");
    Environment.Exit(2);
}
if (!connSection.TryGetProperty("DefaultConnection", out JsonElement defaultConn))
{
    Console.Error.WriteLine("DefaultConnection not found in appsettings.json");
    Environment.Exit(2);
}

string connectionString = defaultConn.GetString() ?? throw new InvalidOperationException("Connection string empty");
string sql = File.ReadAllText(sqlPath);

bool autoConfirm = args.Any(a => string.Equals(a, "--confirm", StringComparison.OrdinalIgnoreCase));
if (!autoConfirm)
{
    Console.WriteLine("This will normalize bilingual fields for Lookups, BusinessCategories, and ClientStatuses (set Arabic to English if missing).\nNo schema changes will be made.");
    Console.Write("Type CONFIRM to proceed: ");
    string? confirmation = Console.ReadLine();
    if (confirmation?.Trim() != "CONFIRM")
    {
        Console.WriteLine("Aborted by user.");
        Environment.Exit(0);
    }
}

try
{
    using var conn = new NpgsqlConnection(connectionString);
    conn.Open();

    // Run normalization
    using (var cmd = new NpgsqlCommand(sql, conn))
    {
        cmd.CommandTimeout = 300;
        cmd.ExecuteNonQuery();
        Console.WriteLine("Normalization SQL executed.");
    }

    // Verify counts and missing Arabic values
    int totalLookups = 0, missingLookupAr = 0;
    int totalCategories = 0, missingCategoryAr = 0;
    int totalClientStatuses = 0, missingClientStatusAr = 0;

    using (var cmd = new NpgsqlCommand("SELECT COUNT(*) FROM \"Lookups\";", conn))
        totalLookups = Convert.ToInt32(cmd.ExecuteScalar());
    using (var cmd = new NpgsqlCommand("SELECT COUNT(*) FROM \"Lookups\" WHERE \"ValueAr\" IS NULL OR \"ValueAr\" = '';", conn))
        missingLookupAr = Convert.ToInt32(cmd.ExecuteScalar());

    using (var cmd = new NpgsqlCommand("SELECT COUNT(*) FROM \"BusinessCategories\";", conn))
        totalCategories = Convert.ToInt32(cmd.ExecuteScalar());
    using (var cmd = new NpgsqlCommand("SELECT COUNT(*) FROM \"BusinessCategories\" WHERE \"ValueAr\" IS NULL OR \"ValueAr\" = '';", conn))
        missingCategoryAr = Convert.ToInt32(cmd.ExecuteScalar());

    using (var cmd = new NpgsqlCommand("SELECT COUNT(*) FROM \"ClientStatuses\";", conn))
        totalClientStatuses = Convert.ToInt32(cmd.ExecuteScalar());
    using (var cmd = new NpgsqlCommand("SELECT COUNT(*) FROM \"ClientStatuses\" WHERE \"NameAr\" IS NULL OR \"NameAr\" = '';", conn))
        missingClientStatusAr = Convert.ToInt32(cmd.ExecuteScalar());

    Console.WriteLine($"Lookups: {totalLookups} total, missing Arabic: {missingLookupAr}");
    Console.WriteLine($"BusinessCategories: {totalCategories} total, missing Arabic: {missingCategoryAr}");
    Console.WriteLine($"ClientStatuses: {totalClientStatuses} total, missing Arabic: {missingClientStatusAr}");

    // Show counts per LookupType
    Console.WriteLine("LookupType counts:");
    using (var cmd = new NpgsqlCommand("SELECT \"Type\", COUNT(*) FROM \"Lookups\" GROUP BY \"Type\" ORDER BY \"Type\";", conn))
    using (var reader = cmd.ExecuteReader())
    {
        while (reader.Read())
        {
            int type = reader.GetInt32(0);
            int count = reader.GetInt32(1);
            Console.WriteLine($" - Type {type}: {count}");
        }
    }
}
catch (Exception ex)
{
    Console.Error.WriteLine("Execution failed: " + ex.Message);
    Environment.Exit(3);
}

Environment.Exit(0);
