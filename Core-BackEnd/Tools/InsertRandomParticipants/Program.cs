using System;
using System.IO;
using System.Linq;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.EntityFrameworkCore;
using Investa.Infrastructure.Persistence;
using Investa.Domain.Entities;

// Find Investa.API/appsettings.json
string? settingsPath = null;
var dir = new DirectoryInfo(Directory.GetCurrentDirectory());
while (dir != null)
{
    var candidate = Path.Combine(dir.FullName, "Investa.API", "appsettings.json");
    if (File.Exists(candidate))
    {
        settingsPath = candidate;
        break;
    }
    dir = dir.Parent;
}

if (settingsPath == null)
{
    Console.WriteLine("Could not find Investa.API/appsettings.json. Run from repository root or a subfolder.");
    return;
}

var builder = new ConfigurationBuilder().AddJsonFile(settingsPath, optional: false, reloadOnChange: false);
var config = builder.Build();
var conn = config.GetConnectionString("DefaultConnection");
if (string.IsNullOrWhiteSpace(conn))
{
    Console.WriteLine("DefaultConnection not found in appsettings.json");
    return;
}

var services = new ServiceCollection();
services.AddDbContext<ApplicationDbContext>(opt => opt.UseSqlServer(conn));
var sp = services.BuildServiceProvider();
using var scope = sp.CreateScope();
var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

int maxPerInvestment = 5;
if (args.Length > 0 && int.TryParse(args[0], out var argVal)) maxPerInvestment = Math.Max(1, argVal);

var rnd = new Random();

var users = db.ApplicationUsers.Include(u => u.Profile).Where(u => u.Profile != null).ToList();
if (!users.Any())
{
    Console.WriteLine("No users with profiles found in database. At least one user with a profile is required to seed participants.");
    return;
}

var investments = db.Investments.ToList();
if (!investments.Any())
{
    Console.WriteLine("No investments found in database to seed participants for.");
    return;
}

int totalInserted = 0;

foreach (var inv in investments)
{
    var existing = db.InvestmentParticipants.Count(p => p.InvestmentId == inv.Id);
    int toAdd = rnd.Next(1, maxPerInvestment + 1);

    // Pick distinct random users excluding founder
    var pool = users.Where(u => u.Id != inv.FounderId).ToList();
    if (!pool.Any()) continue;

    var chosen = pool.OrderBy(_ => rnd.Next()).Take(toAdd).ToList();

    foreach (var user in chosen)
    {
        // Skip if already a participant
        if (db.InvestmentParticipants.Any(p => p.InvestmentId == inv.Id && p.InvestorId == user.Id)) continue;

        int shares = 1;
        decimal amount = 0m;
        if (inv.SharePrice.HasValue && inv.SharePrice > 0)
        {
            shares = rnd.Next(1, Math.Max(2, Math.Min(100, inv.TotalShares ?? 100)));
            amount = Math.Round(shares * inv.SharePrice.Value, 2);
        }
        else
        {
            amount = Math.Round((decimal)(rnd.Next(100, 5000) + rnd.NextDouble()), 2);
        }

        var participant = new InvestmentParticipant
        {
            InvestmentId = inv.Id,
            InvestorId = user.Id,
            SharesPurchased = shares,
            AmountInvested = amount,
            InvestmentDate = DateTime.UtcNow.AddDays(-rnd.Next(0, 365)),
            Status = "Confirmed",
            IsAnonymous = rnd.NextDouble() < 0.1, // 10% anonymous
            CreatedAt = DateTime.UtcNow
        };

        db.InvestmentParticipants.Add(participant);
        // Also insert a matching Transaction record for the investor (type: Investment)
        var tx = new Transaction
        {
            WalletId = user.Id,
            Amount = participant.AmountInvested,
            Type = TransactionType.Investment,
            Timestamp = participant.InvestmentDate
        };
        db.Transactions.Add(tx);
        totalInserted++;
    }

    // Update available shares if applicable
    if (inv.TotalShares.HasValue && inv.AvailableShares.HasValue)
    {
        var sold = db.InvestmentParticipants.Where(p => p.InvestmentId == inv.Id).Sum(p => p.SharesPurchased);
        inv.AvailableShares = Math.Max(0, inv.TotalShares.Value - sold);
        db.Investments.Update(inv);
    }
}

if (totalInserted > 0)
{
    db.SaveChanges();
    Console.WriteLine($"Inserted {totalInserted} investment participants across {investments.Count} investments.");
}
else
{
    Console.WriteLine("No new participants were inserted (records may already exist).");
}
