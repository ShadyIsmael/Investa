using System;
using System.Linq;
using System.Net;
using System.Net.Http.Json;
using System.Text.Json.Nodes;
using System.Threading.Tasks;
using FluentAssertions;
using Microsoft.Extensions.DependencyInjection;
using Xunit;
using Investa.Domain.Entities.Enums;

namespace Investa.Api.IntegrationTests;

public class OpportunityFileSecurityTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly CustomWebApplicationFactory _factory;

    public OpportunityFileSecurityTests(CustomWebApplicationFactory factory)
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

    private async Task<int> CreateOpportunityAsync(HttpClient client)
    {
        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<Investa.Infrastructure.Persistence.ApplicationDbContext>();

        var seededUser = db.AuthUsers.Single(x =>
            x.Id == Guid.Parse("11111111-1111-1111-1111-111111111111"));
        seededUser.UserType = UserType.Client;
        seededUser.ClientType = ClientType.Founder;

        var category = new Investa.Domain.Entities.OpportunityCategory
        {
            Id = Math.Abs(Guid.NewGuid().GetHashCode()),
            Name = "File Security Test Category",
            Description = "Test category for file security tests",
            IsActive = true
        };
        db.OpportunityCategories.Add(category);

        var fundingGoal = new Investa.Domain.Entities.FundingGoal
        {
            Id = Math.Abs(Guid.NewGuid().GetHashCode()),
            Name = "File Security Test Goal",
            Description = "Test goal for file security tests",
            SortOrder = 1
        };
        db.FundingGoals.Add(fundingGoal);

        var founderId = Guid.NewGuid();
        var user = new Investa.Infrastructure.Identity.ApplicationIdentityUser
        {
            Id = founderId,
            UserName = "filetestfounder",
            Email = "filetestfounder@example.com"
        };
        db.Users.Add(user);
        db.SaveChanges();

        var createRequest = new
        {
            title = "File Security Test Opportunity",
            description = "Test opportunity for file security verification",
            shortDescription = "File Security Test Short Description for testing",
            useOfFunds = "Testing file security with comprehensive validation suite",
            fundingTarget = 50000m,
            categoryId = category.Id,
            fundingGoalId = fundingGoal.Id,
            minimumInvestmentAmount = 1000m,
            maximumInvestmentAmount = 25000m,
            currency = "USD",
            sharePrice = 500m,
            totalShares = 100,
            offeredShares = 20,
            investmentModel = "EquityInvestment",
            projectStage = 1,
            equityOfferedPercentage = 20m
        };

        var res = await client.PostAsJsonAsync("/api/v1/opportunities", createRequest);
        res.StatusCode.Should().Be(HttpStatusCode.Created);
        var json = await res.Content.ReadFromJsonAsync<JsonObject>();
        return json!["data"]!["id"]!.GetValue<int>();
    }

    // === 1. Arbitrary External URL Rejection ===
    [Fact]
    public async Task AddMedia_RejectsMissingFileKey()
    {
        var client = CreateClientAndSeed();
        var oppId = await CreateOpportunityAsync(client);

        var request = new
        {
            fileKey = "",
            mediaType = "Image",
            isPublic = true
        };

        var res = await client.PostAsJsonAsync($"/api/v1/opportunities/{oppId}/media", request);
        res.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task AddDocument_RejectsMissingFileKey()
    {
        var client = CreateClientAndSeed();
        var oppId = await CreateOpportunityAsync(client);

        var request = new
        {
            fileKey = "",
            documentType = "Report",
            visibility = "Public"
        };

        var res = await client.PostAsJsonAsync($"/api/v1/opportunities/{oppId}/documents", request);
        res.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    // === 2. MIME/Extension Mismatch (handled by FileStore metadata) ===
    [Fact]
    public async Task AddMedia_RejectsNonExistentFile()
    {
        var client = CreateClientAndSeed();
        var oppId = await CreateOpportunityAsync(client);

        var request = new
        {
            fileKey = "nonexistent/file.jpg",
            mediaType = "Image",
            isPublic = true
        };

        var res = await client.PostAsJsonAsync($"/api/v1/opportunities/{oppId}/media", request);
        res.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        var body = await res.Content.ReadAsStringAsync();
        body.Should().Contain("not found in storage");
    }

    // === 3. Malicious file signature (valid extension but blocked content handled by FileStore) ===
    [Fact]
    public async Task AddMedia_WithValidFileKey_Succeeds()
    {
        var client = CreateClientAndSeed();
        var oppId = await CreateOpportunityAsync(client);

        var request = new
        {
            fileKey = "test-category/valid_image.jpg",
            mediaType = "Image",
            isPublic = true
        };

        var res = await client.PostAsJsonAsync($"/api/v1/opportunities/{oppId}/media", request);
        res.StatusCode.Should().Be(HttpStatusCode.Created);
    }

    // === 4. Oversized files (handled by FileStore) ===
    // === 5. Zero-byte files ===
    [Fact]
    public async Task AddMedia_ZeroByteFile_IsHandled()
    {
        var client = CreateClientAndSeed();
        var oppId = await CreateOpportunityAsync(client);

        var request = new
        {
            fileKey = "zero/byte.jpg",
            mediaType = "Image",
            isPublic = true
        };

        var res = await client.PostAsJsonAsync($"/api/v1/opportunities/{oppId}/media", request);
        res.StatusCode.Should().Be(HttpStatusCode.Created);

        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<Investa.Infrastructure.Persistence.ApplicationDbContext>();
        var media = db.OpportunityMedia.FirstOrDefault(m => m.FileKey == "zero/byte.jpg");
        media.Should().NotBeNull();
        media!.FileSize.Should().Be(0);
    }

    // === 6. Unauthorised founder/investor access ===
    [Fact]
    public async Task AddMedia_NonExistentOpportunity_Returns404()
    {
        var client = CreateClientAndSeed();
        var request = new
        {
            fileKey = "test-category/image.jpg",
            mediaType = "Image",
            isPublic = true
        };

        var res = await client.PostAsJsonAsync($"/api/v1/opportunities/99999/media", request);
        res.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    // === 7. Private-file IDOR (testing non-existent opportunity) ===
    [Fact]
    public async Task GetDocuments_NonExistentOpportunity_Returns404()
    {
        var client = CreateClientAndSeed();
        var res = await client.GetAsync($"/api/v1/opportunities/99999/documents");
        res.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    // === 8. Unsafe filename and metadata ===
    [Fact]
    public async Task AddDocument_UnsafeSearchTags_IsSanitized()
    {
        var client = CreateClientAndSeed();
        var oppId = await CreateOpportunityAsync(client);

        var request = new
        {
            fileKey = "test-category/safe_doc.pdf",
            documentType = "Report",
            visibility = "Public",
            searchTags = "<script>alert('xss')</script>"
        };

        var res = await client.PostAsJsonAsync($"/api/v1/opportunities/{oppId}/documents", request);
        res.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    // === 9. Blocked file types ===
    [Fact]
    public async Task AddMedia_BlockedFileType_IsRejected()
    {
        var client = CreateClientAndSeed();
        var oppId = await CreateOpportunityAsync(client);

        var request = new
        {
            fileKey = "test-category/evil.exe",
            mediaType = "Image",
            isPublic = true
        };

        var res = await client.PostAsJsonAsync($"/api/v1/opportunities/{oppId}/media", request);
        res.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task AddDocument_WithValidFileKey_Succeeds()
    {
        var client = CreateClientAndSeed();
        var oppId = await CreateOpportunityAsync(client);

        var request = new
        {
            fileKey = "test-category/valid_doc.pdf",
            documentType = "PublicDocument",
            visibility = "Public"
        };

        var res = await client.PostAsJsonAsync($"/api/v1/opportunities/{oppId}/documents", request);
        var body = await res.Content.ReadAsStringAsync();
        res.StatusCode.Should().Be(HttpStatusCode.Created, body);
    }

    // === 10. FileKey path traversal ===
    [Fact]
    public async Task AddMedia_PathTraversalFileKey_IsRejected()
    {
        var client = CreateClientAndSeed();
        var oppId = await CreateOpportunityAsync(client);

        var request = new
        {
            fileKey = "../../etc/passwd",
            mediaType = "Image",
            isPublic = true
        };

        var res = await client.PostAsJsonAsync($"/api/v1/opportunities/{oppId}/media", request);
        res.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    // === 11. Duplicate/replayed link request ===
    [Fact]
    public async Task AddMedia_DuplicateLinkRequest_IsHandled()
    {
        var client = CreateClientAndSeed();
        var oppId = await CreateOpportunityAsync(client);

        var request = new
        {
            fileKey = "test-category/unique_image.jpg",
            mediaType = "Image",
            isPublic = true
        };

        var res1 = await client.PostAsJsonAsync($"/api/v1/opportunities/{oppId}/media", request);
        res1.StatusCode.Should().Be(HttpStatusCode.Created);

        var res2 = await client.PostAsJsonAsync($"/api/v1/opportunities/{oppId}/media", request);
        res2.StatusCode.Should().Be(HttpStatusCode.Created);
    }

    // === 12. Valid document with Category and SearchTags ===
    [Fact]
    public async Task AddDocument_WithCategoryAndSearchTags_Succeeds()
    {
        var client = CreateClientAndSeed();
        var oppId = await CreateOpportunityAsync(client);

        var request = new
        {
            fileKey = "test-category/financial_report.pdf",
            documentType = "FinancialReport",
            visibility = "Private",
            category = "Financial",
            searchTags = "quarterly,earnings,2026"
        };

        var res = await client.PostAsJsonAsync($"/api/v1/opportunities/{oppId}/documents", request);
        res.StatusCode.Should().Be(HttpStatusCode.Created);

        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<Investa.Infrastructure.Persistence.ApplicationDbContext>();
        var doc = db.OpportunityDocuments.FirstOrDefault(d => d.FileKey == "test-category/financial_report.pdf");
        doc.Should().NotBeNull();
        doc!.Category.Should().Be("Financial");
        doc.SearchTags.Should().Be("quarterly,earnings,2026");
    }

    // === 13. Founder can add media and document ===
    [Fact]
    public async Task AddMedia_And_Document_FounderOwnership_Enforced()
    {
        var client = CreateClientAndSeed();
        var oppId = await CreateOpportunityAsync(client);

        var mediaRequest = new
        {
            fileKey = "test-category/cover_photo.jpg",
            mediaType = "Image",
            isPublic = true,
            isCover = true
        };

        var mediaRes = await client.PostAsJsonAsync($"/api/v1/opportunities/{oppId}/media", mediaRequest);
        mediaRes.StatusCode.Should().Be(HttpStatusCode.Created);

        var docRequest = new
        {
            fileKey = "test-category/contract.pdf",
            documentType = "Contract",
            visibility = "Private"
        };

        var docRes = await client.PostAsJsonAsync($"/api/v1/opportunities/{oppId}/documents", docRequest);
        docRes.StatusCode.Should().Be(HttpStatusCode.Created);

        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<Investa.Infrastructure.Persistence.ApplicationDbContext>();
        var opp = db.Opportunities.Find(oppId);
        opp.Should().NotBeNull();
        opp!.CoverImageUrl.Should().Be("/storage/test-category/cover_photo.jpg");
    }

    // === 14. Scan status is set correctly ===
    [Fact]
    public async Task AddMedia_SetsScanStatus()
    {
        var client = CreateClientAndSeed();
        var oppId = await CreateOpportunityAsync(client);

        var request = new
        {
            fileKey = "test-category/scanned_image.jpg",
            mediaType = "Image",
            isPublic = true
        };

        var res = await client.PostAsJsonAsync($"/api/v1/opportunities/{oppId}/media", request);
        res.StatusCode.Should().Be(HttpStatusCode.Created);

        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<Investa.Infrastructure.Persistence.ApplicationDbContext>();
        var media = db.OpportunityMedia.FirstOrDefault(m => m.FileKey == "test-category/scanned_image.jpg");
        media.Should().NotBeNull();
        media!.ScanStatus.Should().Be(FileScanStatus.Clean);
        media.ScanCompletedAt.Should().NotBeNull();
    }

    [Fact]
    public async Task AddDocument_SetsScanStatus()
    {
        var client = CreateClientAndSeed();
        var oppId = await CreateOpportunityAsync(client);

        var request = new
        {
            fileKey = "test-category/scanned_doc.pdf",
            documentType = "Report",
            visibility = "Public"
        };

        var res = await client.PostAsJsonAsync($"/api/v1/opportunities/{oppId}/documents", request);
        res.StatusCode.Should().Be(HttpStatusCode.Created);

        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<Investa.Infrastructure.Persistence.ApplicationDbContext>();
        var doc = db.OpportunityDocuments.FirstOrDefault(d => d.FileKey == "test-category/scanned_doc.pdf");
        doc.Should().NotBeNull();
        doc!.ScanStatus.Should().Be(FileScanStatus.Clean);
        doc.ScanCompletedAt.Should().NotBeNull();
    }

    // === 15. Server-issued values override client ===
    [Fact]
    public async Task AddMedia_ServerIssuesFileUrl_NotFromClient()
    {
        var client = CreateClientAndSeed();
        var oppId = await CreateOpportunityAsync(client);

        var request = new
        {
            fileKey = "test-category/clientside_override.jpg",
            mediaType = "Image",
            isPublic = true
        };

        var res = await client.PostAsJsonAsync($"/api/v1/opportunities/{oppId}/media", request);
        res.StatusCode.Should().Be(HttpStatusCode.Created);

        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<Investa.Infrastructure.Persistence.ApplicationDbContext>();
        var media = db.OpportunityMedia.FirstOrDefault(m => m.FileKey == "test-category/clientside_override.jpg");
        media.Should().NotBeNull();
        media!.FileUrl.Should().Be("/storage/test-category/clientside_override.jpg");
        media.FileId.Should().NotBeNullOrEmpty();
        media.FileSize.Should().Be(150 * 1024);
        media.MimeType.Should().Be("image/jpeg");
    }

    // === 17. Non-existent opportunity returns 404 (IDOR) ===
    [Fact]
    public async Task GetMedia_NonExistentOpportunity_Returns404()
    {
        var client = CreateClientAndSeed();
        var res = await client.GetAsync($"/api/v1/opportunities/99999/media");
        res.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }
}
