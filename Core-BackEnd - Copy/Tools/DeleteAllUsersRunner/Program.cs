using System;
using System.IO;
using System.Text.Json;
using Npgsql;

const string solutionRoot = "..\\..\\..\\.."; // relative from Tools/DeleteAllUsersRunner/bin/Debug/net7.0
string repoRoot = Path.GetFullPath(Path.Combine(AppContext.BaseDirectory, solutionRoot));
string appsettingsPath = Path.Combine(repoRoot, "Investa.API", "appsettings.json");
string sqlPath = Path.Combine(repoRoot, "scripts", "delete_all_clients_and_users.sql");

if (!File.Exists(appsettingsPath))
{
    Console.Error.WriteLine($"Could not find appsettings.json at: {appsettingsPath}");
    return 2;
}
if (!File.Exists(sqlPath))
{
    Console.Error.WriteLine($"Could not find SQL script at: {sqlPath}");
    return 2;
}

var json = JsonDocument.Parse(File.ReadAllText(appsettingsPath));
if (!json.RootElement.TryGetProperty("ConnectionStrings", out var connSection) ||
    !connSection.TryGetProperty("DefaultConnection", out var defaultConn))
{
    Console.Error.WriteLine("DefaultConnection not found in appsettings.json");
    return 2;
}

string connectionString = defaultConn.GetString() ?? throw new InvalidOperationException("Connection string empty");
string sql = File.ReadAllText(sqlPath);

Console.WriteLine("About to execute destructive SQL script that deletes ALL clients and users and related data.");
Console.Write("Type CONFIRM to proceed: ");
string? confirmation = Console.ReadLine();
if (confirmation?.Trim() != "CONFIRM")
{
    Console.WriteLine("Aborted by user.");
    return 0;
}

try
{
    using var conn = new NpgsqlConnection(connectionString);
    conn.Open();
    using var cmd = new NpgsqlCommand(sql, conn);
    cmd.CommandTimeout = 600; // 10 minutes
    int affected = cmd.ExecuteNonQuery();
    Console.WriteLine("SQL executed. Rows affected (driver reported): " + affected);
}
catch (Exception ex)
{
    Console.Error.WriteLine("Execution failed: " + ex.Message);
    return 3;
}

return 0;