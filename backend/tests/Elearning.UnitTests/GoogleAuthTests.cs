using Elearning.Application.DTOs;
using Elearning.Domain.Enums;
using Elearning.Infrastructure.Data;
using Elearning.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Xunit;

namespace Elearning.UnitTests;

public class GoogleAuthTests
{
    private ElearningDbContext CreateInMemoryDbContext()
    {
        var options = new DbContextOptionsBuilder<ElearningDbContext>()
            .UseInMemoryDatabase(databaseName: $"GoogleAuthDb_{Guid.NewGuid():N}")
            .Options;
        return new ElearningDbContext(options);
    }

    private IConfiguration CreateConfiguration(string environment = "Development", string isProduction = "false", string clientId = "")
    {
        var dict = new Dictionary<string, string?>
        {
            ["ASPNETCORE_ENVIRONMENT"] = environment,
            ["Environment"] = environment,
            ["IsProduction"] = isProduction,
            ["Google:ClientId"] = clientId,
            ["Jwt:Secret"] = "super_secure_jwt_secret_key_minimum_32_characters_long",
            ["Jwt:Issuer"] = "TOTC-LMS",
            ["Jwt:Audience"] = "TOTC-Students",
            ["Jwt:ExpiresInDays"] = "7"
        };
        return new ConfigurationBuilder().AddInMemoryCollection(dict).Build();
    }

    [Fact]
    public async Task GoogleAuthAsync_InDevelopmentWithDevToken_RegistersAndAuthenticatesUser()
    {
        // Arrange
        using var context = CreateInMemoryDbContext();
        var config = CreateConfiguration();
        var tokenService = new TokenService(config);
        var authService = new AuthService(context, tokenService, config);

        var dto = new GoogleAuthDto
        {
            IdToken = "dev-google-token:dglonti3@gmail.com:Davit Glonti:https://lh3.googleusercontent.com/a/custom",
            Role = UserRole.Student
        };

        // Act
        var result = await authService.GoogleAuthAsync(dto);

        // Assert
        Assert.NotNull(result);
        Assert.False(string.IsNullOrWhiteSpace(result.Token));
        Assert.Equal("dglonti3@gmail.com", result.User.Email);
        Assert.Equal("Davit Glonti", result.User.FullName);
        Assert.Equal("Student", result.User.Role);

        // Verify stored in DB
        var userInDb = await context.Users.FirstOrDefaultAsync(u => u.Email == "dglonti3@gmail.com");
        Assert.NotNull(userInDb);
        Assert.Equal("dglonti3@gmail.com", userInDb.Email);
    }

    [Fact]
    public async Task GoogleAuthAsync_WhenUserAlreadyExists_LogsInWithoutDuplicateCreation()
    {
        // Arrange
        using var context = CreateInMemoryDbContext();
        var config = CreateConfiguration();
        var tokenService = new TokenService(config);
        var authService = new AuthService(context, tokenService, config);

        var dto = new GoogleAuthDto
        {
            IdToken = "dev-google-token:datiglonti@gmail.com:Davit Glonti",
            Role = UserRole.Student
        };

        // First login (registers)
        var firstResult = await authService.GoogleAuthAsync(dto);

        // Second login (logs in)
        var secondResult = await authService.GoogleAuthAsync(dto);

        // Assert
        Assert.Equal(firstResult.User.Id, secondResult.User.Id);
        var count = await context.Users.CountAsync(u => u.Email == "datiglonti@gmail.com");
        Assert.Equal(1, count);
    }

    [Fact]
    public async Task GoogleAuthAsync_WithAdminRole_ThrowsInvalidOperationException()
    {
        // Arrange
        using var context = CreateInMemoryDbContext();
        var config = CreateConfiguration();
        var tokenService = new TokenService(config);
        var authService = new AuthService(context, tokenService, config);

        var dto = new GoogleAuthDto
        {
            IdToken = "dev-google-token:hacker@gmail.com:Hacker",
            Role = UserRole.Admin
        };

        // Act & Assert
        await Assert.ThrowsAsync<InvalidOperationException>(() => authService.GoogleAuthAsync(dto));
    }

    [Fact]
    public async Task GoogleAuthAsync_InProductionWithDevToken_ThrowsUnauthorizedAccessException()
    {
        // Arrange
        using var context = CreateInMemoryDbContext();
        var config = CreateConfiguration(environment: "Production", isProduction: "true");
        var tokenService = new TokenService(config);
        var authService = new AuthService(context, tokenService, config);

        var dto = new GoogleAuthDto
        {
            IdToken = "dev-google-token:test@gmail.com:Test",
            Role = UserRole.Student
        };

        // Act & Assert
        await Assert.ThrowsAsync<UnauthorizedAccessException>(() => authService.GoogleAuthAsync(dto));
    }
}
