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

for (int i = 0; i < 5; i++)
{
    var business = businessNames[rnd.Next(businessNames.Length)];
    var amount = (decimal)(rnd.Next(1000, 20000) + rnd.NextDouble());
    var target = (decimal)(rnd.Next(50000, 200000) + rnd.NextDouble());
    var startDate = DateTime.UtcNow.AddDays(rnd.Next(-365, 365));
    var catId = (int?)categories[rnd.Next(categories.Length)];

    var inv = new Investment
    {
        InvestorId = userId,
        Amount = Math.Round(amount, 2),
        Date = DateTime.UtcNow,
        BusinessName = business + " " + Guid.NewGuid().ToString().Split('-')[0],
        Description = "Seeded investment",
        StartDate = startDate,
        BusinessCategoryId = catId,
        BusinessStageId = null,
        ProjectPhaseId = null,
        TargetFund = Math.Round(target, 2),
        Milestone = "Seed",
        RiskLevel = "Medium",
        Currency = "USD"
    };

    db.Investments.Add(inv);
    Console.WriteLine($"Adding investment: {inv.BusinessName}, amount={inv.Amount}, category={inv.BusinessCategoryId}");
}

db.SaveChanges();
Console.WriteLine("Inserted 5 investments.");
