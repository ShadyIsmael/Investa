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
        CreateMap<Investment, InvestmentDto>();
        CreateMap<UpdateInvestmentDto, Investment>().ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null));
        CreateMap<User, DTOs.UserDto>();
        CreateMap<Transaction, DTOs.TransactionDto>();
        CreateMap<CreditTransaction, DTOs.CreditTransactionDto>()
            .ForMember(d => d.Type, opt => opt.MapFrom(s => s.Type.ToString()))
            .ForMember(d => d.UserId, opt => opt.MapFrom(s => s.UserId));

        // User core metrics mapping
        CreateMap<User, UserCoreMetricsDto>()
            .ForMember(dest => dest.ClientType, opt => opt.MapFrom(src => src.ClientType.ToString()));

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
        CreateMap<User, UserProfileDto>()
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