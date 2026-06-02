using AutoMapper;
using Investa.Application.DTOs;
using Investa.Application.DTOs.Profile;
using Investa.Domain.Entities;

namespace Investa.Application.Mappings;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        CreateMap<Project, ProjectDto>();
        CreateMap<Client, ClientAdminDto>()
            .ForMember(dest => dest.StatusId, opt => opt.MapFrom(src => src.StatusId))
            .ForMember(dest => dest.StatusName, opt => opt.MapFrom(src => src.Status != null ? src.Status.NameEn : null))
            .ForMember(dest => dest.StatusNameEn, opt => opt.MapFrom(src => src.Status != null ? src.Status.NameEn : null))
            .ForMember(dest => dest.StatusNameAr, opt => opt.MapFrom(src => src.Status != null ? src.Status.NameAr : null))
            .ForMember(dest => dest.PenaltyDurationDays, opt => opt.MapFrom(src => src.PenaltyDurationDays));
        CreateMap<CreateInvestmentDto, Investment>();
        CreateMap<Investment, InvestmentDto>()
            .ForMember(dest => dest.TeamMembers, opt => opt.MapFrom(src => src.TeamMembers.Where(tm => tm.IsActive).OrderBy(tm => tm.SortOrder)))
            .ForMember(dest => dest.Images, opt => opt.MapFrom(src => src.Images.OrderBy(i => i.SortOrder)));

        CreateMap<InvestmentImage, InvestmentImageDto>();

        // InvestmentImage -> DTO mapping for API use
        CreateMap<InvestmentImage, InvestmentImageDto>();
        CreateMap<UpdateInvestmentDto, Investment>().ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null));
        CreateMap<InvestmentParticipant, InvestorParticipationDto>()
            .ForMember(dest => dest.InvestorName, opt => opt.MapFrom(src => src.Investor != null ? (src.Investor.Profile != null && !string.IsNullOrWhiteSpace(src.Investor.Profile.FullName) ? src.Investor.Profile.FullName : src.Investor.Name) : null))
            .ForMember(dest => dest.InvestorAvatar, opt => opt.MapFrom(src => src.Investor != null && src.Investor.Profile != null ? src.Investor.Profile.AvatarUrl : null));
        
        // Team member mapping - data comes from linked User/UserProfile
        CreateMap<InvestmentTeamMember, TeamMemberDto>()
            .ForMember(dest => dest.UserId, opt => opt.MapFrom(src => src.UserId.ToString()))
            .ForMember(dest => dest.Name, opt => opt.MapFrom(src => 
                src.User != null 
                    ? (src.User.Profile != null && !string.IsNullOrWhiteSpace(src.User.Profile.FullName) 
                        ? src.User.Profile.FullName 
                        : src.User.Name) 
                    : string.Empty))
            .ForMember(dest => dest.Avatar, opt => opt.MapFrom(src => 
                src.User != null && src.User.Profile != null ? src.User.Profile.AvatarUrl : null))
            .ForMember(dest => dest.LinkedIn, opt => opt.MapFrom(src => 
                src.User != null && src.User.Profile != null ? src.User.Profile.LinkedInUrl : null))
            .ForMember(dest => dest.Bio, opt => opt.MapFrom(src => 
                src.User != null && src.User.Profile != null ? src.User.Profile.Bio : null))
            .ForMember(dest => dest.ClientType, opt => opt.MapFrom(src => 
                src.User != null ? src.User.ClientType.ToString() : null));
        
        CreateMap<AuthUser, DTOs.UserDto>();
        CreateMap<Transaction, DTOs.TransactionDto>();
        
        // CreditTransaction mapping for credibility score audit trail
        CreateMap<CreditTransaction, DTOs.Profile.CreditTransactionDto>()
            .ForMember(d => d.AdminName, opt => opt.MapFrom(s => s.Admin != null ? (s.Admin.Name ?? s.Admin.Email) : null));

        // Investment request mapping
        CreateMap<InvestmentRequest, DTOs.Requests.InvestmentRequestDto>()
            .ForMember(d => d.Status, opt => opt.MapFrom(s => s.Status.ToString()))
            .ForMember(d => d.Direction, opt => opt.MapFrom(s => s.Direction.ToString()))
            .ForMember(d => d.Type, opt => opt.MapFrom(s => s.RequestType));

        // User core metrics mapping
        CreateMap<AuthUser, UserCoreMetricsDto>()
            .ForMember(dest => dest.ClientType, opt => opt.MapFrom(src => src.ClientType.ToString()))
            .ForMember(dest => dest.CurrentCredibilityScore, opt => opt.MapFrom(src => src.Profile != null ? src.Profile.CurrentCredibilityScore : 0));

        CreateMap<ScoreTransaction, ScoreTransactionDto>()
            .ForMember(d => d.TransactionTypeId, opt => opt.MapFrom(s => s.TransactionTypeId))
            .ForMember(d => d.TransactionTypeKey, opt => opt.MapFrom(s => s.TransactionType != null ? s.TransactionType.Key : null));

        // Sectional profile mappings
        CreateMap<UserProfile, BasicInfoDto>();
        CreateMap<UserProfile, ContactInfoDto>();
        CreateMap<UserProfile, IdentityComplianceDto>()
            .ForMember(dest => dest.VerificationStatus, opt => opt.MapFrom(src => src.VerificationStatus.ToString()));
        CreateMap<UserProfile, AuditUsageDto>();

        // Full profile mapping
        CreateMap<AuthUser, UserProfileDto>()
            .ForMember(dest => dest.UserId, opt => opt.MapFrom(src => src.Id))
            .ForMember(dest => dest.CoreMetrics, opt => opt.MapFrom(src => src))
            .ForMember(dest => dest.BasicInfo, opt => opt.MapFrom(src => src.Profile))
            .ForMember(dest => dest.ContactInfo, opt => opt.MapFrom(src => src.Profile))
            .ForMember(dest => dest.IdentityCompliance, opt => opt.MapFrom(src => src.Profile))
            .ForMember(dest => dest.AuditUsage, opt => opt.MapFrom(src => src.Profile))
            .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => src.Profile != null ? src.Profile.CreatedAt : default))
            .ForMember(dest => dest.UpdatedAt, opt => opt.MapFrom(src => src.Profile != null ? src.Profile.UpdatedAt : default));
    }
}