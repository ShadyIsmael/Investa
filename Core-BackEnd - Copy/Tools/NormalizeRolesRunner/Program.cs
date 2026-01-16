using System;
using System.IO;
using System.Linq;
using System.Text.Json;
using Npgsql;

const string solutionRoot = "..\\..\\..\\..\\.."; // relative from Tools/NormalizeRolesRunner/bin/Debug/net8.0
string repoRoot = Path.GetFullPath(Path.Combine(AppContext.BaseDirectory, solutionRoot));
string appsettingsPath = Path.Combine(repoRoot, "Investa.API", "appsettings.json");
string sqlPath = Path.Combine(repoRoot, "scripts", "standardize_roles_postgres.sql");

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
    Console.WriteLine("This will normalize roles: set non-Client users to OrgUser in AuthUsers and ApplicationUsers.");
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
    using var cmd = new NpgsqlCommand(sql, conn);
    cmd.CommandTimeout = 300;
    int affected = cmd.ExecuteNonQuery();
    Console.WriteLine("Role normalization executed. Rows affected (driver-reported): " + affected);
}
catch (Exception ex)
{
    Console.Error.WriteLine("Execution failed: " + ex.Message);
    Environment.Exit(3);
}

Environment.Exit(0);