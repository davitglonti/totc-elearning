using System.Text.Json;
using Elearning.Application.DTOs;
using Elearning.Application.Interfaces;
using Elearning.Domain.Entities;
using Elearning.Domain.Enums;
using Elearning.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Elearning.Infrastructure.Services;

/// <summary>
/// Implements interactive quiz assessment, answer verification, attempt history tracking, and server-side proctoring cooldowns.
/// </summary>
public class QuizService : IQuizService
{
    private readonly ElearningDbContext _context;
    private readonly IEnrollmentService _enrollmentService;

    public QuizService(ElearningDbContext context, IEnrollmentService enrollmentService)
    {
        _context = context;
        _enrollmentService = enrollmentService;
    }

    public async Task<QuizDto?> GetQuizByLessonIdAsync(Guid lessonId, Guid userId)
    {
        var lesson = await _context.Lessons
            .AsNoTracking()
            .Include(l => l.Section).ThenInclude(s => s!.Course)
            .FirstOrDefaultAsync(l => l.Id == lessonId);

        if (lesson == null) return null;

        var courseId = lesson.Section!.CourseId;

        // Verify access: student must be enrolled, pro subscriber, author, or admin (or lesson is free preview)
        var user = await _context.Users.FindAsync(userId);
        var isSubscribed = user != null && user.IsSubscribed && (user.SubscriptionExpiresAt == null || user.SubscriptionExpiresAt > DateTime.UtcNow);
        var isInstructorOrAdmin = user != null && (user.Role == UserRole.Admin || lesson.Section.Course?.InstructorId == user.Id);
        var isEnrolled = await _context.Enrollments.AnyAsync(e => e.CourseId == courseId && e.UserId == userId);

        if (!isEnrolled && !isSubscribed && !isInstructorOrAdmin && !lesson.IsFreePreview)
        {
            throw new UnauthorizedAccessException("You must be enrolled in the course to access lecture quizzes.");
        }

        var quiz = await _context.Quizzes
            .AsNoTracking()
            .Include(q => q.Questions.OrderBy(qu => qu.OrderIndex))
                .ThenInclude(qu => qu.Options)
            .FirstOrDefaultAsync(q => q.LessonId == lessonId);

        if (quiz == null) return null;

        return new QuizDto
        {
            Id = quiz.Id,
            LessonId = quiz.LessonId,
            Title = quiz.Title,
            Description = quiz.Description,
            PassingScorePercentage = quiz.PassingScorePercentage,
            Questions = quiz.Questions.Select(qu => new QuizQuestionDto
            {
                Id = qu.Id,
                QuestionText = qu.QuestionText,
                OrderIndex = qu.OrderIndex,
                Options = qu.Options.Select(o => new QuizOptionDto
                {
                    Id = o.Id,
                    OptionText = o.OptionText
                }).ToList()
            }).ToList()
        };
    }

    public async Task<QuizSubmitResultDto> SubmitQuizAsync(Guid quizId, Guid userId, QuizSubmitRequestDto dto)
    {
        var quiz = await _context.Quizzes
            .Include(q => q.Lesson).ThenInclude(l => l!.Section).ThenInclude(s => s!.Course)
            .Include(q => q.Questions)
                .ThenInclude(qu => qu.Options)
            .FirstOrDefaultAsync(q => q.Id == quizId);

        if (quiz == null)
            throw new KeyNotFoundException("Quiz not found.");

        var courseId = quiz.Lesson?.Section?.CourseId;

        // Verify access / enrollment
        if (courseId.HasValue)
        {
            var user = await _context.Users.FindAsync(userId);
            var isSubscribed = user != null && user.IsSubscribed && (user.SubscriptionExpiresAt == null || user.SubscriptionExpiresAt > DateTime.UtcNow);
            var isInstructorOrAdmin = user != null && (user.Role == UserRole.Admin || quiz.Lesson?.Section?.Course?.InstructorId == user.Id);
            var isEnrolled = await _context.Enrollments.AnyAsync(e => e.CourseId == courseId.Value && e.UserId == userId);

            if (!isEnrolled && !isSubscribed && !isInstructorOrAdmin && !(quiz.Lesson?.IsFreePreview ?? false))
            {
                throw new UnauthorizedAccessException("Enrollment is required to submit quiz assessments.");
            }
        }

        // 1. Server-Side Proctoring Cooldown Gate:
        // If student failed 3 attempts within the past 1 hour, block submission until cooldown expires
        var oneHourAgo = DateTime.UtcNow.AddHours(-1);
        var recentFailedAttempts = await _context.QuizAttempts
            .Where(qa => qa.QuizId == quizId && qa.UserId == userId && !qa.Passed && qa.AttemptedAt >= oneHourAgo)
            .OrderByDescending(qa => qa.AttemptedAt)
            .ToListAsync();

        if (recentFailedAttempts.Count >= 3)
        {
            var latestAttempt = recentFailedAttempts[0];
            var cooldownExpiry = latestAttempt.AttemptedAt.AddHours(1);
            if (DateTime.UtcNow < cooldownExpiry)
            {
                var remainingSec = (int)Math.Ceiling((cooldownExpiry - DateTime.UtcNow).TotalSeconds);
                throw new QuizCooldownException(
                    $"Exam cooldown active. You have failed 3 attempts within the past hour. Please wait {remainingSec} seconds before re-attempting.",
                    remainingSec);
            }
        }

        // 2. Score calculation
        var feedbacks = new List<QuestionFeedbackDto>();
        int correctCount = 0;

        foreach (var question in quiz.Questions)
        {
            var correctOption = question.Options.FirstOrDefault(o => o.IsCorrect);
            dto.Answers.TryGetValue(question.Id, out var selectedOptionId);

            bool isCorrect = correctOption != null && selectedOptionId == correctOption.Id;
            if (isCorrect) correctCount++;

            feedbacks.Add(new QuestionFeedbackDto
            {
                QuestionId = question.Id,
                SelectedOptionId = selectedOptionId != Guid.Empty ? selectedOptionId : null,
                CorrectOptionId = correctOption?.Id ?? Guid.Empty,
                IsCorrect = isCorrect,
                Explanation = question.Explanation
            });
        }

        int total = quiz.Questions.Count;
        int scorePercentage = total > 0 ? (int)Math.Round((double)correctCount / total * 100) : 0;
        bool passed = scorePercentage >= quiz.PassingScorePercentage;

        // 3. Persist attempt record to DB
        var attempt = new QuizAttempt
        {
            QuizId = quizId,
            UserId = userId,
            ScorePercentage = scorePercentage,
            Passed = passed,
            StrikeCount = 0,
            AttemptedAt = DateTime.UtcNow,
            AnswersJson = JsonSerializer.Serialize(dto.Answers)
        };
        _context.QuizAttempts.Add(attempt);
        await _context.SaveChangesAsync();

        // 4. If passed and linked to a lesson, complete the lesson
        if (passed && quiz.LessonId.HasValue)
        {
            await _enrollmentService.CompleteLessonAsync(quiz.LessonId.Value, userId, new CompleteLessonDto
            {
                MarkAsComplete = true,
                LastWatchedPositionSeconds = 0
            });
        }

        var totalAttemptsCount = await _context.QuizAttempts.CountAsync(qa => qa.QuizId == quizId && qa.UserId == userId);

        return new QuizSubmitResultDto
        {
            TotalQuestions = total,
            CorrectAnswersCount = correctCount,
            ScorePercentage = scorePercentage,
            Passed = passed,
            AttemptsCount = totalAttemptsCount,
            IsInCooldown = false,
            RemainingCooldownSeconds = 0,
            FeedbackMessage = passed
                ? $"🎉 Excellent work! You passed with {scorePercentage}% score and completed the lecture."
                : $"You scored {scorePercentage}%. Minimum required is {quiz.PassingScorePercentage}%. Review the lecture and try again!",
            QuestionFeedbacks = feedbacks
        };
    }
}
