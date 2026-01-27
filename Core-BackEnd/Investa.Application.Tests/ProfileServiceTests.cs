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
        public async Task UpdateUserProfile_Should_Persist_BusinessRole_And_NationalId()
        {
            // Arrange: use a seeded test user ID from TestFixture
            var testUserId = TestFixture.SeededUserId;
            var update = new UserProfileDto
            {
                BasicInfo = new BasicInfoDto { FirstName = "Test", LastName = "User" },
                CoreMetrics = new UserCoreMetricsDto { Role = "Founder", ClientType = "Founder" },
                IdentityCompliance = new IdentityComplianceDto { DocumentNumber = "NID-123456" }
            };

            // Act
            var updated = await _profileService.UpdateUserProfileAsync(testUserId, update);

            // Assert
            Assert.NotNull(updated);
            Assert.Equal("Founder", updated.CoreMetrics?.Role ?? updated.CoreMetrics?.ClientType);
            Assert.Equal("NID-123456", updated.IdentityCompliance?.DocumentNumber);
        }
    }
}
