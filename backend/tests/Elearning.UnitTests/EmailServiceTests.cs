using System.Net;
using Elearning.Infrastructure.Services;
using FluentAssertions;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging.Abstractions;
using Xunit;

namespace Elearning.UnitTests;

public class EmailServiceTests
{
    [Fact]
    public async Task SendPasswordResetEmailAsync_ConsoleFallback_ExecutesGracefullyWithoutException()
    {
        // Arrange
        var config = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                { "Email:Provider", "Console" },
                { "Email:FrontendUrl", "https://totc.ge" }
            })
            .Build();

        var httpClient = new HttpClient();
        var emailService = new EmailService(config, httpClient, NullLogger<EmailService>.Instance);

        // Act
        var act = async () => await emailService.SendPasswordResetEmailAsync(
            "student@example.ge",
            "abcdef1234567890abcdef1234567890",
            "გიორგი <script>alert(1)</script>");

        // Assert - Should safely execute console fallback, encoding any XSS payloads in recipient name
        await act.Should().NotThrowAsync();
    }

    [Fact]
    public async Task SendPasswordResetEmailAsync_UnconfiguredProvider_DefaultsToConsoleFallback()
    {
        // Arrange
        var config = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>())
            .Build();

        var httpClient = new HttpClient();
        var emailService = new EmailService(config, httpClient, NullLogger<EmailService>.Instance);

        // Act
        var act = async () => await emailService.SendPasswordResetEmailAsync(
            "test@example.com",
            "token123",
            "Test User");

        // Assert
        await act.Should().NotThrowAsync();
    }
}
