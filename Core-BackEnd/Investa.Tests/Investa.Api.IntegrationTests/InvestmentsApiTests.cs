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
    public async Task GetByCategory_Includes_BusinessCategoryNameAr()
    {
        var client = CreateClientAndSeed();

        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<Investa.Infrastructure.Persistence.ApplicationDbContext>();

        var bc = new Investa.Domain.Entities.BusinessCategory
        {
            Id = 6000,
            Key = "IntTestCat",
            Value = "Integration Category",
            ValueAr = "فئة تكامل",
            SortOrder = 6000
        };
        db.BusinessCategories.Add(bc);

        var inv = new Investa.Domain.Entities.Investment
        {
            FounderId = Guid.NewGuid(),
            BusinessName = "Integration Investment",
            BusinessCategoryId = bc.Id,
            InitialCapital = 100m,
            Date = DateTime.UtcNow,
            Status = Investa.Domain.Entities.Enums.InvestmentStatus.Active
        };
        db.Investments.Add(inv);
        db.SaveChanges();

        var res = await client.GetAsync($"/api/v1/investments/GetByCategory?categoryId={bc.Id}");
        res.StatusCode.Should().Be(HttpStatusCode.OK);

        var json = await res.Content.ReadFromJsonAsync<System.Text.Json.Nodes.JsonObject>();
        json.Should().NotBeNull();
        var data = json!["data"].AsArray();

        var found = data.FirstOrDefault(n => n["businessCategoryName"]?.ToString() == "Integration Category");
        found.Should().NotBeNull();
        var categoryNameAr = found!["businessCategoryNameAr"]?.ToString();
        categoryNameAr.Should().Be("فئة تكامل");
    }

    [Fact]
    public async Task Admin_ExportInvestments_Includes_BusinessCategoryNameAndAr()
    {
        var client = CreateClientAndSeed();

        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<Investa.Infrastructure.Persistence.ApplicationDbContext>();

        var bc = new Investa.Domain.Entities.BusinessCategory
        {
            Id = 6001,
            Key = "CsvCat2",
            Value = "CSV Category 2",
            ValueAr = "فئة CSV 2",
            SortOrder = 6001
        };
        db.BusinessCategories.Add(bc);

        var inv = new Investa.Domain.Entities.Investment
        {
            FounderId = Guid.NewGuid(),
            BusinessName = "CSV Investment 2",
            BusinessCategoryId = bc.Id,
            InitialCapital = 200m,
            Date = DateTime.UtcNow,
            Status = Investa.Domain.Entities.Enums.InvestmentStatus.Active
        };
        db.Investments.Add(inv);
        db.SaveChanges();

        var res = await client.GetAsync("/api/v1/investments/export");
        res.StatusCode.Should().Be(HttpStatusCode.OK);

        var csv = await res.Content.ReadAsStringAsync();
        csv.Should().Contain("BusinessCategoryName");
        csv.Should().Contain("BusinessCategoryNameAr");
        csv.Should().Contain("فئة CSV 2");
    }
}
