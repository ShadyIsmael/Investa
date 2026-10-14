using System.Reflection;
using FluentAssertions;
using Investa.API.Controllers.Admin;
using Investa.Application.Common;
using Investa.Application.DTOs;
using Investa.Application.Services;
using Investa.Domain.Entities;
using Investa.Domain.Entities.Company;
using Investa.Domain.Entities.Security;
using Investa.Infrastructure.Persistence;
using Investa.Infrastructure.Repositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Investa.UnitTests;

public sealed class CompanyCatalogServiceTests
{
    [Fact]
    public async Task Create_supports_product_and_service_with_immutable_codes_and_audit()
    {
        await using var db = CreateDatabase();
        var service = CreateService(db);
        var actor = Guid.NewGuid();

        var product = await service.CreateAsync(Request("FOPX Enterprise", CompanyCatalogItemType.Product, basePrice: 100, currency: "EGP", supportsWorkspace: true, workspaceKey: "fopx"), actorId: actor);
        var serviceItem = await service.CreateAsync(Request("Annual Support", CompanyCatalogItemType.Service));

        product.Code.Should().Be("CAT-000001");
        serviceItem.Code.Should().Be("CAT-000002");
        product.SupportsWorkspace.Should().BeTrue();
        product.WorkspaceKey.Should().Be("fopx");
        db.AuditLogs.Should().ContainSingle(log => log.EntityType == nameof(CompanyCatalogItem) && log.Action == "Created" && log.UserId == actor);

        var updated = await service.UpdateAsync(product.Id, Request("FOPX Enterprise Updated", CompanyCatalogItemType.Product));
        updated!.Code.Should().Be(product.Code);
    }

    [Fact]
    public async Task List_supports_paging_search_type_status_capabilities_and_safe_sorting()
    {
        await using var db = CreateDatabase();
        var service = CreateService(db);
        await service.CreateAsync(Request("Alpha Product", CompanyCatalogItemType.Product, supportsLicense: true));
        await service.CreateAsync(Request("Beta Service", CompanyCatalogItemType.Service));
        var inactive = await service.CreateAsync(Request("Gamma Workspace", CompanyCatalogItemType.Product, supportsWorkspace: true, workspaceKey: "fopx"));
        await service.SetStatusAsync(inactive.Id, CompanyCatalogItemStatus.Inactive);

        var page = await service.ListAsync(new CompanyCatalogListQuery { Page = 2, PageSize = 1, SortBy = "name", SortDirection = "asc" });
        page.Total.Should().Be(3);
        page.Items.Should().ContainSingle(item => item.Name == "Beta Service");

        var filtered = await service.ListAsync(new CompanyCatalogListQuery { Search = "workspace", Status = CompanyCatalogItemStatus.Inactive, SupportsWorkspace = true, PageSize = 100, SortBy = "unsupported" });
        filtered.Total.Should().Be(1);
        filtered.Items.Single().Code.Should().Be(inactive.Code);
    }

    [Fact]
    public async Task Validation_requires_price_currency_and_supported_workspace_state()
    {
        await using var db = CreateDatabase();
        var service = CreateService(db);

        await FluentActions.Invoking(() => service.CreateAsync(Request("Priced", CompanyCatalogItemType.Product, basePrice: 10)))
            .Should().ThrowAsync<BusinessValidationException>().Where(error => error.Code == "CATALOG_CURRENCY_REQUIRED");
        await FluentActions.Invoking(() => service.CreateAsync(Request("Negative", CompanyCatalogItemType.Product, basePrice: -1, currency: "EGP")))
            .Should().ThrowAsync<BusinessValidationException>().Where(error => error.Code == "CATALOG_PRICE_INVALID");
        await FluentActions.Invoking(() => service.CreateAsync(Request("Fake Workspace", CompanyCatalogItemType.Product, supportsWorkspace: true, workspaceKey: "nexus")))
            .Should().ThrowAsync<BusinessValidationException>().Where(error => error.Code == "CATALOG_WORKSPACE_INVALID");
        await FluentActions.Invoking(() => service.CreateAsync(Request("Hidden Workspace", CompanyCatalogItemType.Product, workspaceKey: "fopx")))
            .Should().ThrowAsync<BusinessValidationException>().Where(error => error.Code == "CATALOG_WORKSPACE_NOT_SUPPORTED");
    }

    [Fact]
    public async Task Status_preserves_item_and_missing_items_return_null()
    {
        await using var db = CreateDatabase();
        var service = CreateService(db);
        var item = await service.CreateAsync(Request("Support", CompanyCatalogItemType.Service));

        var inactive = await service.SetStatusAsync(item.Id, CompanyCatalogItemStatus.Inactive);
        inactive!.Status.Should().Be(CompanyCatalogItemStatus.Inactive);
        (await service.GetAsync(item.Id)).Should().NotBeNull();
        (await service.GetAsync(Guid.NewGuid())).Should().BeNull();
        (await service.UpdateAsync(Guid.NewGuid(), Request("Missing", CompanyCatalogItemType.Product))).Should().BeNull();
    }

    [Fact]
    public void Controller_uses_canonical_permission_policies_without_role_shortcuts()
    {
        var controller = typeof(CompanyCatalogController);
        controller.GetCustomAttribute<AuthorizeAttribute>()!.Policy.Should().Be("RequirePermission:Company.Products.View");
        controller.GetCustomAttributes<AuthorizeAttribute>().Should().NotContain(attribute => !string.IsNullOrWhiteSpace(attribute.Roles));
        controller.GetMethod(nameof(CompanyCatalogController.Create))!.GetCustomAttribute<AuthorizeAttribute>()!.Policy.Should().Be("RequirePermission:Company.Products.Create");
        controller.GetMethod(nameof(CompanyCatalogController.Update))!.GetCustomAttribute<AuthorizeAttribute>()!.Policy.Should().Be("RequirePermission:Company.Products.Edit");
        controller.GetMethod(nameof(CompanyCatalogController.SetStatus))!.GetCustomAttribute<AuthorizeAttribute>()!.Policy.Should().Be("RequirePermission:Company.Products.Manage");
    }

    private static CompanyCatalogService CreateService(ApplicationDbContext db) => new(new UnitOfWork(db));

    private static ApplicationDbContext CreateDatabase()
    {
        var db = new ApplicationDbContext(new DbContextOptionsBuilder<ApplicationDbContext>().UseInMemoryDatabase(Guid.NewGuid().ToString()).Options);
        db.Database.EnsureCreated();
        return db;
    }

    private static CompanyCatalogItemUpsertRequest Request(string name, CompanyCatalogItemType type, decimal? basePrice = null, string? currency = null, bool supportsLicense = false, bool supportsWorkspace = false, string? workspaceKey = null) => new()
    {
        Name = name, Type = type, Description = $"{name} description", DefaultUnit = type == CompanyCatalogItemType.Service ? "Month" : "Seat", BasePrice = basePrice, Currency = currency,
        SupportsLicense = supportsLicense, SupportsWorkspace = supportsWorkspace, WorkspaceKey = workspaceKey
    };
}
