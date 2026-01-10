using System;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using System.IO;
using System.Linq;
using Microsoft.EntityFrameworkCore;
using Investa.Infrastructure.Persistence;

// Locate Investa.API/appsettings.json by walking up the directory tree
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
    Console.WriteLine("Could not find 'Investa.API/appsettings.json' in parent directories. Make sure you run this tool from the repository root or a subfolder.");
    return;
}

var builder = new ConfigurationBuilder()
    .AddJsonFile(settingsPath, optional: false, reloadOnChange: false);

var config = builder.Build();

var connectionString = config.GetConnectionString("DefaultConnection");
if (string.IsNullOrWhiteSpace(connectionString))
{
    Console.WriteLine("DefaultConnection not found in the appsettings.json.");
    return;
}

var services = new ServiceCollection();
services.AddDbContext<ApplicationDbContext>(opt =>
    opt.UseSqlServer(connectionString));

var sp = services.BuildServiceProvider();
using var scope = sp.CreateScope();
var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

Console.WriteLine("Querying investments grouped by Investor and Category...");

try
{
    var grouped = db.Investments
        .Where(i => i.BusinessCategoryId != null)
        .GroupBy(i => new { i.InvestorId, i.BusinessCategoryId })
        .Select(g => new
        {
            InvestorId = g.Key.InvestorId,
            BusinessCategoryId = g.Key.BusinessCategoryId,
            Count = g.Count(),
            TotalAmount = g.Sum(x => x.Amount)
        })
        .OrderByDescending(x => x.TotalAmount)
        .Take(50)
        .ToList();

    if (!grouped.Any())
    {
        Console.WriteLine("No investments with business category found.");
        return;
    }

    Console.WriteLine("Top results:");
    foreach (var g in grouped)
    {
        Console.WriteLine($"Investor: {g.InvestorId}, Category: {g.BusinessCategoryId}, Count: {g.Count}, Total: {g.TotalAmount}");
    }
}
catch (Exception ex)
{
    Console.WriteLine("Error querying database: " + ex.Message);
}

Console.WriteLine("Done.");