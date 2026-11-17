using Elearning.Application.Interfaces;
using Elearning.Domain.Entities;
using Elearning.Domain.Enums;
using Elearning.Infrastructure.Data;
using Elearning.Infrastructure.Services;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Moq;
using Xunit;

namespace Elearning.UnitTests;

public class VideoServiceTests
{
    private readonly ElearningDbContext _context;
    private readonly Mock<IBunnyStreamService> _bunnyMock;
    private readonly VideoService _videoService;

    public VideoServiceTests()
    {
        var options = new DbContextOptionsBuilder<ElearningDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        _context = new ElearningDbContext(options);
        _bunnyMock = new Mock<IBunnyStreamService>();
        _bunnyMock.Setup(b => b.GenerateSignedPlayback(It.IsAny<string>(), It.IsAny<int>()))
            .Returns((string vid, int ttl) => new SignedVideoPlaybackDto
            {
                VideoId = vid,
                EmbedUrl = $"https://iframe.mediadelivery.net/embed/123/{vid}?token=abc",
                HlsUrl = $"https://video.bunnycdn.com/play/123/{vid}/playlist.m3u8?token=abc",
                Token = "abc",
                TtlSeconds = ttl
            });

        _videoService = new VideoService(_context, _bunnyMock.Object);
    }

    [Fact]
    public async Task GetAuthorizedPlaybackAsync_WhenLessonNotFound_ThrowsKeyNotFoundException()
    {
        // Act
        Func<Task> act = async () => await _videoService.GetAuthorizedPlaybackAsync(Guid.NewGuid(), "non-existent-guid");

        // Assert
        await act.Should().ThrowAsync<KeyNotFoundException>()
            .WithMessage("Lesson or video not found.");
    }

    [Fact]
    public async Task GetAuthorizedPlaybackAsync_WhenLessonIsFreePreview_AllowsAccessWithoutEnrollment()
    {
        // Arrange
        var instructor = new User { Id = Guid.NewGuid(), FullName = "Instructor", Email = "inst@totc.com" };
        var student = new User { Id = Guid.NewGuid(), FullName = "Guest Student", Email = "guest@totc.com" };
        var course = new Course { Id = Guid.NewGuid(), Title = "Preview Course", InstructorId = instructor.Id, Instructor = instructor };
        var section = new Section { Id = Guid.NewGuid(), CourseId = course.Id, Course = course, Title = "Intro" };
        var lesson = new Lesson
        {
            Id = Guid.NewGuid(),
            SectionId = section.Id,
            Section = section,
            Title = "Free Intro",
            VideoUrl = "vid-free-123",
            IsFreePreview = true
        };

        _context.Users.AddRange(instructor, student);
        _context.Courses.Add(course);
        _context.Sections.Add(section);
        _context.Lessons.Add(lesson);
        await _context.SaveChangesAsync();

        // Act
        var result = await _videoService.GetAuthorizedPlaybackAsync(student.Id, "vid-free-123");

        // Assert
        result.Should().NotBeNull();
        result.VideoId.Should().Be("vid-free-123");
        result.Token.Should().Be("abc");
    }

    [Fact]
    public async Task GetAuthorizedPlaybackAsync_WhenUserIsAdmin_AllowsAccess()
    {
        // Arrange
        var instructor = new User { Id = Guid.NewGuid(), FullName = "Course Creator", Email = "creator@totc.com" };
        var admin = new User { Id = Guid.NewGuid(), FullName = "Admin User", Email = "admin@totc.com", Role = UserRole.Admin };
        var course = new Course { Id = Guid.NewGuid(), Title = "Secured Course", InstructorId = instructor.Id, Instructor = instructor };
        var section = new Section { Id = Guid.NewGuid(), CourseId = course.Id, Course = course, Title = "Core" };
        var lesson = new Lesson
        {
            Id = Guid.NewGuid(),
            SectionId = section.Id,
            Section = section,
            Title = "Exclusive Lesson",
            VideoUrl = "vid-admin-test",
            IsFreePreview = false
        };

        _context.Users.AddRange(instructor, admin);
        _context.Courses.Add(course);
        _context.Sections.Add(section);
        _context.Lessons.Add(lesson);
        await _context.SaveChangesAsync();

        // Act
        var result = await _videoService.GetAuthorizedPlaybackAsync(admin.Id, "vid-admin-test");

        // Assert
        result.Should().NotBeNull();
        result.VideoId.Should().Be("vid-admin-test");
    }

    [Fact]
    public async Task GetAuthorizedPlaybackAsync_WhenUserIsEnrolled_AllowsAccess()
    {
        // Arrange
        var instructor = new User { Id = Guid.NewGuid(), FullName = "Instructor", Email = "inst2@totc.com" };
        var student = new User { Id = Guid.NewGuid(), FullName = "Enrolled Student", Email = "student2@totc.com" };
        var course = new Course { Id = Guid.NewGuid(), Title = "Paid Course", InstructorId = instructor.Id, Instructor = instructor };
        var section = new Section { Id = Guid.NewGuid(), CourseId = course.Id, Course = course, Title = "Core" };
        var lesson = new Lesson
        {
            Id = Guid.NewGuid(),
            SectionId = section.Id,
            Section = section,
            Title = "Lesson 1",
            VideoUrl = "vid-enrolled-test",
            IsFreePreview = false
        };

        var enrollment = new Enrollment
        {
            Id = Guid.NewGuid(),
            UserId = student.Id,
            CourseId = course.Id,
            EnrolledAt = DateTime.UtcNow
        };

        _context.Users.AddRange(instructor, student);
        _context.Courses.Add(course);
        _context.Sections.Add(section);
        _context.Lessons.Add(lesson);
        _context.Enrollments.Add(enrollment);
        await _context.SaveChangesAsync();

        // Act
        var result = await _videoService.GetAuthorizedPlaybackAsync(student.Id, "vid-enrolled-test");

        // Assert
        result.Should().NotBeNull();
        result.VideoId.Should().Be("vid-enrolled-test");
    }

    [Fact]
    public async Task GetAuthorizedPlaybackAsync_WhenUserHasActiveSubscription_AllowsAccess()
    {
        // Arrange
        var instructor = new User { Id = Guid.NewGuid(), FullName = "Instructor", Email = "inst3@totc.com" };
        var subscriber = new User
        {
            Id = Guid.NewGuid(),
            FullName = "Subscribed Student",
            Email = "sub3@totc.com",
            IsSubscribed = true,
            SubscriptionExpiresAt = DateTime.UtcNow.AddDays(30)
        };
        var course = new Course { Id = Guid.NewGuid(), Title = "Subscription Course", InstructorId = instructor.Id, Instructor = instructor };
        var section = new Section { Id = Guid.NewGuid(), CourseId = course.Id, Course = course, Title = "Core" };
        var lesson = new Lesson
        {
            Id = Guid.NewGuid(),
            SectionId = section.Id,
            Section = section,
            Title = "Lesson 1",
            VideoUrl = "vid-sub-test",
            IsFreePreview = false
        };

        _context.Users.AddRange(instructor, subscriber);
        _context.Courses.Add(course);
        _context.Sections.Add(section);
        _context.Lessons.Add(lesson);
        await _context.SaveChangesAsync();

        // Act
        var result = await _videoService.GetAuthorizedPlaybackAsync(subscriber.Id, "vid-sub-test");

        // Assert
        result.Should().NotBeNull();
        result.VideoId.Should().Be("vid-sub-test");
    }

    [Fact]
    public async Task GetAuthorizedPlaybackAsync_WhenUserHasNoAccess_ThrowsUnauthorizedAccessException()
    {
        // Arrange
        var instructor = new User { Id = Guid.NewGuid(), FullName = "Instructor", Email = "inst4@totc.com" };
        var unauthorizedUser = new User { Id = Guid.NewGuid(), FullName = "Unauthorized User", Email = "unauth4@totc.com" };
        var course = new Course { Id = Guid.NewGuid(), Title = "Secured Course", InstructorId = instructor.Id, Instructor = instructor };
        var section = new Section { Id = Guid.NewGuid(), CourseId = course.Id, Course = course, Title = "Core" };
        var lesson = new Lesson
        {
            Id = Guid.NewGuid(),
            SectionId = section.Id,
            Section = section,
            Title = "Secured Lesson",
            VideoUrl = "vid-unauthorized-test",
            IsFreePreview = false
        };

        _context.Users.AddRange(instructor, unauthorizedUser);
        _context.Courses.Add(course);
        _context.Sections.Add(section);
        _context.Lessons.Add(lesson);
        await _context.SaveChangesAsync();

        // Act
        Func<Task> act = async () => await _videoService.GetAuthorizedPlaybackAsync(unauthorizedUser.Id, "vid-unauthorized-test");

        // Assert
        await act.Should().ThrowAsync<UnauthorizedAccessException>()
            .WithMessage("Active enrollment or subscription required to stream this video.");
    }
}
