using Elearning.Application.Interfaces;
using Elearning.Domain.Entities;
using Elearning.Domain.Enums;
using Elearning.Infrastructure.Data;
using Elearning.Infrastructure.Services;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging.Abstractions;
using Moq;
using Xunit;

namespace Elearning.UnitTests;

public class SecuritySprintStage1Tests
{
    private ElearningDbContext CreateInMemoryDbContext()
    {
        var options = new DbContextOptionsBuilder<ElearningDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        return new ElearningDbContext(options);
    }

    [Fact]
    public async Task GetInstructorPublicProfileAsync_WhenUserIsStudent_ThrowsKeyNotFoundException()
    {
        // Arrange
        using var context = CreateInMemoryDbContext();
        var student = new User
        {
            Id = Guid.NewGuid(),
            FullName = "Student User",
            Email = "student@test.com",
            PasswordHash = "hash",
            Role = UserRole.Student
        };
        context.Users.Add(student);
        await context.SaveChangesAsync();

        var tokenServiceMock = new Mock<ITokenService>();
        var emailServiceMock = new Mock<IEmailService>();
        var config = new ConfigurationBuilder().Build();
        var authService = new AuthService(context, tokenServiceMock.Object, config, emailServiceMock.Object, NullLogger<AuthService>.Instance);

        // Act & Assert - Querying by ID must throw KeyNotFoundException
        var actById = async () => await authService.GetInstructorPublicProfileAsync(student.Id.ToString());
        await actById.Should().ThrowAsync<KeyNotFoundException>()
            .WithMessage("*was not found*");

        // Querying by name/email must throw KeyNotFoundException
        var actByName = async () => await authService.GetInstructorPublicProfileAsync(student.FullName);
        await actByName.Should().ThrowAsync<KeyNotFoundException>()
            .WithMessage("*was not found*");
    }

    [Fact]
    public async Task GetInstructorPublicProfileAsync_WhenUserIsAdmin_ThrowsKeyNotFoundException()
    {
        // Arrange
        using var context = CreateInMemoryDbContext();
        var admin = new User
        {
            Id = Guid.NewGuid(),
            FullName = "Admin User",
            Email = "admin@test.com",
            PasswordHash = "hash",
            Role = UserRole.Admin
        };
        context.Users.Add(admin);
        await context.SaveChangesAsync();

        var tokenServiceMock = new Mock<ITokenService>();
        var emailServiceMock = new Mock<IEmailService>();
        var config = new ConfigurationBuilder().Build();
        var authService = new AuthService(context, tokenServiceMock.Object, config, emailServiceMock.Object, NullLogger<AuthService>.Instance);

        // Act & Assert - Must not disclose admin identity or email
        var actById = async () => await authService.GetInstructorPublicProfileAsync(admin.Id.ToString());
        await actById.Should().ThrowAsync<KeyNotFoundException>()
            .WithMessage("*was not found*");

        var actByEmail = async () => await authService.GetInstructorPublicProfileAsync(admin.Email);
        await actByEmail.Should().ThrowAsync<KeyNotFoundException>()
            .WithMessage("*was not found*");
    }

    [Fact]
    public async Task GetInstructorPublicProfileAsync_WhenInstructorExists_NullifiesPrivateEmail()
    {
        // Arrange
        using var context = CreateInMemoryDbContext();
        var instructor = new User
        {
            Id = Guid.NewGuid(),
            FullName = "Prof. Jane Smith",
            Email = "jane.private@university.edu",
            PasswordHash = "hash",
            Role = UserRole.Instructor
        };
        var course = new Course
        {
            Id = Guid.NewGuid(),
            Title = "Cloud Architecture",
            InstructorId = instructor.Id,
            Price = 200m
        };
        instructor.AuthoredCourses.Add(course);
        context.Users.Add(instructor);
        await context.SaveChangesAsync();

        var tokenServiceMock = new Mock<ITokenService>();
        var emailServiceMock = new Mock<IEmailService>();
        var config = new ConfigurationBuilder().Build();
        var authService = new AuthService(context, tokenServiceMock.Object, config, emailServiceMock.Object, NullLogger<AuthService>.Instance);

        // Act
        var profile = await authService.GetInstructorPublicProfileAsync(instructor.Id.ToString());

        // Assert
        profile.Should().NotBeNull();
        profile.FullName.Should().Be("Prof. Jane Smith");
        // Private login email must be strictly null
        profile.Email.Should().BeNull();

        // Nested authored courses must not leak private instructor email
        profile.AuthoredCourses.Should().NotBeEmpty();
        profile.AuthoredCourses.First().InstructorEmail.Should().BeEmpty();
    }

    [Fact]
    public async Task SeedData_InProductionWithoutConfig_DoesNotSeedDefaultAdminOrDemoAccounts()
    {
        // Arrange
        using var context = CreateInMemoryDbContext();
        var envMock = new Mock<IHostEnvironment>();
        envMock.Setup(e => e.EnvironmentName).Returns(Environments.Production);

        var config = new ConfigurationBuilder().Build(); // Empty configuration

        // Act
        await SeedData.InitializeAsync(context, config, envMock.Object);

        // Assert
        // In Production without Admin credentials, no default hardcoded admin should exist
        var users = await context.Users.ToListAsync();
        users.Should().BeEmpty();

        // Categories, PromoCodes, and SiteSettings should still initialize
        var categories = await context.Categories.ToListAsync();
        categories.Should().HaveCount(5);

        // Demo courses must not be seeded in Production
        var courses = await context.Courses.ToListAsync();
        courses.Should().BeEmpty();
    }

    [Fact]
    public async Task SeedData_InProductionWithConfig_SeedsOnlyConfiguredAdmin()
    {
        // Arrange
        using var context = CreateInMemoryDbContext();
        var envMock = new Mock<IHostEnvironment>();
        envMock.Setup(e => e.EnvironmentName).Returns(Environments.Production);

        var config = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                { "Admin:Email", "production-secops@totc.ge" },
                { "Admin:Password", "SuperSecureVaultPassword2026!" }
            })
            .Build();

        // Act
        await SeedData.InitializeAsync(context, config, envMock.Object);

        // Assert
        var users = await context.Users.ToListAsync();
        users.Should().HaveCount(1);
        users.First().Email.Should().Be("production-secops@totc.ge");
        users.First().Role.Should().Be(UserRole.Admin);
        BCrypt.Net.BCrypt.Verify("SuperSecureVaultPassword2026!", users.First().PasswordHash).Should().BeTrue();

        // Demo instructors and courses must NOT be seeded in Production
        users.Should().NotContain(u => u.Email == "lina@totc.com");
        var courses = await context.Courses.ToListAsync();
        courses.Should().BeEmpty();
    }

    [Fact]
    public async Task SeedData_InDevelopment_SeedsDefaultAdminAndDemoAccounts()
    {
        // Arrange
        using var context = CreateInMemoryDbContext();
        var envMock = new Mock<IHostEnvironment>();
        envMock.Setup(e => e.EnvironmentName).Returns(Environments.Development);

        var config = new ConfigurationBuilder().Build(); // No explicit admin credentials

        // Act
        await SeedData.InitializeAsync(context, config, envMock.Object);

        // Assert
        var users = await context.Users.ToListAsync();
        // Development must have demo admin and demo instructors/students
        users.Should().Contain(u => u.Email == "admin@totc.com" && u.Role == UserRole.Admin);
        users.Should().Contain(u => u.Email == "lina@totc.com" && u.Role == UserRole.Instructor);
        users.Should().Contain(u => u.Email == "marcus@totc.com" && u.Role == UserRole.Instructor);
        users.Should().Contain(u => u.Email == "sophia@totc.com" && u.Role == UserRole.Instructor);
        users.Should().Contain(u => u.Email == "student@totc.com" && u.Role == UserRole.Student);

        var courses = await context.Courses.ToListAsync();
        courses.Should().NotBeEmpty();
    }
}
