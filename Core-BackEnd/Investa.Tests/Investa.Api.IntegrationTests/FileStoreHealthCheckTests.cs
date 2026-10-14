using FluentAssertions;
using Investa.Infrastructure.Services;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.FileProviders;
using Microsoft.Extensions.Hosting;
using Xunit;

namespace Investa.Api.IntegrationTests;

public sealed class FileStoreHealthCheckTests
{
    [Fact]
    public async Task Optional_development_filestore_returns_degraded_when_unreachable()
    {
        var check = new FileStoreHealthCheck(
            new StubHttpClientFactory(new HttpResponseMessage(System.Net.HttpStatusCode.ServiceUnavailable)),
            Configuration(required: false),
            new StubEnvironment("Development"));

        var result = await check.CheckHealthAsync(new Microsoft.Extensions.Diagnostics.HealthChecks.HealthCheckContext());

        result.Status.Should().Be(Microsoft.Extensions.Diagnostics.HealthChecks.HealthStatus.Degraded);
    }

    [Fact]
    public async Task Required_filestore_returns_unhealthy_when_unreachable()
    {
        var check = new FileStoreHealthCheck(
            new StubHttpClientFactory(new HttpResponseMessage(System.Net.HttpStatusCode.ServiceUnavailable)),
            Configuration(required: true),
            new StubEnvironment("Production"));

        var result = await check.CheckHealthAsync(new Microsoft.Extensions.Diagnostics.HealthChecks.HealthCheckContext());

        result.Status.Should().Be(Microsoft.Extensions.Diagnostics.HealthChecks.HealthStatus.Unhealthy);
    }

    private static IConfiguration Configuration(bool required) => new ConfigurationBuilder()
        .AddInMemoryCollection(new Dictionary<string, string?>
        {
            ["FileStore:BaseUrl"] = "http://filestore.test",
            ["FileStore:Required"] = required.ToString(),
        })
        .Build();

    private sealed class StubHttpClientFactory(HttpResponseMessage response) : IHttpClientFactory
    {
        public HttpClient CreateClient(string name) => new(new StubHandler(response));
    }

    private sealed class StubHandler(HttpResponseMessage response) : HttpMessageHandler
    {
        protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken) =>
            Task.FromResult(response);
    }

    private sealed class StubEnvironment(string name) : IHostEnvironment
    {
        public string EnvironmentName { get; set; } = name;
        public string ApplicationName { get; set; } = "Investa.Tests";
        public string ContentRootPath { get; set; } = AppContext.BaseDirectory;
        public IFileProvider ContentRootFileProvider { get; set; } = new NullFileProvider();
    }
}
