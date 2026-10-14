using System.Net;
using System.Net.Http.Headers;
using System.Text.Json;
using FluentAssertions;
using Investa.Application.DTOs;
using Investa.Application.Interfaces;
using Investa.Domain.Entities;
using Investa.Domain.Entities.Enums;
using Investa.Infrastructure.Persistence;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Moq;
using Xunit;

namespace Investa.Api.IntegrationTests;

public sealed class FundingDeclarationMultipartBindingTests
{
    private static readonly Guid SeededFounderId = Guid.Parse("11111111-1111-1111-1111-111111111111");

    [Fact]
    public async Task A_single_leg_no_proof_binds_all_fields_and_returns_201()
    {
        var service = new Mock<IFundingDeclarationService>();
        FundingDeclarationCreateCommand? captured = null;
        service
            .Setup(x => x.CreateAsync(
                It.IsAny<Guid>(),
                It.IsAny<int>(),
                It.IsAny<int>(),
                It.IsAny<FundingDeclarationCreateCommand>(),
                It.IsAny<CancellationToken>()))
            .Callback<Guid, int, int, FundingDeclarationCreateCommand, CancellationToken>((_, _, _, command, _) => captured = command)
            .ReturnsAsync(new FundingDeclarationDto { Id = 42, Amount = 1000m, CurrencyCode = "EGP" });

        using var factory = new CustomWebApplicationFactory().WithWebHostBuilder(builder =>
            builder.ConfigureServices(services =>
            {
                services.RemoveAll<IFundingDeclarationService>();
                services.AddSingleton(service.Object);
            }));
        using var client = factory.CreateClient();

        using var form = new MultipartFormDataContent();
        Add(form, "1000", "Amount");
        Add(form, "EGP", "CurrencyCode");
        Add(form, "2026-09-08T07:55:00Z", "ReceivedDate");
        Add(form, "BankTransfer", "PaymentMethod");
        Add(form, "Ref-001", "ExternalReference");
        Add(form, "Test notes", "Notes");

        using var response = await client.PostAsync(
            "/api/v1/funding-declarations/opportunities/3/participations/3",
            form);

        response.StatusCode.Should().Be(HttpStatusCode.Created);
        captured.Should().NotBeNull();
        captured!.Amount.Should().Be(1000m);
        captured.CurrencyCode.Should().Be("EGP");
        captured.ReceivedDate.Should().Be(new DateTime(2026, 9, 8, 7, 55, 0, DateTimeKind.Utc));
        captured.PaymentMethod.Should().Be("BankTransfer");
        captured.ExternalReference.Should().Be("Ref-001");
        captured.Notes.Should().Be("Test notes");
        captured.LegAllocations.Should().BeEmpty();
        captured.ProofContent.Should().BeNull();
    }

    [Fact]
    public async Task B_single_leg_with_proof_binds_file_and_stream()
    {
        var service = new Mock<IFundingDeclarationService>();
        service
            .Setup(x => x.CreateAsync(
                It.IsAny<Guid>(),
                It.IsAny<int>(),
                It.IsAny<int>(),
                It.IsAny<FundingDeclarationCreateCommand>(),
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(new FundingDeclarationDto { Id = 43, Amount = 500m, CurrencyCode = "EGP", ProofAvailable = true });

        FundingDeclarationCreateCommand? captured = null;
        service
            .Setup(x => x.CreateAsync(
                It.IsAny<Guid>(),
                It.IsAny<int>(),
                It.IsAny<int>(),
                It.IsAny<FundingDeclarationCreateCommand>(),
                It.IsAny<CancellationToken>()))
            .Callback<Guid, int, int, FundingDeclarationCreateCommand, CancellationToken>((_, _, _, command, _) => captured = command)
            .ReturnsAsync(new FundingDeclarationDto { Id = 43, Amount = 500m, CurrencyCode = "EGP", ProofAvailable = true });

        using var factory = new CustomWebApplicationFactory().WithWebHostBuilder(builder =>
            builder.ConfigureServices(services =>
            {
                services.RemoveAll<IFundingDeclarationService>();
                services.AddSingleton(service.Object);
            }));
        using var client = factory.CreateClient();

        using var form = new MultipartFormDataContent();
        Add(form, "500", "Amount");
        Add(form, "EGP", "CurrencyCode");
        Add(form, "2026-09-10", "ReceivedDate");
        Add(form, "Cash", "PaymentMethod");

        var fileContent = new ByteArrayContent(new byte[] { 1, 2, 3, 4, 5 });
        fileContent.Headers.ContentType = new MediaTypeHeaderValue("application/pdf");
        form.Add(fileContent, "proofFile", "receipt.pdf");

        using var response = await client.PostAsync(
            "/api/v1/funding-declarations/opportunities/3/participations/3",
            form);

        response.StatusCode.Should().Be(HttpStatusCode.Created);
        captured.Should().NotBeNull();
        captured!.Amount.Should().Be(500m);
        captured.ProofContent.Should().NotBeNull();
        captured.ProofOriginalFileName.Should().Be("receipt.pdf");
        captured.ProofContentType.Should().Be("application/pdf");
        captured.ProofFileSize.Should().Be(5);
    }

    [Fact]
    public async Task C_missing_required_fields_returns_400_with_code_and_field_errors()
    {
        using var factory = new CustomWebApplicationFactory();
        using var client = factory.CreateClient();

        using var form = new MultipartFormDataContent();
        Add(form, "1000", "Amount");
        Add(form, "EGP", "CurrencyCode");
        Add(form, "2026-09-10", "ReceivedDate");
        Add(form, "InvalidMethod", "PaymentMethod");

        using var response = await client.PostAsync(
            "/api/v1/funding-declarations/opportunities/3/participations/3",
            form);

        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        var json = await response.Content.ReadAsStringAsync();
        using var doc = JsonDocument.Parse(json);
        var root = doc.RootElement;

        root.GetProperty("success").GetBoolean().Should().BeFalse();
        root.TryGetProperty("code", out _).Should().BeTrue("error response must include a stable code field");
        root.GetProperty("message").GetString().Should().NotBeNullOrEmpty();
    }

    [Fact]
    public async Task D_invalid_amount_returns_400_with_code()
    {
        using var factory = new CustomWebApplicationFactory();
        using var client = factory.CreateClient();

        using var form = new MultipartFormDataContent();
        Add(form, "0", "Amount");
        Add(form, "EGP", "CurrencyCode");
        Add(form, "2026-09-10", "ReceivedDate");
        Add(form, "BankTransfer", "PaymentMethod");

        using var response = await client.PostAsync(
            "/api/v1/funding-declarations/opportunities/3/participations/3",
            form);

        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        var json = await response.Content.ReadAsStringAsync();
        using var doc = JsonDocument.Parse(json);
        var root = doc.RootElement;

        root.GetProperty("success").GetBoolean().Should().BeFalse();
        root.TryGetProperty("code", out var codeElement).Should().BeTrue("error response must include a stable code field");
        codeElement.GetString().Should().Be("INVALID_REQUEST");
    }

    [Fact]
    public async Task E_missing_currency_returns_400_with_code()
    {
        using var factory = new CustomWebApplicationFactory();
        using var client = factory.CreateClient();

        using var form = new MultipartFormDataContent();
        Add(form, "1000", "Amount");
        Add(form, "2026-09-10", "ReceivedDate");
        Add(form, "BankTransfer", "PaymentMethod");

        using var response = await client.PostAsync(
            "/api/v1/funding-declarations/opportunities/3/participations/3",
            form);

        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        var json = await response.Content.ReadAsStringAsync();
        using var doc = JsonDocument.Parse(json);
        var root = doc.RootElement;

        root.GetProperty("success").GetBoolean().Should().BeFalse();
        root.TryGetProperty("code", out var codeElement).Should().BeTrue("error response must include a stable code field");
        codeElement.GetString().Should().Be("INVALID_REQUEST");
    }

    [Fact]
    public async Task F_empty_body_returns_400_with_code_and_field_errors()
    {
        using var factory = new CustomWebApplicationFactory();
        using var client = factory.CreateClient();

        using var form = new MultipartFormDataContent();

        using var response = await client.PostAsync(
            "/api/v1/funding-declarations/opportunities/3/participations/3",
            form);

        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        var json = await response.Content.ReadAsStringAsync();
        using var doc = JsonDocument.Parse(json);
        var root = doc.RootElement;

        root.GetProperty("success").GetBoolean().Should().BeFalse();
        root.TryGetProperty("code", out var codeElement).Should().BeTrue("error response must include a stable code field");
        root.TryGetProperty("data", out _).Should().BeTrue("error response must include field-level errors in data");
    }

    private static void Add(MultipartFormDataContent form, string value, string name)
    {
        var content = new StringContent(value);
        content.Headers.ContentType = new MediaTypeHeaderValue("text/plain");
        form.Add(content, name);
    }
}
