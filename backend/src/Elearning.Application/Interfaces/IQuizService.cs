using Elearning.Application.DTOs;

namespace Elearning.Application.Interfaces;

/// <summary>
/// Thrown when a student exceeds failed quiz attempts and is locked under the cooldown timer.
/// </summary>
public class QuizCooldownException : Exception
{
    public int RemainingCooldownSeconds { get; }

    public QuizCooldownException(string message, int remainingCooldownSeconds) : base(message)
    {
        RemainingCooldownSeconds = remainingCooldownSeconds;
    }
}

/// <summary>
/// Service managing quiz retrieval, attempt tracking, proctoring cooldowns, and scoring.
/// </summary>
public interface IQuizService
{
    Task<QuizDto?> GetQuizByLessonIdAsync(Guid lessonId, Guid userId);
    Task<QuizSubmitResultDto> SubmitQuizAsync(Guid quizId, Guid userId, QuizSubmitRequestDto dto);
}
