using System;
using System.Linq;
using System.Net;
using System.Net.Http.Json;
using System.Threading.Tasks;
using FluentAssertions;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace Investa.Api.IntegrationTests;

public class InvestmentsApiTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly CustomWebApplicationFactory _factory;

    public InvestmentsApiTests(CustomWebApplicationFactory factory)
    {
        _factory = factory;
    }

    private HttpClient CreateClientAndSeed()
    {
        var client = _factory.CreateClient();
        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<Investa.Infrastructure.Persistence.ApplicationDbContext>();
        Helpers.SeedHelpers.SeedSampleData(db);
        return client;
    }

    [Fact]
    public async Task GetByCategory_Includes_ProjectCategoryNameAr()
    {
        var client = CreateClientAndSeed();

        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<Investa.Infrastructure.Persistence.ApplicationDbContext>();

        var bc = new Investa.Domain.Entities.ProjectCategory
        {
            Id = 6000,
            Code = "INTEGRATION-CAT",
            NameEn = "Integration Category",
            NameAr = "فئة تكامل",
            SortOrder = 6000
        };
        db.ProjectCategories.Add(bc);

        var inv = new Investa.Domain.Entities.Investment
        {
            FounderId = Guid.NewGuid(),
            BusinessName = "Integration Investment",
            ProjectCategoryId = bc.Id,
            InitialCapital = 100m,
            Date = DateTime.UtcNow,
            Status = "Active"
        };
        db.Investments.Add(inv);
        db.SaveChanges();

        var res = await client.GetAsync($"/api/v1/investments/GetByCategory?categoryId={bc.Id}");
        res.StatusCode.Should().Be(HttpStatusCode.OK);

        var json = await res.Content.ReadFromJsonAsync<System.Text.Json.Nodes.JsonObject>();
        json.Should().NotBeNull();
        var data = json!["data"]!.AsArray();

        var found = data.FirstOrDefault(n => n?["projectCategoryName"]?.ToString() == "Integration Category");
        found.Should().NotBeNull();
        var categoryNameAr = found!["projectCategoryNameAr"]?.ToString();
        categoryNameAr.Should().Be("فئة تكامل");
    }

    [Fact]
    public async Task Admin_ExportInvestments_Includes_ProjectCategoryNameAndAr()
    {
        var client = CreateClientAndSeed();

        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<Investa.Infrastructure.Persistence.ApplicationDbContext>();

        var bc = new Investa.Domain.Entities.ProjectCategory
        {
            Id = 6001,
            Code = "CSV-CAT-2",
            NameEn = "CSV Category 2",
            NameAr = "فئة CSV 2",
            SortOrder = 6001
        };
        db.ProjectCategories.Add(bc);

        var inv = new Investa.Domain.Entities.Investment
        {
            FounderId = Guid.NewGuid(),
            BusinessName = "CSV Investment 2",
            ProjectCategoryId = bc.Id,
            InitialCapital = 200m,
            Date = DateTime.UtcNow,
            Status = "Active"
        };
        db.Investments.Add(inv);
        db.SaveChanges();

        var res = await client.GetAsync("/api/v1/investments/export");
        res.StatusCode.Should().Be(HttpStatusCode.OK);

        var csv = await res.Content.ReadAsStringAsync();
        csv.Should().Contain("ProjectCategoryName");
        csv.Should().Contain("ProjectCategoryNameAr");
        csv.Should().Contain("فئة CSV 2");
    }
}
