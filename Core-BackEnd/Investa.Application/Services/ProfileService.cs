using AutoMapper;
using Investa.Application.Common;
using Investa.Application.DTOs.Profile;
using Investa.Application.Interfaces;
using Investa.Domain.Entities;

#pragma warning disable CS8603 // Possible null reference return

namespace Investa.Application.Services;

/// <summary>
/// Service implementation for user profile operations.
/// Handles profile retrieval, updates, and IP tracking.
/// </summary>
public class ProfileService : IProfileService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly IWalletService _walletService;

    public ProfileService(IUnitOfWork unitOfWork, IMapper mapper, IWalletService walletService)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _walletService = walletService;
    }


    /// <inheritdoc/>
    public async Task<UserProfileDto?> GetUserProfileAsync(Guid userId)
    {
        var user = await _unitOfWork.Repository<AuthUser>()
            .GetSingleAsync(u => u.Id == userId, u => u.Profile);

        if (user == null || user.Profile == null)
            return null;

        return await MapToProfileDtoAsync(user)!;
    }

    /// <inheritdoc/>
    public async Task<UserProfileDto> GetOrCreateUserProfileAsync(Guid userId)
    {
        var user = await _unitOfWork.Repository<AuthUser>()
            .GetSingleAsync(u => u.Id == userId, u => u.Profile);

        if (user == null)
            throw new InvalidOperationException($"User with ID {userId} not found.");

        // Create profile if it doesn't exist
        if (user.Profile == null)
        {
            user.Profile = new UserProfile
            {
                UserId = userId,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            await _unitOfWork.Repository<UserProfile>().AddAsync(user.Profile);
            await _unitOfWork.SaveChangesAsync();
        }

        return await MapToProfileDtoAsync(user)!;
    }

    /// <inheritdoc/>
    public async Task<UserProfileDto> UpdateUserProfileAsync(Guid userId, UserProfileDto profileDto)
    {
        var user = await _unitOfWork.Repository<AuthUser>()
            .GetSingleAsync(u => u.Id == userId, u => u.Profile);

        if (user == null)
            throw new InvalidOperationException($"User with ID {userId} not found.");

        // Get or create profile
        var profile = user.Profile ?? new UserProfile { UserId = userId, CreatedAt = DateTime.UtcNow };

        if (user.Profile == null)
        {
            user.Profile = profile;
            await _unitOfWork.Repository<UserProfile>().AddAsync(profile);
        }

        // Update basic info
        if (profileDto.BasicInfo != null)
        {
            profile.FullName = profileDto.BasicInfo.FullName;
            profile.FirstName = profileDto.BasicInfo.FirstName;
            profile.LastName = profileDto.BasicInfo.LastName;
            profile.Gender = profileDto.BasicInfo.Gender;

            // Server-side DOB validation: reject users under 18 (defense-in-depth)
            if (profileDto.BasicInfo.DateOfBirth.HasValue)
            {
                var dob = profileDto.BasicInfo.DateOfBirth.Value;
                var now = DateTime.UtcNow.Date;
                var age = now.Year - dob.Year - ((now.Month < dob.Month || (now.Month == dob.Month && now.Day < dob.Day)) ? 1 : 0);
                if (age < 18)
                    throw new InvalidOperationException("User must be at least 18 years old.");

                profile.DateOfBirth = dob;
            }
            else
            {
                profile.DateOfBirth = profileDto.BasicInfo.DateOfBirth;
            }

            profile.Country = profileDto.BasicInfo.Country;
            profile.Nationality = profileDto.BasicInfo.Nationality;
            profile.CompanyName = profileDto.BasicInfo.CompanyName;
            profile.Bio = profileDto.BasicInfo.Bio;
            profile.AvatarUrl = profileDto.BasicInfo.AvatarUrl;
        }

        // Update contact info
        if (profileDto.ContactInfo != null)
        {
            profile.Email = profileDto.ContactInfo.Email;

            if (!string.IsNullOrWhiteSpace(profileDto.ContactInfo.Phone1))
            {
                var normalizedPhone1 = PhoneNumberNormalizer.NormalizePhoneNumber(profileDto.ContactInfo.Phone1);
                profile.Phone1 = normalizedPhone1 ?? profileDto.ContactInfo.Phone1.Trim();
            }
            else
            {
                profile.Phone1 = profileDto.ContactInfo.Phone1;
            }

            if (!string.IsNullOrWhiteSpace(profileDto.ContactInfo.Phone2))
            {
                var normalizedPhone2 = PhoneNumberNormalizer.NormalizePhoneNumber(profileDto.ContactInfo.Phone2);
                profile.Phone2 = normalizedPhone2 ?? profileDto.ContactInfo.Phone2.Trim();
            }
            else
            {
                profile.Phone2 = profileDto.ContactInfo.Phone2;
            }

            profile.Address = profileDto.ContactInfo.Address;
            profile.CompanyAddress = profileDto.ContactInfo.CompanyAddress;
            profile.CompanyEmail = profileDto.ContactInfo.CompanyEmail;
            profile.LinkedInUrl = profileDto.ContactInfo.LinkedInUrl;
            profile.FacebookUrl = profileDto.ContactInfo.FacebookUrl;

            // Map contact-level country and city if provided
            if (!string.IsNullOrEmpty(profileDto.ContactInfo.Country))
                profile.Country = profileDto.ContactInfo.Country;
            if (!string.IsNullOrEmpty(profileDto.ContactInfo.City))
                profile.City = profileDto.ContactInfo.City;
        }

        profile.UpdatedAt = DateTime.UtcNow;

        await _unitOfWork.SaveChangesAsync();

        return await MapToProfileDtoAsync(user)!;
    }

    /// <inheritdoc/>
    public async Task<UserProfileDto> UpdateLastLoginAsync(Guid userId, string? ipAddress, string? deviceInfo)
    {
        var user = await _unitOfWork.Repository<AuthUser>()
            .GetSingleAsync(u => u.Id == userId, u => u.Profile);

        if (user == null)
            throw new InvalidOperationException($"User with ID {userId} not found.");

        var profile = user.Profile ?? new UserProfile { UserId = userId, CreatedAt = DateTime.UtcNow };

        if (user.Profile == null)
        {
            user.Profile = profile;
            await _unitOfWork.Repository<UserProfile>().AddAsync(profile);
        }

        profile.LastLoginIP = ipAddress;
        profile.DeviceInfo = deviceInfo;
        profile.LastLoginDate = DateTime.UtcNow;
        profile.UpdatedAt = DateTime.UtcNow;

        await _unitOfWork.SaveChangesAsync();

        return await MapToProfileDtoAsync(user)!;
    }

    /// <inheritdoc/>
    public async Task<UserProfileDto> SetRegistrationIpAsync(Guid userId, string? ipAddress)
    {
        var user = await _unitOfWork.Repository<AuthUser>()
            .GetSingleAsync(u => u.Id == userId, u => u.Profile);

        if (user == null)
            throw new InvalidOperationException($"User with ID {userId} not found.");

        var profile = user.Profile ?? new UserProfile { UserId = userId, CreatedAt = DateTime.UtcNow };

        if (user.Profile == null)
        {
            user.Profile = profile;
            await _unitOfWork.Repository<UserProfile>().AddAsync(profile);
        }

        profile.RegistrationIP = ipAddress;
        profile.UpdatedAt = DateTime.UtcNow;

        await _unitOfWork.SaveChangesAsync();

        return await MapToProfileDtoAsync(user)!;
    }

    /// <inheritdoc/>
    public async Task<List<CreditTransactionDto>> GetCreditHistoryAsync(Guid userId)
    {
        var transactions = (await _unitOfWork.Repository<CreditTransaction>()
            .FindAsync(ct => ct.UserId == userId))
            .OrderByDescending(ct => ct.CreatedAt)
            .ToList();

        return _mapper.Map<List<CreditTransactionDto>>(transactions);
    }

    /// <summary>
    /// Maps User and UserProfile entities to UserProfileDto with all 3 sections.
    /// </summary>
    private async Task<UserProfileDto> MapToProfileDtoAsync(AuthUser user)
    {
        var dto = _mapper.Map<UserProfileDto>(user);
        if (dto == null)
            throw new InvalidOperationException("Failed to map user profile DTO.");

        // attempt to include client metrics (Score) from Client entity
        var client = await _unitOfWork.Repository<Client>().GetSingleAsync(c => c.UserId == user.Id);

        if (dto.BasicInfo == null)
            dto.BasicInfo = new BasicInfoDto();

        // Ledger-backed balance for all visible balance/credit fields
        // NOTE: `basicInfo.credit` is legacy-named but must remain in sync with the wallet ledger.
        // TODO: remove/rename this field once the API contract is modernized.
        if (dto.BasicInfo != null)
        {
            // Use wallet ledger as the single source of truth for visible credits/balances.
            dto.BasicInfo.Credit = await _walletService.GetBalanceAsync(user.Id);
        }


        if (client != null)
        {
            dto.BasicInfo.Score = client.Score;
            // TODO: `client.Credit` is legacy and should not be used for visible balance.
            // Keep it for backward compatibility elsewhere.
        }

        return dto;
    }
}
    #pragma warning restore CS8603

