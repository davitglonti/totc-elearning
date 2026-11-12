using Elearning.Application.DTOs;
using Elearning.Application.Interfaces;
using Elearning.Domain.Entities;
using Elearning.Domain.Enums;
using Elearning.Infrastructure.Data;
using Elearning.Infrastructure.Services;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Moq;
using Xunit;

namespace Elearning.UnitTests;

public class AuthServiceTests
{
    private readonly ElearningDbContext _context;
    private readonly Mock<ITokenService> _tokenServiceMock;
    private readonly IConfiguration _config;
    private readonly AuthService _authService;

    public AuthServiceTests()
    {
        var options = new DbContextOptionsBuilder<ElearningDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        _context = new ElearningDbContext(options);
        _tokenServiceMock = new Mock<ITokenService>();
        _tokenServiceMock.Setup(t => t.GenerateToken(It.IsAny<User>())).Returns("mock_jwt_token_xyz");

        _config = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>())
            .Build();

        _authService = new AuthService(_context, _tokenServiceMock.Object, _config);
    }

    [Fact]
    public async Task RegisterAsync_ValidStudentDto_CreatesUserAndReturnsToken()
    {
        // Arrange
        var dto = new RegisterDto
        {
            FullName = "Alice Johnson",
            Email = "alice@example.com",
            Password = "SecurePassword123!",
            Role = UserRole.Student
        };

        // Act
        var result = await _authService.RegisterAsync(dto);

        // Assert
        result.Should().NotBeNull();
        result.Token.Should().Be("mock_jwt_token_xyz");
        result.User.Email.Should().Be("alice@example.com");
        result.User.FullName.Should().Be("Alice Johnson");

        var dbUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == "alice@example.com");
        dbUser.Should().NotBeNull();
        BCrypt.Net.BCrypt.Verify("SecurePassword123!", dbUser!.PasswordHash).Should().BeTrue();
    }

    [Fact]
    public async Task RegisterAsync_DirectAdminRegistration_ThrowsInvalidOperationException()
    {
        // Arrange
        var dto = new RegisterDto
        {
            FullName = "Attacker Admin",
            Email = "hacker@example.com",
            Password = "Password123!",
            Role = UserRole.Admin // Forbidden for self-registration
        };

        // Act
        var act = async () => await _authService.RegisterAsync(dto);

        // Assert
        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("*Administrator is strictly prohibited*");
    }

    [Fact]
    public async Task RegisterAsync_DuplicateEmail_ThrowsInvalidOperationException()
    {
        // Arrange
        _context.Users.Add(new User
        {
            Email = "duplicate@example.com",
            FullName = "Existing User",
            PasswordHash = "hashed",
            Role = UserRole.Student
        });
        await _context.SaveChangesAsync();

        var dto = new RegisterDto
        {
            FullName = "New User",
            Email = "duplicate@example.com",
            Password = "Password123!",
            Role = UserRole.Student
        };

        // Act
        var act = async () => await _authService.RegisterAsync(dto);

        // Assert
        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("*already exists*");
    }

    [Fact]
    public async Task LoginAsync_ValidCredentials_ReturnsTokenAndUserProfile()
    {
        // Arrange
        var password = "CorrectPassword123!";
        var user = new User
        {
            Email = "loginuser@example.com",
            FullName = "Login Tester",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(password),
            Role = UserRole.Student
        };
        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        var dto = new LoginDto
        {
            Email = "loginuser@example.com",
            Password = password
        };

        // Act
        var result = await _authService.LoginAsync(dto);

        // Assert
        result.Should().NotBeNull();
        result.Token.Should().Be("mock_jwt_token_xyz");
        result.User.Email.Should().Be("loginuser@example.com");
    }

    [Fact]
    public async Task LoginAsync_InvalidPassword_ThrowsUnauthorizedAccessException()
    {
        // Arrange
        var user = new User
        {
            Email = "student2@example.com",
            FullName = "Student Two",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("RealPassword123!"),
            Role = UserRole.Student
        };
        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        var dto = new LoginDto
        {
            Email = "student2@example.com",
            Password = "WrongPassword!"
        };

        // Act
        var act = async () => await _authService.LoginAsync(dto);

        // Assert
        await act.Should().ThrowAsync<UnauthorizedAccessException>()
            .WithMessage("*Invalid email*password*");
    }
}
