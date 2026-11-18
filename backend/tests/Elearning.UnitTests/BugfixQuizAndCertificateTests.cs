using Elearning.Application.DTOs;
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

public class BugfixQuizAndCertificateTests
{
    private static ElearningDbContext CreateInMemoryDbContext()
    {
        var options = new DbContextOptionsBuilder<ElearningDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        return new ElearningDbContext(options);
    }

    [Fact]
    public async Task SubmitQuizAsync_WhenSequentialPrerequisiteFails_DoesNotForceCompleteLesson()
    {
        // Arrange
        await using var context = CreateInMemoryDbContext();
        var user = new User { Id = Guid.NewGuid(), FullName = "Student One", Email = "seq@totc.com", Role = UserRole.Student };
        var instructor = new User { Id = Guid.NewGuid(), FullName = "Instructor", Email = "inst@totc.com", Role = UserRole.Instructor };
        var course = new Course { Id = Guid.NewGuid(), Title = "Sequential Course", InstructorId = instructor.Id, IsOpenAccess = false };
        var section = new Section { Id = Guid.NewGuid(), CourseId = course.Id, Course = course, Title = "Module 1", OrderIndex = 1 };
        var lesson1 = new Lesson { Id = Guid.NewGuid(), SectionId = section.Id, Section = section, Title = "Lesson 1 (Incomplete)", OrderIndex = 1 };
        var lesson2 = new Lesson { Id = Guid.NewGuid(), SectionId = section.Id, Section = section, Title = "Lesson 2 (Quiz)", OrderIndex = 2 };

        var correctOpt = new QuizOption { Id = Guid.NewGuid(), OptionText = "Right Answer", IsCorrect = true };
        var wrongOpt = new QuizOption { Id = Guid.NewGuid(), OptionText = "Wrong Answer", IsCorrect = false };
        var question = new QuizQuestion
        {
            Id = Guid.NewGuid(),
            QuestionText = "What is 1 + 1?",
            Explanation = "1 + 1 equals 2.",
            Options = new List<QuizOption> { correctOpt, wrongOpt }
        };
        var quiz = new Quiz
        {
            Id = Guid.NewGuid(),
            LessonId = lesson2.Id,
            Lesson = lesson2,
            Title = "Lesson 2 Quiz",
            PassingScorePercentage = 70,
            Questions = new List<QuizQuestion> { question }
        };

        context.Users.AddRange(user, instructor);
        context.Courses.Add(course);
        context.Sections.Add(section);
        context.Lessons.AddRange(lesson1, lesson2);
        context.Quizzes.Add(quiz);
        context.Enrollments.Add(new Enrollment { UserId = user.Id, CourseId = course.Id, EnrolledAt = DateTime.UtcNow });
        await context.SaveChangesAsync();

        var enrollmentService = new EnrollmentService(context, new CertificateService(context));
        var quizService = new QuizService(context, enrollmentService);

        var request = new QuizSubmitRequestDto
        {
            Answers = new Dictionary<Guid, Guid> { { question.Id, correctOpt.Id } }
        };

        // Act
        var act = async () => await quizService.SubmitQuizAsync(quiz.Id, user.Id, request);

        // Assert - sequential progression exception propagates and lesson 2 is NOT force-completed in DB
        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("*Sequential lesson progression enforced*");

        var lesson2Progress = await context.LessonProgresses
            .FirstOrDefaultAsync(lp => lp.LessonId == lesson2.Id && lp.UserId == user.Id);
        lesson2Progress.Should().BeNull();
    }

    [Fact]
    public async Task SubmitQuizAsync_WhenFailed_HidesCorrectOptionIdAndExplanation()
    {
        // Arrange
        await using var context = CreateInMemoryDbContext();
        var user = new User { Id = Guid.NewGuid(), FullName = "Student Two", Email = "fail@totc.com", Role = UserRole.Student };
        var course = new Course { Id = Guid.NewGuid(), Title = "Security 101" };
        var section = new Section { Id = Guid.NewGuid(), CourseId = course.Id, Course = course, Title = "Section 1", OrderIndex = 1 };
        var lesson = new Lesson { Id = Guid.NewGuid(), SectionId = section.Id, Section = section, Title = "Lesson 1", OrderIndex = 1 };

        var q1Correct = new QuizOption { Id = Guid.NewGuid(), OptionText = "Q1 Right", IsCorrect = true };
        var q1Wrong = new QuizOption { Id = Guid.NewGuid(), OptionText = "Q1 Wrong", IsCorrect = false };
        var q1 = new QuizQuestion
        {
            Id = Guid.NewGuid(),
            QuestionText = "Question 1",
            Explanation = "Secret explanation 1",
            OrderIndex = 1,
            Options = new List<QuizOption> { q1Correct, q1Wrong }
        };

        var q2Correct = new QuizOption { Id = Guid.NewGuid(), OptionText = "Q2 Right", IsCorrect = true };
        var q2Wrong = new QuizOption { Id = Guid.NewGuid(), OptionText = "Q2 Wrong", IsCorrect = false };
        var q2 = new QuizQuestion
        {
            Id = Guid.NewGuid(),
            QuestionText = "Question 2",
            Explanation = "Secret explanation 2",
            OrderIndex = 2,
            Options = new List<QuizOption> { q2Correct, q2Wrong }
        };

        var quiz = new Quiz
        {
            Id = Guid.NewGuid(),
            LessonId = lesson.Id,
            Lesson = lesson,
            Title = "Assessment",
            PassingScorePercentage = 70,
            Questions = new List<QuizQuestion> { q1, q2 }
        };

        context.Users.Add(user);
        context.Courses.Add(course);
        context.Sections.Add(section);
        context.Lessons.Add(lesson);
        context.Quizzes.Add(quiz);
        context.Enrollments.Add(new Enrollment { UserId = user.Id, CourseId = course.Id, EnrolledAt = DateTime.UtcNow });
        await context.SaveChangesAsync();

        var enrollmentMock = new Mock<IEnrollmentService>();
        var quizService = new QuizService(context, enrollmentMock.Object);

        // Answer 1 of 2 correctly -> 50% < 70% (failed)
        var request = new QuizSubmitRequestDto
        {
            Answers = new Dictionary<Guid, Guid>
            {
                { q1.Id, q1Correct.Id },
                { q2.Id, q2Wrong.Id }
            }
        };

        // Act
        var result = await quizService.SubmitQuizAsync(quiz.Id, user.Id, request);

        // Assert
        result.Passed.Should().BeFalse();
        result.ScorePercentage.Should().Be(50);
        result.QuestionFeedbacks.Should().HaveCount(2);
        result.QuestionFeedbacks.Should().OnlyContain(f => f.CorrectOptionId == null && f.Explanation == null);

        var q1Feedback = result.QuestionFeedbacks.Single(f => f.QuestionId == q1.Id);
        q1Feedback.IsCorrect.Should().BeTrue();
        q1Feedback.SelectedOptionId.Should().Be(q1Correct.Id);

        var q2Feedback = result.QuestionFeedbacks.Single(f => f.QuestionId == q2.Id);
        q2Feedback.IsCorrect.Should().BeFalse();
        q2Feedback.SelectedOptionId.Should().Be(q2Wrong.Id);
    }

    [Fact]
    public async Task SubmitQuizAsync_WhenPassed_RevealsCorrectOptionIdAndExplanation()
    {
        // Arrange
        await using var context = CreateInMemoryDbContext();
        var user = new User { Id = Guid.NewGuid(), FullName = "Student Three", Email = "pass@totc.com", Role = UserRole.Student };
        var course = new Course { Id = Guid.NewGuid(), Title = "Security 101" };
        var section = new Section { Id = Guid.NewGuid(), CourseId = course.Id, Course = course, Title = "Section 1", OrderIndex = 1 };
        var lesson = new Lesson { Id = Guid.NewGuid(), SectionId = section.Id, Section = section, Title = "Lesson 1", OrderIndex = 1 };

        var correctOpt = new QuizOption { Id = Guid.NewGuid(), OptionText = "Correct", IsCorrect = true };
        var wrongOpt = new QuizOption { Id = Guid.NewGuid(), OptionText = "Wrong", IsCorrect = false };
        var question = new QuizQuestion
        {
            Id = Guid.NewGuid(),
            QuestionText = "Question 1",
            Explanation = "Detailed explanation revealed upon passing.",
            OrderIndex = 1,
            Options = new List<QuizOption> { correctOpt, wrongOpt }
        };

        var quiz = new Quiz
        {
            Id = Guid.NewGuid(),
            LessonId = lesson.Id,
            Lesson = lesson,
            Title = "Assessment",
            PassingScorePercentage = 70,
            Questions = new List<QuizQuestion> { question }
        };

        context.Users.Add(user);
        context.Courses.Add(course);
        context.Sections.Add(section);
        context.Lessons.Add(lesson);
        context.Quizzes.Add(quiz);
        context.Enrollments.Add(new Enrollment { UserId = user.Id, CourseId = course.Id, EnrolledAt = DateTime.UtcNow });
        await context.SaveChangesAsync();

        var enrollmentMock = new Mock<IEnrollmentService>();
        var quizService = new QuizService(context, enrollmentMock.Object);

        var request = new QuizSubmitRequestDto
        {
            Answers = new Dictionary<Guid, Guid> { { question.Id, correctOpt.Id } }
        };

        // Act
        var result = await quizService.SubmitQuizAsync(quiz.Id, user.Id, request);

        // Assert
        result.Passed.Should().BeTrue();
        result.ScorePercentage.Should().Be(100);
        result.QuestionFeedbacks.Should().ContainSingle();

        var feedback = result.QuestionFeedbacks[0];
        feedback.IsCorrect.Should().BeTrue();
        feedback.SelectedOptionId.Should().Be(correctOpt.Id);
        feedback.CorrectOptionId.Should().Be(correctOpt.Id);
        feedback.Explanation.Should().Be("Detailed explanation revealed upon passing.");
    }

    [Fact]
    public async Task SubmitQuizAsync_WhenSectionQuizAndUnenrolled_ThrowsUnauthorizedAccessException()
    {
        // Arrange
        await using var context = CreateInMemoryDbContext();
        var unenrolledUser = new User
        {
            Id = Guid.NewGuid(),
            FullName = "Outsider",
            Email = "outsider@totc.com",
            Role = UserRole.Student,
            IsSubscribed = false
        };
        var instructor = new User { Id = Guid.NewGuid(), FullName = "Instructor", Email = "inst2@totc.com", Role = UserRole.Instructor };
        var course = new Course { Id = Guid.NewGuid(), Title = "Paid Course", InstructorId = instructor.Id, Price = 99 };
        var section = new Section { Id = Guid.NewGuid(), CourseId = course.Id, Course = course, Title = "Final Exam Section", OrderIndex = 1 };

        var correctOpt = new QuizOption { Id = Guid.NewGuid(), OptionText = "Right", IsCorrect = true };
        var question = new QuizQuestion
        {
            Id = Guid.NewGuid(),
            QuestionText = "Section Exam Question",
            Options = new List<QuizOption> { correctOpt }
        };
        var sectionQuiz = new Quiz
        {
            Id = Guid.NewGuid(),
            SectionId = section.Id,
            Section = section,
            LessonId = null,
            Title = "Section Final Exam",
            PassingScorePercentage = 70,
            Questions = new List<QuizQuestion> { question }
        };

        context.Users.AddRange(unenrolledUser, instructor);
        context.Courses.Add(course);
        context.Sections.Add(section);
        context.Quizzes.Add(sectionQuiz);
        await context.SaveChangesAsync();

        var enrollmentMock = new Mock<IEnrollmentService>();
        var quizService = new QuizService(context, enrollmentMock.Object);

        var request = new QuizSubmitRequestDto
        {
            Answers = new Dictionary<Guid, Guid> { { question.Id, correctOpt.Id } }
        };

        // Act
        var act = async () => await quizService.SubmitQuizAsync(sectionQuiz.Id, unenrolledUser.Id, request);

        // Assert
        await act.Should().ThrowAsync<UnauthorizedAccessException>()
            .WithMessage("*Enrollment is required*");
    }

    [Fact]
    public async Task CompleteLessonAsync_OnFinalLessonFirstTime_MarksEnrollmentCompleteAndIssuesCertificate()
    {
        // Arrange
        await using var context = CreateInMemoryDbContext();
        var user = new User { Id = Guid.NewGuid(), FullName = "Graduate", Email = "grad@totc.com", Role = UserRole.Student };
        var instructor = new User { Id = Guid.NewGuid(), FullName = "Prof. Ada", Email = "ada@totc.com", Role = UserRole.Instructor };
        var course = new Course { Id = Guid.NewGuid(), Title = "Full Stack Architecture", InstructorId = instructor.Id };
        var section = new Section { Id = Guid.NewGuid(), CourseId = course.Id, Course = course, Title = "Core", OrderIndex = 1 };
        var lesson1 = new Lesson { Id = Guid.NewGuid(), SectionId = section.Id, Section = section, Title = "Lesson 1", OrderIndex = 1 };
        var lesson2 = new Lesson { Id = Guid.NewGuid(), SectionId = section.Id, Section = section, Title = "Final Lesson", OrderIndex = 2 };

        context.Users.AddRange(user, instructor);
        context.Courses.Add(course);
        context.Sections.Add(section);
        context.Lessons.AddRange(lesson1, lesson2);
        context.Enrollments.Add(new Enrollment { UserId = user.Id, CourseId = course.Id, EnrolledAt = DateTime.UtcNow, IsCompleted = false });
        context.LessonProgresses.Add(new LessonProgress { LessonId = lesson1.Id, UserId = user.Id, IsCompleted = true, CompletedAt = DateTime.UtcNow.AddMinutes(-5) });
        await context.SaveChangesAsync();

        var certificateService = new CertificateService(context);
        var enrollmentService = new EnrollmentService(context, certificateService);

        // Act - Complete final lesson for the very first time
        var result = await enrollmentService.CompleteLessonAsync(lesson2.Id, user.Id, new CompleteLessonDto
        {
            MarkAsComplete = true,
            LastWatchedPositionSeconds = 120
        });

        // Assert
        result.Should().BeTrue();

        var progress = await context.LessonProgresses.FirstOrDefaultAsync(lp => lp.LessonId == lesson2.Id && lp.UserId == user.Id);
        progress.Should().NotBeNull();
        progress!.IsCompleted.Should().BeTrue();

        var enrollment = await context.Enrollments.FirstAsync(e => e.UserId == user.Id && e.CourseId == course.Id);
        enrollment.IsCompleted.Should().BeTrue();
        enrollment.CompletedAt.Should().NotBeNull();

        var certificates = await context.Certificates.Where(c => c.UserId == user.Id && c.CourseId == course.Id).ToListAsync();
        certificates.Should().ContainSingle();
        certificates[0].CertificateNumber.Should().StartWith($"TOTC-{DateTime.UtcNow.Year}-");
        certificates[0].VerificationHash.Should().NotBeNullOrWhiteSpace();
        certificates[0].PdfUrl.Should().Be($"/api/certificates/{certificates[0].CertificateNumber}/download");
    }

    [Fact]
    public async Task CompleteLessonAsync_WhenCalledTwiceOnFinalLesson_DoesNotDuplicateCertificate()
    {
        // Arrange
        await using var context = CreateInMemoryDbContext();
        var user = new User { Id = Guid.NewGuid(), FullName = "Repeat Caller", Email = "repeat@totc.com", Role = UserRole.Student };
        var instructor = new User { Id = Guid.NewGuid(), FullName = "Prof. Ada", Email = "ada2@totc.com", Role = UserRole.Instructor };
        var course = new Course { Id = Guid.NewGuid(), Title = "Single Lesson Course", InstructorId = instructor.Id };
        var section = new Section { Id = Guid.NewGuid(), CourseId = course.Id, Course = course, Title = "Core", OrderIndex = 1 };
        var finalLesson = new Lesson { Id = Guid.NewGuid(), SectionId = section.Id, Section = section, Title = "Only Lesson", OrderIndex = 1 };

        context.Users.AddRange(user, instructor);
        context.Courses.Add(course);
        context.Sections.Add(section);
        context.Lessons.Add(finalLesson);
        context.Enrollments.Add(new Enrollment { UserId = user.Id, CourseId = course.Id, EnrolledAt = DateTime.UtcNow, IsCompleted = false });
        await context.SaveChangesAsync();

        // Also exercises the backward-compatible single-argument constructor
        var enrollmentService = new EnrollmentService(context);

        // Act - Call completion twice on the final lesson
        var firstCall = await enrollmentService.CompleteLessonAsync(finalLesson.Id, user.Id, new CompleteLessonDto { MarkAsComplete = true });
        var secondCall = await enrollmentService.CompleteLessonAsync(finalLesson.Id, user.Id, new CompleteLessonDto { MarkAsComplete = true });

        // Assert
        firstCall.Should().BeTrue();
        secondCall.Should().BeTrue();

        var certificates = await context.Certificates.Where(c => c.UserId == user.Id && c.CourseId == course.Id).ToListAsync();
        certificates.Should().ContainSingle();

        // Verify composite unique index (UserId, CourseId) is configured in EF Core model metadata
        var certEntityType = context.Model.FindEntityType(typeof(Certificate));
        certEntityType.Should().NotBeNull();
        certEntityType!.GetIndexes().Should().Contain(idx =>
            idx.IsUnique &&
            idx.Properties.Select(p => p.Name).SequenceEqual(new[] { nameof(Certificate.UserId), nameof(Certificate.CourseId) }));
    }
}
