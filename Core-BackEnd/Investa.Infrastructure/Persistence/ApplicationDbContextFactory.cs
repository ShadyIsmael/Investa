using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;
using System.IO;

namespace Investa.Infrastructure.Persistence;

public class ApplicationDbContextFactory : IDesignTimeDbContextFactory<ApplicationDbContext>
{
    public ApplicationDbContext CreateDbContext(string[] args)
    {
        var basePath = Directory.GetCurrentDirectory();
        
        // Look for appsettings.json in the API project directory
        var apiProjectPath = Path.Combine(basePath, "..", "Investa.API");
        if (Directory.Exists(apiProjectPath))
        {
            basePath = Path.GetFullPath(apiProjectPath);
        }
        
        var builder = new ConfigurationBuilder()
            .SetBasePath(basePath)
            .AddJsonFile("appsettings.json", optional: true)
            .AddEnvironmentVariables();

        var config = builder.Build();

        var conn = config.GetConnectionString("DefaultConnection") ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");

        var optionsBuilder = new DbContextOptionsBuilder<ApplicationDbContext>();
        optionsBuilder.UseSqlServer(conn, b =>
        {
            b.MigrationsAssembly("Investa.Infrastructure");
            b.UseCompatibilityLevel(120);
        });

        return new ApplicationDbContext(optionsBuilder.Options);
    }
}
