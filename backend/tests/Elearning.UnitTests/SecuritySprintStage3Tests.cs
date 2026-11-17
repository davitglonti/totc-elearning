using System.IO;
using System.Text;
using Elearning.Domain.Entities;
using Elearning.Domain.Enums;
using Elearning.Infrastructure.Data;
using Elearning.Infrastructure.Services;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Xunit;

namespace Elearning.UnitTests;

public class SecuritySprintStage3Tests
{
    private ElearningDbContext CreateInMemoryDbContext()
    {
        var options = new DbContextOptionsBuilder<ElearningDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        return new ElearningDbContext(options);
    }

    private (LocalMediaService service, string tempDir) CreateMediaService(ElearningDbContext context)
    {
        var tempDir = Path.Combine(Path.GetTempPath(), "stage3_test_" + Guid.NewGuid().ToString("N"));
        var inMemorySettings = new Dictionary<string, string?>
        {
            { "Media:UploadPath", Path.Combine(tempDir, "wwwroot", "uploads") },
            { "Media:ProtectedUploadPath", Path.Combine(tempDir, "protected_uploads") }
        };
        var config = new ConfigurationBuilder().AddInMemoryCollection(inMemorySettings).Build();
        return (new LocalMediaService(context, config), tempDir);
    }

    [Fact]
    public async Task UploadFileAsync_WhenPublicImage_StoresInPublicUploads()
    {
        // Arrange
        using var context = CreateInMemoryDbContext();
        var (service, tempDir) = CreateMediaService(context);
        using var stream = new MemoryStream(Encoding.UTF8.GetBytes("fake-image"));

        // Act
        var url = await service.UploadFileAsync(stream, "banner.png", "image/png", isPublic: true);

        // Assert
        url.Should().StartWith("/uploads/public/");
        var filePath = service.GetProtectedFilePath(Path.GetFileName(url));
        filePath.Should().NotBeNull();
        filePath.Should().Contain("public");
        File.Exists(filePath).Should().BeTrue();
    }

    [Fact]
    public async Task UploadFileAsync_WhenDocumentWithPublicFlag_StillEnforcesProtectedStorage()
    {
        // Arrange
        using var context = CreateInMemoryDbContext();
        var (service, tempDir) = CreateMediaService(context);
        using var stream = new MemoryStream(Encoding.UTF8.GetBytes("sensitive-course-notes"));

        // Act - Even if isPublic=true is passed, documents (.pdf, .zip, .mp4) MUST remain protected
        var url = await service.UploadFileAsync(stream, "lecture-slides.pdf", "application/pdf", isPublic: true);

        // Assert
        url.Should().StartWith("/api/media/secure/");
        var filePath = service.GetProtectedFilePath(Path.GetFileName(url));
        filePath.Should().NotBeNull();
        filePath.Should().Contain("protected_uploads");
        File.Exists(filePath).Should().BeTrue();
    }

    [Fact]
    public void GetProtectedFilePath_WhenGivenTraversalPath_SanitizesAndDefeatsTraversal()
    {
        // Arrange
        using var context = CreateInMemoryDbContext();
        var (service, tempDir) = CreateMediaService(context);

        // Act - Attacker attempts directory traversal to reach system files
        var path = service.GetProtectedFilePath("../../../etc/passwd");

        // Assert - Path.GetFileName sanitizes to "passwd", which does not exist in uploads -> returns null
        path.Should().BeNull();

        var winPath = service.GetProtectedFilePath("..\\..\\Windows\\System32\\cmd.exe");
        winPath.Should().BeNull();
    }

    [Fact]
    public async Task CanAccessProtectedMediaAsync_WhenAdmin_ReturnsTrue()
    {
        // Arrange
        using var context = CreateInMemoryDbContext();
        var (service, _) = CreateMediaService(context);

        // Act
        var canAccess = await service.CanAccessProtectedMediaAsync("anyfile.pdf", Guid.NewGuid(), isAdmin: true);

        // Assert
        canAccess.Should().BeTrue();
    }

    [Fact]
    public async Task CanAccessProtectedMediaAsync_WhenLessonIsFreePreview_AllowsAnonymousAccess()
    {
        // Arrange
        using var context = CreateInMemoryDbContext();
        var course = new Course { Id = Guid.NewGuid(), Title = "Demo Course" };
        var section = new Section { Id = Guid.NewGuid(), Course = course, Title = "Sec 1" };
        var lesson = new Lesson
        {
            Id = Guid.NewGuid(),
            Section = section,
            Title = "Preview Lesson",
            IsFreePreview = true,
            ResourcesJson = "[{\"name\":\"Guide.pdf\",\"url\":\"/api/media/secure/preview-guide.pdf\"}]"
        };
        context.Courses.Add(course);
        context.Sections.Add(section);
        context.Lessons.Add(lesson);
        await context.SaveChangesAsync();

        var (service, _) = CreateMediaService(context);

        // Act
        var canAccess = await service.CanAccessProtectedMediaAsync("preview-guide.pdf", userId: null, isAdmin: false);

        // Assert
        canAccess.Should().BeTrue();
    }

    [Fact]
    public async Task CanAccessProtectedMediaAsync_WhenEnrolledStudent_ReturnsTrue()
    {
        // Arrange
        using var context = CreateInMemoryDbContext();
        var student = new User { Id = Guid.NewGuid(), FullName = "Enrolled Student", Email = "enrolled@totc.ge" };
        var course = new Course { Id = Guid.NewGuid(), Title = "Pro Course" };
        var section = new Section { Id = Guid.NewGuid(), Course = course, Title = "Sec 1" };
        var lesson = new Lesson
        {
            Id = Guid.NewGuid(),
            Section = section,
            Title = "Private Lesson",
            IsFreePreview = false,
            ResourcesJson = "[{\"name\":\"Source.zip\",\"url\":\"/api/media/secure/project-source.zip\"}]"
        };
        var enrollment = new Enrollment { UserId = student.Id, CourseId = course.Id, EnrolledAt = DateTime.UtcNow };

        context.Users.Add(student);
        context.Courses.Add(course);
        context.Sections.Add(section);
        context.Lessons.Add(lesson);
        context.Enrollments.Add(enrollment);
        await context.SaveChangesAsync();

        var (service, _) = CreateMediaService(context);

        // Act
        var canAccess = await service.CanAccessProtectedMediaAsync("project-source.zip", student.Id, isAdmin: false);

        // Assert
        canAccess.Should().BeTrue();
    }

    [Fact]
    public async Task CanAccessProtectedMediaAsync_WhenActiveProSubscriber_ReturnsTrue()
    {
        // Arrange
        using var context = CreateInMemoryDbContext();
        var subscriber = new User
        {
            Id = Guid.NewGuid(),
            FullName = "Subscriber",
            Email = "sub@totc.ge",
            IsSubscribed = true,
            SubscriptionExpiresAt = DateTime.UtcNow.AddMonths(1)
        };
        var course = new Course { Id = Guid.NewGuid(), Title = "Advanced Course" };
        var section = new Section { Id = Guid.NewGuid(), Course = course, Title = "Sec 1" };
        var lesson = new Lesson
        {
            Id = Guid.NewGuid(),
            Section = section,
            Title = "Lesson",
            IsFreePreview = false,
            ResourcesJson = "[{\"name\":\"Cheatsheet.pdf\",\"url\":\"/api/media/secure/cheatsheet.pdf\"}]"
        };

        context.Users.Add(subscriber);
        context.Courses.Add(course);
        context.Sections.Add(section);
        context.Lessons.Add(lesson);
        await context.SaveChangesAsync();

        var (service, _) = CreateMediaService(context);

        // Act - Pro subscribers receive access to curriculum materials across all published courses
        var canAccess = await service.CanAccessProtectedMediaAsync("cheatsheet.pdf", subscriber.Id, isAdmin: false);

        // Assert
        canAccess.Should().BeTrue();
    }

    [Fact]
    public async Task CanAccessProtectedMediaAsync_WhenUnenrolledAndNotSubscribed_ReturnsFalse()
    {
        // Arrange
        using var context = CreateInMemoryDbContext();
        var stranger = new User
        {
            Id = Guid.NewGuid(),
            FullName = "Unenrolled User",
            Email = "stranger@totc.ge",
            IsSubscribed = false
        };
        var course = new Course { Id = Guid.NewGuid(), Title = "Paid Course" };
        var section = new Section { Id = Guid.NewGuid(), Course = course, Title = "Sec 1" };
        var lesson = new Lesson
        {
            Id = Guid.NewGuid(),
            Section = section,
            Title = "Protected Lesson",
            IsFreePreview = false,
            ResourcesJson = "[{\"name\":\"Secret.zip\",\"url\":\"/api/media/secure/secret-vault.zip\"}]"
        };

        context.Users.Add(stranger);
        context.Courses.Add(course);
        context.Sections.Add(section);
        context.Lessons.Add(lesson);
        await context.SaveChangesAsync();

        var (service, _) = CreateMediaService(context);

        // Act
        var canAccess = await service.CanAccessProtectedMediaAsync("secret-vault.zip", stranger.Id, isAdmin: false);

        // Assert - Unauthorized access blocked
        canAccess.Should().BeFalse();
    }
}
