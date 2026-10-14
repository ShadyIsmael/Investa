using System.Reflection;
using FluentAssertions;
using Investa.API.Controllers.Admin;
using Investa.Application.Common;
using Investa.Application.DTOs;
using Investa.Application.Services;
using Investa.Domain.Entities;
using Investa.Domain.Entities.Company;
using Investa.Infrastructure.Persistence;
using Investa.Infrastructure.Repositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Investa.UnitTests;

public sealed class CompanyQuotationServiceTests
{
    [Fact]
    public async Task Create_calculates_decimal_totals_and_preserves_customer_and_catalog_snapshots()
    {
        await using var db = CreateDatabase();
        var customer = Customer("Acme");
        var catalog = Catalog("Implementation", 100m, "USD", "Hour");
        db.CompanyCustomers.Add(customer); db.CompanyCatalogItems.Add(catalog); await db.SaveChangesAsync();
        var service = CreateService(db);

        var quotation = await service.CreateAsync(new CompanyQuotationUpsertRequest
        {
            CustomerId = customer.Id, Currency = "usd", Lines = [new CompanyQuotationLineInput { CatalogItemId = catalog.Id, Quantity = 2m, UnitPrice = null, DiscountType = CompanyQuotationDiscountType.Percentage, DiscountValue = 10m, TaxRate = 5m }]
        });

        quotation.QuotationNumber.Should().Be("QTN-000001");
        quotation.Subtotal.Should().Be(200m);
        quotation.DiscountTotal.Should().Be(20m);
        quotation.TaxTotal.Should().Be(9m);
        quotation.GrandTotal.Should().Be(189m);
        quotation.Lines.Single().UnitPrice.Should().Be(100m);
        quotation.CustomerNameSnapshot.Should().Be("Acme");

        customer.DisplayName = "Acme Renamed"; catalog.Name = "Implementation Renamed"; catalog.BasePrice = 999m; await db.SaveChangesAsync();
        var historical = (await service.GetAsync(quotation.Id))!;
        historical.CustomerNameSnapshot.Should().Be("Acme");
        historical.Lines.Single().ItemName.Should().Be("Implementation");
        historical.Lines.Single().UnitPrice.Should().Be(100m);
    }

    [Fact]
    public async Task Validates_customer_opportunity_contact_catalog_currency_and_custom_lines()
    {
        await using var db = CreateDatabase();
        var customer = Customer("Acme"); var otherCustomer = Customer("Other");
        var contact = new CompanyCustomerContact { Id = Guid.NewGuid(), CustomerId = customer.Id, Name = "Buyer", IsActive = true };
        var opportunity = new CompanySalesOpportunity { Id = Guid.NewGuid(), CodeSequence = 1, OpportunityCode = "SAL-000001", Title = "Expansion", CustomerId = customer.Id, Status = CompanySalesOpportunityStatus.Open, Stage = CompanySalesOpportunityStage.Qualified, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow };
        var catalog = Catalog("Support", 20m, "USD", "Month");
        db.CompanyCustomers.AddRange(customer, otherCustomer); db.CompanyCustomerContacts.Add(contact); db.CompanySalesOpportunities.Add(opportunity); db.CompanyCatalogItems.Add(catalog); await db.SaveChangesAsync();
        var service = CreateService(db);

        await FluentActions.Invoking(() => service.CreateAsync(new CompanyQuotationUpsertRequest { CustomerId = otherCustomer.Id, SalesOpportunityId = opportunity.Id, Currency = "USD", Lines = [CustomLine()] })).Should().ThrowAsync<BusinessValidationException>().Where(error => error.Code == "QUOTATION_OPPORTUNITY_CUSTOMER_MISMATCH");
        await FluentActions.Invoking(() => service.CreateAsync(new CompanyQuotationUpsertRequest { CustomerId = customer.Id, ContactId = Guid.NewGuid(), Currency = "USD", Lines = [CustomLine()] })).Should().ThrowAsync<BusinessValidationException>().Where(error => error.Code == "QUOTATION_CONTACT_INVALID");
        await FluentActions.Invoking(() => service.CreateAsync(new CompanyQuotationUpsertRequest { CustomerId = customer.Id, Currency = "ZZZ", Lines = [new CompanyQuotationLineInput { CatalogItemId = catalog.Id, Quantity = 1, UnitPrice = null }] })).Should().ThrowAsync<BusinessValidationException>().Where(error => error.Code == "QUOTATION_CURRENCY_INVALID");
        await FluentActions.Invoking(() => service.CreateAsync(new CompanyQuotationUpsertRequest { CustomerId = customer.Id, Currency = "USD", Lines = [new CompanyQuotationLineInput { ItemName = "Custom", Description = "Custom work", Quantity = 1, Unit = "Hour", UnitPrice = 50, DiscountType = CompanyQuotationDiscountType.FixedAmount, DiscountValue = 60 }] })).Should().ThrowAsync<BusinessValidationException>().Where(error => error.Code == "QUOTATION_DISCOUNT_INVALID");
        await FluentActions.Invoking(() => service.CreateAsync(new CompanyQuotationUpsertRequest { CustomerId = customer.Id, Currency = "USD", Lines = [new CompanyQuotationLineInput { ItemName = "Huge", Description = "Huge amount", Quantity = 2, Unit = "Hour", UnitPrice = decimal.MaxValue }] })).Should().ThrowAsync<BusinessValidationException>().Where(error => error.Code == "QUOTATION_AMOUNT_INVALID");
        (await service.CreateAsync(new CompanyQuotationUpsertRequest { CustomerId = customer.Id, ContactId = contact.Id, SalesOpportunityId = opportunity.Id, Currency = "USD", Lines = [CustomLine()] })).Lines.Single().ItemCode.Should().BeNull();
    }

    [Fact]
    public async Task Lifecycle_is_explicit_and_sent_accepted_or_rejected_quotes_are_immutable()
    {
        await using var db = CreateDatabase();
        var customer = Customer("Lifecycle"); db.CompanyCustomers.Add(customer); await db.SaveChangesAsync();
        var service = CreateService(db);
        var accepted = await service.CreateAsync(new CompanyQuotationUpsertRequest { CustomerId = customer.Id, Currency = "USD", Lines = [CustomLine()] });
        await FluentActions.Invoking(() => service.MarkAcceptedAsync(accepted.Id)).Should().ThrowAsync<BusinessValidationException>().Where(error => error.Code == "QUOTATION_TRANSITION_INVALID");
        accepted = (await service.MarkSentAsync(accepted.Id))!;
        accepted.Status.Should().Be(CompanyQuotationStatus.Sent); accepted.SentAt.Should().NotBeNull();
        accepted = (await service.MarkAcceptedAsync(accepted.Id))!;
        accepted.Status.Should().Be(CompanyQuotationStatus.Accepted); accepted.AcceptedAt.Should().NotBeNull();
        await FluentActions.Invoking(() => service.UpdateAsync(accepted.Id, new CompanyQuotationUpsertRequest { CustomerId = customer.Id, Currency = "USD", Lines = [CustomLine()] })).Should().ThrowAsync<BusinessValidationException>().Where(error => error.Code == "QUOTATION_IMMUTABLE");

        var rejected = await service.CreateAsync(new CompanyQuotationUpsertRequest { CustomerId = customer.Id, Currency = "USD", Lines = [CustomLine()] });
        await service.MarkSentAsync(rejected.Id);
        await FluentActions.Invoking(() => service.MarkRejectedAsync(rejected.Id, "")).Should().ThrowAsync<BusinessValidationException>().Where(error => error.Code == "QUOTATION_REJECTION_REASON_REQUIRED");
        var rejectedResult = (await service.MarkRejectedAsync(rejected.Id, "Budget deferred"))!;
        rejectedResult.Status.Should().Be(CompanyQuotationStatus.Rejected); rejectedResult.RejectionReason.Should().Be("Budget deferred"); rejectedResult.RejectedAt.Should().NotBeNull();
    }

    [Fact]
    public async Task List_supports_search_filter_sorting_and_page_size_cap()
    {
        await using var db = CreateDatabase();
        var customer = Customer("Search Customer"); db.CompanyCustomers.Add(customer); await db.SaveChangesAsync();
        var service = CreateService(db);
        await service.CreateAsync(new CompanyQuotationUpsertRequest { CustomerId = customer.Id, Currency = "USD", Lines = [CustomLine("Alpha")] });
        var beta = await service.CreateAsync(new CompanyQuotationUpsertRequest { CustomerId = customer.Id, Currency = "USD", Lines = [CustomLine("Beta")] });
        await service.MarkSentAsync(beta.Id);
        var page = await service.ListAsync(new CompanyQuotationListQuery { Search = "QTN-000002", Status = CompanyQuotationStatus.Sent, PageSize = 100, SortBy = "grandTotal", SortDirection = "asc" });
        page.Total.Should().Be(1); page.PageSize.Should().Be(100); page.Items.Single().QuotationNumber.Should().Be("QTN-000002");
    }

    [Fact]
    public void Controller_uses_canonical_company_quotation_permission_policies()
    {
        var controller = typeof(CompanyQuotationsController);
        controller.GetCustomAttribute<AuthorizeAttribute>()!.Policy.Should().Be("RequirePermission:Company.Sales.Quotations.View");
        controller.GetMethod(nameof(CompanyQuotationsController.Create))!.GetCustomAttribute<AuthorizeAttribute>()!.Policy.Should().Be("RequirePermission:Company.Sales.Quotations.Create");
        controller.GetMethod(nameof(CompanyQuotationsController.Update))!.GetCustomAttribute<AuthorizeAttribute>()!.Policy.Should().Be("RequirePermission:Company.Sales.Quotations.Edit");
        controller.GetMethod(nameof(CompanyQuotationsController.Accept))!.GetCustomAttribute<AuthorizeAttribute>()!.Policy.Should().Be("RequirePermission:Company.Sales.Quotations.Manage");
        controller.GetCustomAttributes<AuthorizeAttribute>().Should().NotContain(attribute => !string.IsNullOrWhiteSpace(attribute.Roles));
    }

    private static CompanyQuotationService CreateService(ApplicationDbContext db) => new(new UnitOfWork(db));
    private static ApplicationDbContext CreateDatabase() { var db = new ApplicationDbContext(new DbContextOptionsBuilder<ApplicationDbContext>().UseInMemoryDatabase(Guid.NewGuid().ToString()).Options); db.Database.EnsureCreated(); return db; }
    private static Currency Currency(string code) => new() { ISOCode = code, EnglishName = code, ArabicName = code, Symbol = code, IsActive = true };
    private static CompanyCustomer Customer(string name) => new() { Id = Guid.NewGuid(), CodeSequence = Random.Shared.Next(10000, 90000), CustomerCode = $"CUS-{Random.Shared.Next(100000, 999999)}", LegalName = name, DisplayName = name, Status = CompanyCustomerStatus.Active, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow };
    private static CompanyCatalogItem Catalog(string name, decimal price, string currency, string unit) => new() { Id = Guid.NewGuid(), CodeSequence = Random.Shared.Next(10000, 90000), Code = $"CAT-{Random.Shared.Next(100000, 999999)}", Name = name, Type = CompanyCatalogItemType.Service, Status = CompanyCatalogItemStatus.Active, DefaultUnit = unit, BasePrice = price, Currency = currency, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow };
    private static CompanyQuotationLineInput CustomLine(string name = "Custom work") => new() { ItemName = name, Description = name, Quantity = 1, Unit = "Hour", UnitPrice = 50, DiscountType = CompanyQuotationDiscountType.None, TaxRate = 0 };
}
