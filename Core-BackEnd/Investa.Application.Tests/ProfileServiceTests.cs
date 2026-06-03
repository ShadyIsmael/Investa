using System;
using System.Threading.Tasks;
using Investa.Application.Services;
using Investa.Application.DTOs.Profile;
using Investa.Application.Interfaces;
using Xunit;
using Microsoft.Extensions.DependencyInjection;

namespace Investa.Application.Tests
{
    public class ProfileServiceTests : IClassFixture<TestFixture>
    {
        private readonly IProfileService _profileService;

        public ProfileServiceTests(TestFixture fixture)
        {
            _profileService = fixture.ServiceProvider.GetRequiredService<IProfileService>();
        }

        [Fact]
        public async Task UpdateUserProfile_Should_Reject_Under18()
        {
            var testUserId = TestFixture.SeededUserId;
            var under18Dob = DateTime.UtcNow.Date.AddYears(-17); // clearly under 18

            var update = new UserProfileDto
            {
                BasicInfo = new BasicInfoDto { DateOfBirth = under18Dob }
            };

            await Assert.ThrowsAsync<InvalidOperationException>(() => _profileService.UpdateUserProfileAsync(testUserId, update));
        }

        [Fact]
        public async Task UpdateUserProfile_Should_Accept_Adult()
        {
            var testUserId = TestFixture.SeededUserId;
            var adultDob = DateTime.UtcNow.Date.AddYears(-25);

            var update = new UserProfileDto
            {
                BasicInfo = new BasicInfoDto { DateOfBirth = adultDob }
            };

            var updated = await _profileService.UpdateUserProfileAsync(testUserId, update);

            Assert.NotNull(updated);
            Assert.True(updated.BasicInfo.DateOfBirth.HasValue);
            Assert.Equal(adultDob, updated.BasicInfo.DateOfBirth.Value.Date);
        }
    }
}
