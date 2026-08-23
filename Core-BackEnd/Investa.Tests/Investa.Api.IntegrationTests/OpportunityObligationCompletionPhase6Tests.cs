using FluentAssertions;
using Investa.Application.Common;
using Investa.Application.DTOs;
using Investa.Application.Interfaces;
using Investa.Application.Services;
using Investa.Domain.Entities;
using Investa.Domain.Entities.Enums;
using Investa.Infrastructure.Persistence;
using Investa.Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Investa.Api.IntegrationTests;

public sealed class OpportunityObligationCompletionPhase6Tests
{
    [Fact]
    public async Task Every_approved_participation_requires_founder_and_investor_confirmation()
    {
        await using var db=Db();var founder=User();var investor=User();db.AuthUsers.AddRange(founder,investor);
        var project=new Project{FounderId=founder.Id,DisplayName="P",Slug="p",Summary="s",Description="d"};
        var opportunity=Opportunity(project,founder.Id,OpportunityFundingStatus.Closed);
        var participation=new OpportunityJoinRequest{Opportunity=opportunity,InvestorId=investor.Id,ParticipationSequence=1,
            RequestType=OpportunityJoinRequestType.InvestmentParticipation,Status=OpportunityJoinRequestStatus.Approved};
        db.AddRange(project,opportunity,participation);await db.SaveChangesAsync();
        var notify=new Notifications();var mail=new Email();
        var service=new OpportunityObligationCompletionService(new UnitOfWork(db),notify,mail);

        var initiated=await service.InitiateAsync(founder.Id,opportunity.Id,false);
        initiated.Participations.Should().ContainSingle();
        initiated.Participations[0].Confirmations.Should().HaveCount(2);
        opportunity.ObligationCompletionStatus.Should().Be(ObligationCompletionStatus.AwaitingConfirmations);
        notify.Events.Should().HaveCount(2);mail.Messages.Should().HaveCount(2);

        var request=new ConfirmObligationCompletionRequest{Statement="My side is complete",IdempotencyKey="founder-1",AcknowledgeNoPaymentProof=true};
        (await service.ConfirmAsync(founder.Id,opportunity.Id,participation.Id,request)).Status.Should().Be(ObligationCompletionStatus.AwaitingConfirmations);
        (await service.ConfirmAsync(founder.Id,opportunity.Id,participation.Id,request)).Status.Should().Be(ObligationCompletionStatus.AwaitingConfirmations);
        request=new(){Statement="My side is complete",IdempotencyKey="investor-1",AcknowledgeNoPaymentProof=true};
        var completed=await service.ConfirmAsync(investor.Id,opportunity.Id,participation.Id,request);
        completed.Status.Should().Be(ObligationCompletionStatus.Completed);
        db.AuditLogs.Should().Contain(a=>a.Action=="Complete");
    }

    [Fact]
    public async Task Closing_funding_preserves_participation_contract_schedule_and_other_opportunity_independence()
    {
        await using var db=Db();var founder=User();var investor=User();db.AuthUsers.AddRange(founder,investor);
        var project=new Project{FounderId=founder.Id,DisplayName="P",Slug="p2",Summary="s",Description="d"};
        var first=Opportunity(project,founder.Id,OpportunityFundingStatus.Closed);var later=Opportunity(project,founder.Id,OpportunityFundingStatus.Open);later.SequenceNumber=2;
        var participation=new OpportunityJoinRequest{Opportunity=first,InvestorId=investor.Id,ParticipationSequence=1,RequestedAmount=500,
            RequestType=OpportunityJoinRequestType.InvestmentParticipation,Status=OpportunityJoinRequestStatus.Approved};
        db.AddRange(project,first,later,participation);await db.SaveChangesAsync();
        var service=new OpportunityObligationCompletionService(new UnitOfWork(db),new Notifications(),new Email());
        await service.InitiateAsync(founder.Id,first.Id,false);
        (await db.OpportunityJoinRequests.SingleAsync()).RequestedAmount.Should().Be(500);
        later.FundingStatus.Should().Be(OpportunityFundingStatus.Open);
    }

    [Fact]
    public async Task Confirmation_rejects_wrong_party_and_payment_proof_claim()
    {
        await using var db=Db();var founder=User();var investor=User();var stranger=User();db.AuthUsers.AddRange(founder,investor,stranger);
        var project=new Project{FounderId=founder.Id,DisplayName="P",Slug="p3",Summary="s",Description="d"};var opportunity=Opportunity(project,founder.Id,OpportunityFundingStatus.Closed);
        var participation=new OpportunityJoinRequest{Opportunity=opportunity,InvestorId=investor.Id,ParticipationSequence=1,RequestType=OpportunityJoinRequestType.InvestmentParticipation,Status=OpportunityJoinRequestStatus.Approved};
        db.AddRange(project,opportunity,participation);await db.SaveChangesAsync();var service=new OpportunityObligationCompletionService(new UnitOfWork(db),new Notifications(),new Email());
        await service.InitiateAsync(founder.Id,opportunity.Id,false);
        await FluentActions.Invoking(()=>service.ConfirmAsync(stranger.Id,opportunity.Id,participation.Id,new(){Statement="x",IdempotencyKey="x",AcknowledgeNoPaymentProof=true}))
            .Should().ThrowAsync<BusinessValidationException>().Where(e=>e.Code=="CONFIRMATION_NOT_AUTHORIZED");
        await FluentActions.Invoking(()=>service.ConfirmAsync(investor.Id,opportunity.Id,participation.Id,new(){Statement="x",IdempotencyKey="y",AcknowledgeNoPaymentProof=false}))
            .Should().ThrowAsync<BusinessValidationException>().Where(e=>e.Code=="DISCLAIMER_ACKNOWLEDGEMENT_REQUIRED");
    }

    private static Opportunity Opportunity(Project p,Guid founder,OpportunityFundingStatus status)=>new(){Project=p,FounderId=founder,SequenceNumber=1,Purpose="Purpose",Type="Opportunity",
        Title="Opportunity",ShortDescription="short",UseOfFunds="use",FundingTarget=1000,FundingCurrency="EGP",InvestmentModel=InvestmentModel.LoanInvestment,
        ProjectStage=ProjectStage.MVP,Status=OpportunityStatus.Completed,ModerationStatus=OpportunityModerationStatus.Approved,FundingStatus=status};
    private static AuthUser User()=>new(){Id=Guid.NewGuid(),Email=$"{Guid.NewGuid():N}@test.local",Status=true};
    private static ApplicationDbContext Db()=>new(new DbContextOptionsBuilder<ApplicationDbContext>().UseInMemoryDatabase(Guid.NewGuid().ToString()).Options);
    private sealed class Notifications:IUserNotificationService{
        public List<NotificationEventCreation> Events{get;}=[];
        public Task<UserNotification>CreateEventAsync(NotificationEventCreation c,CancellationToken t=default){Events.Add(c);return Task.FromResult(new UserNotification());}
        public Task<IReadOnlyList<UserNotification>>CreateEventRangeAsync(IEnumerable<NotificationEventCreation> c,CancellationToken t=default)=>Task.FromResult<IReadOnlyList<UserNotification>>([]);
        public Task<UserNotification>CreateAsync(string u,string t,string b,string ty,string? a=null,string? i=null,int? ti=null,long? n=null,CancellationToken c=default)=>Task.FromResult(new UserNotification());
        public Task<IReadOnlyList<UserNotification>>CreateRangeAsync(IEnumerable<UserNotificationCreation> c,CancellationToken t=default)=>Task.FromResult<IReadOnlyList<UserNotification>>([]);
    }
    private sealed class Email:IEmailService{
        public List<SendEmailRequest>Messages{get;}=[];public Task SendEmailAsync(SendEmailRequest r,CancellationToken c=default){Messages.Add(r);return Task.CompletedTask;}
        public Task<long>SendTemplatedEmailAsync(SendTemplatedEmailRequest r,CancellationToken c=default)=>Task.FromResult(1L);
        public Task<bool>VerifyConnectionAsync(CancellationToken c=default)=>Task.FromResult(true);
    }
}
