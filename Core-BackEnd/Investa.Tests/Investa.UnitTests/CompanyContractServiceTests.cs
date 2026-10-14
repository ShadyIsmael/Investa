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

public sealed class CompanyContractServiceTests
{
    [Fact]
    public async Task Accepted_quotation_converts_once_and_preserves_commercial_and_capability_snapshots()
    {
        await using var db = CreateDatabase();
        var customer = Customer("Acme");
        var catalog = Catalog("Implementation", 100m, "USD", "Hour", supportsLicense: true, supportsSubscription: true);
        db.CompanyCustomers.Add(customer); db.CompanyCatalogItems.Add(catalog); await db.SaveChangesAsync();
        var quotationService = new CompanyQuotationService(new UnitOfWork(db));
        var quotation = await quotationService.CreateAsync(new CompanyQuotationUpsertRequest
        {
            CustomerId = customer.Id, Currency = "USD", PaymentTerms = "Net 30", CommercialTerms = "Fixed scope", Notes = "Approved scope",
            Lines = [
                new CompanyQuotationLineInput { CatalogItemId = catalog.Id, Quantity = 2m, Unit = "Hour", UnitPrice = null, DiscountType = CompanyQuotationDiscountType.Percentage, DiscountValue = 10m, TaxRate = 5m },
                new CompanyQuotationLineInput { ItemName = "Custom onboarding", Description = "Custom onboarding", Quantity = 1m, Unit = "Project", UnitPrice = 50m, DiscountType = CompanyQuotationDiscountType.None, TaxRate = 0m },
            ]
        });
        await quotationService.MarkSentAsync(quotation.Id);
        await quotationService.MarkAcceptedAsync(quotation.Id);

        var service = CreateService(db);
        var contract = await service.CreateFromQuotationAsync(new CompanyContractFromQuotationRequest { SourceQuotationId = quotation.Id, EffectiveDate = new DateOnly(2026, 10, 1), StartDate = new DateOnly(2026, 10, 1), EndDate = new DateOnly(2027, 9, 30) });

        contract.ContractNumber.Should().Be("CTR-000001");
        contract.Status.Should().Be(CompanyContractStatus.Draft);
        contract.SourceQuotationId.Should().Be(quotation.Id);
        contract.CustomerNameSnapshot.Should().Be("Acme");
        contract.PaymentTerms.Should().Be("Net 30");
        contract.Lines.Should().HaveCount(2);
        contract.Lines[0].SupportsLicense.Should().BeTrue();
        contract.Lines[0].SupportsSubscription.Should().BeTrue();
        contract.Lines[1].CatalogItemId.Should().BeNull();
        contract.Lines[1].SupportsLicense.Should().BeFalse();
        contract.Lines[1].SupportsSubscription.Should().BeFalse();
        contract.GrandTotal.Should().Be(239m);

        customer.DisplayName = "Acme Renamed"; catalog.Name = "Implementation Renamed"; catalog.BasePrice = 999m; catalog.SupportsLicense = false; await db.SaveChangesAsync();
        var historical = (await service.GetAsync(contract.Id))!;
        historical.CustomerNameSnapshot.Should().Be("Acme");
        historical.Lines[0].ItemName.Should().Be("Implementation");
        historical.Lines[0].UnitPrice.Should().Be(100m);
        historical.Lines[0].SupportsLicense.Should().BeTrue();
        (await service.CreateFromQuotationAsync(new CompanyContractFromQuotationRequest { SourceQuotationId = quotation.Id })).Id.Should().Be(contract.Id);
        db.CompanyContracts.Count(x => x.SourceQuotationId == quotation.Id).Should().Be(1);
        db.AuditLogs.Any(x => x.EntityType == nameof(CompanyContract) && x.EntityId == contract.Id.ToString() && x.Action == "CreatedFromQuotation").Should().BeTrue();
    }

    [Fact]
    public async Task Rejects_non_accepted_quotes_invalid_dates_and_inconsistent_source_totals_without_creating_contract()
    {
        await using var db = CreateDatabase();
        var customer = Customer("Acme"); db.CompanyCustomers.Add(customer); await db.SaveChangesAsync();
        var quotationService = new CompanyQuotationService(new UnitOfWork(db));
        var draft = await quotationService.CreateAsync(new CompanyQuotationUpsertRequest { CustomerId = customer.Id, Currency = "USD", Lines = [CustomLine()] });
        var service = CreateService(db);
        await FluentActions.Invoking(() => service.CreateFromQuotationAsync(new CompanyContractFromQuotationRequest { SourceQuotationId = draft.Id })).Should().ThrowAsync<BusinessValidationException>().Where(error => error.Code == "CONTRACT_SOURCE_QUOTATION_INVALID");
        db.CompanyContracts.Should().BeEmpty();

        await quotationService.MarkSentAsync(draft.Id); await quotationService.MarkAcceptedAsync(draft.Id);
        await FluentActions.Invoking(() => service.CreateFromQuotationAsync(new CompanyContractFromQuotationRequest { SourceQuotationId = draft.Id, StartDate = new DateOnly(2026, 10, 2), EndDate = new DateOnly(2026, 10, 1) })).Should().ThrowAsync<BusinessValidationException>().Where(error => error.Code == "CONTRACT_DATES_INVALID");
        db.CompanyContracts.Should().BeEmpty();

        var stored = db.CompanyQuotations.Include(x => x.Lines).Single(x => x.Id == draft.Id);
        stored.Lines.Single().LineTotal = 999m; await db.SaveChangesAsync();
        await FluentActions.Invoking(() => service.CreateFromQuotationAsync(new CompanyContractFromQuotationRequest { SourceQuotationId = draft.Id })).Should().ThrowAsync<BusinessValidationException>().Where(error => error.Code == "CONTRACT_SOURCE_QUOTATION_INVALID");
        db.CompanyContracts.Should().BeEmpty();
    }

    [Fact]
    public async Task Lifecycle_allows_draft_active_complete_or_terminate_and_rejects_reopen()
    {
        await using var db = CreateDatabase();
        var customer = Customer("Lifecycle"); db.CompanyCustomers.Add(customer); await db.SaveChangesAsync();
        var quotationService = new CompanyQuotationService(new UnitOfWork(db));
        var quotation = await quotationService.CreateAsync(new CompanyQuotationUpsertRequest { CustomerId = customer.Id, Currency = "USD", Lines = [CustomLine()] });
        await quotationService.MarkSentAsync(quotation.Id); await quotationService.MarkAcceptedAsync(quotation.Id);
        var service = CreateService(db);
        var contract = await service.CreateFromQuotationAsync(new CompanyContractFromQuotationRequest { SourceQuotationId = quotation.Id, StartDate = new DateOnly(2026, 10, 1) });
        await FluentActions.Invoking(() => service.TerminateAsync(contract.Id, "Missing activation")).Should().ThrowAsync<BusinessValidationException>().Where(error => error.Code == "CONTRACT_TRANSITION_INVALID");
        contract = (await service.ActivateAsync(contract.Id))!;
        contract.Status.Should().Be(CompanyContractStatus.Active); contract.ActivatedAt.Should().NotBeNull();
        contract = (await service.CompleteAsync(contract.Id))!;
        contract.Status.Should().Be(CompanyContractStatus.Completed); contract.CompletedAt.Should().NotBeNull();
        await FluentActions.Invoking(() => service.ActivateAsync(contract.Id)).Should().ThrowAsync<BusinessValidationException>().Where(error => error.Code == "CONTRACT_IMMUTABLE");

        var second = await quotationService.CreateAsync(new CompanyQuotationUpsertRequest { CustomerId = customer.Id, Currency = "USD", Lines = [CustomLine("Termination")] });
        await quotationService.MarkSentAsync(second.Id); await quotationService.MarkAcceptedAsync(second.Id);
        var terminating = await service.CreateFromQuotationAsync(new CompanyContractFromQuotationRequest { SourceQuotationId = second.Id });
        await FluentActions.Invoking(() => service.TerminateAsync(terminating.Id, "")).Should().ThrowAsync<BusinessValidationException>().Where(error => error.Code == "CONTRACT_TERMINATION_REASON_REQUIRED");
        terminating = (await service.ActivateAsync(terminating.Id))!;
        terminating = (await service.TerminateAsync(terminating.Id, "Customer cancelled"))!;
        terminating.Status.Should().Be(CompanyContractStatus.Terminated); terminating.TerminationReason.Should().Be("Customer cancelled");
        await FluentActions.Invoking(() => service.CompleteAsync(terminating.Id)).Should().ThrowAsync<BusinessValidationException>().Where(error => error.Code == "CONTRACT_TRANSITION_INVALID");
    }

    [Fact]
    public async Task List_supports_search_filter_sorting_and_page_cap()
    {
        await using var db = CreateDatabase();
        var customer = Customer("Search Customer"); db.CompanyCustomers.Add(customer); await db.SaveChangesAsync();
        var quotationService = new CompanyQuotationService(new UnitOfWork(db)); var service = CreateService(db);
        var quotation = await quotationService.CreateAsync(new CompanyQuotationUpsertRequest { CustomerId = customer.Id, Currency = "USD", Lines = [CustomLine()] });
        await quotationService.MarkSentAsync(quotation.Id); await quotationService.MarkAcceptedAsync(quotation.Id);
        await service.CreateFromQuotationAsync(new CompanyContractFromQuotationRequest { SourceQuotationId = quotation.Id });
        var page = await service.ListAsync(new CompanyContractListQuery { Search = "CTR-000001", Status = CompanyContractStatus.Draft, PageSize = 500, SortBy = "contractNumber", SortDirection = "asc" });
        page.Total.Should().Be(1); page.PageSize.Should().Be(100); page.Items.Single().ContractNumber.Should().Be("CTR-000001");
    }

    [Fact]
    public void Controller_uses_canonical_company_contract_permission_policies_and_is_separate_from_fopx_contract()
    {
        var controller = typeof(CompanyContractsController);
        controller.GetCustomAttribute<AuthorizeAttribute>()!.Policy.Should().Be("RequirePermission:Company.Sales.Contracts.View");
        controller.GetMethod(nameof(CompanyContractsController.CreateFromQuotation))!.GetCustomAttribute<AuthorizeAttribute>()!.Policy.Should().Be("RequirePermission:Company.Sales.Contracts.Create");
        controller.GetMethod(nameof(CompanyContractsController.Update))!.GetCustomAttribute<AuthorizeAttribute>()!.Policy.Should().Be("RequirePermission:Company.Sales.Contracts.Edit");
        controller.GetMethod(nameof(CompanyContractsController.Activate))!.GetCustomAttribute<AuthorizeAttribute>()!.Policy.Should().Be("RequirePermission:Company.Sales.Contracts.Manage");
        typeof(CompanyContract).Should().NotBe(typeof(Investa.Domain.Entities.InvestmentContract));
        typeof(CompanyContract).GetProperty(nameof(CompanyContract.SourceQuotationId)).Should().NotBeNull();
    }

    private static CompanyContractService CreateService(ApplicationDbContext db) => new(new UnitOfWork(db));
    private static ApplicationDbContext CreateDatabase() { var db = new ApplicationDbContext(new DbContextOptionsBuilder<ApplicationDbContext>().UseInMemoryDatabase(Guid.NewGuid().ToString()).Options); db.Database.EnsureCreated(); return db; }
    private static CompanyCustomer Customer(string name) => new() { Id = Guid.NewGuid(), CodeSequence = Random.Shared.Next(10000, 90000), CustomerCode = $"CUS-{Random.Shared.Next(100000, 999999)}", LegalName = name, DisplayName = name, Status = CompanyCustomerStatus.Active, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow };
    private static CompanyCatalogItem Catalog(string name, decimal price, string currency, string unit, bool supportsLicense = false, bool supportsSubscription = false) => new() { Id = Guid.NewGuid(), CodeSequence = Random.Shared.Next(10000, 90000), Code = $"CAT-{Random.Shared.Next(100000, 999999)}", Name = name, Type = CompanyCatalogItemType.Service, Status = CompanyCatalogItemStatus.Active, DefaultUnit = unit, BasePrice = price, Currency = currency, SupportsLicense = supportsLicense, SupportsSubscription = supportsSubscription, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow };
    private static CompanyQuotationLineInput CustomLine(string name = "Custom work") => new() { ItemName = name, Description = name, Quantity = 1, Unit = "Hour", UnitPrice = 50, DiscountType = CompanyQuotationDiscountType.None, TaxRate = 0 };
}
