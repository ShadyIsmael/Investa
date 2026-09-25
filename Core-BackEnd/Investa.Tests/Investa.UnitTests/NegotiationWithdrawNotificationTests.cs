using FluentAssertions;
using Investa.Application.Common;
using Investa.Application.Interfaces;
using Investa.Domain.Entities;
using Investa.Domain.Entities.Chat;
using Investa.Domain.Entities.Enums;
using Microsoft.Extensions.Logging.Abstractions;
using Moq;
using Xunit;

namespace Investa.UnitTests;

public class NegotiationWithdrawNotificationTests
{
    private readonly Mock<IUnitOfWork> _uowMock;
    private readonly Mock<IPaidActionService> _paidActionMock;
    private readonly Mock<IReputationService> _reputationMock;
    private readonly Mock<IUserNotificationService> _userNotifMock;
    private readonly Mock<IRealtimeEventPublisher> _realtimeMock;
    private readonly Mock<IRepository<AuthUser>> _authUserRepoMock;
    private readonly Mock<IRepository<ConversationRequest>> _crRepoMock;
    private readonly Investa.Application.Services.NegotiationService _service;

    private readonly Guid _requesterId = Guid.NewGuid();
    private readonly Guid _recipientId = Guid.NewGuid();
    private readonly Guid _requestId = Guid.NewGuid();
    private readonly int _opportunityId = 42;

    public NegotiationWithdrawNotificationTests()
    {
        _uowMock = new Mock<IUnitOfWork>();
        _paidActionMock = new Mock<IPaidActionService>();
        _reputationMock = new Mock<IReputationService>();
        _userNotifMock = new Mock<IUserNotificationService>();
        _realtimeMock = new Mock<IRealtimeEventPublisher>();
        _authUserRepoMock = new Mock<IRepository<AuthUser>>();
        _crRepoMock = new Mock<IRepository<ConversationRequest>>();

        _uowMock.Setup(u => u.Repository<AuthUser>()).Returns(_authUserRepoMock.Object);
        _uowMock.Setup(u => u.Repository<ConversationRequest>()).Returns(_crRepoMock.Object);

        _service = new Investa.Application.Services.NegotiationService(
            _uowMock.Object,
            _paidActionMock.Object,
            _reputationMock.Object,
            _userNotifMock.Object,
            _realtimeMock.Object,
            new Mock<IConversationPresenceService>().Object,
            Mock.Of<IInvestmentContractService>(),
            NullLogger<Investa.Application.Services.NegotiationService>.Instance);

        SetupAuthUserValidation();
    }

    [Fact]
    public async Task Withdraw_NotifyRecipient_CreatesExactlyOneUserNotification()
    {
        CreatePendingRequest();

        await _service.WithdrawConversationRequestAsync(_requesterId, _requestId);

        _userNotifMock.Verify(x => x.CreateEventAsync(
            It.Is<NotificationEventCreation>(n =>
                n.RecipientUserId == _recipientId &&
                n.EventType == "ConversationRequestWithdrawn"),
            It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Withdraw_NotifyRecipient_DoesNotNotifyRequester()
    {
        CreatePendingRequest();

        await _service.WithdrawConversationRequestAsync(_requesterId, _requestId);

        _userNotifMock.Verify(x => x.CreateEventAsync(
            It.Is<NotificationEventCreation>(n => n.RecipientUserId == _requesterId),
            It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task Withdraw_PublishesRealtimeEventForRecipient()
    {
        CreatePendingRequest();

        await _service.WithdrawConversationRequestAsync(_requesterId, _requestId);

        _userNotifMock.Verify(x => x.CreateEventAsync(
            It.Is<NotificationEventCreation>(n =>
                n.RecipientUserId == _recipientId &&
                n.EventType == "ConversationRequestWithdrawn"),
            It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Withdraw_AlreadyWithdrawn_ThrowsAndDoesNotDuplicateNotification()
    {
        CreatePendingRequest();

        await _service.WithdrawConversationRequestAsync(_requesterId, _requestId);

        _userNotifMock.Invocations.Clear();
        _realtimeMock.Invocations.Clear();

        var requestAfterWithdraw = new ConversationRequest
        {
            Id = _requestId,
            OpportunityId = _opportunityId,
            RequesterUserId = _requesterId,
            RecipientUserId = _recipientId,
            Status = ConversationRequestStatus.Withdrawn,
            RespondedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            Requester = new AuthUser { Id = _requesterId, Name = "Test", UserType = UserType.Client },
            Recipient = new AuthUser { Id = _recipientId, Name = "Other", UserType = UserType.Client },
            Opportunity = new Opportunity { Id = _opportunityId, Title = "Test", FounderId = _recipientId }
        };

        _crRepoMock.Setup(r => r.GetSingleAsync(
                It.IsAny<System.Linq.Expressions.Expression<Func<ConversationRequest, bool>>>(),
                It.IsAny<System.Linq.Expressions.Expression<Func<ConversationRequest, object>>[]>()
            ))
            .ReturnsAsync(requestAfterWithdraw);

        Func<Task> act = () => _service.WithdrawConversationRequestAsync(_requesterId, _requestId);

        await act.Should().ThrowAsync<BusinessValidationException>()
            .WithMessage("Only pending conversation requests can be withdrawn.");

        _userNotifMock.Verify(x => x.CreateEventAsync(
            It.IsAny<NotificationEventCreation>(),
            It.IsAny<CancellationToken>()), Times.Never);

        _realtimeMock.Verify(
            x => x.PublishToUserAsync(
                It.IsAny<Guid>(), It.IsAny<string>(), It.IsAny<Guid>(),
                It.IsAny<CancellationToken>()),
            Times.Never);
    }

    [Fact]
    public async Task Withdraw_WrongUser_ThrowsAndDoesNotCreateNotification()
    {
        var request = new ConversationRequest
        {
            Id = _requestId,
            OpportunityId = _opportunityId,
            RequesterUserId = _recipientId,
            RecipientUserId = _requesterId,
            Status = ConversationRequestStatus.Pending,
            CreatedAt = DateTime.UtcNow,
            Requester = new AuthUser { Id = _recipientId, Name = "Other", UserType = UserType.Client },
            Recipient = new AuthUser { Id = _requesterId, Name = "Test", UserType = UserType.Client },
            Opportunity = new Opportunity { Id = _opportunityId, Title = "Test", FounderId = _requesterId }
        };

        _crRepoMock.Setup(r => r.GetSingleAsync(
                It.IsAny<System.Linq.Expressions.Expression<Func<ConversationRequest, bool>>>(),
                It.IsAny<System.Linq.Expressions.Expression<Func<ConversationRequest, object>>[]>()
            ))
            .ReturnsAsync(request);

        Func<Task> act = () => _service.WithdrawConversationRequestAsync(_requesterId, _requestId);

        await act.Should().ThrowAsync<BusinessValidationException>()
            .WithMessage("Only the request sender can perform this action.");

        _userNotifMock.Verify(x => x.CreateEventAsync(
            It.IsAny<NotificationEventCreation>(),
            It.IsAny<CancellationToken>()), Times.Never);
    }

    private void CreatePendingRequest()
    {
        var request = new ConversationRequest
        {
            Id = _requestId,
            OpportunityId = _opportunityId,
            RequesterUserId = _requesterId,
            RecipientUserId = _recipientId,
            Status = ConversationRequestStatus.Pending,
            CreatedAt = DateTime.UtcNow,
            Requester = new AuthUser
            {
                Id = _requesterId,
                Name = "Test Requester",
                UserType = UserType.Client
            },
            Recipient = new AuthUser
            {
                Id = _recipientId,
                Name = "Test Recipient",
                UserType = UserType.Client
            },
            Opportunity = new Opportunity
            {
                Id = _opportunityId,
                Title = "Test Opportunity",
                FounderId = _recipientId
            }
        };

        _crRepoMock.Setup(r => r.GetSingleAsync(
                It.IsAny<System.Linq.Expressions.Expression<Func<ConversationRequest, bool>>>(),
                It.IsAny<System.Linq.Expressions.Expression<Func<ConversationRequest, object>>[]>()
            ))
            .ReturnsAsync(request);

        _crRepoMock.Setup(r => r.UpdateAsync(request))
            .Returns(Task.CompletedTask);

        _uowMock.Setup(u => u.SaveChangesAsync())
            .ReturnsAsync(1);

        _userNotifMock.Setup(x => x.CreateEventAsync(
                It.IsAny<NotificationEventCreation>(),
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(new UserNotification
            {
                Id = 1,
                UserId = _recipientId.ToString(),
                Title = "Test",
                Body = "Test body",
                Type = "info"
            });
    }

    private void SetupAuthUserValidation()
    {
        var requesterUser = new AuthUser
        {
            Id = _requesterId,
            Name = "Test User",
            UserType = UserType.Client
        };
        _authUserRepoMock.Setup(r => r.GetByIdAsync(_requesterId))
            .ReturnsAsync(requesterUser);
    }
}
