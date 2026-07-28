using FluentAssertions;
using Investa.Application.DTOs;
using Investa.Application.Interfaces;
using Investa.Domain.Entities;
using Investa.Infrastructure.Persistence;
using Investa.Infrastructure.Services.Email;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Moq;
using Xunit;

namespace Investa.UnitTests;

public sealed class EmailOtpServiceTests
{
    private static (ApplicationDbContext Db, EmailOtpService Service, Mock<IEmailService> Email, AuthUser User) Create()
    {
        var db = new ApplicationDbContext(new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase($"EmailOtp_{Guid.NewGuid()}").Options);
        var user = new AuthUser { Id = Guid.NewGuid(), Name = "Test User", PasswordHash = "hash" };
        db.AuthUsers.Add(user);
        db.SaveChanges();
        var email = new Mock<IEmailService>();
        var config = new ConfigurationBuilder().AddInMemoryCollection(new Dictionary<string, string?>
        {
            ["ASPNETCORE_ENVIRONMENT"] = "Development",
            ["EmailOtp:DevelopmentCode"] = "654321"
        }).Build();
        return (db, new EmailOtpService(db, email.Object, config), email, user);
    }

    [Fact]
    public async Task Send_QueuesOneEmail_AndStoresOnlyHash()
    {
        var x = Create();
        (await x.Service.GenerateAsync(x.User.Id, "person@example.com", "en")).Status.Should().Be(EmailOtpStatus.Success);
        x.Email.Verify(e => e.SendTemplatedEmailAsync(It.IsAny<SendTemplatedEmailRequest>(), default), Times.Once);
        var record = await x.Db.EmailVerificationOtps.SingleAsync();
        record.OtpHash.Should().NotContain("654321");
        record.ExpiresAtUtc.Should().BeCloseTo(record.CreatedAtUtc.AddMinutes(10), TimeSpan.FromSeconds(1));
    }

    [Fact]
    public async Task ValidOtp_VerifiesEmail_AndQueuesWelcomeOnce()
    {
        var x = Create();
        await x.Service.GenerateAsync(x.User.Id, "person@example.com", "en");
        (await x.Service.VerifyAsync(x.User.Id, "person@example.com", "654321")).Status.Should().Be(EmailOtpStatus.Success);
        x.User.IsEmailVerified.Should().BeTrue();
        x.User.EmailVerifiedAtUtc.Should().NotBeNull();
        x.User.WelcomeEmailSentAtUtc.Should().NotBeNull();
        (await x.Service.VerifyAsync(x.User.Id, "person@example.com", "654321")).Status.Should().Be(EmailOtpStatus.InvalidOtp);
        x.Email.Verify(e => e.SendTemplatedEmailAsync(It.IsAny<SendTemplatedEmailRequest>(), default), Times.Exactly(2));
    }

    [Fact]
    public async Task InvalidOtp_IsRejected_AndMaximumAttemptsEnforced()
    {
        var x = Create();
        await x.Service.GenerateAsync(x.User.Id, "person@example.com", "en");
        for (var i = 0; i < 4; i++)
            (await x.Service.VerifyAsync(x.User.Id, "person@example.com", "000000")).Status.Should().Be(EmailOtpStatus.InvalidOtp);
        (await x.Service.VerifyAsync(x.User.Id, "person@example.com", "000000")).Status.Should().Be(EmailOtpStatus.TooManyAttempts);
        (await x.Service.VerifyAsync(x.User.Id, "person@example.com", "654321")).Status.Should().Be(EmailOtpStatus.TooManyAttempts);
    }

    [Fact]
    public async Task ExpiredOtp_IsRejected()
    {
        var x = Create();
        await x.Service.GenerateAsync(x.User.Id, "person@example.com", "en");
        (await x.Db.EmailVerificationOtps.SingleAsync()).ExpiresAtUtc = DateTime.UtcNow.AddSeconds(-1);
        await x.Db.SaveChangesAsync();
        (await x.Service.VerifyAsync(x.User.Id, "person@example.com", "654321")).Status.Should().Be(EmailOtpStatus.Expired);
    }

    [Fact]
    public async Task ResendCooldown_IsEnforced()
    {
        var x = Create();
        await x.Service.GenerateAsync(x.User.Id, "person@example.com", "en");
        var result = await x.Service.ResendAsync(x.User.Id, "person@example.com", "en");
        result.Status.Should().Be(EmailOtpStatus.Cooldown);
        result.RetryAfterSeconds.Should().BeInRange(1, 60);
    }

    [Fact]
    public async Task Otp_CannotVerifyAnotherUser_OrDuplicateEmail()
    {
        var x = Create();
        await x.Service.GenerateAsync(x.User.Id, "person@example.com", "en");
        var other = new AuthUser { Id = Guid.NewGuid(), Name = "Other", PasswordHash = "hash", Email = "used@example.com" };
        x.Db.AuthUsers.Add(other);
        await x.Db.SaveChangesAsync();
        (await x.Service.VerifyAsync(other.Id, "person@example.com", "654321")).Status.Should().NotBe(EmailOtpStatus.Success);
        (await x.Service.GenerateAsync(x.User.Id, "used@example.com", "en")).Status.Should().Be(EmailOtpStatus.EmailAlreadyUsed);
    }
}
