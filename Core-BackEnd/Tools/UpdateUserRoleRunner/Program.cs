using System;
using System.IO;
using System.Linq;
using System.Text.Json;
using Npgsql;

const string solutionRoot = "..\\..\\..\\..\\.."; // relative from Tools/UpdateUserRoleRunner/bin/Debug/net8.0
string repoRoot = Path.GetFullPath(Path.Combine(AppContext.BaseDirectory, solutionRoot));
string appsettingsPath = Path.Combine(repoRoot, "Investa.API", "appsettings.json");

if (!File.Exists(appsettingsPath))
{
    Console.Error.WriteLine($"Could not find appsettings.json at: {appsettingsPath}");
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

string phone;
string sql;

bool autoConfirm = args.Any(a => string.Equals(a, "--confirm", StringComparison.OrdinalIgnoreCase));
if (!autoConfirm)
{
    Console.Write("Enter phone number to update role to Client: ");
    phone = Console.ReadLine()?.Trim() ?? "";
    if (string.IsNullOrEmpty(phone))
    {
        Console.Error.WriteLine("Phone number is required.");
        Environment.Exit(1);
    }

    sql = $@"
UPDATE ""ApplicationUsers""
SET ""Role"" = 'Client'
WHERE ""Email"" LIKE '%{phone}%' OR ""Name"" LIKE '%{phone}%';
";

    Console.WriteLine($"Updating role to Client for user with phone: {phone}");
    Console.Write("Type CONFIRM to proceed: ");
    string? confirmation = Console.ReadLine();
    if (confirmation?.Trim() != "CONFIRM")
    {
        Console.WriteLine("Aborted by user.");
        Environment.Exit(0);
    }
}
else
{
    phone = args.FirstOrDefault(a => !a.StartsWith("--")) ?? "+2001022322292";
    sql = $@"
UPDATE ""ApplicationUsers""
SET ""Role"" = 'Client'
WHERE ""Email"" LIKE '%{phone}%' OR ""Name"" LIKE '%{phone}%';
";

    Console.WriteLine($"Auto-confirming update of role to Client for user with phone: {phone}");
}

try
{
    using var conn = new NpgsqlConnection(connectionString);
    conn.Open();
    using var cmd = new NpgsqlCommand(sql, conn);
    cmd.CommandTimeout = 300;
    int affected = cmd.ExecuteNonQuery();
    Console.WriteLine($"Role update executed. Rows affected: {affected}");
}
catch (Exception ex)
{
    Console.Error.WriteLine("Execution failed: " + ex.Message);
    Environment.Exit(3);
}

Environment.Exit(0);