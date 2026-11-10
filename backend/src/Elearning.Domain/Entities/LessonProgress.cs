namespace Elearning.Domain.Entities;

/// <summary>
/// Tracks an enrolled student's progress on an individual lesson.
/// </summary>
public class LessonProgress
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    public User? User { get; set; }

    public Guid LessonId { get; set; }
    public Lesson? Lesson { get; set; }

    public bool IsCompleted { get; set; } = false;
    public int LastWatchedPositionSeconds { get; set; } = 0;
    public DateTime? CompletedAt { get; set; }
}
