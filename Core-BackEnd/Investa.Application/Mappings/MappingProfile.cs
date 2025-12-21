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
        CreateMap<CreateInvestmentDto, Investment>();
        CreateMap<User, DTOs.UserDto>();
        CreateMap<Transaction, DTOs.TransactionDto>();

        // User core metrics mapping
        CreateMap<User, UserCoreMetricsDto>()
            .ForMember(dest => dest.ClientType, opt => opt.MapFrom(src => src.ClientType.ToString()));

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