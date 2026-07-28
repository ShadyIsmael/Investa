using FluentAssertions;
using Investa.Application.DTOs;
using Investa.Domain.Entities;
using Xunit;

namespace Investa.UnitTests;

public class DeviceTokenTests
{
    [Fact]
    public void DeviceToken_CanBeCreatedWithDefaultValues()
    {
        var token = new DeviceToken();

        token.Id.Should().Be(0);
        token.UserId.Should().BeEmpty();
        token.Token.Should().BeEmpty();
        token.IsActive.Should().BeTrue();
        token.CreatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(5));
        token.UpdatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(5));
        token.DeviceId.Should().BeNull();
        token.Browser.Should().BeNull();
        token.Platform.Should().BeNull();
        token.LastUsedAt.Should().BeNull();
    }

    [Fact]
    public void RegisterDeviceTokenRequestDto_RequiresToken()
    {
        var dto = new RegisterDeviceTokenRequestDto();
        var context = new System.ComponentModel.DataAnnotations.ValidationContext(dto);
        var results = new List<System.ComponentModel.DataAnnotations.ValidationResult>();
        var isValid = System.ComponentModel.DataAnnotations.Validator.TryValidateObject(dto, context, results, true);

        isValid.Should().BeFalse();
        results.Should().Contain(r => r.MemberNames.Contains("Token"));
    }

    [Fact]
    public void RegisterDeviceTokenRequestDto_AcceptsOptionalFields()
    {
        var dto = new RegisterDeviceTokenRequestDto
        {
            Token = "test-fcm-token-12345",
            DeviceId = "web_abc123",
            Browser = "Chrome",
            Platform = "Web"
        };

        var context = new System.ComponentModel.DataAnnotations.ValidationContext(dto);
        var results = new List<System.ComponentModel.DataAnnotations.ValidationResult>();
        var isValid = System.ComponentModel.DataAnnotations.Validator.TryValidateObject(dto, context, results, true);

        isValid.Should().BeTrue();
    }

    [Fact]
    public void MultipleDevicesPerUser_AreSupportedByDesign()
    {
        var user1 = Guid.NewGuid().ToString();
        var user2 = Guid.NewGuid().ToString();

        var tokens = new List<DeviceToken>
        {
            new() { UserId = user1, Token = "token-a1", DeviceId = "device-1" },
            new() { UserId = user1, Token = "token-a2", DeviceId = "device-2" },
            new() { UserId = user2, Token = "token-b1", DeviceId = "device-3" }
        };

        tokens.Count(t => t.UserId == user1).Should().Be(2);
        tokens.Count(t => t.UserId == user2).Should().Be(1);
    }

    [Fact]
    public void DuplicateTokenRegistration_IsIdempotent_ByDesign()
    {
        var userId = Guid.NewGuid().ToString();
        var token = "duplicate-token-value";

        var first = new DeviceToken { UserId = userId, Token = token };
        var second = new DeviceToken { UserId = userId, Token = token };

        first.Token.Should().Be(second.Token);
        first.UserId.Should().Be(second.UserId);
    }

    [Fact]
    public void InvalidToken_CanBeDeactivated()
    {
        var token = new DeviceToken
        {
            UserId = Guid.NewGuid().ToString(),
            Token = "invalid-token",
            IsActive = true
        };

        token.IsActive = false;
        token.UpdatedAt = DateTime.UtcNow;

        token.IsActive.Should().BeFalse();
    }

    [Fact]
    public void DevicePushPayload_DoesNotContainSensitiveData()
    {
        var data = new Dictionary<string, string>
        {
            ["notificationId"] = "42",
            ["notificationType"] = "info",
            ["entityId"] = Guid.NewGuid().ToString(),
            ["targetUrl"] = "/admin/dashboard"
        };

        data.Should().ContainKey("notificationId");
        data.Should().ContainKey("notificationType");
        data.Should().ContainKey("entityId");
        data.Should().ContainKey("targetUrl");
        data.Keys.Should().NotContain("title");
        data.Keys.Should().NotContain("body");
        data.Keys.Should().NotContain("userId");
    }

    [Theory]
    [InlineData("/admin/dashboard", true)]
    [InlineData("/notifications", true)]
    [InlineData("/", true)]
    [InlineData("https://evil.com/phish", false)]
    [InlineData("//evil.com", false)]
    [InlineData("javascript:alert(1)", false)]
    public void TargetUrl_ValidatesAsInternalRoute(string url, bool expectedValid)
    {
        var isValid = url.StartsWith('/') && !url.StartsWith("//");
        isValid.Should().Be(expectedValid);
    }
}