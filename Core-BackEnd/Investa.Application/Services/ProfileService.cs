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
    public async Task<UserProfileDto?> GetUserProfileAsync(int userId)
    {
        var user = await _unitOfWork.Repository<User>()
            .GetSingleAsync(u => u.Id == userId, u => u.Profile);

        if (user == null || user.Profile == null)
            return null;

        return MapToProfileDto(user)!;
    }

    /// <inheritdoc/>
    public async Task<UserProfileDto> GetOrCreateUserProfileAsync(int userId)
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

        return MapToProfileDto(user)!;
    }

    /// <inheritdoc/>
    public async Task<UserProfileDto> UpdateUserProfileAsync(int userId, UserProfileDto profileDto)
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
            profile.Gender = profileDto.BasicInfo.Gender;
            profile.Nationality = profileDto.BasicInfo.Nationality;
            profile.Bio = profileDto.BasicInfo.Bio;
        }

        // Update contact info
        if (profileDto.ContactInfo != null)
        {
            profile.Email = profileDto.ContactInfo.Email;
            profile.Phone1 = profileDto.ContactInfo.Phone1;
            profile.Phone2 = profileDto.ContactInfo.Phone2;
            profile.WorkAddress = profileDto.ContactInfo.WorkAddress;
        }

        // Update identity & compliance
        if (profileDto.IdentityCompliance != null)
        {
            profile.DocumentNumber = profileDto.IdentityCompliance.DocumentNumber;
            profile.DocumentExpiryDate = profileDto.IdentityCompliance.DocumentExpiryDate;
            profile.DocumentFrontImageUrl = profileDto.IdentityCompliance.DocumentFrontImageUrl;
            profile.DocumentBackImageUrl = profileDto.IdentityCompliance.DocumentBackImageUrl;
        }

        profile.UpdatedAt = DateTime.UtcNow;
        await _unitOfWork.SaveChangesAsync();

        return MapToProfileDto(user)!;
    }

    /// <inheritdoc/>
    public async Task<UserProfileDto> UpdateLastLoginAsync(int userId, string? ipAddress, string? deviceInfo)
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

        return MapToProfileDto(user)!;
    }

    /// <inheritdoc/>
    public async Task<UserProfileDto> SetRegistrationIpAsync(int userId, string? ipAddress)
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

        return MapToProfileDto(user)!;
    }

    /// <summary>
    /// Maps User and UserProfile entities to UserProfileDto with all 4 sections.
    /// </summary>
    private UserProfileDto MapToProfileDto(User user)
    {
        var dto = _mapper.Map<UserProfileDto>(user);
        if (dto == null)
            throw new InvalidOperationException("Failed to map user profile DTO.");
        return dto;
    }
}
    #pragma warning restore CS8603
