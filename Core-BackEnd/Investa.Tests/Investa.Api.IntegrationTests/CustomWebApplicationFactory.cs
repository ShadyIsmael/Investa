using System;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Configuration;
using Investa.Infrastructure.Persistence;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Investa.Application.DTOs;
using Investa.Application.Interfaces;

namespace Investa.Api.IntegrationTests;

public class CustomWebApplicationFactory : WebApplicationFactory<Program>
{
    private readonly string _databaseName = $"InvestaTestDb-{Guid.NewGuid():N}";

    public CustomWebApplicationFactory()
    {
        UseTestFileStorage = true;
    }

    public bool UseTestFileStorage { get; set; }

    protected override IHost CreateHost(IHostBuilder builder)
    {
        builder.UseEnvironment("Testing");
        builder.ConfigureServices(services =>
        {
            // Replace DbContext with InMemory
            services.RemoveAll<DbContextOptions<ApplicationDbContext>>();
            services.RemoveAll<ApplicationDbContext>();

            services.AddDbContext<ApplicationDbContext>(options =>
            {
                options.UseInMemoryDatabase(_databaseName);
            });
            services.PostConfigure<FirebaseOptions>(options => options.Enabled = false);

            // Program registers the deterministic Test scheme in the Testing environment.
            services.PostConfigure<AuthenticationOptions>(options =>
            {
                options.DefaultAuthenticateScheme = "Test";
                options.DefaultChallengeScheme = "Test";
                options.DefaultScheme = "Test";
            });

            // Replace FileStore with test implementation
            if (UseTestFileStorage)
            {
                services.RemoveAll<IFileStorage>();
                services.AddScoped<IFileStorage, TestFileStorage>();
            }
        });

        return base.CreateHost(builder);
    }

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.ConfigureAppConfiguration((_, configuration) =>
        {
            configuration.AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["Jwt:Key"] = "integration-test-jwt-signing-key-at-least-32-characters",
                ["FileStore:ApiKey"] = "integration-test-file-store-key"
            });
        });
    }
}
