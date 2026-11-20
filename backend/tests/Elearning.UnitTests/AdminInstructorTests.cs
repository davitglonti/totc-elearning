using Elearning.Application.DTOs;
using Elearning.Domain.Entities;
using Elearning.Domain.Enums;
using Elearning.Infrastructure.Data;
using Elearning.Infrastructure.Services;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Elearning.UnitTests;

public class AdminInstructorTests
{
    private ElearningDbContext CreateInMemoryDbContext()
    {
        var options = new DbContextOptionsBuilder<ElearningDbContext>()
            .UseInMemoryDatabase(databaseName: $"AdminInstructorDb_{Guid.NewGuid():N}")
            .Options;
        return new ElearningDbContext(options);
    }

    [Fact]
    public async Task CreateInstructorAsync_ValidDto_CreatesInstructorWithRoleInstructor()
    {
        // Arrange
        using var context = CreateInMemoryDbContext();
        var adminService = new AdminService(context);

        var dto = new CreateInstructorDto
        {
            FullName = "Dr. Alan Turing",
            Email = "alan.turing@totc.com",
            Password = "SecurePassword123!",
            Headline = "Distinguished Computer Scientist & Cryptanalyst",
            Bio = "Pioneer in artificial intelligence and modern computing.",
            AvatarUrl = "https://images.unsplash.com/photo-custom"
        };

        // Act
        var result = await adminService.CreateInstructorAsync(dto);

        // Assert
        result.Should().NotBeNull();
        result.FullName.Should().Be("Dr. Alan Turing");
        result.Email.Should().Be("alan.turing@totc.com");
        result.Role.Should().Be("Instructor");
        result.AvatarUrl.Should().Be("https://images.unsplash.com/photo-custom");

        var userInDb = await context.Users.FirstOrDefaultAsync(u => u.Email == "alan.turing@totc.com");
        userInDb.Should().NotBeNull();
        userInDb!.Role.Should().Be(UserRole.Instructor);
        userInDb.Headline.Should().Be("Distinguished Computer Scientist & Cryptanalyst");
        userInDb.Bio.Should().Be("Pioneer in artificial intelligence and modern computing.");
        BCrypt.Net.BCrypt.Verify("SecurePassword123!", userInDb.PasswordHash).Should().BeTrue();
    }

    [Fact]
    public async Task CreateInstructorAsync_DefaultAvatarAndDefaults_AppliedWhenOmitted()
    {
        // Arrange
        using var context = CreateInMemoryDbContext();
        var adminService = new AdminService(context);

        var dto = new CreateInstructorDto
        {
            FullName = "Grace Hopper",
            Email = "grace.hopper@totc.com",
            Password = "CompilerMaster123!"
        };

        // Act
        var result = await adminService.CreateInstructorAsync(dto);

        // Assert
        result.Should().NotBeNull();
        result.Role.Should().Be("Instructor");
        result.AvatarUrl.Should().NotBeNullOrWhiteSpace();

        var userInDb = await context.Users.FirstOrDefaultAsync(u => u.Email == "grace.hopper@totc.com");
        userInDb.Should().NotBeNull();
        userInDb!.Headline.Should().Be("EdTech Instructor");
        userInDb.Bio.Should().Be("Expert instructor at TOTC LMS.");
    }

    [Fact]
    public async Task CreateInstructorAsync_DuplicateEmail_ThrowsInvalidOperationException()
    {
        // Arrange
        using var context = CreateInMemoryDbContext();
        context.Users.Add(new User
        {
            FullName = "Existing Instructor",
            Email = "duplicate@totc.com",
            PasswordHash = "hash",
            Role = UserRole.Instructor
        });
        await context.SaveChangesAsync();

        var adminService = new AdminService(context);
        var dto = new CreateInstructorDto
        {
            FullName = "New Instructor",
            Email = "duplicate@totc.com",
            Password = "Password123!"
        };

        // Act
        var act = async () => await adminService.CreateInstructorAsync(dto);

        // Assert
        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("*already exists*");
    }

    [Theory]
    [InlineData("", "test@totc.com", "Password123!", "Full name is required.")]
    [InlineData("   ", "test@totc.com", "Password123!", "Full name is required.")]
    [InlineData("John Doe", "", "Password123!", "Email is required.")]
    [InlineData("John Doe", "   ", "Password123!", "Email is required.")]
    [InlineData("John Doe", "test@totc.com", "", "Password must be at least 6 characters long.")]
    [InlineData("John Doe", "test@totc.com", "12345", "Password must be at least 6 characters long.")]
    public async Task CreateInstructorAsync_InvalidInputs_ThrowsArgumentException(string name, string email, string password, string expectedMsg)
    {
        // Arrange
        using var context = CreateInMemoryDbContext();
        var adminService = new AdminService(context);
        var dto = new CreateInstructorDto
        {
            FullName = name,
            Email = email,
            Password = password
        };

        // Act
        var act = async () => await adminService.CreateInstructorAsync(dto);

        // Assert
        await act.Should().ThrowAsync<ArgumentException>()
            .WithMessage($"*{expectedMsg}*");
    }
}
