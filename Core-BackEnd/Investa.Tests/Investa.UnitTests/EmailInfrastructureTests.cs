using FluentAssertions;
using Investa.Application.DTOs;
using Investa.Application.Interfaces;
using Investa.Domain.Entities;
using Investa.Domain.Entities.Enums;
using Investa.Infrastructure.Persistence;
using Investa.Infrastructure.Services.Email;
using Investa.Infrastructure.Services;
using Investa.Infrastructure.Workers;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Microsoft.Extensions.Configuration;
using Moq;
using Xunit;

namespace Investa.UnitTests;

public sealed class EmailInfrastructureTests
{
    private static ApplicationDbContext CreateDbContext()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase($"EmailTestDb_{Guid.NewGuid()}")
            .Options;
        return new ApplicationDbContext(options);
    }

    private static ILogger<T> NullLogger<T>() => Mock.Of<ILogger<T>>();

    private static EmailOptions CreateOptions()
    {
        return new EmailOptions
        {
            Provider = "MailerSend",
            MailerSend = new MailerSendOptions
            {
                ApiKey = "test-key",
                BaseUrl = "https://api.mailersend.com/v1"
            },
            Sender = new EmailSenderOptions
            {
                Name = "FOPX One",
                Email = "no-reply@fopx.one"
            },
            Retry = new EmailRetryOptions
            {
                MaxRetries = 3,
                BaseDelaySeconds = 5,
                ExponentialBackoff = true
            },
            TimeoutSeconds = 30,
            Queue = new EmailQueueOptions
            {
                BatchSize = 10,
                PollingIntervalSeconds = 10,
                MaxDequeueAttempts = 3
            }
        };
    }

    private static IOptions<EmailOptions> CreateOptionsWrapper(EmailOptions? options = null)
    {
        return Options.Create(options ?? CreateOptions());
    }

    // ─── EmailQueue Tests ─────────────────────────────────────────────

    [Fact]
    public async Task EmailQueue_EnqueueAsync_ShouldAddAndReturnOutbox()
    {
        var db = CreateDbContext();
        var queue = new EmailQueue(db, CreateOptionsWrapper(), NullLogger<EmailQueue>());

        var outbox = new EmailOutbox
        {
            Recipient = "test@example.com",
            Subject = "Test",
            HtmlBody = "<p>Hi</p>"
        };

        var result = await queue.EnqueueAsync(outbox);

        result.Id.Should().BeGreaterThan(0);
        result.Status.Should().Be(EmailOutboxStatus.Queued);
        (await db.EmailOutbox.CountAsync()).Should().Be(1);
    }

    [Fact]
    public async Task EmailQueue_DequeueBatchAsync_ShouldReturnQueuedItems()
    {
        var db = CreateDbContext();
        var queue = new EmailQueue(db, CreateOptionsWrapper(), NullLogger<EmailQueue>());

        db.EmailOutbox.Add(new EmailOutbox
        {
            Recipient = "a@test.com",
            Subject = "A",
            HtmlBody = "<p>A</p>",
            Status = EmailOutboxStatus.Queued,
            CreatedAt = DateTime.UtcNow.AddSeconds(-10)
        });
        db.EmailOutbox.Add(new EmailOutbox
        {
            Recipient = "b@test.com",
            Subject = "B",
            HtmlBody = "<p>B</p>",
            Status = EmailOutboxStatus.Queued,
            CreatedAt = DateTime.UtcNow.AddSeconds(-5)
        });
        db.EmailOutbox.Add(new EmailOutbox
        {
            Recipient = "c@test.com",
            Subject = "C",
            HtmlBody = "<p>C</p>",
            Status = EmailOutboxStatus.Sent
        });
        await db.SaveChangesAsync();

        var batch = await queue.DequeueBatchAsync(batchSize: 10);

        batch.Should().HaveCount(2);
        batch.Should().Contain(e => e.Recipient == "a@test.com");
        batch.Should().Contain(e => e.Recipient == "b@test.com");
    }

    [Fact]
    public async Task EmailQueue_DequeueBatchAsync_ShouldRespectNextAttemptAfter()
    {
        var db = CreateDbContext();
        var queue = new EmailQueue(db, CreateOptionsWrapper(), NullLogger<EmailQueue>());

        db.EmailOutbox.Add(new EmailOutbox
        {
            Recipient = "future@test.com",
            Subject = "Future",
            HtmlBody = "<p>Future</p>",
            Status = EmailOutboxStatus.Queued,
            NextAttemptAfter = DateTime.UtcNow.AddHours(1)
        });
        db.EmailOutbox.Add(new EmailOutbox
        {
            Recipient = "now@test.com",
            Subject = "Now",
            HtmlBody = "<p>Now</p>",
            Status = EmailOutboxStatus.Queued
        });
        await db.SaveChangesAsync();

        var batch = await queue.DequeueBatchAsync(batchSize: 10);

        batch.Should().HaveCount(1);
        batch[0].Recipient.Should().Be("now@test.com");
    }

    [Fact]
    public async Task EmailQueue_DequeueBatchAsync_ShouldOrderByPriorityDescendingThenCreatedAt()
    {
        var db = CreateDbContext();
        var queue = new EmailQueue(db, CreateOptionsWrapper(), NullLogger<EmailQueue>());

        db.EmailOutbox.Add(new EmailOutbox
        {
            Recipient = "normal@test.com",
            Subject = "Normal",
            HtmlBody = "<p>N</p>",
            Status = EmailOutboxStatus.Queued,
            Priority = EmailPriority.Normal,
            CreatedAt = DateTime.UtcNow.AddSeconds(-20)
        });
        db.EmailOutbox.Add(new EmailOutbox
        {
            Recipient = "critical@test.com",
            Subject = "Critical",
            HtmlBody = "<p>C</p>",
            Status = EmailOutboxStatus.Queued,
            Priority = EmailPriority.Critical,
            CreatedAt = DateTime.UtcNow.AddSeconds(-10)
        });
        db.EmailOutbox.Add(new EmailOutbox
        {
            Recipient = "high@test.com",
            Subject = "High",
            HtmlBody = "<p>H</p>",
            Status = EmailOutboxStatus.Queued,
            Priority = EmailPriority.High,
            CreatedAt = DateTime.UtcNow.AddSeconds(-15)
        });
        await db.SaveChangesAsync();

        var batch = await queue.DequeueBatchAsync(batchSize: 10);

        batch.Should().HaveCount(3);
        batch[0].Recipient.Should().Be("critical@test.com");
        batch[1].Recipient.Should().Be("high@test.com");
        batch[2].Recipient.Should().Be("normal@test.com");
    }

    [Fact]
    public async Task EmailQueue_MarkProcessingAsync_ShouldUpdateStatus()
    {
        var db = CreateDbContext();
        var queue = new EmailQueue(db, CreateOptionsWrapper(), NullLogger<EmailQueue>());

        var outbox = new EmailOutbox
        {
            Recipient = "test@example.com",
            Subject = "Test",
            HtmlBody = "<p>Hi</p>",
            Status = EmailOutboxStatus.Queued
        };
        db.EmailOutbox.Add(outbox);
        await db.SaveChangesAsync();

        await queue.MarkProcessingAsync(outbox.Id);

        var reloaded = await db.EmailOutbox.FindAsync(outbox.Id);
        reloaded!.Status.Should().Be(EmailOutboxStatus.Processing);
    }

    [Fact]
    public async Task EmailQueue_MarkSentAsync_ShouldUpdateStatusAndTimestamps()
    {
        var db = CreateDbContext();
        var queue = new EmailQueue(db, CreateOptionsWrapper(), NullLogger<EmailQueue>());

        var outbox = new EmailOutbox
        {
            Recipient = "test@example.com",
            Subject = "Test",
            HtmlBody = "<p>Hi</p>",
            Status = EmailOutboxStatus.Processing
        };
        db.EmailOutbox.Add(outbox);
        await db.SaveChangesAsync();

        await queue.MarkSentAsync(outbox.Id, "msg-123");

        var reloaded = await db.EmailOutbox.FindAsync(outbox.Id);
        reloaded!.Status.Should().Be(EmailOutboxStatus.Sent);
        reloaded.SentAt.Should().NotBeNull();
        reloaded.CompletedAt.Should().NotBeNull();
    }

    [Theory]
    [InlineData(true, false)]
    [InlineData(false, true)]
    public async Task EmailQueue_MarkFailedAsync_ShouldHandlePermanentFailure(bool retryable, bool expectFailed)
    {
        var db = CreateDbContext();
        var queue = new EmailQueue(db, CreateOptionsWrapper(), NullLogger<EmailQueue>());

        var outbox = new EmailOutbox
        {
            Recipient = "test@example.com",
            Subject = "Test",
            HtmlBody = "<p>Hi</p>",
            Status = EmailOutboxStatus.Processing,
            MaxRetries = 1,
            RetryCount = 0
        };
        db.EmailOutbox.Add(outbox);
        await db.SaveChangesAsync();

        await queue.MarkFailedAsync(outbox.Id, "Permanent failure", retryable);

        var reloaded = await db.EmailOutbox.FindAsync(outbox.Id);
        if (expectFailed)
        {
            reloaded!.Status.Should().Be(EmailOutboxStatus.Failed);
            reloaded.CompletedAt.Should().NotBeNull();
            reloaded.NextAttemptAfter.Should().BeNull();
        }
        else
        {
            reloaded!.Status.Should().Be(EmailOutboxStatus.Queued);
            reloaded.NextAttemptAfter.Should().NotBeNull();
        }
        reloaded.RetryCount.Should().Be(1);
        reloaded.LastError.Should().Be("Permanent failure");
    }

    [Fact]
    public async Task EmailQueue_MarkFailedAsync_ShouldExceedMaxRetries()
    {
        var db = CreateDbContext();
        var queue = new EmailQueue(db, CreateOptionsWrapper(), NullLogger<EmailQueue>());

        var outbox = new EmailOutbox
        {
            Recipient = "test@example.com",
            Subject = "Test",
            HtmlBody = "<p>Hi</p>",
            Status = EmailOutboxStatus.Processing,
            MaxRetries = 2,
            RetryCount = 2
        };
        db.EmailOutbox.Add(outbox);
        await db.SaveChangesAsync();

        await queue.MarkFailedAsync(outbox.Id, "Max retries exceeded", true);

        var reloaded = await db.EmailOutbox.FindAsync(outbox.Id);
        reloaded!.Status.Should().Be(EmailOutboxStatus.Failed);
        reloaded.RetryCount.Should().Be(3);
    }

    [Fact]
    public async Task EmailQueue_GetQueuedCountAsync_ShouldOnlyCountEligibleItems()
    {
        var db = CreateDbContext();
        var queue = new EmailQueue(db, CreateOptionsWrapper(), NullLogger<EmailQueue>());

        db.EmailOutbox.Add(new EmailOutbox { Recipient = "a@t.com", Subject = "A", HtmlBody = "<p>A</p>", Status = EmailOutboxStatus.Queued });
        db.EmailOutbox.Add(new EmailOutbox { Recipient = "b@t.com", Subject = "B", HtmlBody = "<p>B</p>", Status = EmailOutboxStatus.Queued, NextAttemptAfter = DateTime.UtcNow.AddHours(1) });
        db.EmailOutbox.Add(new EmailOutbox { Recipient = "c@t.com", Subject = "C", HtmlBody = "<p>C</p>", Status = EmailOutboxStatus.Sent });
        await db.SaveChangesAsync();

        var count = await queue.GetQueuedCountAsync();

        count.Should().Be(1);
    }

    // ─── EmailDispatcher Tests ────────────────────────────────────────

    private static Mock<IEmailPreferenceService> CreatePreferenceServiceMock(bool enabled = true)
    {
        var mock = new Mock<IEmailPreferenceService>();
        mock.Setup(s => s.IsCategoryEnabledAsync(It.IsAny<string>(), It.IsAny<EmailCategory>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(enabled);
        return mock;
    }

    [Fact]
    public async Task EmailDispatcher_DispatchAsync_ShouldSendAndMarkSent()
    {
        var db = CreateDbContext();
        var queue = new EmailQueue(db, CreateOptionsWrapper(), NullLogger<EmailQueue>());
        var historyService = new EmailHistoryService(db, NullLogger<EmailHistoryService>());
        var prefService = CreatePreferenceServiceMock().Object;

        var providerMock = new Mock<IEmailProvider>();
        providerMock.Setup(p => p.Name).Returns("MailerSend");
        providerMock.Setup(p => p.SendAsync(It.IsAny<EmailMessage>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new EmailProviderResult { Success = true, ProviderMessageId = "msg-1" });

        var dispatcher = new EmailDispatcher(queue, historyService, prefService, [providerMock.Object], CreateOptionsWrapper(), NullLogger<EmailDispatcher>());

        var outbox = new EmailOutbox
        {
            Recipient = "test@example.com",
            Subject = "Test",
            HtmlBody = "<p>Hi</p>",
            Provider = "MailerSend",
            Status = EmailOutboxStatus.Queued,
            MaxRetries = 3
        };
        db.EmailOutbox.Add(outbox);
        await db.SaveChangesAsync();

        await dispatcher.DispatchAsync();

        var reloaded = await db.EmailOutbox.FindAsync(outbox.Id);
        reloaded!.Status.Should().Be(EmailOutboxStatus.Sent);

        var history = await db.EmailHistory.ToListAsync();
        history.Should().HaveCount(2);
        history[1].Status.Should().Be(EmailHistoryStatus.Sent);
        history[1].ProviderMessageId.Should().Be("msg-1");
    }

    [Fact]
    public async Task EmailDispatcher_DispatchAsync_ShouldRetryOnTransientFailure()
    {
        var db = CreateDbContext();
        var queue = new EmailQueue(db, CreateOptionsWrapper(), NullLogger<EmailQueue>());
        var historyService = new EmailHistoryService(db, NullLogger<EmailHistoryService>());
        var prefService = CreatePreferenceServiceMock().Object;

        var providerMock = new Mock<IEmailProvider>();
        providerMock.Setup(p => p.Name).Returns("MailerSend");
        providerMock.Setup(p => p.SendAsync(It.IsAny<EmailMessage>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new EmailProviderResult { Success = false, FailureReason = "Timeout", IsRetryable = true });

        var dispatcher = new EmailDispatcher(queue, historyService, prefService, [providerMock.Object], CreateOptionsWrapper(), NullLogger<EmailDispatcher>());

        var outbox = new EmailOutbox
        {
            Recipient = "test@example.com",
            Subject = "Test",
            HtmlBody = "<p>Hi</p>",
            Provider = "MailerSend",
            Status = EmailOutboxStatus.Queued,
            MaxRetries = 3,
            RetryCount = 0
        };
        db.EmailOutbox.Add(outbox);
        await db.SaveChangesAsync();

        await dispatcher.DispatchAsync();

        var reloaded = await db.EmailOutbox.FindAsync(outbox.Id);
        reloaded!.Status.Should().Be(EmailOutboxStatus.Queued);
        reloaded.RetryCount.Should().Be(1);
        reloaded.LastError.Should().Be("Timeout");
        reloaded.NextAttemptAfter.Should().NotBeNull();
    }

    [Fact]
    public async Task EmailDispatcher_DispatchAsync_ShouldFailOnPermanentFailure()
    {
        var db = CreateDbContext();
        var queue = new EmailQueue(db, CreateOptionsWrapper(), NullLogger<EmailQueue>());
        var historyService = new EmailHistoryService(db, NullLogger<EmailHistoryService>());
        var prefService = CreatePreferenceServiceMock().Object;

        var providerMock = new Mock<IEmailProvider>();
        providerMock.Setup(p => p.Name).Returns("MailerSend");
        providerMock.Setup(p => p.SendAsync(It.IsAny<EmailMessage>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new EmailProviderResult { Success = false, FailureReason = "Invalid recipient", IsRetryable = false });

        var dispatcher = new EmailDispatcher(queue, historyService, prefService, [providerMock.Object], CreateOptionsWrapper(), NullLogger<EmailDispatcher>());

        var outbox = new EmailOutbox
        {
            Recipient = "bad@example.com",
            Subject = "Test",
            HtmlBody = "<p>Hi</p>",
            Provider = "MailerSend",
            Status = EmailOutboxStatus.Queued,
            MaxRetries = 3
        };
        db.EmailOutbox.Add(outbox);
        await db.SaveChangesAsync();

        await dispatcher.DispatchAsync();

        var reloaded = await db.EmailOutbox.FindAsync(outbox.Id);
        reloaded!.Status.Should().Be(EmailOutboxStatus.Failed);
        reloaded.FailureReason.Should().Be("Invalid recipient");
    }

    [Fact]
    public async Task EmailDispatcher_DispatchAsync_ShouldHandleUnknownProvider()
    {
        var db = CreateDbContext();
        var queue = new EmailQueue(db, CreateOptionsWrapper(), NullLogger<EmailQueue>());
        var historyService = new EmailHistoryService(db, NullLogger<EmailHistoryService>());
        var prefService = CreatePreferenceServiceMock().Object;

        var providerMock = new Mock<IEmailProvider>();
        providerMock.Setup(p => p.Name).Returns("SendGrid");

        var dispatcher = new EmailDispatcher(queue, historyService, prefService, [providerMock.Object], CreateOptionsWrapper(), NullLogger<EmailDispatcher>());

        var outbox = new EmailOutbox
        {
            Recipient = "test@example.com",
            Subject = "Test",
            HtmlBody = "<p>Hi</p>",
            Provider = "MailerSend",
            Status = EmailOutboxStatus.Queued,
            MaxRetries = 3
        };
        db.EmailOutbox.Add(outbox);
        await db.SaveChangesAsync();

        await dispatcher.DispatchAsync();

        var reloaded = await db.EmailOutbox.FindAsync(outbox.Id);
        reloaded!.Status.Should().Be(EmailOutboxStatus.Failed);
        reloaded.FailureReason.Should().Contain("No email provider found");
    }

    [Fact]
    public async Task EmailDispatcher_DispatchAsync_ShouldSkipWhenUserPreferenceDisabledForOptionalCategory()
    {
        var db = CreateDbContext();
        var queue = new EmailQueue(db, CreateOptionsWrapper(), NullLogger<EmailQueue>());
        var historyService = new EmailHistoryService(db, NullLogger<EmailHistoryService>());

        var prefMock = new Mock<IEmailPreferenceService>();
        prefMock.Setup(s => s.IsCategoryEnabledAsync("user-1", EmailCategory.Marketing, It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);

        var providerMock = new Mock<IEmailProvider>();
        providerMock.Setup(p => p.Name).Returns("MailerSend");

        var dispatcher = new EmailDispatcher(queue, historyService, prefMock.Object, [providerMock.Object], CreateOptionsWrapper(), NullLogger<EmailDispatcher>());

        var outbox = new EmailOutbox
        {
            Recipient = "test@example.com",
            Subject = "Marketing",
            HtmlBody = "<p>Ad</p>",
            Provider = "MailerSend",
            Status = EmailOutboxStatus.Queued,
            MaxRetries = 3,
            Category = EmailCategory.Marketing.ToString(),
            UserId = "user-1"
        };
        db.EmailOutbox.Add(outbox);
        await db.SaveChangesAsync();

        await dispatcher.DispatchAsync();

        var reloaded = await db.EmailOutbox.FindAsync(outbox.Id);
        reloaded!.Status.Should().Be(EmailOutboxStatus.Failed);
        reloaded.FailureReason.Should().Contain("Skipped");
    }

    [Fact]
    public async Task EmailDispatcher_DispatchAsync_ShouldNotSkipMandatoryCategoryEvenWhenDisabled()
    {
        var db = CreateDbContext();
        var queue = new EmailQueue(db, CreateOptionsWrapper(), NullLogger<EmailQueue>());
        var historyService = new EmailHistoryService(db, NullLogger<EmailHistoryService>());

        var prefMock = new Mock<IEmailPreferenceService>();
        prefMock.Setup(s => s.IsCategoryEnabledAsync("user-1", EmailCategory.Security, It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);

        var providerMock = new Mock<IEmailProvider>();
        providerMock.Setup(p => p.Name).Returns("MailerSend");
        providerMock.Setup(p => p.SendAsync(It.IsAny<EmailMessage>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new EmailProviderResult { Success = true, ProviderMessageId = "msg-sec" });

        var dispatcher = new EmailDispatcher(queue, historyService, prefMock.Object, [providerMock.Object], CreateOptionsWrapper(), NullLogger<EmailDispatcher>());

        var outbox = new EmailOutbox
        {
            Recipient = "test@example.com",
            Subject = "Security Alert",
            HtmlBody = "<p>Alert</p>",
            Provider = "MailerSend",
            Status = EmailOutboxStatus.Queued,
            MaxRetries = 3,
            Category = EmailCategory.Security.ToString(),
            UserId = "user-1"
        };
        db.EmailOutbox.Add(outbox);
        await db.SaveChangesAsync();

        await dispatcher.DispatchAsync();

        var reloaded = await db.EmailOutbox.FindAsync(outbox.Id);
        reloaded!.Status.Should().Be(EmailOutboxStatus.Sent);
    }

    // ─── EmailHistoryService Tests ────────────────────────────────────

    [Fact]
    public async Task EmailHistoryService_RecordAsync_ShouldPersist()
    {
        var db = CreateDbContext();
        var service = new EmailHistoryService(db, NullLogger<EmailHistoryService>());

        var history = new EmailHistory
        {
            CorrelationId = Guid.NewGuid(),
            Recipient = "test@example.com",
            Subject = "Test",
            Status = EmailHistoryStatus.Queued,
            Provider = "MailerSend",
            CreatedAt = DateTime.UtcNow
        };

        var result = await service.RecordAsync(history);

        result.Id.Should().BeGreaterThan(0);
        (await db.EmailHistory.CountAsync()).Should().Be(1);
    }

    [Fact]
    public async Task EmailHistoryService_UpdateStatusAsync_ShouldUpdateFields()
    {
        var db = CreateDbContext();
        var service = new EmailHistoryService(db, NullLogger<EmailHistoryService>());

        var history = new EmailHistory
        {
            CorrelationId = Guid.NewGuid(),
            Recipient = "test@example.com",
            Subject = "Test",
            Status = EmailHistoryStatus.Queued,
            Provider = "MailerSend",
            CreatedAt = DateTime.UtcNow
        };
        db.EmailHistory.Add(history);
        await db.SaveChangesAsync();

        await service.UpdateStatusAsync(history.Id, EmailHistoryStatus.Sent, "msg-456");

        var reloaded = await db.EmailHistory.FindAsync(history.Id);
        reloaded!.Status.Should().Be(EmailHistoryStatus.Sent);
        reloaded.ProviderMessageId.Should().Be("msg-456");
        reloaded.SentAt.Should().NotBeNull();
    }

    [Fact]
    public async Task EmailHistoryService_GetByCorrelationIdAsync_ShouldReturnOrdered()
    {
        var db = CreateDbContext();
        var service = new EmailHistoryService(db, NullLogger<EmailHistoryService>());
        var correlationId = Guid.NewGuid();

        db.EmailHistory.Add(new EmailHistory { CorrelationId = correlationId, Recipient = "a@t.com", Subject = "A", Status = EmailHistoryStatus.Sent, Provider = "M", CreatedAt = DateTime.UtcNow.AddMinutes(-10) });
        db.EmailHistory.Add(new EmailHistory { CorrelationId = correlationId, Recipient = "a@t.com", Subject = "A", Status = EmailHistoryStatus.Queued, Provider = "M", CreatedAt = DateTime.UtcNow.AddMinutes(-5) });
        db.EmailHistory.Add(new EmailHistory { CorrelationId = Guid.NewGuid(), Recipient = "b@t.com", Subject = "B", Status = EmailHistoryStatus.Sent, Provider = "M", CreatedAt = DateTime.UtcNow });
        await db.SaveChangesAsync();

        var results = await service.GetByCorrelationIdAsync(correlationId);

        results.Should().HaveCount(2);
        results.Should().BeInDescendingOrder(h => h.CreatedAt);
    }

    [Fact]
    public async Task EmailHistoryService_GetByRecipientAsync_ShouldPaginate()
    {
        var db = CreateDbContext();
        var service = new EmailHistoryService(db, NullLogger<EmailHistoryService>());

        for (int i = 0; i < 5; i++)
        {
            db.EmailHistory.Add(new EmailHistory { Recipient = "same@t.com", Subject = $"Msg {i}", Status = EmailHistoryStatus.Sent, Provider = "M", CreatedAt = DateTime.UtcNow.AddMinutes(-i) });
        }
        await db.SaveChangesAsync();

        var page1 = await service.GetByRecipientAsync("same@t.com", page: 1, pageSize: 2);
        page1.Should().HaveCount(2);

        var page2 = await service.GetByRecipientAsync("same@t.com", page: 2, pageSize: 2);
        page2.Should().HaveCount(2);

        var page3 = await service.GetByRecipientAsync("same@t.com", page: 3, pageSize: 2);
        page3.Should().HaveCount(1);
    }

    // ─── MailerSendEmailProvider Tests ────────────────────────────────

    [Fact]
    public async Task MailerSendProvider_SendAsync_ShouldFailWithoutApiKey()
    {
        var options = CreateOptions();
        options.MailerSend.ApiKey = "";
        var httpClientFactory = new Mock<IHttpClientFactory>();

        var provider = new MailerSendEmailProvider(httpClientFactory.Object, CreateOptionsWrapper(options), NullLogger<MailerSendEmailProvider>());

        var result = await provider.SendAsync(new EmailMessage
        {
            Recipient = "test@example.com",
            Subject = "Test",
            HtmlBody = "<p>Hi</p>"
        });

        result.Success.Should().BeFalse();
        result.IsRetryable.Should().BeFalse();
        result.FailureReason.Should().Be("MailerSend API key is not configured");
    }

    // ─── EmailService Tests ───────────────────────────────────────────

    [Fact]
    public async Task EmailService_SendEmailAsync_ShouldEnqueueWithCategoryAndPriority()
    {
        var db = CreateDbContext();
        var queue = new EmailQueue(db, CreateOptionsWrapper(), NullLogger<EmailQueue>());
        var rendererMock = new Mock<IEmailTemplateRenderer>();
        var attachmentMock = new Mock<IEmailAttachmentProvider>();

        var service = new EmailService(queue, rendererMock.Object, attachmentMock.Object, CreateOptionsWrapper(), NullLogger<EmailService>());

        await service.SendEmailAsync(new SendEmailRequest
        {
            To = "test@example.com",
            Subject = "Hello",
            HtmlBody = "<p>World</p>",
            Category = EmailCategory.Security,
            Priority = EmailPriority.Critical,
            UserId = "user-1"
        });

        var outbox = await db.EmailOutbox.FirstAsync();
        outbox.Recipient.Should().Be("test@example.com");
        outbox.Subject.Should().Be("Hello");
        outbox.SenderName.Should().Be("FOPX One");
        outbox.SenderEmail.Should().Be("no-reply@fopx.one");
        outbox.Category.Should().Be(EmailCategory.Security.ToString());
        outbox.Priority.Should().Be(EmailPriority.Critical);
        outbox.UserId.Should().Be("user-1");
    }

    [Fact]
    public async Task EmailService_SendTemplatedEmailAsync_ShouldPersistExactPdfAttachment()
    {
        var db = CreateDbContext();
        var queue = new EmailQueue(db, CreateOptionsWrapper(), NullLogger<EmailQueue>());
        var renderer = new Mock<IEmailTemplateRenderer>();
        renderer.Setup(x => x.RenderAsync("investment-contract", It.IsAny<object>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new EmailTemplateResult { Subject = "Contract", HtmlBody = "<p>Contract</p>", PlainTextBody = "Contract" });
        var fallbackAttachments = new Mock<IEmailAttachmentProvider>();
        fallbackAttachments.Setup(x => x.GetAttachmentsAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(Array.Empty<EmailAttachment>());
        var service = new EmailService(queue, renderer.Object, fallbackAttachments.Object, CreateOptionsWrapper(), NullLogger<EmailService>());
        var pdf = new byte[] { 0x25, 0x50, 0x44, 0x46, 0x2d, 1, 2, 3 };

        var outboxId = await service.SendTemplatedEmailAsync(new SendTemplatedEmailRequest
        {
            Recipient = "verified@example.com",
            TemplateName = "investment-contract",
            Model = new EmailTemplateModel(),
            Attachments =
            [
                new EmailAttachment
                {
                    FileName = "FOPX-One-Contract-INV-1-v2.pdf",
                    ContentType = "application/pdf",
                    Content = pdf
                }
            ]
        });

        var outbox = await db.EmailOutbox.SingleAsync();
        outbox.Id.Should().Be(outboxId);
        var attachment = System.Text.Json.JsonSerializer.Deserialize<List<EmailAttachment>>(outbox.AttachmentsJson!)!.Single();
        attachment.FileName.Should().Be("FOPX-One-Contract-INV-1-v2.pdf");
        attachment.ContentType.Should().Be("application/pdf");
        attachment.Content.Should().Equal(pdf);
    }

    [Fact]
    public async Task PlaywrightRenderer_ShouldUseInstalledBrowserFallbackAndReturnPdf()
    {
        var configuration = new ConfigurationBuilder().Build();
        var renderer = new PlaywrightHtmlToPdfRenderer(
            configuration,
            NullLogger<PlaywrightHtmlToPdfRenderer>());

        var pdf = await renderer.RenderAsync(
            "<!doctype html><html><body><h1>Contract test</h1></body></html>",
            "INV-TEST - V1");

        pdf.Should().StartWith([0x25, 0x50, 0x44, 0x46, 0x2d]);
    }

    [Theory]
    [InlineData("en", "Your FOPX One Contract", "Hello, Contract User")]
    [InlineData("ar", "عقدك على FOPX One", "مرحبًا، Contract User")]
    public async Task UnifiedRenderer_InvestmentContract_ShouldRenderLocalizedContent(string language, string subject, string greeting)
    {
        var renderer = new UnifiedEmailTemplateRenderer(NullLogger<UnifiedEmailTemplateRenderer>());
        var result = await renderer.RenderAsync("investment-contract", new EmailTemplateModel
        {
            RecipientDisplayName = "Contract User",
            Language = language,
            Title = subject,
            Description = language == "ar" ? "مرفق بهذه الرسالة عقد الاستثمار." : "Your investment contract is attached.",
            StatusLabel = language == "ar" ? "عقد الاستثمار" : "Investment contract",
            CardLabel = language == "ar" ? "رقم العقد / الإصدار" : "Contract reference / Version",
            CardValue = "INV-1 / V2",
            CtaText = language == "ar" ? "فتح غرفة المشروع" : "Open Project Room",
            PlainTextFallback = subject
        });

        result.Subject.Should().Be(subject);
        result.HtmlBody.Should().Contain(greeting);
        result.HtmlBody.Should().Contain("INV-1 / V2");
    }

    [Fact]
    public async Task EmailService_VerifyConnectionAsync_ShouldReturnTrue()
    {
        var queue = new Mock<IEmailQueue>();
        var rendererMock = new Mock<IEmailTemplateRenderer>();
        var attachmentMock = new Mock<IEmailAttachmentProvider>();

        var service = new EmailService(queue.Object, rendererMock.Object, attachmentMock.Object, CreateOptionsWrapper(), NullLogger<EmailService>());

        var result = await service.VerifyConnectionAsync();

        result.Should().BeTrue();
    }

    // ─── EmailPreferenceService Tests ─────────────────────────────────

    [Fact]
    public async Task EmailPreferenceService_MandatoryCategory_ShouldAlwaysBeEnabled()
    {
        var db = CreateDbContext();
        var service = new EmailPreferenceService(db, NullLogger<EmailPreferenceService>());

        foreach (var category in EmailPreferenceDefaults.AllCategories)
        {
            if (EmailCategoryMetadata.IsMandatory(category))
            {
                var enabled = await service.IsCategoryEnabledAsync("any-user", category);
                enabled.Should().BeTrue();
            }
        }
    }

    [Fact]
    public async Task EmailPreferenceService_OptionalCategory_ShouldDefaultToFalse()
    {
        var db = CreateDbContext();
        var service = new EmailPreferenceService(db, NullLogger<EmailPreferenceService>());

        var enabled = await service.IsCategoryEnabledAsync("new-user", EmailCategory.Marketing);

        enabled.Should().BeFalse();
    }

    [Fact]
    public async Task EmailPreferenceService_ShouldSetAndGetPreferences()
    {
        var db = CreateDbContext();
        var service = new EmailPreferenceService(db, NullLogger<EmailPreferenceService>());

        await service.SetCategoryEnabledAsync("user-1", EmailCategory.Marketing, true);

        var enabled = await service.IsCategoryEnabledAsync("user-1", EmailCategory.Marketing);
        enabled.Should().BeTrue();

        await service.SetCategoryEnabledAsync("user-1", EmailCategory.Marketing, false);

        enabled = await service.IsCategoryEnabledAsync("user-1", EmailCategory.Marketing);
        enabled.Should().BeFalse();
    }

    [Fact]
    public async Task EmailPreferenceService_ShouldNotDisableMandatoryCategory()
    {
        var db = CreateDbContext();
        var service = new EmailPreferenceService(db, NullLogger<EmailPreferenceService>());

        await service.SetCategoryEnabledAsync("user-1", EmailCategory.Security, false);

        var enabled = await service.IsCategoryEnabledAsync("user-1", EmailCategory.Security);
        enabled.Should().BeTrue();
    }

    [Fact]
    public async Task EmailPreferenceService_GetAllPreferences_ShouldReturnAllCategories()
    {
        var db = CreateDbContext();
        var service = new EmailPreferenceService(db, NullLogger<EmailPreferenceService>());

        var prefs = await service.GetAllPreferencesAsync("user-1");

        prefs.Should().HaveCount(EmailPreferenceDefaults.AllCategories.Count);
        prefs[EmailCategory.Security].Should().BeTrue();
        prefs[EmailCategory.Authentication].Should().BeTrue();
        prefs[EmailCategory.Marketing].Should().BeFalse();
    }

    [Fact]
    public async Task EmailPreferenceService_InitializeDefaults_ShouldCreateAllPreferences()
    {
        var db = CreateDbContext();
        var service = new EmailPreferenceService(db, NullLogger<EmailPreferenceService>());

        await service.InitializeDefaultsAsync("user-1");

        var count = await db.EmailPreferences.CountAsync(p => p.UserId == "user-1");
        count.Should().Be(EmailPreferenceDefaults.AllCategories.Count);

        var enabledCount = await db.EmailPreferences.CountAsync(p => p.UserId == "user-1" && p.Enabled);
        var mandatoryCount = EmailPreferenceDefaults.AllCategories.Count(EmailCategoryMetadata.IsMandatory);
        enabledCount.Should().Be(mandatoryCount);
    }

    [Fact]
    public async Task EmailPreferenceService_InitializeDefaults_ShouldNotDuplicate()
    {
        var db = CreateDbContext();
        var service = new EmailPreferenceService(db, NullLogger<EmailPreferenceService>());

        await service.InitializeDefaultsAsync("user-1");
        await service.InitializeDefaultsAsync("user-1");

        var count = await db.EmailPreferences.CountAsync(p => p.UserId == "user-1");
        count.Should().Be(EmailPreferenceDefaults.AllCategories.Count);
    }

    // ─── Configuration Validation Tests ───────────────────────────────

    [Fact]
    public void EmailOptions_ShouldHaveCorrectDefaults()
    {
        var options = new EmailOptions();

        options.Provider.Should().Be("MailerSend");
        options.TimeoutSeconds.Should().Be(30);
        options.Sender.Name.Should().Be("FOPX One");
        options.Sender.Email.Should().Be("no-reply@fopx.one");
        options.Retry.MaxRetries.Should().Be(3);
        options.Retry.BaseDelaySeconds.Should().Be(5);
        options.Retry.ExponentialBackoff.Should().BeTrue();
        options.Queue.BatchSize.Should().Be(10);
        options.Queue.PollingIntervalSeconds.Should().Be(10);
        options.MailerSend.BaseUrl.Should().Be("https://api.mailersend.com/v1");
        options.MailerSend.ApiKey.Should().BeEmpty();
    }

    // ─── EmailDispatcherWorker Tests ──────────────────────────────────

    [Fact]
    public async Task EmailDispatcherWorker_ShouldStopGracefullyOnCancellation()
    {
        var serviceProvider = new Mock<IServiceProvider>();
        var scope = new Mock<IServiceScope>();
        var scopeFactory = new Mock<IServiceScopeFactory>();
        var dispatcherMock = new Mock<IEmailDispatcher>();

        scope.Setup(s => s.ServiceProvider.GetService(typeof(IEmailDispatcher))).Returns(dispatcherMock.Object);
        serviceProvider.Setup(s => s.GetService(typeof(IServiceScopeFactory))).Returns(scopeFactory.Object);
        scopeFactory.Setup(f => f.CreateScope()).Returns(scope.Object);

        var worker = new EmailDispatcherWorker(serviceProvider.Object, CreateOptionsWrapper(), NullLogger<EmailDispatcherWorker>());

        using var cts = new CancellationTokenSource();
        cts.CancelAfter(100);

        await worker.StartAsync(cts.Token);
        await Task.Delay(500);

        worker.ExecuteTask!.IsCompleted.Should().BeTrue();
    }

    // ─── Retry Policy Tests ───────────────────────────────────────────

    [Theory]
    [InlineData(true, 1, 10, 10)]
    [InlineData(true, 2, 10, 20)]
    [InlineData(true, 3, 10, 40)]
    [InlineData(false, 2, 10, 10)]
    public async Task EmailQueue_CalculateNextAttempt_ShouldApplyBackoff(bool exponential, int retryCount, int baseDelaySeconds, int expectedDelaySeconds)
    {
        var db = CreateDbContext();
        var options = CreateOptions();
        options.Retry.BaseDelaySeconds = baseDelaySeconds;
        options.Retry.ExponentialBackoff = exponential;
        var queue = new EmailQueue(db, CreateOptionsWrapper(options), NullLogger<EmailQueue>());

        var before = DateTime.UtcNow;

        var outbox = new EmailOutbox
        {
            Recipient = "test@example.com",
            Subject = "Test",
            HtmlBody = "<p>Hi</p>",
            Status = EmailOutboxStatus.Processing,
            MaxRetries = 5,
            RetryCount = retryCount - 1
        };
        db.EmailOutbox.Add(outbox);
        await db.SaveChangesAsync();

        await queue.MarkFailedAsync(outbox.Id, "Transient", true);

        var reloaded = await db.EmailOutbox.FindAsync(outbox.Id);
        var expected = before.AddSeconds(expectedDelaySeconds);
        reloaded!.NextAttemptAfter.Should().NotBeNull();
        reloaded.NextAttemptAfter!.Value.Should().BeCloseTo(expected, TimeSpan.FromSeconds(2));
    }

    // ─── EmailHistoryStatus Consistency Tests ─────────────────────────

    [Fact]
    public void EmailHistoryStatus_ShouldHaveAllExpectedValues()
    {
        EmailHistoryStatus.Queued.Should().Be("Queued");
        EmailHistoryStatus.Processing.Should().Be("Processing");
        EmailHistoryStatus.Sent.Should().Be("Sent");
        EmailHistoryStatus.Delivered.Should().Be("Delivered");
        EmailHistoryStatus.Opened.Should().Be("Opened");
        EmailHistoryStatus.Clicked.Should().Be("Clicked");
        EmailHistoryStatus.SoftBounce.Should().Be("SoftBounce");
        EmailHistoryStatus.HardBounce.Should().Be("HardBounce");
        EmailHistoryStatus.Failed.Should().Be("Failed");
        EmailHistoryStatus.Skipped.Should().Be("Skipped");
    }

    [Fact]
    public void EmailOutboxStatus_ShouldHaveAllExpectedValues()
    {
        EmailOutboxStatus.Queued.Should().Be("Queued");
        EmailOutboxStatus.Processing.Should().Be("Processing");
        EmailOutboxStatus.Sent.Should().Be("Sent");
        EmailOutboxStatus.Failed.Should().Be("Failed");
    }

    // ─── Null/Noop Services Tests ─────────────────────────────────────

    [Fact]
    public async Task NoopEmailTemplateRenderer_ShouldReturnPlaceholder()
    {
        var renderer = new NoopEmailTemplateRenderer(NullLogger<NoopEmailTemplateRenderer>());

        var result = await renderer.RenderAsync("TestTemplate", new { });

        result.Subject.Should().Be("TestTemplate");
        result.HtmlBody.Should().Contain("TestTemplate");
    }

    [Fact]
    public async Task NullEmailAttachmentProvider_ShouldReturnEmpty()
    {
        var provider = new NullEmailAttachmentProvider();

        var result = await provider.GetAttachmentsAsync("type", "id");

        result.Should().BeEmpty();
    }

    // ─── EmailCategory Metadata Tests ─────────────────────────────────

    [Fact]
    public void EmailCategoryMetadata_MandatoryCategories_ShouldBeCorrect()
    {
        EmailCategoryMetadata.IsMandatory(EmailCategory.Security).Should().BeTrue();
        EmailCategoryMetadata.IsMandatory(EmailCategory.Authentication).Should().BeTrue();
        EmailCategoryMetadata.IsMandatory(EmailCategory.OTP).Should().BeTrue();
        EmailCategoryMetadata.IsMandatory(EmailCategory.PasswordReset).Should().BeTrue();
        EmailCategoryMetadata.IsMandatory(EmailCategory.VerifyEmail).Should().BeTrue();
    }

    [Fact]
    public void EmailCategoryMetadata_OptionalCategories_ShouldBeCorrect()
    {
        EmailCategoryMetadata.IsOptional(EmailCategory.Conversation).Should().BeTrue();
        EmailCategoryMetadata.IsOptional(EmailCategory.Participation).Should().BeTrue();
        EmailCategoryMetadata.IsOptional(EmailCategory.Project).Should().BeTrue();
        EmailCategoryMetadata.IsOptional(EmailCategory.Finance).Should().BeTrue();
        EmailCategoryMetadata.IsOptional(EmailCategory.Marketing).Should().BeTrue();
        EmailCategoryMetadata.IsOptional(EmailCategory.System).Should().BeTrue();
    }

    [Fact]
    public void EmailCategoryMetadata_MandatoryShouldNotBeOptional()
    {
        EmailCategoryMetadata.IsOptional(EmailCategory.Security).Should().BeFalse();
        EmailCategoryMetadata.IsOptional(EmailCategory.Authentication).Should().BeFalse();
    }

    // ─── EmailPriority Enum Tests ─────────────────────────────────────

    [Fact]
    public void EmailPriority_ShouldHaveCorrectOrder()
    {
        ((int)EmailPriority.Normal).Should().BeLessThan((int)EmailPriority.High);
        ((int)EmailPriority.High).Should().BeLessThan((int)EmailPriority.Critical);
    }

    [Fact]
    public void EmailOutbox_DefaultPriority_ShouldBeNormal()
    {
        var outbox = new EmailOutbox();
        outbox.Priority.Should().Be(EmailPriority.Normal);
    }

    [Fact]
    public void EmailOutbox_DefaultCategory_ShouldBeSystem()
    {
        var outbox = new EmailOutbox();
        outbox.Category.Should().Be(EmailCategory.System.ToString());
    }

    [Fact]
    public async Task UnifiedRenderer_Render_EN_ShouldContainEnglishLabels()
    {
        var logger = NullLogger<UnifiedEmailTemplateRenderer>();
        var renderer = new UnifiedEmailTemplateRenderer(logger);

        var model = new EmailTemplateModel
        {
            StatusLabel = "Notification",
            Title = "Platform Update",
            Description = "All systems are operating normally.",
            CardLabel = "Summary",
            CardValue = "Completed successfully.",
            CtaText = "View Dashboard",
            CtaUrl = "https://example.com/dashboard",
            PlainTextFallback = "Plain text fallback content.",
            Preheader = "FOPX One — Platform Update",
            Language = "en"
        };

        var result = await renderer.RenderAsync("test", model);

        result.Subject.Should().Be("Platform Update");
        result.HtmlBody.Should().Contain("Notification");
        result.HtmlBody.Should().Contain("Need help?");
        result.HtmlBody.Should().Contain("Contact us at");
        result.HtmlBody.Should().Contain("Documentation");
        result.HtmlBody.Should().Contain("Privacy Policy");
        result.HtmlBody.Should().Contain("Email Preferences");
        result.HtmlBody.Should().Contain("All rights reserved.");
        result.PlainTextBody.Should().Be("Plain text fallback content.");
    }

    [Fact]
    public async Task UnifiedRenderer_Render_AR_ShouldContainArabicLabels()
    {
        var logger = NullLogger<UnifiedEmailTemplateRenderer>();
        var renderer = new UnifiedEmailTemplateRenderer(logger);

        var model = new EmailTemplateModel
        {
            StatusLabel = "إشعار",
            Title = "تحديث المنصة",
            Description = "جميع الأنظمة تعمل بشكل طبيعي.",
            CardLabel = "ملخص",
            CardValue = "اكتمل بنجاح.",
            CtaText = "عرض لوحة التحكم",
            CtaUrl = "https://example.com/dashboard",
            PlainTextFallback = "نص احتياطي.",
            Preheader = "FOPX One — تحديث",
            Language = "ar"
        };

        var result = await renderer.RenderAsync("test", model);

        result.HtmlBody.Should().Contain("إشعار");
        result.HtmlBody.Should().Contain("هل تحتاج مساعدة؟");
        result.HtmlBody.Should().Contain("اتصل بنا على");
        result.HtmlBody.Should().Contain("الوثائق");
        result.HtmlBody.Should().Contain("سياسة الخصوصية");
        result.HtmlBody.Should().Contain("تفضيلات البريد");
        result.HtmlBody.Should().Contain("جميع الحقوق محفوظة");
    }

    [Fact]
    public async Task UnifiedRenderer_Render_EN_ShouldUseTrimmedRecipientNameAndBrandTagline()
    {
        var renderer = new UnifiedEmailTemplateRenderer(NullLogger<UnifiedEmailTemplateRenderer>());
        var model = CreateRendererModel("en");
        model.RecipientDisplayName = "  Shady Ahmed  ";

        var result = await renderer.RenderAsync("welcome", model);

        result.HtmlBody.Should().Contain("Hello, Shady Ahmed");
        result.HtmlBody.Should().Contain("Founder • Opportunity • Partner");
        result.HtmlBody.Should().NotContain("Investment Platform");
    }

    [Fact]
    public async Task UnifiedRenderer_Render_AR_ShouldUseRecipientNameAndBrandTagline()
    {
        var renderer = new UnifiedEmailTemplateRenderer(NullLogger<UnifiedEmailTemplateRenderer>());
        var model = CreateRendererModel("ar");
        model.RecipientDisplayName = "شادي أحمد";

        var result = await renderer.RenderAsync("welcome", model);

        result.HtmlBody.Should().Contain("مرحبًا، شادي أحمد");
        result.HtmlBody.Should().Contain("Founder • Opportunity • Partner");
        result.HtmlBody.Should().NotContain("Investment Platform");
    }

    [Theory]
    [InlineData("en", "Hello")]
    [InlineData("ar", "مرحبًا")]
    public async Task UnifiedRenderer_Render_ShouldUseCleanGenericGreetingWhenNameMissing(string language, string greeting)
    {
        var renderer = new UnifiedEmailTemplateRenderer(NullLogger<UnifiedEmailTemplateRenderer>());
        var model = CreateRendererModel(language);
        model.RecipientDisplayName = "   ";

        var result = await renderer.RenderAsync("welcome", model);

        result.HtmlBody.Should().Contain($">{greeting}</p>");
        result.HtmlBody.Should().NotContain("Hello ,");
        result.HtmlBody.Should().NotContain("مرحبًا،</p>");
    }

    [Fact]
    public async Task UnifiedRenderer_Render_Otp_ShouldAppearOnlyInVerificationCodeSection()
    {
        const string otp = "739184";
        var renderer = new UnifiedEmailTemplateRenderer(NullLogger<UnifiedEmailTemplateRenderer>());
        var model = CreateRendererModel("en");
        model.CardLabel = "Verification code";
        model.CardValue = otp;
        model.PlainTextFallback = "Use the verification-code section above.";
        model.Preheader = "Verify your email";

        var result = await renderer.RenderAsync("email-verification-otp", model);

        result.HtmlBody.Should().Contain("data-email-section=\"verification-code\"");
        result.HtmlBody.Split(otp).Should().HaveCount(2);
        var sectionStart = result.HtmlBody.IndexOf("data-email-section=\"verification-code\"", StringComparison.Ordinal);
        var otpPosition = result.HtmlBody.IndexOf(otp, StringComparison.Ordinal);
        otpPosition.Should().BeGreaterThan(sectionStart);
        result.PlainTextBody.Should().NotContain(otp);
    }

    private static EmailTemplateModel CreateRendererModel(string language) => new()
    {
        StatusLabel = "Test",
        Title = "Test email",
        Description = "Test description.",
        CardLabel = "Information",
        CardValue = "Value",
        CtaText = "Continue",
        PlainTextFallback = "Plain text.",
        Language = language
    };

    [Fact]
    public async Task UnifiedRenderer_Render_ShouldRespectRTLDir()
    {
        var logger = NullLogger<UnifiedEmailTemplateRenderer>();
        var renderer = new UnifiedEmailTemplateRenderer(logger);

        var enModel = new EmailTemplateModel
        {
            StatusLabel = "Test", Title = "T", Description = "D",
            CardLabel = "C", CardValue = "V", CtaText = "Go",
            CtaUrl = "#", PlainTextFallback = "F", Language = "en"
        };
        var arModel = new EmailTemplateModel
        {
            StatusLabel = "اختبار", Title = "ع", Description = "و",
            CardLabel = "ب", CardValue = "ق", CtaText = "انطلق",
            CtaUrl = "#", PlainTextFallback = "ن", Language = "ar"
        };

        var enResult = await renderer.RenderAsync("test", enModel);
        var arResult = await renderer.RenderAsync("test", arModel);

        enResult.HtmlBody.Should().MatchRegex(@"<html lang=""en"" dir=""ltr"">");
        arResult.HtmlBody.Should().MatchRegex(@"<html lang=""ar"" dir=""rtl"">");
    }

    [Fact]
    public async Task UnifiedRenderer_Render_ShouldEscapeHtml()
    {
        var logger = NullLogger<UnifiedEmailTemplateRenderer>();
        var renderer = new UnifiedEmailTemplateRenderer(logger);

        var model = new EmailTemplateModel
        {
            StatusLabel = "<script>alert('xss')</script>",
            Title = "<b>Bold</b>",
            Description = "\"quotes\" & <tags>",
            CardLabel = "a", CardValue = "b",
            CtaText = "Go", CtaUrl = "#",
            PlainTextFallback = "safe", Language = "en"
        };

        var result = await renderer.RenderAsync("test", model);

        result.HtmlBody.Should().Contain("&lt;script&gt;");
        result.HtmlBody.Should().Contain("&lt;b&gt;Bold&lt;/b&gt;");
        result.HtmlBody.Should().Contain("&quot;quotes&quot;");
        result.HtmlBody.Should().Contain("&amp; &lt;tags&gt;");
        result.HtmlBody.Should().NotContain("<script>");
        result.HtmlBody.Should().NotContain("<b>");
    }

    [Fact]
    public async Task UnifiedRenderer_Render_ShouldThrowOnMissingRequiredFields()
    {
        var logger = NullLogger<UnifiedEmailTemplateRenderer>();
        var renderer = new UnifiedEmailTemplateRenderer(logger);

        var model = new EmailTemplateModel
        {
            StatusLabel = "",
            Title = "",
            Description = "",
            CardLabel = "",
            CardValue = "",
            CtaText = "",
            PlainTextFallback = "",
            Language = "en"
        };

        var act = () => renderer.RenderAsync("test", model);

        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("*TITLE*DESCRIPTION*STATUS_LABEL*CARD_LABEL*CARD_VALUE*CTA_TEXT*PLAIN_TEXT_FALLBACK*");
    }

    [Fact]
    public async Task UnifiedRenderer_Render_ShouldIncludePlainTextFallback()
    {
        var logger = NullLogger<UnifiedEmailTemplateRenderer>();
        var renderer = new UnifiedEmailTemplateRenderer(logger);

        var model = new EmailTemplateModel
        {
            StatusLabel = "Info", Title = "Note", Description = "Details.",
            CardLabel = "L", CardValue = "V", CtaText = "OK",
            CtaUrl = "#", PlainTextFallback = "This is the plain text fallback.",
            Language = "en"
        };

        var result = await renderer.RenderAsync("test", model);

        result.PlainTextBody.Should().Be("This is the plain text fallback.");
        result.HtmlBody.Should().Contain("This is the plain text fallback.");
    }

    [Fact]
    public async Task UnifiedRenderer_Render_WrongModelType_ShouldThrow()
    {
        var logger = NullLogger<UnifiedEmailTemplateRenderer>();
        var renderer = new UnifiedEmailTemplateRenderer(logger);

        var act = async () => await renderer.RenderAsync("test", new { Fake = true });

        await act.Should().ThrowAsync<ArgumentException>()
            .WithMessage("*EmailTemplateModel*");
    }
}

public sealed class FakeHttpMessageHandler : DelegatingHandler
{
    private readonly HttpResponseMessage _response;

    public FakeHttpMessageHandler(HttpResponseMessage response)
    {
        _response = response;
    }

    protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
    {
        return Task.FromResult(_response);
    }
}
