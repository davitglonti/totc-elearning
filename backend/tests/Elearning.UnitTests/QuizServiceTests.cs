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

public class QuizServiceTests
{
    private readonly ElearningDbContext _context;
    private readonly Mock<IEnrollmentService> _enrollmentMock;
    private readonly QuizService _quizService;

    public QuizServiceTests()
    {
        var options = new DbContextOptionsBuilder<ElearningDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        _context = new ElearningDbContext(options);
        _enrollmentMock = new Mock<IEnrollmentService>();
        _quizService = new QuizService(_context, _enrollmentMock.Object);
    }

    [Fact]
    public async Task SubmitQuizAsync_AllCorrectAnswers_ReturnsPassedAnd100Percent()
    {
        // Arrange
        var user = new User { Id = Guid.NewGuid(), Email = "quizzer@totc.com", FullName = "Quizzer", Role = UserRole.Student };
        var course = new Course { Id = Guid.NewGuid(), Title = "C# Mastery", Price = 0 };
        var section = new Section { Id = Guid.NewGuid(), CourseId = course.Id, Course = course, Title = "Basics" };
        var lesson = new Lesson { Id = Guid.NewGuid(), SectionId = section.Id, Section = section, Title = "Intro", IsFreePreview = true };

        var option1 = new QuizOption { Id = Guid.NewGuid(), OptionText = "Correct A", IsCorrect = true };
        var option2 = new QuizOption { Id = Guid.NewGuid(), OptionText = "Wrong B", IsCorrect = false };

        var question = new QuizQuestion
        {
            Id = Guid.NewGuid(),
            QuestionText = "What is 2+2?",
            Options = new List<QuizOption> { option1, option2 }
        };

        var quiz = new Quiz
        {
            Id = Guid.NewGuid(),
            LessonId = lesson.Id,
            Lesson = lesson,
            Title = "Math Quiz",
            PassingScorePercentage = 70,
            Questions = new List<QuizQuestion> { question }
        };

        _context.Users.Add(user);
        _context.Courses.Add(course);
        _context.Sections.Add(section);
        _context.Lessons.Add(lesson);
        _context.Quizzes.Add(quiz);
        await _context.SaveChangesAsync();

        var request = new QuizSubmitRequestDto
        {
            Answers = new Dictionary<Guid, Guid> { { question.Id, option1.Id } }
        };

        // Act
        var result = await _quizService.SubmitQuizAsync(quiz.Id, user.Id, request);

        // Assert
        result.Passed.Should().BeTrue();
        result.ScorePercentage.Should().Be(100);
        result.CorrectAnswersCount.Should().Be(1);

        var attempts = await _context.QuizAttempts.Where(qa => qa.QuizId == quiz.Id && qa.UserId == user.Id).ToListAsync();
        attempts.Should().HaveCount(1);
        attempts[0].Passed.Should().BeTrue();
        attempts[0].ScorePercentage.Should().Be(100);
    }

    [Fact]
    public async Task SubmitQuizAsync_ThreeFailedAttempts_TriggersOneHourCooldownExceptionOnFourthAttempt()
    {
        // Arrange
        var user = new User { Id = Guid.NewGuid(), Email = "repeat_fail@totc.com", FullName = "Failer", Role = UserRole.Student };
        var course = new Course { Id = Guid.NewGuid(), Title = "Docker & K8s", Price = 0 };
        var section = new Section { Id = Guid.NewGuid(), CourseId = course.Id, Course = course, Title = "Containers" };
        var lesson = new Lesson { Id = Guid.NewGuid(), SectionId = section.Id, Section = section, Title = "Docker Basics", IsFreePreview = true };

        var correctOpt = new QuizOption { Id = Guid.NewGuid(), OptionText = "Correct Option", IsCorrect = true };
        var wrongOpt = new QuizOption { Id = Guid.NewGuid(), OptionText = "Wrong Option", IsCorrect = false };

        var question = new QuizQuestion
        {
            Id = Guid.NewGuid(),
            QuestionText = "Question 1",
            Options = new List<QuizOption> { correctOpt, wrongOpt }
        };

        var quiz = new Quiz
        {
            Id = Guid.NewGuid(),
            LessonId = lesson.Id,
            Lesson = lesson,
            Title = "Container Quiz",
            PassingScorePercentage = 70,
            Questions = new List<QuizQuestion> { question }
        };

        _context.Users.Add(user);
        _context.Courses.Add(course);
        _context.Sections.Add(section);
        _context.Lessons.Add(lesson);
        _context.Quizzes.Add(quiz);

        // Seed 3 recent failed attempts in the database within past 15 minutes
        for (int i = 0; i < 3; i++)
        {
            _context.QuizAttempts.Add(new QuizAttempt
            {
                QuizId = quiz.Id,
                UserId = user.Id,
                ScorePercentage = 0,
                Passed = false,
                AttemptedAt = DateTime.UtcNow.AddMinutes(-10 * (3 - i))
            });
        }
        await _context.SaveChangesAsync();

        var request = new QuizSubmitRequestDto
        {
            Answers = new Dictionary<Guid, Guid> { { question.Id, wrongOpt.Id } }
        };

        // Act & Assert
        var act = async () => await _quizService.SubmitQuizAsync(quiz.Id, user.Id, request);

        var ex = await act.Should().ThrowAsync<QuizCooldownException>();
        ex.Which.RemainingCooldownSeconds.Should().BeGreaterThan(0);
        ex.Which.Message.Should().Contain("Exam cooldown active");
    }
}
