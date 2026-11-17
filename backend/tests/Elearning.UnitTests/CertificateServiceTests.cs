using Elearning.Domain.Entities;
using Elearning.Domain.Enums;
using Elearning.Infrastructure.Data;
using Elearning.Infrastructure.Services;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Elearning.UnitTests;

public class CertificateServiceTests
{
    private readonly ElearningDbContext _context;
    private readonly CertificateService _service;

    public CertificateServiceTests()
    {
        var options = new DbContextOptionsBuilder<ElearningDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        _context = new ElearningDbContext(options);
        _service = new CertificateService(_context);
    }

    [Fact]
    public async Task IssueCertificateAsync_WhenAllLessonsCompleted_CreatesCertificateWithSerialAndHash()
    {
        // Arrange
        var instructor = new User { Id = Guid.NewGuid(), FullName = "Dr. Instructor", Email = "inst@totc.com", Role = UserRole.Instructor };
        var student = new User { Id = Guid.NewGuid(), FullName = "Graduating Student", Email = "grad@totc.com", Role = UserRole.Student };
        var course = new Course { Id = Guid.NewGuid(), Title = "Mastering Clean Architecture", InstructorId = instructor.Id, Instructor = instructor };
        var section = new Section { Id = Guid.NewGuid(), CourseId = course.Id, Course = course, Title = "Module 1" };
        var lesson = new Lesson { Id = Guid.NewGuid(), SectionId = section.Id, Section = section, Title = "Lesson 1" };

        var progress = new LessonProgress { UserId = student.Id, LessonId = lesson.Id, IsCompleted = true, CompletedAt = DateTime.UtcNow };

        _context.Users.AddRange(instructor, student);
        _context.Courses.Add(course);
        _context.Sections.Add(section);
        _context.Lessons.Add(lesson);
        _context.LessonProgresses.Add(progress);
        await _context.SaveChangesAsync();

        // Act
        var certDto = await _service.IssueCertificateAsync(student.Id, course.Id);

        // Assert
        certDto.Should().NotBeNull();
        certDto.CertificateNumber.Should().StartWith("TOTC-");
        certDto.VerificationHash.Should().HaveLength(32);
        certDto.CourseTitle.Should().Be("Mastering Clean Architecture");
        certDto.StudentName.Should().Be("Graduating Student");

        var dbCert = await _context.Certificates.FirstOrDefaultAsync(c => c.VerificationHash == certDto.VerificationHash);
        dbCert.Should().NotBeNull();
        dbCert!.CertificateNumber.Should().Be(certDto.CertificateNumber);
    }

    [Fact]
    public async Task VerifyCertificateAsync_ValidHash_ReturnsValidCertificateDetails()
    {
        // Arrange
        var instructor = new User { Id = Guid.NewGuid(), FullName = "Prof. Xavier", Email = "xavier@totc.com", Role = UserRole.Instructor };
        var student = new User { Id = Guid.NewGuid(), FullName = "Peter Parker", Email = "spidey@totc.com", Role = UserRole.Student };
        var course = new Course { Id = Guid.NewGuid(), Title = "Web Slinging 101", InstructorId = instructor.Id, Instructor = instructor };

        var cert = new Certificate
        {
            Id = Guid.NewGuid(),
            UserId = student.Id,
            User = student,
            CourseId = course.Id,
            Course = course,
            CertificateNumber = "TOTC-2026-TEST1234",
            VerificationHash = "ABCDEF1234567890ABCDEF1234567890",
            IssuedAt = DateTime.UtcNow
        };

        _context.Users.AddRange(instructor, student);
        _context.Courses.Add(course);
        _context.Certificates.Add(cert);
        await _context.SaveChangesAsync();

        // Act
        var result = await _service.VerifyCertificateAsync("ABCDEF1234567890ABCDEF1234567890");

        // Assert
        result.Should().NotBeNull();
        result.IsValid.Should().BeTrue();
        result.CertificateNumber.Should().Be("TOTC-2026-TEST1234");
        result.StudentName.Should().Be("Peter Parker");
        result.CourseTitle.Should().Be("Web Slinging 101");
        result.InstructorName.Should().Be("Prof. Xavier");
    }

    [Fact]
    public async Task VerifyCertificateAsync_NonExistentHash_ReturnsInvalidResult()
    {
        // Act
        var result = await _service.VerifyCertificateAsync("NON_EXISTENT_HASH_999");

        // Assert
        result.Should().NotBeNull();
        result.IsValid.Should().BeFalse();
        result.Message.Should().Contain("Certificate not found");
    }

    [Fact]
    public async Task GenerateCertificateHtmlAsync_WhenCertificateExists_ReturnsFormattedHtmlDocument()
    {
        // Arrange
        var instructor = new User { Id = Guid.NewGuid(), FullName = "Prof. Xavier", Email = "xavier2@totc.com", Role = UserRole.Instructor };
        var student = new User { Id = Guid.NewGuid(), FullName = "Peter Parker", Email = "spidey2@totc.com", Role = UserRole.Student };
        var course = new Course { Id = Guid.NewGuid(), Title = "Advanced Web Slinging", InstructorId = instructor.Id, Instructor = instructor };

        var cert = new Certificate
        {
            Id = Guid.NewGuid(),
            UserId = student.Id,
            User = student,
            CourseId = course.Id,
            Course = course,
            CertificateNumber = "TOTC-2026-HTML999",
            VerificationHash = "ABCDEF1234567890ABCDEF1234567899",
            IssuedAt = DateTime.UtcNow
        };

        _context.Users.AddRange(instructor, student);
        _context.Courses.Add(course);
        _context.Certificates.Add(cert);
        await _context.SaveChangesAsync();

        // Act
        var html = await _service.GenerateCertificateHtmlAsync("TOTC-2026-HTML999");

        // Assert
        html.Should().NotBeNullOrEmpty();
        html.Should().Contain("<!DOCTYPE html>");
        html.Should().Contain("Peter Parker");
        html.Should().Contain("Advanced Web Slinging");
        html.Should().Contain("TOTC-2026-HTML999");
        html.Should().Contain("სერტიფიკატი"); // Georgian localization check
    }

    [Fact]
    public async Task GenerateCertificateHtmlAsync_WhenCertificateDoesNotExist_ReturnsNull()
    {
        // Act
        var html = await _service.GenerateCertificateHtmlAsync("NON-EXISTENT-CERT-000");

        // Assert
        html.Should().BeNull();
    }

    [Fact]
    public async Task GenerateCertificateHtmlAsync_WhenInputContainsScriptTags_HtmlEncodesDynamicFields()
    {
        // Arrange
        var instructor = new User { Id = Guid.NewGuid(), FullName = "Dr. <script>alert('xss1')</script>", Email = "inst@totc.com", Role = UserRole.Instructor };
        var student = new User { Id = Guid.NewGuid(), FullName = "Student <script>alert('xss2')</script>", Email = "stud@totc.com", Role = UserRole.Student };
        var course = new Course { Id = Guid.NewGuid(), Title = "Course <b>Bold</b> & <script>alert('xss3')</script>", InstructorId = instructor.Id, Instructor = instructor };

        var cert = new Certificate
        {
            Id = Guid.NewGuid(),
            UserId = student.Id,
            User = student,
            CourseId = course.Id,
            Course = course,
            CertificateNumber = "TOTC-2026-<script>",
            VerificationHash = "HASH<img src=x onerror=alert(1)>",
            IssuedAt = DateTime.UtcNow
        };

        _context.Users.AddRange(instructor, student);
        _context.Courses.Add(course);
        _context.Certificates.Add(cert);
        await _context.SaveChangesAsync();

        // Act
        var html = await _service.GenerateCertificateHtmlAsync(cert.CertificateNumber);

        // Assert
        html.Should().NotBeNullOrEmpty();
        html.Should().NotContain("<script>alert('xss1')</script>");
        html.Should().NotContain("<script>alert('xss2')</script>");
        html.Should().NotContain("<script>alert('xss3')</script>");
        html.Should().NotContain("<img src=x onerror=alert(1)>");

        html.Should().Contain("&lt;script&gt;alert(&#39;xss1&#39;)&lt;/script&gt;");
        html.Should().Contain("&lt;script&gt;alert(&#39;xss2&#39;)&lt;/script&gt;");
        html.Should().Contain("&lt;script&gt;alert(&#39;xss3&#39;)&lt;/script&gt;");
    }
}
