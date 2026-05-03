using System;
using System.Linq;
using System.Net;
using System.Net.Http.Json;
using System.Threading.Tasks;
using FluentAssertions;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace Investa.Api.IntegrationTests;

public class DashboardApiTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly CustomWebApplicationFactory _factory;

    public DashboardApiTests(CustomWebApplicationFactory factory)
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
    public async Task Admin_GetInvestmentsGroupedByCategory_Includes_CategoryNameAr()
    {
        var client = CreateClientAndSeed();

        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<Investa.Infrastructure.Persistence.ApplicationDbContext>();

        // create a business category with Arabic value
        var bc = new Investa.Domain.Entities.BusinessCategory
        {
            Id = 999,
            Key = "TestCat",
            Value = "Test Category",
            ValueAr = "فئة اختبار",
            SortOrder = 900
        };
        db.BusinessCategories.Add(bc);

        // create an investment in that category
        var inv = new Investa.Domain.Entities.Investment
        {
            FounderId = Guid.NewGuid(),
            BusinessName = "Seeded Investment",
            BusinessCategoryId = bc.Id,
            InitialCapital = 1000m,
            Date = DateTime.UtcNow,
            Status = Investa.Domain.Entities.Enums.InvestmentStatus.Active
        };
        db.Investments.Add(inv);
        db.SaveChanges();

        // add a participant to count the invested amount
        var participant = new Investa.Domain.Entities.InvestmentParticipant
        {
            InvestmentId = inv.Id,
            InvestorId = Guid.NewGuid(),
            AmountInvested = 500m,
            CreatedAt = DateTime.UtcNow
        };
        db.InvestmentParticipants.Add(participant);
        db.SaveChanges();

        // Call the admin endpoint
        var res = await client.GetAsync("/api/v1/admin/dashboard/investments/stats/by-category");
        res.StatusCode.Should().Be(HttpStatusCode.OK);

        var json = await res.Content.ReadFromJsonAsync<System.Text.Json.Nodes.JsonObject>();
        json.Should().NotBeNull();

        var data = json["data"].AsArray();
        data.Count.Should().BeGreaterOrEqualTo(1);

        // Find our seeded category row
        var found = data.FirstOrDefault(n => n["categoryName"]?.ToString() == "Test Category");
        found.Should().NotBeNull();

        var categoryNameAr = found["categoryNameAr"]?.ToString();
        categoryNameAr.Should().Be("فئة اختبار");
    }
}
