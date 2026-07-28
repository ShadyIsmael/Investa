using Investa.Application.DTOs;
using Investa.Application.Interfaces;
using Investa.Domain.Entities;
using Investa.Domain.Entities.Chat;
using Investa.Domain.Entities.Enums;
using Microsoft.Extensions.Logging.Abstractions;
using Moq;
using Xunit;

namespace Investa.UnitTests;

public sealed class NegotiationRealtimeMessageTests
{
    private readonly Guid _senderId = Guid.NewGuid();
    private readonly Guid _recipientId = Guid.NewGuid();
    private readonly Guid _conversationId = Guid.NewGuid();
    private readonly Guid _clientMessageId = Guid.NewGuid();
    private readonly Mock<IUnitOfWork> _uow = new();
    private readonly Mock<IRepository<AuthUser>> _users = new();
    private readonly Mock<IRepository<Conversation>> _conversations = new();
    private readonly Mock<IRepository<ConversationParticipant>> _participants = new();
    private readonly Mock<IRepository<ChatMessage>> _messages = new();
    private readonly Mock<IRealtimeEventPublisher> _realtime = new();
    private readonly Mock<IUserNotificationService> _notifications = new();
    private readonly Investa.Application.Services.NegotiationService _service;

    public NegotiationRealtimeMessageTests()
    {
        _uow.Setup(x => x.Repository<AuthUser>()).Returns(_users.Object);
        _uow.Setup(x => x.Repository<Conversation>()).Returns(_conversations.Object);
        _uow.Setup(x => x.Repository<ConversationParticipant>()).Returns(_participants.Object);
        _uow.Setup(x => x.Repository<ChatMessage>()).Returns(_messages.Object);
        _uow.Setup(x => x.SaveChangesAsync()).ReturnsAsync(1);
        _messages.Setup(x => x.GetByIdAsync(_clientMessageId)).ReturnsAsync((ChatMessage?)null);
        _messages.Setup(x => x.AddAsync(It.IsAny<ChatMessage>())).Returns(Task.CompletedTask);
        _conversations.Setup(x => x.UpdateAsync(It.IsAny<Conversation>())).Returns(Task.CompletedTask);
        _users.Setup(x => x.GetByIdAsync(_senderId)).ReturnsAsync(new AuthUser
        {
            Id = _senderId,
            Name = "Sender",
            UserType = UserType.Client
        });
        _conversations.Setup(x => x.GetSingleAsync(
                It.IsAny<System.Linq.Expressions.Expression<Func<Conversation, bool>>>(),
                It.IsAny<System.Linq.Expressions.Expression<Func<Conversation, object>>[]>()))
            .ReturnsAsync(CreateConversation());
        _participants.Setup(x => x.FindAsync(
                It.IsAny<System.Linq.Expressions.Expression<Func<ConversationParticipant, bool>>>()))
            .ReturnsAsync(
            [
                new ConversationParticipant { ConversationId = _conversationId, UserId = _senderId },
                new ConversationParticipant { ConversationId = _conversationId, UserId = _recipientId }
            ]);

        _service = new Investa.Application.Services.NegotiationService(
            _uow.Object,
            Mock.Of<IPaidActionService>(),
            Mock.Of<IReputationService>(),
            _notifications.Object,
            _realtime.Object,
            Mock.Of<IConversationPresenceService>(),
            NullLogger<Investa.Application.Services.NegotiationService>.Instance);
    }

    [Fact]
    public async Task InvestorToFounder_PersistsBeforePublishingToBothActualParticipants()
    {
        var saved = false;
        _uow.Setup(x => x.SaveChangesAsync()).Callback(() => saved = true).ReturnsAsync(1);
        _realtime.Setup(x => x.PublishToUserAsync(
                It.IsAny<Guid>(),
                "ConversationMessageSaved",
                _clientMessageId,
                It.IsAny<IReadOnlyDictionary<string, object?>>(),
                It.IsAny<CancellationToken>()))
            .Callback(() => Assert.True(saved))
            .Returns(Task.CompletedTask);

        var result = await SendAsync();

        Assert.Equal(_clientMessageId, result.Id);
        Assert.Equal(_conversationId, result.ConversationId);
        Assert.Equal(_senderId, result.SenderId);
        Assert.Equal("Investor", result.SenderName);
        Assert.Equal("Investor", result.SenderRole);
        Assert.Equal("Hello realtime", result.Message);
        _realtime.Verify(x => x.PublishToUserAsync(
            It.Is<Guid>(id => id == _senderId || id == _recipientId),
            "ConversationMessageSaved",
            _clientMessageId,
            It.Is<IReadOnlyDictionary<string, object?>>(data =>
                Equals(data["conversationId"], _conversationId.ToString("D"))
                && Equals(data["senderUserId"], _senderId.ToString("D"))
                && Equals(data["senderName"], "Investor")
                && Equals(data["senderRole"], "Investor")
                && Equals(data["body"], "Hello realtime")),
            It.IsAny<CancellationToken>()), Times.Exactly(2));
        _realtime.Verify(x => x.PublishToUserAsync(
            _senderId,
            "ConversationMessageSaved",
            _clientMessageId,
            It.IsAny<IReadOnlyDictionary<string, object?>>(),
            It.IsAny<CancellationToken>()), Times.Once);
        _realtime.Verify(x => x.PublishToUserAsync(
            _recipientId,
            "ConversationMessageSaved",
            _clientMessageId,
            It.IsAny<IReadOnlyDictionary<string, object?>>(),
            It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task FounderToInvestor_PublishesToBothActualParticipants()
    {
        _users.Setup(x => x.GetByIdAsync(_recipientId)).ReturnsAsync(new AuthUser
        {
            Id = _recipientId,
            Name = "Founder",
            UserType = UserType.Client
        });

        var result = await _service.SendMessageAsync(
            _recipientId,
            _conversationId,
            new SendNegotiationMessageRequest
            {
                Message = "Founder reply",
                ClientMessageId = _clientMessageId
            });

        Assert.Equal(_recipientId, result.SenderId);
        Assert.Equal("Founder", result.SenderName);
        Assert.Equal("Founder", result.SenderRole);
        _realtime.Verify(x => x.PublishToUserAsync(
            _senderId,
            "ConversationMessageSaved",
            _clientMessageId,
            It.IsAny<IReadOnlyDictionary<string, object?>>(),
            It.IsAny<CancellationToken>()), Times.Once);
        _realtime.Verify(x => x.PublishToUserAsync(
            _recipientId,
            "ConversationMessageSaved",
            _clientMessageId,
            It.IsAny<IReadOnlyDictionary<string, object?>>(),
            It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Send_WithExistingClientMessageId_ReturnsExistingWithoutDuplicateInsert()
    {
        var existing = CreateMessage();
        _messages.Setup(x => x.GetByIdAsync(_clientMessageId)).ReturnsAsync(existing);

        var result = await SendAsync();

        Assert.Equal(existing.Id, result.Id);
        _messages.Verify(x => x.AddAsync(It.IsAny<ChatMessage>()), Times.Never);
        _uow.Verify(x => x.SaveChangesAsync(), Times.Never);
    }

    [Fact]
    public async Task Send_WhenRealtimePublisherThrows_StillReturnsSavedMessage()
    {
        _realtime.Setup(x => x.PublishToUserAsync(
                It.IsAny<Guid>(),
                It.IsAny<string>(),
                It.IsAny<Guid>(),
                It.IsAny<IReadOnlyDictionary<string, object?>>(),
                It.IsAny<CancellationToken>()))
            .ThrowsAsync(new InvalidOperationException("Firebase unavailable"));

        var result = await SendAsync();

        Assert.Equal(_clientMessageId, result.Id);
        _uow.Verify(x => x.SaveChangesAsync(), Times.Once);
    }

    private Task<NegotiationMessageDto> SendAsync() =>
        _service.SendMessageAsync(
            _senderId,
            _conversationId,
            new SendNegotiationMessageRequest
            {
                Message = "Hello realtime",
                ClientMessageId = _clientMessageId
            });

    private Conversation CreateConversation() => new()
    {
        Id = _conversationId,
        FounderId = _recipientId,
        InvestorId = _senderId,
        IsVisibleToFounder = true,
        IsVisibleToInvestor = true,
        IsActive = true,
        Status = ConversationStatus.Accepted,
        OpportunityId = 7,
        Founder = new AuthUser { Id = _recipientId, Name = "Founder", UserType = UserType.Client },
        Investor = new AuthUser { Id = _senderId, Name = "Investor", UserType = UserType.Client }
    };

    private ChatMessage CreateMessage() => new()
    {
        Id = _clientMessageId,
        ConversationId = _conversationId,
        SenderId = _senderId.ToString(),
        SenderUserId = _senderId,
        MessageText = "Hello realtime",
        Timestamp = DateTime.UtcNow
    };
}
