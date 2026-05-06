using AutoMapper;
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

    public ProfileService(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    /// <inheritdoc/>
    public async Task<UserProfileDto?> GetUserProfileAsync(Guid userId)
    {
        var user = await _unitOfWork.Repository<User>()
            .GetSingleAsync(u => u.Id == userId, u => u.Profile);

        if (user == null || user.Profile == null)
            return null;

        // Calculate KYC completion percentage
        CalculateKycCompletion(user.Profile);
        await _unitOfWork.SaveChangesAsync();

        return await MapToProfileDtoAsync(user)!;
    }

    /// <inheritdoc/>
    public async Task<UserProfileDto> GetOrCreateUserProfileAsync(Guid userId)
    {
        var user = await _unitOfWork.Repository<User>()
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
        else
        {
            // Calculate KYC completion for existing profile
            CalculateKycCompletion(user.Profile);
            await _unitOfWork.SaveChangesAsync();
        }

        return await MapToProfileDtoAsync(user)!;
    }

    /// <inheritdoc/>
    public async Task<UserProfileDto> UpdateUserProfileAsync(Guid userId, UserProfileDto profileDto)
    {
        var user = await _unitOfWork.Repository<User>()
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
            profile.Phone1 = profileDto.ContactInfo.Phone1;
            profile.Phone2 = profileDto.ContactInfo.Phone2;
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

        // Update identity & compliance
        if (profileDto.IdentityCompliance != null)
        {
            profile.DocumentNumber = profileDto.IdentityCompliance.DocumentNumber;
            profile.DocumentExpiryDate = profileDto.IdentityCompliance.DocumentExpiryDate;
            profile.DocumentFrontImageUrl = profileDto.IdentityCompliance.DocumentFrontImageUrl;
            profile.DocumentBackImageUrl = profileDto.IdentityCompliance.DocumentBackImageUrl;
            profile.HrLetterFileName = profileDto.IdentityCompliance.HrLetterFileName;
            profile.HrLetterBase64 = profileDto.IdentityCompliance.HrLetterBase64;
            profile.DeviceMacAddress = profileDto.IdentityCompliance.DeviceMacAddress;
        }

        // Update client-level fields (NationalId) when provided. BusinessRole is no longer part of profile updates.
        var client = await _unitOfWork.Repository<Client>().GetSingleAsync(c => c.UserId == userId);
        if (client != null)
        {
            if (profileDto.IdentityCompliance != null && !string.IsNullOrEmpty(profileDto.IdentityCompliance.DocumentNumber))
            {
                if (client.NationalId != profileDto.IdentityCompliance.DocumentNumber)
                {
                    // Audit national id change
                    var audit = new ProfileChangeAudit
                    {
                        UserId = userId,
                        FieldName = "NationalId",
                        OldValue = client.NationalId,
                        NewValue = profileDto.IdentityCompliance.DocumentNumber,
                        Reason = "User updated national ID",
                        CreatedAt = DateTime.UtcNow
                    };
                    await _unitOfWork.Repository<ProfileChangeAudit>().AddAsync(audit);

                    // Reset verification status and set to Pending for review
                    profile.VerificationStatus = Domain.Entities.Enums.VerificationStatus.Pending;

                    client.NationalId = profileDto.IdentityCompliance.DocumentNumber;
                }
            }
        }

        profile.UpdatedAt = DateTime.UtcNow;

        // Calculate KYC completion percentage
        CalculateKycCompletion(profile);

        await _unitOfWork.SaveChangesAsync();

        return await MapToProfileDtoAsync(user)!;
    }

    /// <inheritdoc/>
    public async Task<UserProfileDto> UpdateLastLoginAsync(Guid userId, string? ipAddress, string? deviceInfo)
    {
        var user = await _unitOfWork.Repository<User>()
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
        var user = await _unitOfWork.Repository<User>()
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
    public async Task<UserProfileDto> StartKycAsync(Guid userId)
    {
        var user = await _unitOfWork.Repository<User>()
            .GetSingleAsync(u => u.Id == userId, u => u.Profile);

        if (user == null)
            throw new InvalidOperationException($"User with ID {userId} not found.");

        var profile = user.Profile ?? new UserProfile { UserId = userId, CreatedAt = DateTime.UtcNow };

        if (user.Profile == null)
        {
            user.Profile = profile;
            await _unitOfWork.Repository<UserProfile>().AddAsync(profile);
        }

        // Validation: User must not have already started KYC
        if (profile.VerificationStatus != Domain.Entities.Enums.VerificationStatus.None)
        {
            throw new InvalidOperationException(
                $"KYC already initiated. Current status: {profile.VerificationStatus}");
        }

        // Set verification status to Pending
        profile.VerificationStatus = Domain.Entities.Enums.VerificationStatus.Pending;
        profile.UpdatedAt = DateTime.UtcNow;

        // Create credit transaction for KYC initiation reward (+10 points)
        var creditTransaction = new CreditTransaction
        {
            UserId = userId,
            Amount = 10m,
            JustificationAr = "مكافأة بدء إجراءات توثيق الهوية",
            JustificationEn = "Reward for initiating identity verification",
            CreatedAt = DateTime.UtcNow,
            AdminId = null // System-generated transaction
        };

        await _unitOfWork.Repository<CreditTransaction>().AddAsync(creditTransaction);

        // Update user's current credibility score
        profile.CurrentCredibilityScore += 10m;

        // Save all changes atomically
        await _unitOfWork.SaveChangesAsync();

        return await MapToProfileDtoAsync(user)!;;
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
    /// Calculates KYC completion percentage based on required profile fields.
    /// Auto-verifies user when reaching 100% completion.
    /// </summary>
    /// <param name="profile">The user profile to calculate completion for</param>
    private void CalculateKycCompletion(UserProfile profile)
    {
        int totalFields = 14; // Total KYC required fields
        int filledFields = 0;

        // Basic Info (5 fields)
        if (!string.IsNullOrWhiteSpace(profile.FirstName)) filledFields++;
        if (!string.IsNullOrWhiteSpace(profile.LastName)) filledFields++;
        if (profile.DateOfBirth.HasValue) filledFields++;
        if (!string.IsNullOrWhiteSpace(profile.Nationality)) filledFields++;
        if (!string.IsNullOrWhiteSpace(profile.CompanyName)) filledFields++;

        // Contact Info (4 fields)
        if (!string.IsNullOrWhiteSpace(profile.Email)) filledFields++;
        if (!string.IsNullOrWhiteSpace(profile.Phone1)) filledFields++;
        if (!string.IsNullOrWhiteSpace(profile.CompanyAddress)) filledFields++;
        if (!string.IsNullOrWhiteSpace(profile.CompanyEmail)) filledFields++;

        // Identity & Compliance (5 fields)
        if (!string.IsNullOrWhiteSpace(profile.DocumentNumber)) filledFields++;
        if (profile.DocumentExpiryDate.HasValue) filledFields++;
        if (!string.IsNullOrWhiteSpace(profile.DocumentFrontImageUrl)) filledFields++;
        if (!string.IsNullOrWhiteSpace(profile.HrLetterFileName)) filledFields++;
        if (!string.IsNullOrWhiteSpace(profile.DeviceMacAddress)) filledFields++;

        // Calculate percentage
        profile.KycCompletionPercentage = (int)Math.Round((double)filledFields / totalFields * 100);

        // Auto-verify when 100% complete
        if (profile.KycCompletionPercentage >= 100 && profile.VerificationStatus == Domain.Entities.Enums.VerificationStatus.Pending)
        {
            profile.VerificationStatus = Domain.Entities.Enums.VerificationStatus.Verified;
            profile.IsKycVerified = true;
        }
        else if (profile.KycCompletionPercentage < 100)
        {
            profile.IsKycVerified = false;
        }
    }

    /// <summary>
    /// Maps User and UserProfile entities to UserProfileDto with all 4 sections.
    /// </summary>
    private async Task<UserProfileDto> MapToProfileDtoAsync(User user)
    {
        var dto = _mapper.Map<UserProfileDto>(user);
        if (dto == null)
            throw new InvalidOperationException("Failed to map user profile DTO.");

        // attempt to include client metrics (Score, Credit) from Client entity
        var client = await _unitOfWork.Repository<Client>().GetSingleAsync(c => c.UserId == user.Id);
        if (dto.BasicInfo == null)
            dto.BasicInfo = new BasicInfoDto();

        if (client != null)
        {
            dto.BasicInfo.Score = client.Score;
            dto.BasicInfo.Credit = client.Credit;
        }

        // Include KYC completion fields
        if (user.Profile != null)
        {
            dto.BasicInfo.IsKycVerified = user.Profile.IsKycVerified;
            dto.BasicInfo.KycCompletionPercentage = user.Profile.KycCompletionPercentage;
        }

        return dto;
    }
}
    #pragma warning restore CS8603
