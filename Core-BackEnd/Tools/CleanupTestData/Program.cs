using Investa.Domain.Entities;
using Investa.Domain.Entities.Chat;
using Investa.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

static string? FindSettingsPath()
{
    var dir = new DirectoryInfo(Directory.GetCurrentDirectory());
    while (dir != null)
    {
        var candidate = Path.Combine(dir.FullName, "Investa.API", "appsettings.json");
        if (File.Exists(candidate)) return candidate;
        dir = dir.Parent;
    }
    return null;
}

var settingsPath = FindSettingsPath();
if (settingsPath == null)
{
    Console.WriteLine("Could not find Investa.API/appsettings.json.");
    return;
}

var config = new ConfigurationBuilder()
    .AddJsonFile(settingsPath, optional: false, reloadOnChange: false)
    .Build();

var connectionString = config.GetConnectionString("DefaultConnection");
if (string.IsNullOrWhiteSpace(connectionString))
{
    Console.WriteLine("DefaultConnection not found in appsettings.json.");
    return;
}

var services = new ServiceCollection();
services.AddLogging(b => b.AddConsole());
services.AddDbContext<ApplicationDbContext>(o => o.UseSqlServer(connectionString));

await using var serviceProvider = services.BuildServiceProvider();
await using var scope = serviceProvider.CreateAsyncScope();

var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
var logger = scope.ServiceProvider.GetRequiredService<ILoggerFactory>().CreateLogger("CleanupTestData");

Console.WriteLine("Starting cleanup of investments, requests, notifications, and participants...");

try
{
    // Remove in dependency order (children first)
    
    // 1. Remove investment participants
    var participantCount = await db.InvestmentParticipants.CountAsync();
    if (participantCount > 0)
    {
        Console.WriteLine($"Removing {participantCount} investment participants...");
        db.InvestmentParticipants.RemoveRange(await db.InvestmentParticipants.ToListAsync());
        await db.SaveChangesAsync();
        Console.WriteLine("Investment participants removed.");
    }

    // 2. Remove investment contracts and versions
    var contractVersionCount = await db.InvestmentContractVersions.CountAsync();
    if (contractVersionCount > 0)
    {
        Console.WriteLine($"Removing {contractVersionCount} investment contract versions...");
        db.InvestmentContractVersions.RemoveRange(await db.InvestmentContractVersions.ToListAsync());
        await db.SaveChangesAsync();
        Console.WriteLine("Investment contract versions removed.");
    }

    var contractEventCount = await db.ContractEvents.CountAsync();
    if (contractEventCount > 0)
    {
        Console.WriteLine($"Removing {contractEventCount} contract events...");
        db.ContractEvents.RemoveRange(await db.ContractEvents.ToListAsync());
        await db.SaveChangesAsync();
        Console.WriteLine("Contract events removed.");
    }

    var contractCount = await db.InvestmentContracts.CountAsync();
    if (contractCount > 0)
    {
        Console.WriteLine($"Removing {contractCount} investment contracts...");
        db.InvestmentContracts.RemoveRange(await db.InvestmentContracts.ToListAsync());
        await db.SaveChangesAsync();
        Console.WriteLine("Investment contracts removed.");
    }

    // 3. Remove investment requests
    var investmentRequestCount = await db.InvestmentRequests.CountAsync();
    if (investmentRequestCount > 0)
    {
        Console.WriteLine($"Removing {investmentRequestCount} investment requests...");
        db.InvestmentRequests.RemoveRange(await db.InvestmentRequests.ToListAsync());
        await db.SaveChangesAsync();
        Console.WriteLine("Investment requests removed.");
    }

    // 4. Remove opportunity join requests
    var joinRequestCount = await db.OpportunityJoinRequests.CountAsync();
    if (joinRequestCount > 0)
    {
        Console.WriteLine($"Removing {joinRequestCount} opportunity join requests...");
        db.OpportunityJoinRequests.RemoveRange(await db.OpportunityJoinRequests.ToListAsync());
        await db.SaveChangesAsync();
        Console.WriteLine("Opportunity join requests removed.");
    }

    // 5. Remove conversation participants
    var conversationParticipantCount = await db.ConversationParticipants.CountAsync();
    if (conversationParticipantCount > 0)
    {
        Console.WriteLine($"Removing {conversationParticipantCount} conversation participants...");
        db.ConversationParticipants.RemoveRange(await db.ConversationParticipants.ToListAsync());
        await db.SaveChangesAsync();
        Console.WriteLine("Conversation participants removed.");
    }

    // 6. Remove conversation requests
    var conversationRequestCount = await db.ConversationRequests.CountAsync();
    if (conversationRequestCount > 0)
    {
        Console.WriteLine($"Removing {conversationRequestCount} conversation requests...");
        db.ConversationRequests.RemoveRange(await db.ConversationRequests.ToListAsync());
        await db.SaveChangesAsync();
        Console.WriteLine("Conversation requests removed.");
    }

    // 7. Remove negotiations and offers
    var negotiationOfferLegCount = await db.NegotiationOfferLegs.CountAsync();
    if (negotiationOfferLegCount > 0)
    {
        Console.WriteLine($"Removing {negotiationOfferLegCount} negotiation offer legs...");
        db.NegotiationOfferLegs.RemoveRange(await db.NegotiationOfferLegs.ToListAsync());
        await db.SaveChangesAsync();
        Console.WriteLine("Negotiation offer legs removed.");
    }

    var negotiationOfferCount = await db.NegotiationOffers.CountAsync();
    if (negotiationOfferCount > 0)
    {
        Console.WriteLine($"Removing {negotiationOfferCount} negotiation offers...");
        db.NegotiationOffers.RemoveRange(await db.NegotiationOffers.ToListAsync());
        await db.SaveChangesAsync();
        Console.WriteLine("Negotiation offers removed.");
    }

    // 8. Remove notifications
    var userNotificationCount = await db.UserNotifications.CountAsync();
    if (userNotificationCount > 0)
    {
        Console.WriteLine($"Removing {userNotificationCount} user notifications...");
        db.UserNotifications.RemoveRange(await db.UserNotifications.ToListAsync());
        await db.SaveChangesAsync();
        Console.WriteLine("User notifications removed.");
    }

    var notificationCount = await db.Notifications.CountAsync();
    if (notificationCount > 0)
    {
        Console.WriteLine($"Removing {notificationCount} notifications...");
        db.Notifications.RemoveRange(await db.Notifications.ToListAsync());
        await db.SaveChangesAsync();
        Console.WriteLine("Notifications removed.");
    }

    // 9. Remove investments
    var investmentCount = await db.Investments.CountAsync();
    if (investmentCount > 0)
    {
        Console.WriteLine($"Removing {investmentCount} investments...");
        db.Investments.RemoveRange(await db.Investments.ToListAsync());
        await db.SaveChangesAsync();
        Console.WriteLine("Investments removed.");
    }

    // 10. Remove opportunities
    var opportunityCount = await db.Opportunities.CountAsync();
    if (opportunityCount > 0)
    {
        Console.WriteLine($"Removing {opportunityCount} opportunities...");
        db.Opportunities.RemoveRange(await db.Opportunities.ToListAsync());
        await db.SaveChangesAsync();
        Console.WriteLine("Opportunities removed.");
    }

    Console.WriteLine("\n✓ Cleanup completed successfully!");
    Console.WriteLine("All investments, requests, notifications, and participants have been removed.");
}
catch (Exception ex)
{
    Console.WriteLine($"\n✗ Error during cleanup: {ex.Message}");
    logger.LogError(ex, "Cleanup failed");
    throw;
}
