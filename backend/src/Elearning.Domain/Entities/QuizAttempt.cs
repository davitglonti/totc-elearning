using Elearning.Domain.Common;

namespace Elearning.Domain.Entities;

/// <summary>
/// Represents an attempt by a student on an interactive quiz or assessment.
/// </summary>
public class QuizAttempt : BaseEntity
{
    public Guid QuizId { get; set; }
    public Quiz? Quiz { get; set; }

    public Guid UserId { get; set; }
    public User? User { get; set; }

    public int ScorePercentage { get; set; }
    public bool Passed { get; set; }
    public int StrikeCount { get; set; } = 0;
    public DateTime AttemptedAt { get; set; } = DateTime.UtcNow;
    public string? AnswersJson { get; set; }
}
