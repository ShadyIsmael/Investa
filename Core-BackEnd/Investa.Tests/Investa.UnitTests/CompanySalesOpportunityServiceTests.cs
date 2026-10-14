using System.Reflection;
using FluentAssertions;
using Investa.API.Controllers.Admin;
using Investa.Application.Common;
using Investa.Application.DTOs;
using Investa.Application.Services;
using Investa.Domain.Entities.Company;
using Investa.Domain.Entities.Security;
using Investa.Infrastructure.Persistence;
using Investa.Infrastructure.Repositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Investa.UnitTests;

public sealed class CompanySalesOpportunityServiceTests
{
    [Fact]
    public async Task Create_generates_immutable_code_and_links_customer_contact_and_multiple_catalog_items()
    {
        await using var db = CreateDatabase();
        var customer = Customer("Acme");
        var contact = new CompanyCustomerContact { Id = Guid.NewGuid(), CustomerId = customer.Id, Name = "Sales Contact", IsActive = true };
        var product = Catalog("Product One", CompanyCatalogItemType.Product);
        var serviceItem = Catalog("Service One", CompanyCatalogItemType.Service);
        db.CompanyCustomers.Add(customer); db.CompanyCustomerContacts.Add(contact); db.CompanyCatalogItems.AddRange(product, serviceItem); await db.SaveChangesAsync();
        var actor = Guid.NewGuid();

        var created = await CreateService(db).CreateAsync(new CompanySalesOpportunityUpsertRequest { Title = "Expansion", CustomerId = customer.Id, PrimaryContactId = contact.Id, CatalogItemIds = [product.Id, serviceItem.Id], ExpectedValue = 12500, Currency = null, ExpectedCloseDate = new DateOnly(2026, 12, 1) }, actorId: actor);

        created.OpportunityCode.Should().Be("SAL-000001");
        created.InterestedItems.Should().HaveCount(2);
        created.CustomerDisplayName.Should().Be("Acme");
        db.AuditLogs.Should().ContainSingle(log => log.EntityType == nameof(CompanySalesOpportunity) && log.Action == "Created" && log.UserId == actor);
        var updated = await CreateService(db).UpdateAsync(created.Id, new CompanySalesOpportunityUpsertRequest { Title = "Expansion Updated", CustomerId = customer.Id, CatalogItemIds = [product.Id] });
        updated!.OpportunityCode.Should().Be(created.OpportunityCode);
    }

    [Fact]
    public async Task New_opportunity_requires_active_customer_contact_and_catalog_relationships()
    {
        await using var db = CreateDatabase();
        var inactiveCustomer = Customer("Inactive", CompanyCustomerStatus.Inactive);
        var activeCustomer = Customer("Active");
        var inactiveCatalog = Catalog("Retired", CompanyCatalogItemType.Product, CompanyCatalogItemStatus.Inactive);
        db.CompanyCustomers.AddRange(inactiveCustomer, activeCustomer); db.CompanyCatalogItems.Add(inactiveCatalog); await db.SaveChangesAsync();
        var service = CreateService(db);

        await FluentActions.Invoking(() => service.CreateAsync(new CompanySalesOpportunityUpsertRequest { Title = "Blocked", CustomerId = inactiveCustomer.Id })).Should().ThrowAsync<BusinessValidationException>().Where(error => error.Code == "SALES_OPPORTUNITY_CUSTOMER_INACTIVE");
        await FluentActions.Invoking(() => service.CreateAsync(new CompanySalesOpportunityUpsertRequest { Title = "Blocked", CustomerId = activeCustomer.Id, CatalogItemIds = [inactiveCatalog.Id] })).Should().ThrowAsync<BusinessValidationException>().Where(error => error.Code == "SALES_OPPORTUNITY_ITEM_INACTIVE");
        await FluentActions.Invoking(() => service.CreateAsync(new CompanySalesOpportunityUpsertRequest { Title = "Blocked", CustomerId = activeCustomer.Id, PrimaryContactId = Guid.NewGuid() })).Should().ThrowAsync<BusinessValidationException>().Where(error => error.Code == "SALES_OPPORTUNITY_CONTACT_INVALID");
    }

    [Fact]
    public async Task List_supports_search_filters_sorting_and_page_size_cap()
    {
        await using var db = CreateDatabase();
        var customer = Customer("Acme Search");
        db.CompanyCustomers.Add(customer); await db.SaveChangesAsync();
        var service = CreateService(db);
        await service.CreateAsync(new CompanySalesOpportunityUpsertRequest { Title = "Alpha", CustomerId = customer.Id, Stage = CompanySalesOpportunityStage.New });
        await service.CreateAsync(new CompanySalesOpportunityUpsertRequest { Title = "Beta", CustomerId = customer.Id, Stage = CompanySalesOpportunityStage.Qualified });

        var page = await service.ListAsync(new CompanySalesOpportunityListQuery { Search = "beta", Stage = CompanySalesOpportunityStage.Qualified, PageSize = 100, SortBy = "title", SortDirection = "asc" });
        page.Total.Should().Be(1);
        page.PageSize.Should().Be(100);
        page.Items.Single().Title.Should().Be("Beta");
    }

    [Fact]
    public async Task Won_and_lost_are_explicit_terminal_actions_and_closed_records_cannot_reopen()
    {
        await using var db = CreateDatabase();
        var customer = Customer("Lifecycle"); db.CompanyCustomers.Add(customer); await db.SaveChangesAsync();
        var service = CreateService(db);
        var won = await service.CreateAsync(new CompanySalesOpportunityUpsertRequest { Title = "Won", CustomerId = customer.Id });
        var wonResult = await service.MarkWonAsync(won.Id);
        wonResult!.Status.Should().Be(CompanySalesOpportunityStatus.Won);
        wonResult.WonAt.Should().NotBeNull();
        (await service.GetAsync(won.Id))!.Status.Should().Be(CompanySalesOpportunityStatus.Won);
        await FluentActions.Invoking(() => service.UpdateAsync(won.Id, new CompanySalesOpportunityUpsertRequest { Title = "Reopen", CustomerId = customer.Id })).Should().ThrowAsync<BusinessValidationException>().Where(error => error.Code == "SALES_OPPORTUNITY_CLOSED");

        var lost = await service.CreateAsync(new CompanySalesOpportunityUpsertRequest { Title = "Lost", CustomerId = customer.Id });
        await FluentActions.Invoking(() => service.MarkLostAsync(lost.Id, "Budget paused")).Should().NotThrowAsync();
        (await service.GetAsync(lost.Id))!.Status.Should().Be(CompanySalesOpportunityStatus.Lost);
        await FluentActions.Invoking(() => service.MarkLostAsync(lost.Id, "Again")).Should().ThrowAsync<BusinessValidationException>().Where(error => error.Code == "SALES_OPPORTUNITY_CLOSED");
        await FluentActions.Invoking(() => service.MarkLostAsync(Guid.NewGuid(), "")).Should().ThrowAsync<BusinessValidationException>().Where(error => error.Code == "SALES_OPPORTUNITY_LOST_REASON_REQUIRED");
    }

    [Fact]
    public void Controller_uses_canonical_company_sales_permission_policies()
    {
        var controller = typeof(CompanySalesOpportunitiesController);
        controller.GetCustomAttribute<AuthorizeAttribute>()!.Policy.Should().Be("RequirePermission:Company.Sales.Opportunities.View");
        controller.GetMethod(nameof(CompanySalesOpportunitiesController.Create))!.GetCustomAttribute<AuthorizeAttribute>()!.Policy.Should().Be("RequirePermission:Company.Sales.Opportunities.Create");
        controller.GetMethod(nameof(CompanySalesOpportunitiesController.Update))!.GetCustomAttribute<AuthorizeAttribute>()!.Policy.Should().Be("RequirePermission:Company.Sales.Opportunities.Edit");
        controller.GetMethod(nameof(CompanySalesOpportunitiesController.MarkWon))!.GetCustomAttribute<AuthorizeAttribute>()!.Policy.Should().Be("RequirePermission:Company.Sales.Opportunities.Manage");
        controller.GetCustomAttributes<AuthorizeAttribute>().Should().NotContain(attribute => !string.IsNullOrWhiteSpace(attribute.Roles));
    }

    private static CompanySalesOpportunityService CreateService(ApplicationDbContext db) => new(new UnitOfWork(db));
    private static ApplicationDbContext CreateDatabase() { var db = new ApplicationDbContext(new DbContextOptionsBuilder<ApplicationDbContext>().UseInMemoryDatabase(Guid.NewGuid().ToString()).Options); db.Database.EnsureCreated(); return db; }
    private static CompanyCustomer Customer(string name, CompanyCustomerStatus status = CompanyCustomerStatus.Active) => new() { Id = Guid.NewGuid(), CodeSequence = Random.Shared.Next(10000, 90000), CustomerCode = $"CUS-{Random.Shared.Next(100000, 999999)}", LegalName = name, DisplayName = name, Status = status, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow };
    private static CompanyCatalogItem Catalog(string name, CompanyCatalogItemType type, CompanyCatalogItemStatus status = CompanyCatalogItemStatus.Active) => new() { Id = Guid.NewGuid(), CodeSequence = Random.Shared.Next(10000, 90000), Code = $"CAT-{Random.Shared.Next(100000, 999999)}", Name = name, Type = type, Status = status, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow };
}
