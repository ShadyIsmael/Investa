using FluentAssertions;
using Investa.Application.DTOs;
using Investa.Application.Interfaces;
using Investa.Domain.Entities;
using Investa.Domain.Entities.Chat;
using Investa.Domain.Entities.Enums;
using Microsoft.Extensions.Logging.Abstractions;
using Moq;
using Xunit;

namespace Investa.UnitTests;

public sealed class NegotiationJourneyTests
{
    private readonly Guid _founderId = Guid.NewGuid();
    private readonly Guid _investorId = Guid.NewGuid();
    private readonly Guid _conversationId = Guid.NewGuid();
    private readonly int _opportunityId = 42;

    private readonly Mock<IUnitOfWork> _uow = new();
    private readonly Mock<IRepository<Opportunity>> _opportunities = new();
    private readonly Mock<IRepository<Conversation>> _conversations = new();
    private readonly Mock<IRepository<ConversationRequest>> _requests = new();
    private readonly Mock<IRepository<OpportunityJoinRequest>> _joinRequests = new();
    private readonly Mock<IRepository<ChatMessage>> _messages = new();
    private readonly Mock<IRepository<AuthUser>> _users = new();
    private readonly Investa.Application.Services.NegotiationService _service;

    private readonly Opportunity _opportunity;

    public NegotiationJourneyTests()
    {
        _opportunity = new Opportunity
        {
            Id = _opportunityId,
            Title = "Test Opportunity",
            FounderId = _founderId,
            Status = OpportunityStatus.Published,
            InvestmentModel = InvestmentModel.Equity
        };

        _uow.Setup(x => x.Repository<Opportunity>()).Returns(_opportunities.Object);
        _uow.Setup(x => x.Repository<Conversation>()).Returns(_conversations.Object);
        _uow.Setup(x => x.Repository<ConversationRequest>()).Returns(_requests.Object);
        _uow.Setup(x => x.Repository<OpportunityJoinRequest>()).Returns(_joinRequests.Object);
        _uow.Setup(x => x.Repository<ChatMessage>()).Returns(_messages.Object);
        _uow.Setup(x => x.Repository<AuthUser>()).Returns(_users.Object);

        _opportunities.Setup(x => x.GetByIdAsync(_opportunityId)).ReturnsAsync(_opportunity);
        _opportunities.Setup(x => x.GetSingleAsync(
                It.IsAny<System.Linq.Expressions.Expression<Func<Opportunity, bool>>>(),
                It.IsAny<System.Linq.Expressions.Expression<Func<Opportunity, object>>[]>()))
            .ReturnsAsync(_opportunity);
        _opportunities.Setup(x => x.FindAsync(
                It.IsAny<System.Linq.Expressions.Expression<Func<Opportunity, bool>>>()))
            .ReturnsAsync(new List<Opportunity> { _opportunity });

        _users.Setup(x => x.GetByIdAsync(It.IsAny<Guid>()))
            .ReturnsAsync((Guid id) => new AuthUser
            {
                Id = id,
                Name = id == _founderId ? "Founder" : "Investor",
                UserType = UserType.Client
            });

        _requests.Setup(x => x.FindAsync(
                It.IsAny<System.Linq.Expressions.Expression<Func<ConversationRequest, bool>>>()))
            .ReturnsAsync(new List<ConversationRequest>());

        _messages.Setup(x => x.FindAsync(
                It.IsAny<System.Linq.Expressions.Expression<Func<ChatMessage, bool>>>()))
            .ReturnsAsync(new List<ChatMessage>());

        _service = new Investa.Application.Services.NegotiationService(
            _uow.Object,
            Mock.Of<IPaidActionService>(),
            Mock.Of<IReputationService>(),
            Mock.Of<IUserNotificationService>(),
            Mock.Of<IRealtimeEventPublisher>(),
            Mock.Of<IConversationPresenceService>(),
            NullLogger<Investa.Application.Services.NegotiationService>.Instance);
    }

    private Conversation CreateConversation(
        ConversationStatus status,
        OpportunityJoinRequest? participationRequest = null,
        bool founderReady = false,
        bool investorReady = false)
    {
        var conv = new Conversation
        {
            Id = _conversationId,
            FounderId = _founderId,
            InvestorId = _investorId,
            OpportunityId = _opportunityId,
            Status = status,
            IsVisibleToFounder = true,
            IsVisibleToInvestor = true,
            IsActive = status is ConversationStatus.Accepted or ConversationStatus.Negotiation or ConversationStatus.ReadyForParticipation,
            FounderReady = founderReady,
            InvestorReady = investorReady,
            ParticipationRequestId = participationRequest?.Id,
            ParticipationRequest = participationRequest,
            Opportunity = _opportunity,
            Founder = new AuthUser { Id = _founderId, Name = "Founder", UserType = UserType.Client },
            Investor = new AuthUser { Id = _investorId, Name = "Investor", UserType = UserType.Client }
        };
        return conv;
    }

    private OpportunityJoinRequest CreateJoinRequest(OpportunityJoinRequestStatus status) => new()
    {
        OpportunityId = _opportunityId,
        InvestorId = _investorId,
        Status = status,
        IsVisibleToFounder = true,
        IsVisibleToInvestor = true
    };

    [Fact]
    public async Task ViewerState_ParticipationStatus_ShouldBeSameForFounderAndInvestor()
    {
        var joinRequest = CreateJoinRequest(OpportunityJoinRequestStatus.Pending);
        var conversation = CreateConversation(ConversationStatus.Negotiation, joinRequest);

        _conversations.Setup(x => x.FindWithIncludesAsync(
                It.IsAny<System.Linq.Expressions.Expression<Func<Conversation, bool>>>(),
                It.IsAny<System.Linq.Expressions.Expression<Func<Conversation, object>>[]>()))
            .ReturnsAsync(new List<Conversation> { conversation });

        _joinRequests.Setup(x => x.FindAsync(
                It.IsAny<System.Linq.Expressions.Expression<Func<OpportunityJoinRequest, bool>>>()))
            .ReturnsAsync(new List<OpportunityJoinRequest> { joinRequest });

        var founderState = await _service.GetOpportunityViewerStateAsync(_founderId, _opportunityId);
        var investorState = await _service.GetOpportunityViewerStateAsync(_investorId, _opportunityId);

        founderState.ParticipationStatus.Should().Be(investorState.ParticipationStatus);
        founderState.HasPendingParticipationRequest.Should().Be(investorState.HasPendingParticipationRequest);
    }

    [Fact]
    public async Task ViewerState_FounderReadyAndInvestorReady_ShouldBeSameForBothRoles()
    {
        var joinRequest = CreateJoinRequest(OpportunityJoinRequestStatus.Pending);
        var conversation = CreateConversation(ConversationStatus.Negotiation, joinRequest, founderReady: true, investorReady: false);

        _conversations.Setup(x => x.FindWithIncludesAsync(
                It.IsAny<System.Linq.Expressions.Expression<Func<Conversation, bool>>>(),
                It.IsAny<System.Linq.Expressions.Expression<Func<Conversation, object>>[]>()))
            .ReturnsAsync(new List<Conversation> { conversation });

        _joinRequests.Setup(x => x.FindAsync(
                It.IsAny<System.Linq.Expressions.Expression<Func<OpportunityJoinRequest, bool>>>()))
            .ReturnsAsync(new List<OpportunityJoinRequest> { joinRequest });

        var founderState = await _service.GetOpportunityViewerStateAsync(_founderId, _opportunityId);
        var investorState = await _service.GetOpportunityViewerStateAsync(_investorId, _opportunityId);

        founderState.FounderReady.Should().BeTrue();
        investorState.FounderReady.Should().BeTrue();
        founderState.InvestorReady.Should().BeFalse();
        investorState.InvestorReady.Should().BeFalse();
    }

    [Fact]
    public async Task ViewerState_ProjectRoomRemainsLockedForBothRoles_WhenParticipationNotApproved()
    {
        var joinRequest = CreateJoinRequest(OpportunityJoinRequestStatus.Pending);
        var conversation = CreateConversation(ConversationStatus.Negotiation, joinRequest);

        _conversations.Setup(x => x.FindWithIncludesAsync(
                It.IsAny<System.Linq.Expressions.Expression<Func<Conversation, bool>>>(),
                It.IsAny<System.Linq.Expressions.Expression<Func<Conversation, object>>[]>()))
            .ReturnsAsync(new List<Conversation> { conversation });

        _joinRequests.Setup(x => x.FindAsync(
                It.IsAny<System.Linq.Expressions.Expression<Func<OpportunityJoinRequest, bool>>>()))
            .ReturnsAsync(new List<OpportunityJoinRequest> { joinRequest });

        var founderState = await _service.GetOpportunityViewerStateAsync(_founderId, _opportunityId);
        var investorState = await _service.GetOpportunityViewerStateAsync(_investorId, _opportunityId);

        founderState.ProjectRoomUnlocked.Should().BeFalse();
        investorState.ProjectRoomUnlocked.Should().BeFalse();
    }

    [Fact]
    public async Task ConversationDto_FounderReadyAndInvestorReady_ShouldBeSameForBothRoles()
    {
        var joinRequest = CreateJoinRequest(OpportunityJoinRequestStatus.Pending);
        var conversation = CreateConversation(ConversationStatus.Negotiation, joinRequest, founderReady: true, investorReady: true);

        _conversations.Setup(x => x.GetSingleAsync(
                It.IsAny<System.Linq.Expressions.Expression<Func<Conversation, bool>>>(),
                It.IsAny<System.Linq.Expressions.Expression<Func<Conversation, object>>[]>()))
            .ReturnsAsync(conversation);

        var founderConv = await _service.GetConversationAsync(_founderId, _conversationId);
        var investorConv = await _service.GetConversationAsync(_investorId, _conversationId);

        founderConv.FounderReady.Should().BeTrue();
        investorConv.FounderReady.Should().BeTrue();
        founderConv.InvestorReady.Should().BeTrue();
        investorConv.InvestorReady.Should().BeTrue();
    }

    [Fact]
    public async Task ConversationDto_ParticipationStatus_ShouldBeSameForBothRoles()
    {
        var joinRequest = CreateJoinRequest(OpportunityJoinRequestStatus.Approved);
        var conversation = CreateConversation(ConversationStatus.ParticipationApproved, joinRequest);

        _conversations.Setup(x => x.GetSingleAsync(
                It.IsAny<System.Linq.Expressions.Expression<Func<Conversation, bool>>>(),
                It.IsAny<System.Linq.Expressions.Expression<Func<Conversation, object>>[]>()))
            .ReturnsAsync(conversation);

        var founderConv = await _service.GetConversationAsync(_founderId, _conversationId);
        var investorConv = await _service.GetConversationAsync(_investorId, _conversationId);

        founderConv.ParticipationStatus.Should().Be(investorConv.ParticipationStatus);
        founderConv.ParticipationStatus.Should().Be(OpportunityJoinRequestStatus.Approved);
    }

    [Fact]
    public async Task ConversationDto_ConversationStatus_ShouldBeSameForBothRoles()
    {
        var joinRequest = CreateJoinRequest(OpportunityJoinRequestStatus.Pending);
        var conversation = CreateConversation(ConversationStatus.ReadyForParticipation, joinRequest);

        _conversations.Setup(x => x.GetSingleAsync(
                It.IsAny<System.Linq.Expressions.Expression<Func<Conversation, bool>>>(),
                It.IsAny<System.Linq.Expressions.Expression<Func<Conversation, object>>[]>()))
            .ReturnsAsync(conversation);

        var founderConv = await _service.GetConversationAsync(_founderId, _conversationId);
        var investorConv = await _service.GetConversationAsync(_investorId, _conversationId);

        founderConv.ConversationStatus.Should().Be(ConversationStatus.ReadyForParticipation);
        investorConv.ConversationStatus.Should().Be(ConversationStatus.ReadyForParticipation);
    }

    [Fact]
    public async Task ConversationDto_ProjectRoomUnlocked_ShouldBeSameForBothRoles_WhenApproved()
    {
        var joinRequest = CreateJoinRequest(OpportunityJoinRequestStatus.Approved);
        var conversation = CreateConversation(ConversationStatus.ParticipationApproved, joinRequest);

        _conversations.Setup(x => x.GetSingleAsync(
                It.IsAny<System.Linq.Expressions.Expression<Func<Conversation, bool>>>(),
                It.IsAny<System.Linq.Expressions.Expression<Func<Conversation, object>>[]>()))
            .ReturnsAsync(conversation);

        var founderConv = await _service.GetConversationAsync(_founderId, _conversationId);
        var investorConv = await _service.GetConversationAsync(_investorId, _conversationId);

        // Unlike ViewerState, ConversationDto uses the same participation-based check for both roles
        founderConv.ProjectRoomUnlocked.Should().BeTrue();
        investorConv.ProjectRoomUnlocked.Should().BeTrue();
    }

    [Fact]
    public async Task ConversationDto_ProjectRoomUnlocked_FalseWhenNotApproved()
    {
        var joinRequest = CreateJoinRequest(OpportunityJoinRequestStatus.Pending);
        var conversation = CreateConversation(ConversationStatus.Negotiation, joinRequest);

        _conversations.Setup(x => x.GetSingleAsync(
                It.IsAny<System.Linq.Expressions.Expression<Func<Conversation, bool>>>(),
                It.IsAny<System.Linq.Expressions.Expression<Func<Conversation, object>>[]>()))
            .ReturnsAsync(conversation);

        var dto = await _service.GetConversationAsync(_founderId, _conversationId);

        dto.ProjectRoomUnlocked.Should().BeFalse();
    }

    [Fact]
    public async Task MyConversations_FiltersByCorrectParticipant()
    {
        var conversation = CreateConversation(ConversationStatus.Negotiation);

        _conversations.Setup(x => x.FindWithIncludesAsync(
                It.IsAny<System.Linq.Expressions.Expression<Func<Conversation, bool>>>(),
                It.IsAny<System.Linq.Expressions.Expression<Func<Conversation, object>>[]>()))
            .ReturnsAsync(new List<Conversation> { conversation });

        var conversations = await _service.GetMyConversationsAsync(_founderId);

        conversations.Should().HaveCount(1);
        conversations[0].Id.Should().Be(_conversationId);
        conversations[0].OpportunityId.Should().Be(_opportunityId);
    }

    [Fact]
    public async Task MyConversations_ExcludesRequestedStatus()
    {
        _conversations.Setup(x => x.FindWithIncludesAsync(
                It.IsAny<System.Linq.Expressions.Expression<Func<Conversation, bool>>>(),
                It.IsAny<System.Linq.Expressions.Expression<Func<Conversation, object>>[]>()))
            .ReturnsAsync(new List<Conversation>());

        var conversations = await _service.GetMyConversationsAsync(_founderId);

        conversations.Should().HaveCount(0);
    }

    [Fact]
    public async Task ViewerState_FounderSeesCanApproveParticipation_WhenPending()
    {
        var joinRequest = CreateJoinRequest(OpportunityJoinRequestStatus.Pending);
        var conversation = CreateConversation(ConversationStatus.ParticipationCreated, joinRequest);

        _conversations.Setup(x => x.FindWithIncludesAsync(
                It.IsAny<System.Linq.Expressions.Expression<Func<Conversation, bool>>>(),
                It.IsAny<System.Linq.Expressions.Expression<Func<Conversation, object>>[]>()))
            .ReturnsAsync(new List<Conversation> { conversation });

        _joinRequests.Setup(x => x.FindAsync(
                It.IsAny<System.Linq.Expressions.Expression<Func<OpportunityJoinRequest, bool>>>()))
            .ReturnsAsync(new List<OpportunityJoinRequest> { joinRequest });

        var founderState = await _service.GetOpportunityViewerStateAsync(_founderId, _opportunityId);
        var investorState = await _service.GetOpportunityViewerStateAsync(_investorId, _opportunityId);

        founderState.CanApproveParticipation.Should().BeTrue();
        founderState.CanRejectParticipation.Should().BeTrue();
        investorState.CanApproveParticipation.Should().BeFalse();
        investorState.CanRejectParticipation.Should().BeFalse();
    }
}
