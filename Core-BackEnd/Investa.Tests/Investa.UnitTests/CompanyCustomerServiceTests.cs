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

public sealed class CompanyCustomerServiceTests
{
    [Fact]
    public async Task Create_generates_immutable_customer_code_and_update_preserves_it()
    {
        await using var db = CreateDatabase();
        var service = CreateService(db);
        var actorId = Guid.NewGuid();
        var created = await service.CreateAsync(Request("Acme Trading", "acme"), actorId: actorId);

        created.CustomerCode.Should().Be("CUS-000001");
        db.AuditLogs.Should().ContainSingle(log => log.EntityType == nameof(CompanyCustomer) && log.Action == "Created" && log.UserId == actorId);
        var updated = await service.UpdateAsync(created.Id, Request("Acme Trading LLC", "Acme Trading"));

        updated!.CustomerCode.Should().Be(created.CustomerCode);
        updated.DisplayName.Should().Be("Acme Trading");
    }

    [Fact]
    public async Task Create_rejects_duplicate_tax_id_and_invalid_profile()
    {
        await using var db = CreateDatabase();
        var service = CreateService(db);
        await service.CreateAsync(Request("First Company", "First", taxId: "TX-001"));

        var duplicate = () => service.CreateAsync(Request("Second Company", "Second", taxId: "TX-001"));
        await duplicate.Should().ThrowAsync<BusinessValidationException>().Where(error => error.Code == "CUSTOMER_TAX_ID_DUPLICATE");

        var invalid = () => service.CreateAsync(Request("", ""));
        await invalid.Should().ThrowAsync<BusinessValidationException>().Where(error => error.Code == "CUSTOMER_NAME_REQUIRED");
    }

    [Fact]
    public async Task List_supports_pagination_search_filters_and_whitelisted_sorting()
    {
        await using var db = CreateDatabase();
        var service = CreateService(db);
        await service.CreateAsync(Request("Alpha Organization", "Alpha", type: CompanyCustomerType.Organization));
        await service.CreateAsync(Request("Beta Individual", "Beta", type: CompanyCustomerType.Individual));
        await service.CreateAsync(Request("Gamma Organization", "Gamma", type: CompanyCustomerType.Organization));

        var page = await service.ListAsync(new CompanyCustomerListQuery { Page = 2, PageSize = 1, SortBy = "name", SortDirection = "asc" });
        page.Total.Should().Be(3);
        page.Items.Should().ContainSingle(item => item.DisplayName == "Beta");

        var filtered = await service.ListAsync(new CompanyCustomerListQuery { Search = "gamma", Type = CompanyCustomerType.Organization, Status = CompanyCustomerStatus.Active, PageSize = 100, SortBy = "unsupported", SortDirection = "asc" });
        filtered.Total.Should().Be(1);
        filtered.Items.Single().DisplayName.Should().Be("Gamma");
    }

    [Fact]
    public async Task Contacts_keep_one_active_primary_and_support_status_changes()
    {
        await using var db = CreateDatabase();
        var service = CreateService(db);
        var customer = await service.CreateAsync(Request("Acme", "Acme"));
        var first = await service.AddContactAsync(customer.Id, Contact("One", isPrimary: true));
        var second = await service.AddContactAsync(customer.Id, Contact("Two", isPrimary: true));

        (await service.GetAsync(customer.Id))!.Contacts.Count(x => x.IsActive && x.IsPrimary).Should().Be(1);
        (await service.GetAsync(customer.Id))!.Contacts.Single(x => x.Id == second!.Id).IsPrimary.Should().BeTrue();

        await service.SetContactStatusAsync(customer.Id, second!.Id, false);
        var detail = await service.GetAsync(customer.Id);
        detail!.Contacts.Single(x => x.Id == first!.Id).IsPrimary.Should().BeTrue();
        detail.Contacts.Should().NotContain(x => !x.IsActive && x.IsPrimary);
    }

    [Fact]
    public async Task Status_is_deactivated_without_deleting_the_customer()
    {
        await using var db = CreateDatabase();
        var service = CreateService(db);
        var customer = await service.CreateAsync(Request("Acme", "Acme"));

        var updated = await service.SetStatusAsync(customer.Id, CompanyCustomerStatus.Inactive);

        updated!.Status.Should().Be(CompanyCustomerStatus.Inactive);
        (await service.GetAsync(customer.Id)).Should().NotBeNull();
    }

    [Fact]
    public void Controller_uses_canonical_permission_policies_instead_of_role_shortcuts()
    {
        var controller = typeof(CompanyCustomersController);
        controller.GetCustomAttribute<AuthorizeAttribute>()!.Policy.Should().Be("RequirePermission:Company.Customers.View");
        controller.GetCustomAttributes<AuthorizeAttribute>().Should().NotContain(attribute => !string.IsNullOrWhiteSpace(attribute.Roles));
        controller.GetMethod(nameof(CompanyCustomersController.Create))!.GetCustomAttribute<AuthorizeAttribute>()!.Policy.Should().Be("RequirePermission:Company.Customers.Create");
        controller.GetMethod(nameof(CompanyCustomersController.Update))!.GetCustomAttribute<AuthorizeAttribute>()!.Policy.Should().Be("RequirePermission:Company.Customers.Edit");
        controller.GetMethod(nameof(CompanyCustomersController.SetStatus))!.GetCustomAttribute<AuthorizeAttribute>()!.Policy.Should().Be("RequirePermission:Company.Customers.Manage");
    }

    private static CompanyCustomerService CreateService(ApplicationDbContext db) => new(new UnitOfWork(db));

    private static ApplicationDbContext CreateDatabase() => new(new DbContextOptionsBuilder<ApplicationDbContext>().UseInMemoryDatabase(Guid.NewGuid().ToString()).Options);

    private static CompanyCustomerUpsertRequest Request(string legalName, string displayName, CompanyCustomerType type = CompanyCustomerType.Organization, string? taxId = null) => new()
    {
        Type = type, LegalName = legalName, DisplayName = displayName, TaxId = taxId
    };

    private static CompanyCustomerContactRequest Contact(string name, bool isPrimary) => new() { Name = name, IsPrimary = isPrimary, IsActive = true };
}
