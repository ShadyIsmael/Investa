using System;
using System.IO;
using System.Linq;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.EntityFrameworkCore;
using Investa.Infrastructure.Persistence;
using Investa.Domain.Entities;

// find Investa.API/appsettings.json
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

// User id either from arg or default
var userIdStr = args.Length > 0 ? args[0] : "6D0412D6-5AED-42CA-A71E-D675BFF71485";
if (!Guid.TryParse(userIdStr, out var userId))
{
    Console.WriteLine("Invalid user id provided.");
    return;
}

var rnd = new Random();
var businessNames = new[] { "TechStart", "GreenEnergy", "FoodieHub", "MediCare", "EduLearn", "SmartHome", "LogiChain", "FitLife", "AutoDrive", "CryptoWallet" };
var categories = db.BusinessCategories.Select(c => c.Id).ToArray();
if (!categories.Any())
{
    // fallback category ids
    categories = new[] { 100, 101, 102 };
}

int createCount = 20;
if (args.Length > 1 && int.TryParse(args[1], out var provided)) createCount = Math.Max(1, provided);

// pick founders from DB (ClientType Founder or Both)
var founders = db.ApplicationUsers.Where(u => u.ClientType == Investa.Domain.Entities.Enums.ClientType.Founder || u.ClientType == Investa.Domain.Entities.Enums.ClientType.Both).Select(u => u.Id).ToArray();
if (!founders.Any())
{
    // fallback to provided userId as founder
    founders = new[] { userId };
}

for (int i = 0; i < createCount; i++)
{
    var business = businessNames[rnd.Next(businessNames.Length)];
    var initialCapital = (decimal)(rnd.Next(1000, 50000) + rnd.NextDouble());
    var target = (decimal)(rnd.Next(50000, 500000) + rnd.NextDouble());
    var startDate = DateTime.UtcNow.AddDays(rnd.Next(-90, 90));
    var endDate = startDate.AddDays(rnd.Next(30, 365));
    var catId = categories.Any() ? (int?)categories[rnd.Next(categories.Length)] : null;
    var sharePrice = Math.Round((decimal)(rnd.NextDouble() * 50 + 0.5), 2);
    var totalShares = rnd.Next(1000, 10000);

    var inv = new Investment
    {
        FounderId = founders[rnd.Next(founders.Length)],
        InitialCapital = Math.Round(initialCapital, 2),
        Date = DateTime.UtcNow,
        SharePrice = sharePrice,
        TotalShares = totalShares,
        AvailableShares = totalShares,
        MinInvestment = Math.Round((decimal)(rnd.Next(50, 500) + rnd.NextDouble()), 2),
        MaxInvestment = Math.Round((decimal)(rnd.Next(1000, 20000) + rnd.NextDouble()), 2),
        ValuationCap = Math.Round(target * (decimal)(1.5 + rnd.NextDouble()), 2),
        ExpectedROI = Math.Round((decimal)(rnd.Next(5, 50) + rnd.NextDouble()), 2),
        InvestmentTypeId = Investa.Domain.Entities.Enums.InvestmentType.Founding,
        Status = "Active",
        BusinessName = business + " " + Guid.NewGuid().ToString().Split('-')[0],
        Description = "Auto-seeded investment opportunity for testing",
        ImageUrl = null,
        VideoUrl = null,
        BusinessCategoryId = catId,
        TargetFund = Math.Round(target, 2),
        Milestone = "Seed",
        RiskLevel = "Medium",
        Currency = "USD",
        StartDate = startDate,
        EndDate = endDate
    };

    db.Investments.Add(inv);
    Console.WriteLine($"Adding investment: {inv.BusinessName}, founder={inv.FounderId}, capital={inv.InitialCapital}, sharePrice={inv.SharePrice}, totalShares={inv.TotalShares}");
}

db.SaveChanges();
Console.WriteLine($"Inserted {createCount} investments.");
