using FluentAssertions;
using Investa.Application.DTOs.Trust;
using Investa.Application.Interfaces;
using Investa.Application.Services;
using Investa.Domain.Entities;
using Microsoft.Extensions.Logging.Abstractions;
using Moq;
using Xunit;

namespace Investa.UnitTests;

public sealed class ReputationServiceTests
{
    private readonly Mock<IUnitOfWork> _uow = new();
    private readonly Mock<IRepository<ReputationRule>> _rules = new();
    private readonly Mock<IRepository<ReputationTransaction>> _transactions = new();
    private readonly Mock<IRepository<AuthUser>> _users = new();
    private readonly Mock<IRepository<Client>> _clients = new();
    private readonly ReputationService _service;

    public ReputationServiceTests()
    {
        _uow.Setup(x => x.Repository<ReputationRule>()).Returns(_rules.Object);
        _uow.Setup(x => x.Repository<ReputationTransaction>()).Returns(_transactions.Object);
        _uow.Setup(x => x.Repository<AuthUser>()).Returns(_users.Object);
        _uow.Setup(x => x.Repository<Client>()).Returns(_clients.Object);

        _service = new ReputationService(_uow.Object, NullLogger<ReputationService>.Instance);
    }

    [Theory]
    [InlineData(0, "New Member")]
    [InlineData(3499, "New Member")]
    [InlineData(3500, "Rising Member")]
    [InlineData(6499, "Rising Member")]
    [InlineData(6500, "Trusted Member")]
    [InlineData(8499, "Trusted Member")]
    [InlineData(8500, "Elite Member")]
    [InlineData(10000, "Elite Member")]
    public void GetReputationLevel_ReturnsCorrectLevel(int score, string expected)
    {
        var level = ReputationService.GetReputationLevel(score);
        level.Should().Be(expected);
    }

    [Fact]
    public async Task ApplyActivityAsync_WhenRuleFound_UpdatesAllScoreFields()
    {
        var userId = Guid.NewGuid();
        var user = new AuthUser
        {
            Id = userId,
            Name = "Test User",
            ReputationScore = 0,
            ActivityScore = 0,
            CredibilityScore = 0,
            ReputationLevel = "New Member"
        };
        var rule = new ReputationRule
        {
            Id = 1,
            RuleCode = "AcceptConversationRequest",
            ActivityCode = "AcceptConversationRequest",
            Description = "Test rule",
            Points = 10,
            IsActive = true,
            IsEnabled = true,
            CanRepeat = false,
            MaximumOccurrences = 1
        };

        _rules.Setup(x => x.GetSingleAsync(
                It.IsAny<System.Linq.Expressions.Expression<Func<ReputationRule, bool>>>(),
                It.IsAny<System.Linq.Expressions.Expression<Func<ReputationRule, object>>[]>()))
            .ReturnsAsync(rule);

        _transactions.Setup(x => x.FindAsync(
                It.IsAny<System.Linq.Expressions.Expression<Func<ReputationTransaction, bool>>>()))
            .ReturnsAsync(new List<ReputationTransaction>());

        _users.Setup(x => x.GetByIdAsync(userId)).ReturnsAsync(user);

        _clients.Setup(x => x.FindAsync(
                It.IsAny<System.Linq.Expressions.Expression<Func<Client, bool>>>()))
            .ReturnsAsync(new List<Client>());

        await _service.ApplyActivityAsync(userId, "AcceptConversationRequest", "ConversationRequest", "req-1");

        user.ReputationScore.Should().Be(10);
        user.ActivityScore.Should().Be(10);
        user.CredibilityScore.Should().Be(10);
        user.ReputationLevel.Should().Be("New Member");

        _transactions.Verify(x => x.AddAsync(It.Is<ReputationTransaction>(t =>
            t.UserId == userId && t.Points == 10 && t.ActivityCode == "AcceptConversationRequest")), Times.Once);
        _uow.Verify(x => x.SaveChangesAsync(), Times.Once);
    }

    [Fact]
    public async Task ApplyActivityAsync_DuplicateReference_Skips()
    {
        var userId = Guid.NewGuid();
        var user = new AuthUser
        {
            Id = userId,
            Name = "Test User",
            ReputationScore = 0,
            ActivityScore = 0,
            CredibilityScore = 0,
            ReputationLevel = "New Member"
        };
        var rule = new ReputationRule
        {
            Id = 1,
            RuleCode = "AcceptConversationRequest",
            ActivityCode = "AcceptConversationRequest",
            Description = "Test rule",
            Points = 10,
            IsActive = true,
            IsEnabled = true
        };
        var existingTxn = new ReputationTransaction
        {
            Id = 1,
            UserId = userId,
            ActivityCode = "AcceptConversationRequest",
            ReferenceType = "ConversationRequest",
            ReferenceId = "req-1",
            Points = 10
        };

        _rules.Setup(x => x.GetSingleAsync(
                It.IsAny<System.Linq.Expressions.Expression<Func<ReputationRule, bool>>>(),
                It.IsAny<System.Linq.Expressions.Expression<Func<ReputationRule, object>>[]>()))
            .ReturnsAsync(rule);

        _transactions.Setup(x => x.FindAsync(
                It.IsAny<System.Linq.Expressions.Expression<Func<ReputationTransaction, bool>>>()))
            .ReturnsAsync(new List<ReputationTransaction> { existingTxn });

        _users.Setup(x => x.GetByIdAsync(userId)).ReturnsAsync(user);

        await _service.ApplyActivityAsync(userId, "AcceptConversationRequest", "ConversationRequest", "req-1");

        user.ReputationScore.Should().Be(0);
        _transactions.Verify(x => x.AddAsync(It.IsAny<ReputationTransaction>()), Times.Never);
        _uow.Verify(x => x.SaveChangesAsync(), Times.Never);
    }

    [Fact]
    public async Task ApplyActivityAsync_AcceptConversationRequest_Awards10Points()
    {
        var userId = Guid.NewGuid();
        var user = new AuthUser
        {
            Id = userId,
            Name = "Founder",
            ReputationScore = 0,
            ActivityScore = 0,
            CredibilityScore = 0,
            ReputationLevel = "New Member"
        };
        var rule = new ReputationRule
        {
            Id = 101,
            RuleCode = "AcceptConversationRequest",
            ActivityCode = "AcceptConversationRequest",
            Description = "Accept a conversation request",
            Points = 10,
            IsActive = true,
            IsEnabled = true,
            CanRepeat = false,
            MaximumOccurrences = 1
        };

        _rules.Setup(x => x.GetSingleAsync(
                It.IsAny<System.Linq.Expressions.Expression<Func<ReputationRule, bool>>>(),
                It.IsAny<System.Linq.Expressions.Expression<Func<ReputationRule, object>>[]>()))
            .ReturnsAsync(rule);

        _transactions.Setup(x => x.FindAsync(
                It.IsAny<System.Linq.Expressions.Expression<Func<ReputationTransaction, bool>>>()))
            .ReturnsAsync(new List<ReputationTransaction>());

        _users.Setup(x => x.GetByIdAsync(userId)).ReturnsAsync(user);

        _clients.Setup(x => x.FindAsync(
                It.IsAny<System.Linq.Expressions.Expression<Func<Client, bool>>>()))
            .ReturnsAsync(new List<Client>());

        await _service.ApplyActivityAsync(userId, "AcceptConversationRequest", "ConversationRequest", "req-1");

        user.ReputationScore.Should().Be(10);
        user.ActivityScore.Should().Be(10);
        user.CredibilityScore.Should().Be(10);

        _transactions.Verify(x => x.AddAsync(It.Is<ReputationTransaction>(t =>
            t.Points == 10 && t.ActivityCode == "AcceptConversationRequest")), Times.Once);
        _uow.Verify(x => x.SaveChangesAsync(), Times.Once);
    }

    [Fact]
    public async Task ApplyActivityAsync_SendMessageAfterAcceptance_FirstMessage_Awards15Points()
    {
        var userId = Guid.NewGuid();
        var user = new AuthUser
        {
            Id = userId,
            Name = "Sender",
            ReputationScore = 0,
            ActivityScore = 0,
            CredibilityScore = 0,
            ReputationLevel = "New Member"
        };
        var rule = new ReputationRule
        {
            Id = 102,
            RuleCode = "SendMessageAfterAcceptance",
            ActivityCode = "SendMessageAfterAcceptance",
            Description = "Send first message after acceptance",
            Points = 15,
            IsActive = true,
            IsEnabled = true,
            CanRepeat = false,
            MaximumOccurrences = 1
        };

        _rules.Setup(x => x.GetSingleAsync(
                It.IsAny<System.Linq.Expressions.Expression<Func<ReputationRule, bool>>>(),
                It.IsAny<System.Linq.Expressions.Expression<Func<ReputationRule, object>>[]>()))
            .ReturnsAsync(rule);

        _transactions.Setup(x => x.FindAsync(
                It.IsAny<System.Linq.Expressions.Expression<Func<ReputationTransaction, bool>>>()))
            .ReturnsAsync(new List<ReputationTransaction>());

        _users.Setup(x => x.GetByIdAsync(userId)).ReturnsAsync(user);

        _clients.Setup(x => x.FindAsync(
                It.IsAny<System.Linq.Expressions.Expression<Func<Client, bool>>>()))
            .ReturnsAsync(new List<Client>());

        await _service.ApplyActivityAsync(userId, "SendMessageAfterAcceptance", "Conversation", "conv-1");

        user.ReputationScore.Should().Be(15);
        _transactions.Verify(x => x.AddAsync(It.Is<ReputationTransaction>(t =>
            t.Points == 15 && t.ActivityCode == "SendMessageAfterAcceptance")), Times.Once);
        _uow.Verify(x => x.SaveChangesAsync(), Times.Once);
    }

    [Fact]
    public async Task ApplyActivityAsync_SendMessageAfterAcceptance_SecondMessage_NoPoints()
    {
        var userId = Guid.NewGuid();
        var user = new AuthUser
        {
            Id = userId,
            Name = "Sender",
            ReputationScore = 0,
            ActivityScore = 0,
            CredibilityScore = 0,
            ReputationLevel = "New Member"
        };
        var rule = new ReputationRule
        {
            Id = 102,
            RuleCode = "SendMessageAfterAcceptance",
            ActivityCode = "SendMessageAfterAcceptance",
            Description = "Send first message after acceptance",
            Points = 15,
            IsActive = true,
            IsEnabled = true,
            CanRepeat = false,
            MaximumOccurrences = 1
        };
        var existingTxn = new ReputationTransaction
        {
            Id = 1,
            UserId = userId,
            ReputationRuleId = 102,
            ActivityCode = "SendMessageAfterAcceptance",
            ReferenceType = "Conversation",
            ReferenceId = "conv-1",
            Points = 15
        };

        _rules.Setup(x => x.GetSingleAsync(
                It.IsAny<System.Linq.Expressions.Expression<Func<ReputationRule, bool>>>(),
                It.IsAny<System.Linq.Expressions.Expression<Func<ReputationRule, object>>[]>()))
            .ReturnsAsync(rule);

        _transactions.Setup(x => x.FindAsync(
                It.IsAny<System.Linq.Expressions.Expression<Func<ReputationTransaction, bool>>>()))
            .ReturnsAsync(new List<ReputationTransaction> { existingTxn });

        _users.Setup(x => x.GetByIdAsync(userId)).ReturnsAsync(user);

        await _service.ApplyActivityAsync(userId, "SendMessageAfterAcceptance", "Conversation", "conv-1");

        user.ReputationScore.Should().Be(0);
        _transactions.Verify(x => x.AddAsync(It.IsAny<ReputationTransaction>()), Times.Never);
        _uow.Verify(x => x.SaveChangesAsync(), Times.Never);
    }

    [Fact]
    public async Task ApplyActivityAsync_WhenRuleNotFound_SkipsSilently()
    {
        var userId = Guid.NewGuid();

        _rules.Setup(x => x.GetSingleAsync(
                It.IsAny<System.Linq.Expressions.Expression<Func<ReputationRule, bool>>>(),
                It.IsAny<System.Linq.Expressions.Expression<Func<ReputationRule, object>>[]>()))
            .ReturnsAsync((ReputationRule?)null);

        await _service.ApplyActivityAsync(userId, "NonExistentCode", "ConversationRequest", "req-1");

        _transactions.Verify(x => x.AddAsync(It.IsAny<ReputationTransaction>()), Times.Never);
        _uow.Verify(x => x.SaveChangesAsync(), Times.Never);
    }

    [Fact]
    public async Task GetReputationLevel_EliteMember_AtOrAbove8500()
    {
        ReputationService.GetReputationLevel(8500).Should().Be("Elite Member");
        ReputationService.GetReputationLevel(10000).Should().Be("Elite Member");
    }

    [Fact]
    public async Task GetReputationLevel_TrustedMember_Between6500And8499()
    {
        ReputationService.GetReputationLevel(6500).Should().Be("Trusted Member");
        ReputationService.GetReputationLevel(8499).Should().Be("Trusted Member");
    }

    [Fact]
    public async Task GetReputationLevel_RisingMember_Between3500And6499()
    {
        ReputationService.GetReputationLevel(3500).Should().Be("Rising Member");
        ReputationService.GetReputationLevel(6499).Should().Be("Rising Member");
    }

    [Fact]
    public async Task GetReputationLevel_NewMember_Below3500()
    {
        ReputationService.GetReputationLevel(0).Should().Be("New Member");
        ReputationService.GetReputationLevel(3499).Should().Be("New Member");
    }
}
