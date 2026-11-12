using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Elearning.Domain.Entities;
using Elearning.Domain.Enums;
using Elearning.Infrastructure.Services;
using FluentAssertions;
using Microsoft.Extensions.Configuration;
using Xunit;

namespace Elearning.UnitTests;

public class TokenServiceTests
{
    private readonly IConfiguration _config;
    private readonly TokenService _tokenService;

    public TokenServiceTests()
    {
        var inMemorySettings = new Dictionary<string, string?>
        {
            {"Jwt:Secret", "totc_super_secret_key_minimum_32_characters_long_12345"},
            {"Jwt:Issuer", "TOTC-LMS"},
            {"Jwt:Audience", "TOTC-Students"},
            {"Jwt:ExpiresInDays", "7"}
        };

        _config = new ConfigurationBuilder()
            .AddInMemoryCollection(inMemorySettings)
            .Build();

        _tokenService = new TokenService(_config);
    }

    [Fact]
    public void GenerateToken_ValidUser_ReturnsValidJwt()
    {
        // Arrange
        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = "student@totc.com",
            FullName = "Jane Doe",
            Role = UserRole.Student
        };

        // Act
        var token = _tokenService.GenerateToken(user);

        // Assert
        token.Should().NotBeNullOrWhiteSpace();

        var handler = new JwtSecurityTokenHandler();
        var jwt = handler.ReadJwtToken(token);

        jwt.Issuer.Should().Be("TOTC-LMS");
        jwt.Audiences.Should().Contain("TOTC-Students");

        var claims = jwt.Claims.ToList();
        claims.Should().Contain(c => (c.Type == ClaimTypes.NameIdentifier || c.Type == "nameid") && c.Value == user.Id.ToString());
        claims.Should().Contain(c => (c.Type == ClaimTypes.Email || c.Type == "email") && c.Value == user.Email);
        claims.Should().Contain(c => (c.Type == ClaimTypes.Name || c.Type == "unique_name") && c.Value == user.FullName);
        claims.Should().Contain(c => (c.Type == ClaimTypes.Role || c.Type == "role") && c.Value == UserRole.Student.ToString());
    }

    [Fact]
    public void GenerateToken_InstructorUser_HasInstructorRoleClaim()
    {
        // Arrange
        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = "instructor@totc.com",
            FullName = "Professor Smith",
            Role = UserRole.Instructor
        };

        // Act
        var token = _tokenService.GenerateToken(user);

        // Assert
        var handler = new JwtSecurityTokenHandler();
        var jwt = handler.ReadJwtToken(token);

        jwt.Claims.Should().Contain(c => (c.Type == ClaimTypes.Role || c.Type == "role") && c.Value == "Instructor");
    }

    [Fact]
    public void GenerateToken_InsecureOrShortSecret_ThrowsInvalidOperationException()
    {
        // Arrange
        var weakConfig = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?> { { "Jwt:Secret", "short" } })
            .Build();

        var weakService = new TokenService(weakConfig);
        var user = new User { Id = Guid.NewGuid(), Email = "test@totc.com", FullName = "Test" };

        // Act
        Action act = () => weakService.GenerateToken(user);

        // Assert
        act.Should().Throw<InvalidOperationException>()
            .WithMessage("*insecure*");
    }
}
