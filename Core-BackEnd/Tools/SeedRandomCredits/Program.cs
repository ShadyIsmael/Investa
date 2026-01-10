using System.Data;
using Microsoft.Data.SqlClient;
using System.Text.Json;

// Usage:
// dotnet run --project Tools/SeedRandomCredits -- [connectionString] [userIdGuid]
// If connectionString not provided, the tool attempts to read Investa.API/appsettings.json ConnectionStrings:DefaultConnection

string? connStr = args.Length > 0 && !string.IsNullOrWhiteSpace(args[0]) ? args[0] : null;
string? userIdArg = args.Length > 1 ? args[1] : null;

if (connStr == null)
{
    var cfgPath = Path.Combine(Directory.GetCurrentDirectory(), "..", "..", "..", "Investa.API", "appsettings.json");
    cfgPath = Path.GetFullPath(cfgPath);
    if (!File.Exists(cfgPath))
    {
        Console.WriteLine("appsettings.json not found and no connection string provided. Provide connection string as first arg.");
        return 1;
    }

    try
    {
        using var fs = File.OpenRead(cfgPath);
        using var doc = JsonDocument.Parse(fs);
        if (doc.RootElement.TryGetProperty("ConnectionStrings", out var cs) && cs.TryGetProperty("DefaultConnection", out var def))
        {
            connStr = def.GetString();
        }
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Failed reading appsettings.json: {ex.Message}");
        return 1;
    }
}

if (string.IsNullOrWhiteSpace(connStr))
{
    Console.WriteLine("Connection string is empty.");
    return 1;
}

Console.WriteLine("Using connection string: " + (connStr!.Length > 40 ? connStr[..40] + "..." : connStr));

Guid? targetUserId = null;
int? targetClientId = null;

using var conn = new SqlConnection(connStr);
await conn.OpenAsync();

if (!string.IsNullOrWhiteSpace(userIdArg) && Guid.TryParse(userIdArg, out var parsed))
{
    targetUserId = parsed;
    // try find client id
    using var cmd = new SqlCommand("SELECT TOP 1 Id FROM Clients WHERE UserId = @uid", conn);
    cmd.Parameters.Add(new SqlParameter("@uid", SqlDbType.UniqueIdentifier) { Value = targetUserId });
    var res = await cmd.ExecuteScalarAsync();
    if (res != null && res != DBNull.Value) targetClientId = Convert.ToInt32(res);
}

if (targetUserId == null)
{
    // pick first client
    using var cmd = new SqlCommand("SELECT TOP 1 Id, UserId FROM Clients ORDER BY Id", conn);
    using var rdr = await cmd.ExecuteReaderAsync();
    if (!await rdr.ReadAsync())
    {
        Console.WriteLine("No clients found in database. Aborting.");
        return 1;
    }

    targetClientId = rdr.GetInt32(0);
    targetUserId = rdr.GetGuid(1);
}

Console.WriteLine($"Target client id: {targetClientId}, user id: {targetUserId}");

var rand = new Random();
var startDate = new DateTime(2025, 3, 1);
var endDate = DateTime.UtcNow;

int created = 0;

for (int i = 0; i < 100; i++)
{
    // random date between startDate and endDate
    var range = (endDate - startDate).Days;
    var addDays = rand.Next(0, Math.Max(1, range));
    var createdAt = startDate.AddDays(addDays).AddHours(rand.Next(0,24)).AddMinutes(rand.Next(0,60)).AddSeconds(rand.Next(0,60));

    decimal amount = Math.Round((decimal)(rand.NextDouble() * 490.0 + 10.0), 2); // 10.00 - 500.00
    int type = rand.Next(0, 2); // 0 = Earn, 1 = Adjustment
    int? referenceId = rand.Next(0, 10) == 0 ? (int?)null : rand.Next(1, 99999);
    string description = (type == 0) ? "Auto-generated Earn" : "Auto-generated Adjustment";

    using var tran = conn.BeginTransaction();
    try
    {
        using var ins = new SqlCommand(@"
INSERT INTO CreditTransactions (UserId, ClientId, Amount, Type, ReferenceId, Description, CreatedAt)
VALUES (@userId, @clientId, @amount, @type, @refId, @desc, @createdAt);
SELECT SCOPE_IDENTITY();
", conn, tran);

        ins.Parameters.Add(new SqlParameter("@userId", SqlDbType.UniqueIdentifier) { Value = targetUserId });
        ins.Parameters.Add(new SqlParameter("@clientId", SqlDbType.Int) { Value = targetClientId });
        ins.Parameters.Add(new SqlParameter("@amount", SqlDbType.Decimal) { Precision = 18, Scale = 2, Value = amount });
        ins.Parameters.Add(new SqlParameter("@type", SqlDbType.Int) { Value = type });
        ins.Parameters.Add(new SqlParameter("@refId", SqlDbType.Int) { Value = (object?)referenceId ?? DBNull.Value });
        ins.Parameters.Add(new SqlParameter("@desc", SqlDbType.NVarChar, 1000) { Value = description });
        ins.Parameters.Add(new SqlParameter("@createdAt", SqlDbType.DateTime2) { Value = createdAt });

        var idObj = await ins.ExecuteScalarAsync();

        using var upd = new SqlCommand("UPDATE Clients SET Credit = ISNULL(Credit,0) + @amount WHERE Id = @clientId", conn, tran);
        upd.Parameters.Add(new SqlParameter("@amount", SqlDbType.Decimal) { Precision = 18, Scale = 2, Value = amount });
        upd.Parameters.Add(new SqlParameter("@clientId", SqlDbType.Int) { Value = targetClientId });
        await upd.ExecuteNonQueryAsync();

        tran.Commit();
        created++;
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Insert failed: {ex.Message}");
        try { tran.Rollback(); } catch { }
    }
}

Console.WriteLine($"Inserted {created} credit transactions for user {targetUserId} (client {targetClientId}).");
return 0;
