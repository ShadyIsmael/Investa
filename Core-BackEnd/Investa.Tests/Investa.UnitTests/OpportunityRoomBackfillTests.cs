using System;
using System.Linq;
using System.Threading.Tasks;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Xunit;

namespace Investa.UnitTests;

public class OpportunityRoomBackfillTests
{
    [Fact]
    public async Task BackfillAsync_DoesNotCreateDocuments()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<Investa.Infrastructure.Persistence.ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        using var context = new Investa.Infrastructure.Persistence.ApplicationDbContext(options);
        
        var logger = new MockLogger<Investa.Infrastructure.Services.OpportunityRoomDemoDataBackfillService>();
        var service = new Investa.Infrastructure.Services.OpportunityRoomDemoDataBackfillService(context, logger);

        // Create a test opportunity
        var opportunity = new Investa.Domain.Entities.Opportunity
        {
            Id = 1,
            FounderId = Guid.NewGuid(),
            Title = "Test Opportunity",
            Status = Investa.Domain.Entities.Enums.OpportunityStatus.Published,
            CreatedAt = DateTime.UtcNow
        };
        context.Opportunities.Add(opportunity);
        await context.SaveChangesAsync();

        // Act
        var result = await service.BackfillAsync();

        // Assert
        result.Scanned.Should().Be(1, "One opportunity should be scanned");
        
        var documents = await context.OpportunityDocuments.Where(d => d.OpportunityId == opportunity.Id).ToListAsync();
        documents.Should().BeEmpty("No documents should exist in the database after backfill");
    }

    [Fact]
    public async Task BackfillAsync_StillCreatesTimelineAndMedia()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<Investa.Infrastructure.Persistence.ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        using var context = new Investa.Infrastructure.Persistence.ApplicationDbContext(options);
        
        var logger = new MockLogger<Investa.Infrastructure.Services.OpportunityRoomDemoDataBackfillService>();
        var service = new Investa.Infrastructure.Services.OpportunityRoomDemoDataBackfillService(context, logger);

        // Create a test opportunity
        var opportunity = new Investa.Domain.Entities.Opportunity
        {
            Id = 2,
            FounderId = Guid.NewGuid(),
            Title = "Test Opportunity 2",
            Status = Investa.Domain.Entities.Enums.OpportunityStatus.Published,
            CreatedAt = DateTime.UtcNow
        };
        context.Opportunities.Add(opportunity);
        await context.SaveChangesAsync();

        // Act
        var result = await service.BackfillAsync();

        // Assert
        result.Scanned.Should().Be(1, "One opportunity should be scanned");
        result.TimelineEventsCreated.Should().BeGreaterThan(0, "Timeline events should still be created");
        result.MediaCreated.Should().BeGreaterThan(0, "Media should still be created");
        
        var documents = await context.OpportunityDocuments.Where(d => d.OpportunityId == opportunity.Id).ToListAsync();
        documents.Should().BeEmpty("No documents should exist");
        
        var timelineEvents = await context.OpportunityEvents.Where(e => e.OpportunityId == opportunity.Id).ToListAsync();
        timelineEvents.Should().NotBeEmpty("Timeline events should exist");
        
        var media = await context.OpportunityMedia.Where(m => m.OpportunityId == opportunity.Id).ToListAsync();
        media.Should().NotBeEmpty("Media should exist");
    }

    private class MockLogger<T> : ILogger<T>
    {
        public IDisposable? BeginScope<TState>(TState state) where TState : notnull => null;
        public bool IsEnabled(LogLevel logLevel) => true;
        public void Log<TState>(LogLevel logLevel, EventId eventId, TState state, Exception? exception, Func<TState, Exception?, string> formatter)
        {
            // Suppress logging in tests
        }
    }
}
