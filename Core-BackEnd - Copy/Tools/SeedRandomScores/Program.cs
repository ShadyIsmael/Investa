using System.Data;
using Microsoft.Data.SqlClient;
using System.Text.Json;

// Usage:
// dotnet run --project Tools/SeedRandomScores -- [connectionString] [count]
// If connectionString not provided, the tool attempts to read Investa.API/appsettings.json ConnectionStrings:DefaultConnection

string? connStr = args.Length > 0 && !string.IsNullOrWhiteSpace(args[0]) ? args[0] : null;
int count = 100;
if (args.Length > 1 && int.TryParse(args[1], out var parsedCount)) count = parsedCount;

bool updateOnly = args.Any(a => string.Equals(a, "update-scores", StringComparison.OrdinalIgnoreCase));

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

using var conn = new SqlConnection(connStr);
await conn.OpenAsync();

// If requested, only update Clients.Score from ScoreTransactions and exit
if (updateOnly)
{
    Console.WriteLine("Running update-scores: aggregating ScoreTransactions and updating Clients.Score...");
    var aggregates = new Dictionary<Guid, decimal>();
    using (var aggCmd = new SqlCommand(@"SELECT UserId, SUM(Score) AS TotalScore FROM ScoreTransactions GROUP BY UserId", conn))
    using (var rdrAgg = await aggCmd.ExecuteReaderAsync())
    {
        while (await rdrAgg.ReadAsync())
        {
            if (!rdrAgg.IsDBNull(0))
            {
                var uid = rdrAgg.GetGuid(0);
                var total = rdrAgg.IsDBNull(1) ? 0m : rdrAgg.GetDecimal(1);
                aggregates[uid] = total;
            }
        }
    }

    int updated = 0;
    foreach (var kv in aggregates)
    {
        using var uCmd = new SqlCommand("UPDATE Clients SET Score = @score WHERE UserId = @uid", conn);
        uCmd.Parameters.Add(new SqlParameter("@score", SqlDbType.Decimal) { Precision = 5, Scale = 2, Value = kv.Value });
        uCmd.Parameters.Add(new SqlParameter("@uid", SqlDbType.UniqueIdentifier) { Value = kv.Key });
        var rows = await uCmd.ExecuteNonQueryAsync();
        if (rows > 0) updated += rows;
    }

    Console.WriteLine($"Updated {updated} client score(s) from aggregated ScoreTransactions.");
    return 0;
}

// load available clients (userId) to distribute scores across existing users
var users = new List<Guid>();
using (var ccmd = new SqlCommand("SELECT UserId FROM Clients WHERE UserId IS NOT NULL", conn))
using (var rdr = await ccmd.ExecuteReaderAsync())
{
    while (await rdr.ReadAsync())
    {
        if (!rdr.IsDBNull(0)) users.Add(rdr.GetGuid(0));
    }
}

if (users.Count == 0)
{
    Console.WriteLine("No clients found to seed score transactions.");
    return 1;
}

// fetch valid transaction type ids for ScoreTransaction (Lookup.Type = ScoreTransaction)
var txTypeIds = new List<int>();
using (var q = new SqlCommand("SELECT Id FROM Lookups WHERE [Type] = 20", conn))
using (var r = await q.ExecuteReaderAsync())
{
    while (await r.ReadAsync()) txTypeIds.Add(r.GetInt32(0));
}

if (txTypeIds.Count == 0)
{
    // fallback common ids
    txTypeIds.AddRange(new[] { 200, 201, 202 });
}

var rand = new Random();
int inserted = 0;
var startDate = new DateTime(2025, 3, 1);
var endDate = DateTime.UtcNow;

for (int i = 0; i < count; i++)
{
    var userId = users[rand.Next(users.Count)];
    var range = (endDate - startDate).Days;
    var addDays = rand.Next(0, Math.Max(1, range));
    var createdAt = startDate.AddDays(addDays).AddHours(rand.Next(0,24)).AddMinutes(rand.Next(0,60)).AddSeconds(rand.Next(0,60));

    decimal score = Math.Round((decimal)(rand.NextDouble() * 9.0 + 1.0), 2); // 1.00 - 10.00
    int txType = txTypeIds[rand.Next(txTypeIds.Count)];
    Guid? reviewer = rand.Next(0, 5) == 0 ? (Guid?)users[rand.Next(users.Count)] : null;

    using var tran = conn.BeginTransaction();
    try
    {
        using var ins = new SqlCommand(@"
INSERT INTO ScoreTransactions (UserId, Score, TransactionTypeId, ReviewerId, CreatedAt)
VALUES (@userId, @score, @txType, @revId, @createdAt);
SELECT SCOPE_IDENTITY();
", conn, tran);

        ins.Parameters.Add(new SqlParameter("@userId", SqlDbType.UniqueIdentifier) { Value = userId });
        ins.Parameters.Add(new SqlParameter("@score", SqlDbType.Decimal) { Precision = 5, Scale = 2, Value = score });
        ins.Parameters.Add(new SqlParameter("@txType", SqlDbType.Int) { Value = txType });
        ins.Parameters.Add(new SqlParameter("@revId", SqlDbType.UniqueIdentifier) { Value = (object?)reviewer ?? DBNull.Value });
        ins.Parameters.Add(new SqlParameter("@createdAt", SqlDbType.DateTime2) { Value = createdAt });

        await ins.ExecuteScalarAsync();
        tran.Commit();
        inserted++;
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Failed to insert score tx: {ex.Message}");
        try { tran.Rollback(); } catch { }
    }
}

Console.WriteLine($"Inserted {inserted} score transactions across {users.Count} users.");
return 0;
