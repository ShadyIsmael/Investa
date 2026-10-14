using FluentAssertions;
using Investa.Application.Common;
using Investa.Application.DTOs;
using Investa.Application.Services;
using Investa.Domain.Entities;
using Investa.Domain.Entities.Enums;
using Investa.Infrastructure.Persistence;
using Investa.Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Moq;
using System.Text.Json;
using Xunit;

namespace Investa.Api.IntegrationTests;

public sealed class ProjectRoomPhase7SecurityTests
{
    [Fact]
    public async Task Founder_and_privileged_reviewer_see_every_opportunity_section()
    {
        await using var fixture=await Fixture.Create();
        var founderRoom=await fixture.Service.GetAsync(fixture.Founder.Id,fixture.Project.Id,false);
        var reviewerRoom=await fixture.Service.GetAsync(Guid.NewGuid(),fixture.Project.Id,true);

        foreach(var room in new[]{founderRoom,reviewerRoom})
        {
            room.Opportunities.Should().HaveCount(2);
            room.Opportunities.Should().OnlyContain(x=>x.HasOriginatingOpportunityAccess);
            room.Opportunities.Should().OnlyContain(x=>!string.IsNullOrEmpty(x.OpportunityRoomUrl));
            room.Opportunities.Sum(x=>x.VisibleParticipationCount).Should().Be(2);
            room.Opportunities.Sum(x=>x.VisibleContractCount).Should().Be(2);
        }
    }

    [Fact]
    public async Task Approved_investor_enters_project_but_other_opportunity_is_strictly_projected()
    {
        await using var fixture=await Fixture.Create();
        var room=await fixture.Service.GetAsync(fixture.InvestorA.Id,fixture.Project.Id,false);
        var own=room.Opportunities.Single(x=>x.OpportunityId==fixture.OpportunityA.Id);
        var other=room.Opportunities.Single(x=>x.OpportunityId==fixture.OpportunityB.Id);

        own.HasOriginatingOpportunityAccess.Should().BeTrue();
        own.VisibleParticipationCount.Should().Be(1);
        own.VisibleContractCount.Should().Be(1);
        own.Documents.Should().Contain(x=>x.FileName=="a-private.pdf");
        own.OpportunityRoomUrl.Should().NotBeEmpty();
        own.CashFlowUrl.Should().NotBeEmpty();
        own.ObligationCompletionUrl.Should().NotBeEmpty();

        other.HasOriginatingOpportunityAccess.Should().BeFalse();
        other.VisibleParticipationCount.Should().Be(0);
        other.VisibleContractCount.Should().Be(0);
        other.Documents.Should().ContainSingle(x=>x.FileName=="b-public.pdf");
        other.Documents.Should().NotContain(x=>x.FileName=="b-private.pdf");
        other.Media.Should().ContainSingle(x=>x.FileName=="b-public.jpg");
        other.Media.Should().NotContain(x=>x.FileName=="b-private.jpg");
        other.OpportunityRoomUrl.Should().BeEmpty();
        other.CashFlowUrl.Should().BeEmpty();
        other.ObligationCompletionUrl.Should().BeEmpty();
    }

    [Theory]
    [InlineData(OpportunityJoinRequestStatus.Pending)]
    [InlineData(OpportunityJoinRequestStatus.Rejected)]
    [InlineData(OpportunityJoinRequestStatus.Cancelled)]
    public async Task Non_approved_participation_does_not_grant_membership(OpportunityJoinRequestStatus status)
    {
        await using var fixture=await Fixture.Create();
        var outsider=User();
        fixture.Db.AuthUsers.Add(outsider);
        fixture.Db.OpportunityJoinRequests.Add(Participation(fixture.OpportunityA,outsider,status));
        await fixture.Db.SaveChangesAsync();

        await FluentActions.Invoking(()=>fixture.Service.GetAsync(outsider.Id,fixture.Project.Id,false))
            .Should().ThrowAsync<BusinessValidationException>().Where(x=>x.Code=="PROJECT_ROOM_FORBIDDEN");
    }

    [Fact]
    public async Task Foreign_investor_and_cross_project_ids_are_isolated()
    {
        await using var fixture=await Fixture.Create();
        var foreignProject=new Project{FounderId=fixture.InvestorB.Id,DisplayName="Foreign",Slug="foreign",Summary="s",Description="d"};
        var foreignOpportunity=Opportunity(foreignProject,fixture.InvestorB.Id,1);
        fixture.Db.AddRange(foreignProject,foreignOpportunity);
        await fixture.Db.SaveChangesAsync();

        await FluentActions.Invoking(()=>fixture.Service.GetAsync(fixture.InvestorA.Id,foreignProject.Id,false))
            .Should().ThrowAsync<BusinessValidationException>().Where(x=>x.Code=="PROJECT_ROOM_FORBIDDEN");
        await FluentActions.Invoking(()=>fixture.Service.GetAsync(fixture.InvestorA.Id,999999,false))
            .Should().ThrowAsync<BusinessValidationException>().Where(x=>x.Code=="PROJECT_NOT_FOUND");
    }

    [Fact]
    public async Task Project_document_cannot_be_linked_from_an_unregistered_or_other_context_file()
    {
        await using var fixture=await Fixture.Create();
        fixture.Db.FileCategories.Add(GeneralProjectRoomCategory());
        await fixture.Db.SaveChangesAsync();
        await FluentActions.Invoking(()=>fixture.Service.AddDocumentAsync(fixture.Founder.Id,fixture.Project.Id,new CreateProjectRoomDocumentRequest{
            FileKey="uploads-GENERAL/forged.pdf",CategoryCode="GENERAL",DocumentType="Financial report",Visibility=ProjectRoomDocumentVisibility.ProjectMembers}))
            .Should().ThrowAsync<BusinessValidationException>().Where(x=>x.Code=="PROJECT_DOCUMENT_UPLOAD_REQUIRED");
    }

    [Fact]
    public async Task Founder_links_governed_project_upload_with_server_owned_metadata()
    {
        await using var fixture=await Fixture.Create();
        var key="uploads-GENERAL/financials.pdf";
        fixture.Db.FileCategories.Add(GeneralProjectRoomCategory());
        fixture.Db.StoredFiles.Add(new StoredFile{FileId="doc-2",FileKey=key,CategoryCode="GENERAL",OriginalFileName="financials.pdf",Extension=".pdf",
            MimeType="application/pdf",FileSizeBytes=2048,UploadedByUserId=fixture.Founder.Id,ProjectId=fixture.Project.Id,EntityType="ProjectRoom",EntityId=fixture.Project.Id.ToString()});
        await fixture.Db.SaveChangesAsync();

        var linked=await fixture.Service.AddDocumentAsync(fixture.Founder.Id,fixture.Project.Id,new CreateProjectRoomDocumentRequest{
            FileKey=key,CategoryCode="GENERAL",DocumentType="Financial report",Visibility=ProjectRoomDocumentVisibility.ProjectMembers});
        var room=await fixture.Service.GetAsync(fixture.Founder.Id,fixture.Project.Id,false);
        var document=room.Documents.Single();
        linked.FileName.Should().Be("financials.pdf");
        document.DocumentType.Should().Be("Financial report");
        document.Category.Should().Be("GENERAL");
        document.MimeType.Should().Be("application/pdf");
        document.FileSize.Should().Be(2048);
        document.CanDownload.Should().BeTrue();
        document.DownloadUrl.Should().Contain($"/documents/{linked.Id}/download");
    }

    [Fact]
    public async Task Founder_only_project_document_is_denied_to_an_approved_project_participant()
    {
        await using var fixture=await Fixture.Create();
        var key="uploads-GENERAL/founder-only.pdf";
        var stored=new StoredFile{FileId="doc-1",FileKey=key,CategoryCode="GENERAL",OriginalFileName="founder-only.pdf",Extension=".pdf",
            MimeType="application/pdf",FileSizeBytes=100,UploadedByUserId=fixture.Founder.Id,ProjectId=fixture.Project.Id,EntityType="ProjectRoom",EntityId=fixture.Project.Id.ToString()};
        var document=new ProjectRoomDocument{ProjectId=fixture.Project.Id,FileKey=key,FileName=stored.OriginalFileName,DocumentType="Legal",Visibility=ProjectRoomDocumentVisibility.FounderOnly,CreatedByUserId=fixture.Founder.Id};
        fixture.Db.AddRange(stored,document);await fixture.Db.SaveChangesAsync();

        await FluentActions.Invoking(()=>fixture.Service.DownloadDocumentAsync(fixture.InvestorA.Id,fixture.Project.Id,document.Id,false))
            .Should().ThrowAsync<BusinessValidationException>().Where(x=>x.Code=="PROJECT_ROOM_FORBIDDEN");
    }

    [Fact]
    public async Task Project_room_timeline_includes_only_persisted_public_activity_events()
    {
        await using var fixture=await Fixture.Create();
        fixture.Db.OpportunityEvents.AddRange(
            new OpportunityEvent{OpportunityId=fixture.OpportunityA.Id,EventType="OpportunityCreated",Title="key",CreatedByUserId=fixture.Founder.Id,
                IsPublic=true,IsImmutableTimelineEntry=true},
            new OpportunityEvent{OpportunityId=fixture.OpportunityA.Id,EventType="PrivateInternalNote",Title="private",CreatedByUserId=fixture.Founder.Id,
                IsPublic=false,IsImmutableTimelineEntry=true});
        await fixture.Db.SaveChangesAsync();

        var room=await fixture.Service.GetAsync(fixture.Founder.Id,fixture.Project.Id,false);
        room.Timeline.Should().ContainSingle(x=>x.EventType=="OpportunityCreated"&&x.OpportunityId==fixture.OpportunityA.Id);
        room.Timeline.Should().NotContain(x=>x.Title=="PrivateInternalNote");
    }

    [Fact]
    public async Task Manipulated_project_and_milestone_ids_cannot_cross_ownership_boundary()
    {
        await using var fixture=await Fixture.Create();
        var milestone=await fixture.Service.AddEntryAsync(fixture.Founder.Id,fixture.Project.Id,new CreateProjectRoomEntryRequest{
            EntryType=ProjectRoomEntryType.Milestone,Title="M",IsInvestorVisible=true});
        var otherProject=new Project{FounderId=fixture.InvestorB.Id,DisplayName="Other",Slug="other",Summary="s",Description="d"};
        fixture.Db.Projects.Add(otherProject);await fixture.Db.SaveChangesAsync();

        await FluentActions.Invoking(()=>fixture.Service.CompleteMilestoneAsync(fixture.InvestorB.Id,fixture.Project.Id,milestone.Id))
            .Should().ThrowAsync<BusinessValidationException>().Where(x=>x.Code=="PROJECT_ROOM_FORBIDDEN");
        await FluentActions.Invoking(()=>fixture.Service.CompleteMilestoneAsync(fixture.InvestorB.Id,otherProject.Id,milestone.Id))
            .Should().ThrowAsync<BusinessValidationException>().Where(x=>x.Code=="MILESTONE_NOT_FOUND");
        await FluentActions.Invoking(()=>fixture.Service.AddDocumentAsync(fixture.InvestorA.Id,fixture.Project.Id,new(){
            FileKey="manipulated",DocumentType="Other"}))
            .Should().ThrowAsync<BusinessValidationException>().Where(x=>x.Code=="PROJECT_ROOM_FORBIDDEN");
    }

    [Fact]
    public async Task Archived_project_keeps_existing_member_authorization_and_missing_project_is_not_found()
    {
        await using var fixture=await Fixture.Create();
        fixture.Project.Status=ProjectStatus.Archived;await fixture.Db.SaveChangesAsync();
        (await fixture.Service.GetAsync(fixture.InvestorA.Id,fixture.Project.Id,false)).HasProjectAccess.Should().BeTrue();
        await FluentActions.Invoking(()=>fixture.Service.GetAsync(fixture.InvestorA.Id,int.MaxValue,false))
            .Should().ThrowAsync<BusinessValidationException>().Where(x=>x.Code=="PROJECT_NOT_FOUND");
    }

    [Fact]
    public async Task Opportunity_room_endpoint_returns_opportunity_payload_without_project_room_redirect()
    {
        using var factory=new CustomWebApplicationFactory();
        using var client=factory.CreateClient();
        int opportunityId,projectId;
        using(var scope=factory.Services.CreateScope())
        {
            var db=scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var founderId=Guid.Parse("11111111-1111-1111-1111-111111111111");
            var founder=User();founder.Id=founderId;db.AuthUsers.Add(founder);
            var project=new Project{FounderId=founderId,DisplayName="Legacy",Slug="legacy-room",Summary="s",Description="d"};
            var opportunity=Opportunity(project,founderId,1);db.AddRange(project,opportunity);await db.SaveChangesAsync();
            opportunityId=opportunity.Id;projectId=project.Id;
        }

        var response=await client.GetAsync($"/api/v1/opportunities/{opportunityId}/room");
        response.EnsureSuccessStatusCode();
        using var json=JsonDocument.Parse(await response.Content.ReadAsStringAsync());
        var data=json.RootElement.GetProperty("data");
        data.GetProperty("projectId").GetInt32().Should().Be(projectId);
        data.GetProperty("overview").GetProperty("id").GetInt32().Should().Be(opportunityId);
        data.GetProperty("participantContext").GetProperty("isAdmin").GetBoolean().Should().BeTrue();
    }

    private sealed class Fixture : IAsyncDisposable
    {
        public ApplicationDbContext Db{get;} public ProjectRoomService Service{get;}
        public AuthUser Founder{get;}=User();public AuthUser InvestorA{get;}=User();public AuthUser InvestorB{get;}=User();
        public Project Project{get;private set;}=null!;public Opportunity OpportunityA{get;private set;}=null!;public Opportunity OpportunityB{get;private set;}=null!;
        private Fixture(){Db=new(new DbContextOptionsBuilder<ApplicationDbContext>().UseInMemoryDatabase(Guid.NewGuid().ToString()).Options);Service=new(new UnitOfWork(Db),Mock.Of<Investa.Application.Interfaces.IFileStorage>());}
        public static async Task<Fixture>Create()
        {
            var f=new Fixture();f.Db.AuthUsers.AddRange(f.Founder,f.InvestorA,f.InvestorB);
            f.Project=new(){FounderId=f.Founder.Id,DisplayName="Project",Slug="project",Summary="s",Description="d"};
            f.OpportunityA=Opportunity(f.Project,f.Founder.Id,1);f.OpportunityB=Opportunity(f.Project,f.Founder.Id,2);
            f.Db.AddRange(f.Project,f.OpportunityA,f.OpportunityB);await f.Db.SaveChangesAsync();
            f.Db.OpportunityJoinRequests.AddRange(Participation(f.OpportunityA,f.InvestorA,OpportunityJoinRequestStatus.Approved),Participation(f.OpportunityB,f.InvestorB,OpportunityJoinRequestStatus.Approved));
            f.Db.InvestmentContracts.AddRange(Contract(f.OpportunityA,f.Founder,f.InvestorA,"A"),Contract(f.OpportunityB,f.Founder,f.InvestorB,"B"));
            f.Db.OpportunityDocuments.AddRange(Document(f.OpportunityA,"a-private.pdf",false),Document(f.OpportunityB,"b-private.pdf",false),Document(f.OpportunityB,"b-public.pdf",true));
            f.Db.OpportunityMedia.AddRange(Media(f.OpportunityB,"b-private.jpg",false),Media(f.OpportunityB,"b-public.jpg",true));
            await f.Db.SaveChangesAsync();return f;
        }
        public ValueTask DisposeAsync()=>Db.DisposeAsync();
    }
    private static AuthUser User()=>new(){Id=Guid.NewGuid(),Email=$"{Guid.NewGuid():N}@test.local",Status=true};
    private static FileCategory GeneralProjectRoomCategory()=>new(){Code="GENERAL",NameEn="General",NameAr="عام",SortOrder=1,IsActive=true,MaxFileSizeBytes=25*1024*1024,
        AllowedExtensions=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.zip",AllowedMimeTypes="application/pdf"};
    private static Opportunity Opportunity(Project p,Guid founder,int sequence)=>new(){Project=p,FounderId=founder,SequenceNumber=sequence,Type="Opportunity",
        Title=$"Opportunity {sequence}",ShortDescription="short",UseOfFunds="use",FundingTarget=1000,FundingCurrency="EGP",InvestmentModel=InvestmentModel.LoanInvestment,
        ProjectStage=ProjectStage.MVP,Status=OpportunityStatus.Completed,ModerationStatus=OpportunityModerationStatus.Approved,FundingStatus=OpportunityFundingStatus.Closed};
    private static OpportunityJoinRequest Participation(Opportunity o,AuthUser investor,OpportunityJoinRequestStatus status)=>new(){Opportunity=o,InvestorId=investor.Id,
        RequestType=OpportunityJoinRequestType.InvestmentParticipation,Status=status,ParticipationSequence=1};
    private static InvestmentContract Contract(Opportunity o,AuthUser founder,AuthUser investor,string suffix)=>new(){Opportunity=o,FounderUserId=founder.Id,InvestorUserId=investor.Id,
        ContractNumber=$"C-{suffix}",InvestmentModel=InvestmentModel.LoanInvestment,CurrentVersionNumber=1};
    private static OpportunityDocument Document(Opportunity o,string name,bool isPublic)=>new(){Opportunity=o,FileKey=name,FileName=name,FileExtension=".pdf",
        FileUrl=$"/{name}",DocumentType="Test",Visibility=isPublic?OpportunityDocumentVisibility.Public:OpportunityDocumentVisibility.Private,CreatedByUserId=o.FounderId};
    private static OpportunityMedia Media(Opportunity o,string name,bool isPublic)=>new(){Opportunity=o,FileKey=name,FileName=name,FileUrl=$"/{name}",FileType="image",
        MediaType="Gallery",IsPublic=isPublic,CreatedByUserId=o.FounderId};
}
