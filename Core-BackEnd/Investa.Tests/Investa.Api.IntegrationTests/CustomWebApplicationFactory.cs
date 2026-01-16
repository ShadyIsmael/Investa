using System;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Investa.Infrastructure.Persistence;

namespace Investa.Api.IntegrationTests;

public class CustomWebApplicationFactory : WebApplicationFactory<Program>
{
    protected override IHost CreateHost(IHostBuilder builder)
    {
        builder.ConfigureServices(services =>
        {
            // Replace DbContext with InMemory
            var descriptor = services.SingleOrDefault(d => d.ServiceType == typeof(DbContextOptions<ApplicationDbContext>));
            if (descriptor != null) services.Remove(descriptor);

            services.AddDbContext<ApplicationDbContext>(options =>
            {
                options.UseInMemoryDatabase("InvestaTestDb");
            });

            // Replace authentication with test scheme
            services.AddAuthentication("Test")
                .AddScheme<AuthenticationSchemeOptions, TestAuthHandler>("Test", options => { });

            // Ensure authorization uses the Test scheme as default
            services.Configure<Microsoft.AspNetCore.Authorization.AuthorizationOptions>(opts =>
            {
                // No-op: fallback policy is in Program; Test auth will authenticate requests
            });
        });

        return base.CreateHost(builder);
    }
}