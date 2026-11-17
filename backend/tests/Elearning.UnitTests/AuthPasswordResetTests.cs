using System.Security.Cryptography;
using System.Text;
using Elearning.Application.DTOs;
using Elearning.Application.Interfaces;
using Elearning.Domain.Entities;
using Elearning.Domain.Enums;
using Elearning.Infrastructure.Data;
using Elearning.Infrastructure.Services;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging.Abstractions;
using Moq;
using Xunit;

namespace Elearning.UnitTests;

public class AuthPasswordResetTests
{
    private readonly ElearningDbContext _context;
    private readonly Mock<ITokenService> _tokenServiceMock;
    private readonly Mock<IEmailService> _emailServiceMock;
    private readonly IConfiguration _config;
    private readonly AuthService _authService;

    public AuthPasswordResetTests()
    {
        var options = new DbContextOptionsBuilder<ElearningDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        _context = new ElearningDbContext(options);
        _tokenServiceMock = new Mock<ITokenService>();
        _emailServiceMock = new Mock<IEmailService>();

        _config = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>())
            .Build();

        _authService = new AuthService(
            _context,
            _tokenServiceMock.Object,
            _config,
            _emailServiceMock.Object,
            NullLogger<AuthService>.Instance);
    }

    [Fact]
    public async Task ForgotPasswordAsync_NonExistentEmail_DoesNotThrowAndDoesNotSendEmail()
    {
        // Arrange
        var dto = new ForgotPasswordDto { Email = "nonexistent@example.com" };

        // Act
        var act = async () => await _authService.ForgotPasswordAsync(dto);

        // Assert - Anti-enumeration: must complete without exception
        await act.Should().NotThrowAsync();
        _emailServiceMock.Verify(e => e.SendPasswordResetEmailAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>()), Times.Never);
    }

    [Fact]
    public async Task ForgotPasswordAsync_ValidUser_StoresSha256HashAndDispatchesEmailWithRawToken()
    {
        // Arrange
        var user = new User
        {
            FullName = "გიორგი ბერიძე",
            Email = "giorgi@example.ge",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("OldSecretPass123!"),
            Role = UserRole.Student
        };
        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        string? capturedRawToken = null;
        _emailServiceMock
            .Setup(e => e.SendPasswordResetEmailAsync(user.Email, It.IsAny<string>(), user.FullName))
            .Callback<string, string, string>((email, token, name) => capturedRawToken = token)
            .Returns(Task.CompletedTask);

        // Act
        await _authService.ForgotPasswordAsync(new ForgotPasswordDto { Email = "GIORGI@EXAMPLE.GE" });

        // Assert
        capturedRawToken.Should().NotBeNullOrWhiteSpace();
        capturedRawToken!.Length.Should().Be(64); // 32 bytes in hex = 64 characters

        var updatedUser = await _context.Users.FindAsync(user.Id);
        updatedUser!.PasswordResetTokenHash.Should().NotBeNullOrWhiteSpace();
        // Raw token must NEVER be saved in database in plaintext
        updatedUser.PasswordResetTokenHash.Should().NotBe(capturedRawToken);

        // Verify SHA-256 hash match
        var expectedHash = Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(capturedRawToken))).ToLowerInvariant();
        updatedUser.PasswordResetTokenHash.Should().Be(expectedHash);

        // Expiry must be in the future (~30 min)
        updatedUser.PasswordResetTokenExpiresAt.Should().BeAfter(DateTime.UtcNow.AddMinutes(28));
        updatedUser.PasswordResetTokenExpiresAt.Should().BeBefore(DateTime.UtcNow.AddMinutes(31));

        _emailServiceMock.Verify(e => e.SendPasswordResetEmailAsync(user.Email, capturedRawToken, user.FullName), Times.Once);
    }

    [Fact]
    public async Task ResetPasswordAsync_ValidToken_UpdatesPasswordAndClearsTokenFields()
    {
        // Arrange
        var rawToken = "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
        var tokenHash = Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(rawToken))).ToLowerInvariant();
        var oldPassword = "OldPassword123!";

        var user = new User
        {
            FullName = "ნინო ჩხეიძე",
            Email = "nino@example.ge",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(oldPassword),
            PasswordResetTokenHash = tokenHash,
            PasswordResetTokenExpiresAt = DateTime.UtcNow.AddMinutes(20),
            Role = UserRole.Student
        };
        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        var newPassword = "BrandNewSecurePassword2026!";
        var resetDto = new ResetPasswordDto
        {
            Token = rawToken,
            NewPassword = newPassword
        };

        // Act
        await _authService.ResetPasswordAsync(resetDto);

        // Assert
        var updatedUser = await _context.Users.FindAsync(user.Id);
        BCrypt.Net.BCrypt.Verify(newPassword, updatedUser!.PasswordHash).Should().BeTrue();
        BCrypt.Net.BCrypt.Verify(oldPassword, updatedUser.PasswordHash).Should().BeFalse();

        // Token fields must be strictly cleared (single-use)
        updatedUser.PasswordResetTokenHash.Should().BeNull();
        updatedUser.PasswordResetTokenExpiresAt.Should().BeNull();
    }

    [Fact]
    public async Task ResetPasswordAsync_ExpiredToken_ThrowsInvalidOperationException()
    {
        // Arrange
        var rawToken = "fedcba9876543210fedcba9876543210fedcba9876543210fedcba9876543210";
        var tokenHash = Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(rawToken))).ToLowerInvariant();

        var user = new User
        {
            FullName = "დავითი",
            Email = "daviti@example.ge",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Password123!"),
            PasswordResetTokenHash = tokenHash,
            PasswordResetTokenExpiresAt = DateTime.UtcNow.AddMinutes(-5), // Expired 5 minutes ago
            Role = UserRole.Student
        };
        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        var resetDto = new ResetPasswordDto
        {
            Token = rawToken,
            NewPassword = "NewValidPassword123!"
        };

        // Act
        var act = async () => await _authService.ResetPasswordAsync(resetDto);

        // Assert
        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("*ვადაგასულია*");
    }

    [Fact]
    public async Task ResetPasswordAsync_TamperedOrInvalidToken_ThrowsInvalidOperationException()
    {
        // Arrange
        var validRawToken = "aaaa1111bbbb2222cccc3333dddd4444aaaa1111bbbb2222cccc3333dddd4444";
        var tokenHash = Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(validRawToken))).ToLowerInvariant();

        var user = new User
        {
            FullName = "მარიამი",
            Email = "mariam@example.ge",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Password123!"),
            PasswordResetTokenHash = tokenHash,
            PasswordResetTokenExpiresAt = DateTime.UtcNow.AddMinutes(15),
            Role = UserRole.Student
        };
        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        var tamperedDto = new ResetPasswordDto
        {
            Token = "tampered_token_that_does_not_match",
            NewPassword = "NewValidPassword123!"
        };

        // Act
        var act = async () => await _authService.ResetPasswordAsync(tamperedDto);

        // Assert
        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("*ვადაგასულია*");
    }

    [Fact]
    public async Task ResetPasswordAsync_ReusedToken_ThrowsInvalidOperationException()
    {
        // Arrange
        var rawToken = "singleuse1234567890singleuse1234567890singleuse1234567890singleuse12";
        var tokenHash = Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(rawToken))).ToLowerInvariant();

        var user = new User
        {
            FullName = "ლევანი",
            Email = "levan@example.ge",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("InitialPass123!"),
            PasswordResetTokenHash = tokenHash,
            PasswordResetTokenExpiresAt = DateTime.UtcNow.AddMinutes(15),
            Role = UserRole.Student
        };
        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        var dto = new ResetPasswordDto
        {
            Token = rawToken,
            NewPassword = "FirstResetPassword123!"
        };

        // First reset succeeds
        await _authService.ResetPasswordAsync(dto);

        // Replay attack with same token must fail
        var replayDto = new ResetPasswordDto
        {
            Token = rawToken,
            NewPassword = "AttackerNewPassword123!"
        };

        var replayAct = async () => await _authService.ResetPasswordAsync(replayDto);
        await replayAct.Should().ThrowAsync<InvalidOperationException>();
    }

    [Fact]
    public async Task ResetPasswordAsync_ShortPassword_ThrowsInvalidOperationException()
    {
        // Arrange
        var dto = new ResetPasswordDto
        {
            Token = "any_token",
            NewPassword = "123" // < 6 characters
        };

        // Act
        var act = async () => await _authService.ResetPasswordAsync(dto);

        // Assert
        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("*მინიმუმ 6 სიმბოლოსგან*");
    }
}
