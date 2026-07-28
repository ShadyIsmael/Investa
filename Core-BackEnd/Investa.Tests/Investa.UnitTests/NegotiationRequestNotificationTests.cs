using FluentAssertions;
using Investa.Application.Common;
using Investa.Application.DTOs;
using Investa.Application.Interfaces;
using Investa.Domain.Entities;
using Investa.Domain.Entities.Chat;
using Investa.Domain.Entities.Enums;
using Microsoft.Extensions.Logging.Abstractions;
using Moq;
using Xunit;

namespace Investa.UnitTests;

public class NegotiationRequestNotificationTests
{
    private readonly Mock<IUnitOfWork> _uowMock;
    private readonly Mock<IPaidActionService> _paidActionMock;
    private readonly Mock<IReputationService> _reputationMock;
    private readonly Mock<IUserNotificationService> _userNotifMock;
    private readonly Mock<IRealtimeEventPublisher> _realtimeMock;
    private readonly Mock<IRepository<AuthUser>> _authUserRepoMock;
    private readonly Mock<IRepository<Opportunity>> _opportunityRepoMock;
    private readonly Mock<IRepository<Conversation>> _conversationRepoMock;
    private readonly Mock<IRepository<ConversationRequest>> _crRepoMock;
    private readonly Investa.Application.Services.NegotiationService _service;

    private readonly Guid _investorId = Guid.NewGuid();
    private readonly Guid _founderId = Guid.NewGuid();
    private readonly int _opportunityId = 99;
    private const string _opportunityTitle = "Test Farm";

    public NegotiationRequestNotificationTests()
    {
        _uowMock = new Mock<IUnitOfWork>();
        _paidActionMock = new Mock<IPaidActionService>();
        _reputationMock = new Mock<IReputationService>();
        _userNotifMock = new Mock<IUserNotificationService>();
        _realtimeMock = new Mock<IRealtimeEventPublisher>();
        _authUserRepoMock = new Mock<IRepository<AuthUser>>();
        _opportunityRepoMock = new Mock<IRepository<Opportunity>>();
        _conversationRepoMock = new Mock<IRepository<Conversation>>();
        _crRepoMock = new Mock<IRepository<ConversationRequest>>();

        _uowMock.Setup(u => u.Repository<AuthUser>()).Returns(_authUserRepoMock.Object);
        _uowMock.Setup(u => u.Repository<Opportunity>()).Returns(_opportunityRepoMock.Object);
        _uowMock.Setup(u => u.Repository<Conversation>()).Returns(_conversationRepoMock.Object);
        _uowMock.Setup(u => u.Repository<ConversationRequest>()).Returns(_crRepoMock.Object);

        _uowMock.Setup(u => u.BeginTransactionAsync())
            .Returns(Task.CompletedTask);
        _uowMock.Setup(u => u.CommitTransactionAsync())
            .Returns(Task.CompletedTask);
        _uowMock.Setup(u => u.SaveChangesAsync())
            .ReturnsAsync(1);

        _uowMock.Setup(u => u.ExecuteWithStrategyAsync(
                It.IsAny<Func<Task>>(),
                It.IsAny<CancellationToken>()))
            .Returns<Func<Task>, CancellationToken>((op, ct) => op());

        _service = new Investa.Application.Services.NegotiationService(
            _uowMock.Object,
            _paidActionMock.Object,
            _reputationMock.Object,
            _userNotifMock.Object,
            _realtimeMock.Object,
            new Mock<IConversationPresenceService>().Object,
            NullLogger<Investa.Application.Services.NegotiationService>.Instance);

        SetupAuthUser();
        SetupEmptyFindResults();
    }

    private void SetupEmptyFindResults()
    {
        _conversationRepoMock.Setup(r => r.FindAsync(
                It.IsAny<System.Linq.Expressions.Expression<Func<Conversation, bool>>>()
            ))
            .ReturnsAsync(new List<Conversation>());

        _crRepoMock.Setup(r => r.FindAsync(
                It.IsAny<System.Linq.Expressions.Expression<Func<ConversationRequest, bool>>>()
            ))
            .ReturnsAsync(new List<ConversationRequest>());
    }

    private void SetupAuthUser()
    {
        var investor = new AuthUser
        {
            Id = _investorId,
            Name = "Test Investor",
            UserType = UserType.Client
        };
        _authUserRepoMock.Setup(r => r.GetByIdAsync(_investorId))
            .ReturnsAsync(investor);
    }

    private void SetupOpportunity()
    {
        var opportunity = new Opportunity
        {
            Id = _opportunityId,
            Title = _opportunityTitle,
            FounderId = _founderId,
            Status = OpportunityStatus.Published
        };
        _opportunityRepoMock.Setup(r => r.GetByIdAsync(_opportunityId))
            .ReturnsAsync(opportunity);
    }

    private void SetupCrGetSingleMock(Guid? requestId = null)
    {
        _crRepoMock.Setup(r => r.GetSingleAsync(
                It.IsAny<System.Linq.Expressions.Expression<Func<ConversationRequest, bool>>>(),
                It.IsAny<System.Linq.Expressions.Expression<Func<ConversationRequest, object>>[]>()
            ))
            .ReturnsAsync(new ConversationRequest
            {
                Id = requestId ?? Guid.NewGuid(),
                OpportunityId = _opportunityId,
                RequesterUserId = _investorId,
                RecipientUserId = _founderId,
                Status = ConversationRequestStatus.Pending,
                Requester = new AuthUser { Id = _investorId, Name = "Test Investor", UserType = UserType.Client },
                Recipient = new AuthUser { Id = _founderId, Name = "Test Founder", UserType = UserType.Client },
                Opportunity = new Opportunity { Id = _opportunityId, Title = _opportunityTitle, FounderId = _founderId }
            });
    }

    private void SetupNotificationMocks()
    {
        _userNotifMock.Setup(x => x.CreateEventAsync(
                It.IsAny<NotificationEventCreation>(),
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(new UserNotification
            {
                Id = 1,
                UserId = _founderId.ToString(),
                Title = "New conversation request",
                Body = "Test Investor sent a conversation request for Test Farm.",
                Type = "info"
            });
    }

    [Fact]
    public async Task SendRequest_CreatesExactlyOneNotificationForFounder()
    {
        SetupOpportunity();
        SetupNotificationMocks();
        _crRepoMock.Setup(r => r.AddAsync(It.IsAny<ConversationRequest>()))
            .Returns(Task.CompletedTask);
        _paidActionMock.Setup(p => p.ChargeAsync(
                _investorId,
                PricingAction.SendConversationRequest,
                ReferenceType.ConversationRequest,
                It.IsAny<string>(),
                It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);
        SetupCrGetSingleMock();

        await _service.RequestConversationAsync(_investorId, _opportunityId,
            new CreateNegotiationConversationRequest { Message = "Hello" });

        _userNotifMock.Verify(x => x.CreateEventAsync(
            It.Is<NotificationEventCreation>(n =>
                n.RecipientUserId == _founderId &&
                n.EventType == "ConversationRequestCreated"),
            It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task SendRequest_NotificationDoesNotContainWithdrawn()
    {
        SetupOpportunity();
        SetupNotificationMocks();
        _crRepoMock.Setup(r => r.AddAsync(It.IsAny<ConversationRequest>()))
            .Returns(Task.CompletedTask);
        _paidActionMock.Setup(p => p.ChargeAsync(
                _investorId,
                PricingAction.SendConversationRequest,
                ReferenceType.ConversationRequest,
                It.IsAny<string>(),
                It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);
        SetupCrGetSingleMock();

        await _service.RequestConversationAsync(_investorId, _opportunityId,
            new CreateNegotiationConversationRequest { Message = "Hello" });

        _userNotifMock.Verify(x => x.CreateEventAsync(
            It.Is<NotificationEventCreation>(n =>
                !n.Title.Contains("withdrawn", StringComparison.OrdinalIgnoreCase) &&
                !n.Body.Contains("withdrawn", StringComparison.OrdinalIgnoreCase)),
            It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task SendRequest_PublishesConversationRequestCreatedEvent()
    {
        SetupOpportunity();
        SetupNotificationMocks();
        _crRepoMock.Setup(r => r.AddAsync(It.IsAny<ConversationRequest>()))
            .Returns(Task.CompletedTask);
        _paidActionMock.Setup(p => p.ChargeAsync(
                _investorId,
                PricingAction.SendConversationRequest,
                ReferenceType.ConversationRequest,
                It.IsAny<string>(),
                It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);
        SetupCrGetSingleMock();

        await _service.RequestConversationAsync(_investorId, _opportunityId,
            new CreateNegotiationConversationRequest { Message = "Hello" });

        _userNotifMock.Verify(x => x.CreateEventAsync(
            It.Is<NotificationEventCreation>(n => n.EventType == "ConversationRequestCreated"),
            It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task SendRequest_DoesNotNotifyRequester()
    {
        SetupOpportunity();
        SetupNotificationMocks();
        _crRepoMock.Setup(r => r.AddAsync(It.IsAny<ConversationRequest>()))
            .Returns(Task.CompletedTask);
        _paidActionMock.Setup(p => p.ChargeAsync(
                _investorId,
                PricingAction.SendConversationRequest,
                ReferenceType.ConversationRequest,
                It.IsAny<string>(),
                It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);
        SetupCrGetSingleMock();

        await _service.RequestConversationAsync(_investorId, _opportunityId,
            new CreateNegotiationConversationRequest { Message = "Hello" });

        _userNotifMock.Verify(x => x.CreateEventAsync(
            It.Is<NotificationEventCreation>(n => n.RecipientUserId == _investorId),
            It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task SendRequest_WithdrawStillCreatesSeparateWithdrawalNotification()
    {
        SetupOpportunity();
        SetupNotificationMocks();

        var requestId = Guid.NewGuid();
        _crRepoMock.Setup(r => r.AddAsync(It.IsAny<ConversationRequest>()))
            .Returns(Task.CompletedTask)
            .Callback<ConversationRequest>(cr =>
            {
                cr.Id = requestId;
                cr.Requester = new AuthUser { Id = _investorId, Name = "Test Investor" };
                cr.Recipient = new AuthUser { Id = _founderId, Name = "Test Founder" };
                cr.Opportunity = new Opportunity { Id = _opportunityId, Title = _opportunityTitle };
            });

        _paidActionMock.Setup(p => p.ChargeAsync(
                _investorId,
                PricingAction.SendConversationRequest,
                ReferenceType.ConversationRequest,
                It.IsAny<string>(),
                It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);
        SetupCrGetSingleMock();

        await _service.RequestConversationAsync(_investorId, _opportunityId,
            new CreateNegotiationConversationRequest { Message = "Hello" });

        _userNotifMock.Verify(x => x.CreateEventAsync(
            It.Is<NotificationEventCreation>(n =>
                n.RecipientUserId == _founderId &&
                n.EventType == "ConversationRequestCreated" &&
                n.Body.Contains("sent a conversation request")),
            It.IsAny<CancellationToken>()), Times.Once);

        _userNotifMock.Invocations.Clear();
        _realtimeMock.Invocations.Clear();

        var withdrawnRequest = new ConversationRequest
        {
            Id = requestId,
            OpportunityId = _opportunityId,
            RequesterUserId = _investorId,
            RecipientUserId = _founderId,
            Status = ConversationRequestStatus.Pending,
            Requester = new AuthUser { Id = _investorId, Name = "Test Investor", UserType = UserType.Client },
            Recipient = new AuthUser { Id = _founderId, Name = "Test Founder", UserType = UserType.Client },
            Opportunity = new Opportunity { Id = _opportunityId, Title = _opportunityTitle, FounderId = _founderId }
        };

        _crRepoMock.Setup(r => r.GetSingleAsync(
                It.IsAny<System.Linq.Expressions.Expression<Func<ConversationRequest, bool>>>(),
                It.IsAny<System.Linq.Expressions.Expression<Func<ConversationRequest, object>>[]>()
            ))
            .ReturnsAsync(withdrawnRequest);

        _crRepoMock.Setup(r => r.UpdateAsync(It.IsAny<ConversationRequest>()))
            .Returns(Task.CompletedTask);

        _userNotifMock.Setup(x => x.CreateEventAsync(
                It.IsAny<NotificationEventCreation>(),
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(new UserNotification
            {
                Id = 2,
                UserId = _founderId.ToString(),
                Title = "Conversation request withdrawn",
                Body = "Test Investor withdrew the conversation request for Test Farm.",
                Type = "info"
            });

        await _service.WithdrawConversationRequestAsync(_investorId, requestId);

        _userNotifMock.Verify(x => x.CreateEventAsync(
            It.Is<NotificationEventCreation>(n =>
                n.RecipientUserId == _founderId &&
                n.EventType == "ConversationRequestWithdrawn" &&
                n.Body.Contains("withdrew the conversation request")),
            It.IsAny<CancellationToken>()), Times.Once);
    }
}
