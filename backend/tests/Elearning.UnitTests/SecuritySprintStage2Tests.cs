using Elearning.Application.DTOs;
using Elearning.Domain.Entities;
using Elearning.Domain.Enums;
using Elearning.Infrastructure.Data;
using Elearning.Infrastructure.Services;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Elearning.UnitTests;

public class SecuritySprintStage2Tests
{
    private ElearningDbContext CreateInMemoryDbContext()
    {
        var options = new DbContextOptionsBuilder<ElearningDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        return new ElearningDbContext(options);
    }

    [Fact]
    public async Task CompleteLessonAsync_WhenLessonHasUnpassedQuiz_ThrowsInvalidOperationException()
    {
        // Arrange
        using var context = CreateInMemoryDbContext();
        var user = new User { Id = Guid.NewGuid(), FullName = "Alice Student", Email = "alice@totc.com" };
        var instructor = new User { Id = Guid.NewGuid(), FullName = "Prof. Bob", Email = "bob@totc.com", Role = UserRole.Instructor };
        var course = new Course { Id = Guid.NewGuid(), Title = "Cybersecurity 101", InstructorId = instructor.Id, Price = 0 };
        var section = new Section { Id = Guid.NewGuid(), Course = course, Title = "Section 1", OrderIndex = 1 };
        var lesson = new Lesson { Id = Guid.NewGuid(), Section = section, Title = "Lesson with Quiz", OrderIndex = 1 };
        var quiz = new Quiz { Id = Guid.NewGuid(), LessonId = lesson.Id, Title = "Module Quiz 1", PassingScorePercentage = 70 };

        context.Users.AddRange(user, instructor);
        context.Courses.Add(course);
        context.Sections.Add(section);
        context.Lessons.Add(lesson);
        context.Quizzes.Add(quiz);
        context.Enrollments.Add(new Enrollment { UserId = user.Id, CourseId = course.Id, EnrolledAt = DateTime.UtcNow });
        await context.SaveChangesAsync();

        var service = new EnrollmentService(context);

        // Act - Attempting to complete the lesson without taking or passing the quiz
        var act = async () => await service.CompleteLessonAsync(lesson.Id, user.Id, new CompleteLessonDto { MarkAsComplete = true });

        // Assert - Must block completion with academic integrity exception
        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("*contains a required quiz*");
    }

    [Fact]
    public async Task CompleteLessonAsync_WhenLessonQuizIsPassed_Succeeds()
    {
        // Arrange
        using var context = CreateInMemoryDbContext();
        var user = new User { Id = Guid.NewGuid(), FullName = "Alice Student", Email = "alice@totc.com" };
        var instructor = new User { Id = Guid.NewGuid(), FullName = "Prof. Bob", Email = "bob@totc.com", Role = UserRole.Instructor };
        var course = new Course { Id = Guid.NewGuid(), Title = "Cybersecurity 101", InstructorId = instructor.Id, Price = 0 };
        var section = new Section { Id = Guid.NewGuid(), Course = course, Title = "Section 1", OrderIndex = 1 };
        var lesson = new Lesson { Id = Guid.NewGuid(), Section = section, Title = "Lesson with Quiz", OrderIndex = 1 };
        var quiz = new Quiz { Id = Guid.NewGuid(), LessonId = lesson.Id, Title = "Module Quiz 1", PassingScorePercentage = 70 };
        var passedAttempt = new QuizAttempt { Id = Guid.NewGuid(), QuizId = quiz.Id, UserId = user.Id, ScorePercentage = 90, Passed = true };

        context.Users.AddRange(user, instructor);
        context.Courses.Add(course);
        context.Sections.Add(section);
        context.Lessons.Add(lesson);
        context.Quizzes.Add(quiz);
        context.QuizAttempts.Add(passedAttempt);
        context.Enrollments.Add(new Enrollment { UserId = user.Id, CourseId = course.Id, EnrolledAt = DateTime.UtcNow });
        await context.SaveChangesAsync();

        var service = new EnrollmentService(context);

        // Act
        var result = await service.CompleteLessonAsync(lesson.Id, user.Id, new CompleteLessonDto { MarkAsComplete = true });

        // Assert
        result.Should().BeTrue();
        var progress = await context.LessonProgresses.FirstOrDefaultAsync(lp => lp.LessonId == lesson.Id && lp.UserId == user.Id);
        progress.Should().NotBeNull();
        progress!.IsCompleted.Should().BeTrue();
    }

    [Fact]
    public async Task IssueCertificateAsync_WhenCourseHasUnpassedAssessments_ThrowsInvalidOperationException()
    {
        // Arrange
        using var context = CreateInMemoryDbContext();
        var user = new User { Id = Guid.NewGuid(), FullName = "Charlie Student", Email = "charlie@totc.com" };
        var instructor = new User { Id = Guid.NewGuid(), FullName = "Prof. Bob", Email = "bob@totc.com", Role = UserRole.Instructor };
        var course = new Course { Id = Guid.NewGuid(), Title = "AI Foundations", InstructorId = instructor.Id };
        var section = new Section { Id = Guid.NewGuid(), Course = course, Title = "Section 1", OrderIndex = 1 };
        var lesson = new Lesson { Id = Guid.NewGuid(), Section = section, Title = "Intro Lesson", OrderIndex = 1 };
        var finalExam = new Quiz { Id = Guid.NewGuid(), SectionId = section.Id, Title = "Final Comprehensive Exam", PassingScorePercentage = 80 };

        context.Users.AddRange(user, instructor);
        context.Courses.Add(course);
        context.Sections.Add(section);
        context.Lessons.Add(lesson);
        context.Quizzes.Add(finalExam);
        // Student completed all lessons, but has NOT passed the final exam
        context.LessonProgresses.Add(new LessonProgress { LessonId = lesson.Id, UserId = user.Id, IsCompleted = true });
        context.Enrollments.Add(new Enrollment { UserId = user.Id, CourseId = course.Id, EnrolledAt = DateTime.UtcNow });
        await context.SaveChangesAsync();

        var certService = new CertificateService(context);

        // Act - Attempting direct certificate issuance
        var act = async () => await certService.IssueCertificateAsync(user.Id, course.Id);

        // Assert - Direct bypass must be rejected with 400 Bad Request exception
        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("*Course requires passing all assessments*Final Comprehensive Exam*");
    }

    [Fact]
    public async Task IssueCertificateAsync_WhenAllLessonsAndAssessmentsPassed_SuccessfullyIssuesCertificate()
    {
        // Arrange
        using var context = CreateInMemoryDbContext();
        var user = new User { Id = Guid.NewGuid(), FullName = "Charlie Student", Email = "charlie@totc.com" };
        var instructor = new User { Id = Guid.NewGuid(), FullName = "Prof. Bob", Email = "bob@totc.com", Role = UserRole.Instructor };
        var course = new Course { Id = Guid.NewGuid(), Title = "AI Foundations", InstructorId = instructor.Id };
        var section = new Section { Id = Guid.NewGuid(), Course = course, Title = "Section 1", OrderIndex = 1 };
        var lesson = new Lesson { Id = Guid.NewGuid(), Section = section, Title = "Intro Lesson", OrderIndex = 1 };
        var finalExam = new Quiz { Id = Guid.NewGuid(), SectionId = section.Id, Title = "Final Comprehensive Exam", PassingScorePercentage = 80 };
        var examAttempt = new QuizAttempt { Id = Guid.NewGuid(), QuizId = finalExam.Id, UserId = user.Id, ScorePercentage = 95, Passed = true };

        context.Users.AddRange(user, instructor);
        context.Courses.Add(course);
        context.Sections.Add(section);
        context.Lessons.Add(lesson);
        context.Quizzes.Add(finalExam);
        context.QuizAttempts.Add(examAttempt);
        context.LessonProgresses.Add(new LessonProgress { LessonId = lesson.Id, UserId = user.Id, IsCompleted = true });
        context.Enrollments.Add(new Enrollment { UserId = user.Id, CourseId = course.Id, EnrolledAt = DateTime.UtcNow });
        await context.SaveChangesAsync();

        var certService = new CertificateService(context);

        // Act
        var cert = await certService.IssueCertificateAsync(user.Id, course.Id);

        // Assert
        cert.Should().NotBeNull();
        cert.CertificateNumber.Should().StartWith("TOTC-2026-");
        cert.VerificationHash.Should().NotBeNullOrWhiteSpace();

        var dbCert = await context.Certificates.FirstOrDefaultAsync(c => c.UserId == user.Id && c.CourseId == course.Id);
        dbCert.Should().NotBeNull();
    }
}
